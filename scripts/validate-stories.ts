// CI check: every story file is valid, every catalog entry matches its file,
// and every published entry went through the review and parent gates.

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gatesPass, publishedRevisionGates } from '../src/production/gates';
import { validateDraft } from '../src/production/validate-draft';
import { fileSha, listJobs, loadCatalog, loadPolicy, pathsFor, readJsonFile, rel } from './lib/repo';

const paths = pathsFor();
const problems: string[] = [];
const lines: string[] = [];

function checkStory(file: string, label: string) {
  const v = validateDraft(readJsonFile(file));
  lines.push(`${v.ok ? 'ok  ' : 'FAIL'} ${label}: ${v.summary.join('; ')}`);
  if (!v.ok) problems.push(`${label}: ${[...v.schema.errors, ...(v.graph?.errors.map((e) => `${e.code} ${e.passage ?? ''}`) ?? []), ...(v.literacy?.automatedChecks.filter((c) => !c.ok).map((c) => c.id) ?? [])].join('; ')}`);
}

for (const dir of ['published', 'previews']) {
  const abs = join(paths.publicStories, dir);
  if (!existsSync(abs)) continue;
  for (const f of readdirSync(abs).filter((x) => x.endsWith('.json'))) checkStory(join(abs, f), `public/stories/${dir}/${f}`);
}
checkStory(join(paths.root, 'tests', 'fixtures', 'mini-story.json'), 'tests/fixtures/mini-story.json');

const jobs = listJobs(paths);
for (const job of jobs) {
  const rev = job.revisions.at(-1);
  if (!rev) {
    lines.push(`--   job ${job.id}: ${job.state}, no draft yet`);
    continue;
  }
  const abs = join(paths.root, rev.draft.path);
  if (fileSha(abs) !== rev.draft.sha256) problems.push(`job ${job.id}: ${rev.draft.path} was edited after submission`);
  lines.push(`--   job ${job.id}: ${job.state}, revision ${rev.revision} (story v${rev.storyVersion})`);
}

const catalog = loadCatalog(paths);
const policy = loadPolicy(paths);
for (const entry of [...catalog.published, ...catalog.previews]) {
  const abs = join(paths.publicStories, entry.path);
  if (!existsSync(abs)) problems.push(`catalog ${entry.id}: missing file ${entry.path}`);
  else if (fileSha(abs) !== entry.sha256) problems.push(`catalog ${entry.id}: ${entry.path} does not match its catalog hash`);
}
for (const entry of catalog.published) {
  const job = jobs.find((j) => j.id === entry.jobId);
  if (!job) {
    problems.push(`published ${entry.id}: no production job ${entry.jobId}; stories can only be published through the story workflow`);
    continue;
  }
  if (job.publication?.sha256 !== entry.sha256) problems.push(`published ${entry.id}: catalog hash differs from the job's publication record`);
  const gates = publishedRevisionGates(job, policy);
  if (!gatesPass(gates)) problems.push(`published ${entry.id}: gates not satisfied: ${gates.filter((g) => !g.ok).map((g) => `${g.id} (${g.detail})`).join('; ')}`);
  else lines.push(`ok   published ${entry.id} v${entry.version}: all gates satisfied for revision ${job.publication?.revision}`);
}

console.log(lines.join('\n'));
console.log(`\n${catalog.published.length} published, ${catalog.previews.length} previews, ${jobs.length} production jobs (${rel(paths, paths.jobs)})`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exitCode = 1;
} else console.log('All story checks passed.');

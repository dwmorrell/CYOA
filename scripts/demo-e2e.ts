// End-to-end demonstration of the story production workflow.
//
// Runs in a throwaway sandbox so the real repository is never changed. It
// replays the real sample request, the narrative-designer agent's real draft
// and the real agent reviews from stories/jobs/, then shows the gates. The
// human steps (literacy review, parent approval, publish) are SIMULATED and
// labelled as such: no person took part in this run.

import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Actor, Job } from '../src/production/job';
import { createJob, decide, evidenceFor, gatesFor, publish, recordReview, StageError, submitDraft } from './lib/production';
import { listJobs, loadCatalog, loadJob, pathsFor, readJsonFile, ROOT, writeTextFile } from './lib/repo';

const real = pathsFor(ROOT);
const sandboxDir = mkdtempSync(join(tmpdir(), 'cyoa-demo-'));
for (const d of ['config', 'prompts']) cpSync(join(ROOT, d), join(sandboxDir, d), { recursive: true });
const sb = pathsFor(sandboxDir);
const out: string[] = [];
const log = (s = '') => {
  out.push(s);
  console.log(s);
};
const gateLines = (id: string) => gatesFor(sb, id).map((g) => `    ${g.ok ? 'PASS' : 'WAIT'} ${g.id}: ${g.detail}`);
const expectFail = (label: string, fn: () => unknown) => {
  try {
    fn();
    log(`  UNEXPECTED: ${label} was allowed`);
    process.exitCode = 1;
  } catch (e) {
    log(`  refused as expected: ${label}\n    -> ${(e as Error).message.split('\n')[0]}`);
  }
};

const sourceJob = listJobs(real).find((j) => j.revisions.length > 0);
if (!sourceJob) throw new Error('No real production job with a draft in stories/jobs/; run the story workflow first.');
const sourceRev = sourceJob.revisions.at(-1)!;

log('# End-to-end story workflow demonstration');
log();
log(`Run at ${new Date().toISOString()} in a temporary sandbox; the repository is not modified.`);
log(`Source: real job ${sourceJob.id}, revision ${sourceRev.revision} by ${sourceRev.author.name} (${sourceRev.author.kind}).`);
log();
log('## 1. Structured request to planned job (executable)');
const request = readJsonFile(join(ROOT, sourceJob.artifacts.request!.path));
let job: Job = createJob(sb, request, new Date(), undefined, sourceJob.id);
log(`  job ${job.id}: ${job.history.map((h) => h.to).join(' -> ')}`);
log(`  artifacts: ${Object.keys(job.artifacts).join(', ')}`);

log();
log('## 2. Agent draft to validated draft (executable; draft written by the narrative-designer agent)');
const r = submitDraft(sb, job.id, join(ROOT, sourceRev.draft.path), sourceRev.author);
log(`  state: ${r.job.state}`);
r.summary.forEach((s) => log(`  ${s}`));

log();
log('## 3. Gate checks that must refuse (executable)');
job = loadJob(sb, job.id);
const rev = job.revisions.at(-1)!;
const evidence = evidenceFor(sb, [rev.draft.path, rev.validation.report.path, rev.validation.literacyReport.path]);
expectFail('publishing straight after validation', () => publish(sb, job.id, { name: 'Demo Parent (SIMULATED)', kind: 'human' }));
expectFail('the narrative author reviewing its own draft', () =>
  recordReview(sb, job.id, { role: 'qa', reviewer: sourceRev.author, revision: rev.revision, draftSha256: rev.draft.sha256, verdict: 'pass', findings: [], evidence }),
);
expectFail('a parent approval before reviews pass', () => decide(sb, job.id, { parent: { name: 'Demo Parent (SIMULATED)', kind: 'human' }, decision: 'approved', at: new Date().toISOString() }));

log();
log('## 4. Specialist agent reviews (executable; real reviews replayed from the repository)');
const realReviews = sourceJob.reviews.filter((x) => x.revision === sourceRev.revision);
if (realReviews.length === 0) log('  No agent reviews recorded on this revision yet.');
for (const rv of realReviews) {
  job = recordReview(sb, job.id, { role: rv.role, reviewer: rv.reviewer, revision: rev.revision, draftSha256: rv.draftSha256, verdict: rv.verdict, findings: rv.findings, evidence });
  log(`  ${rv.role} review by ${rv.reviewer.name} (${rv.reviewer.kind}): ${rv.verdict}, ${rv.findings.length} finding(s) -> job ${job.state}`);
}
gateLines(job.id).forEach(log);

log();
log('## 5. Human steps (SIMULATED in this sandbox; no person took part)');
const simulatedLiteracy: Actor = { name: 'Literacy tutor (SIMULATED)', kind: 'human' };
const simulatedParent: Actor = { name: 'Parent (SIMULATED)', kind: 'human' };
job = loadJob(sb, job.id);
const qaPassed = job.reviews.some((x) => x.role === 'qa' && x.verdict === 'pass' && !x.invalidatedBy);
if (!qaPassed) {
  log('  The real QA review has not passed this revision, so the story stays blocked. Simulated human steps skipped.');
} else {
  job = recordReview(sb, job.id, { role: 'literacy', reviewer: simulatedLiteracy, revision: rev.revision, draftSha256: rev.draft.sha256, verdict: 'pass', findings: [{ severity: 'note', message: 'SIMULATED review for the demonstration only' }], evidence });
  log(`  simulated human literacy review: pass -> ${job.state}`);
  job = decide(sb, job.id, { parent: simulatedParent, decision: 'approved', note: 'SIMULATED approval for the demonstration only', at: new Date().toISOString() });
  log(`  simulated parent decision: approved -> ${job.state}`);
  job = publish(sb, job.id, simulatedParent);
  log(`  publish into the sandbox catalog: ${job.state}; sandbox catalog has ${loadCatalog(sb).published.length} published story`);
}
gateLines(job.id).forEach(log);

log();
log('## 6. Revision invalidation (executable)');
const revised = readJsonFile<{ version: number; title: string }>(join(ROOT, sourceRev.draft.path));
revised.version += 1;
const revisedFile = join(sandboxDir, 'revised.json');
writeTextFile(revisedFile, JSON.stringify(revised, null, 2));
try {
  const r2 = submitDraft(sb, job.id, revisedFile, sourceRev.author);
  log(`  new revision ${r2.job.revisions.length} (story v${revised.version}) -> ${r2.job.state}`);
  log(`  stale reviews: ${r2.job.reviews.filter((x) => x.invalidatedBy).length} of ${r2.job.reviews.length}; stale parent decisions: ${r2.job.parentDecisions.filter((d) => d.invalidatedBy).length}`);
  log(`  child library still shows version ${loadCatalog(sb).published[0]?.version ?? '(none)'} until the new revision passes every gate`);
} catch (e) {
  if (e instanceof StageError) log(`  ${e.message}`);
  else throw e;
}

log();
log('## Limits of this demonstration');
log('- Story drafting and the QA and literacy pre-reviews were done by Claude Code agents before this run; the demo replays their recorded output.');
log('- The human literacy review, parent approval and publication above are simulated in a sandbox. In the real repository the sample story remains unpublished with its literacy review pending.');

writeTextFile(join(ROOT, 'reports', 'demo', 'e2e-demo.md'), `${out.join('\n')}\n`);
rmSync(sandboxDir, { recursive: true, force: true });
console.log('\nWrote reports/demo/e2e-demo.md');

// Software workflow orchestrator. Checks work items in dependency order,
// optionally runs their check commands, summarizes story production jobs,
// and regenerates the requirements traceability report.
//
//   npm run orchestrate              check and report
//   npm run orchestrate -- --run     also run each item's check commands
//   npm run orchestrate -- --trace   also regenerate docs/REQUIREMENTS_TRACEABILITY.md

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gatesFor } from './lib/production';
import { listJobs, pathsFor, readJsonFile, ROOT, writeJsonFile, writeTextFile } from './lib/repo';
import { checkItems, checkRequirements, nextItems, orderItems, type Requirement, type WorkItem } from './lib/workflow';

const args = new Set(process.argv.slice(2));
const exists = (p: string) => existsSync(join(ROOT, p));
const items = readJsonFile<{ items: WorkItem[] }>(join(ROOT, 'workflow', 'work-items.json')).items;
const reqs = readJsonFile<{ requirements: Requirement[] }>(join(ROOT, 'workflow', 'requirements.json')).requirements;
const testSource = readdirSync(join(ROOT, 'tests', 'unit'))
  .map((f) => readFileSync(join(ROOT, 'tests', 'unit', f), 'utf8'))
  .join('\n');

const itemProblems = checkItems(items, exists);
const reqProblems = checkRequirements(reqs, exists, testSource);
const ordered = orderItems(items);
const results: Record<string, { command: string; ok: boolean; tail: string }[]> = {};

if (args.has('--run')) {
  for (const item of ordered) {
    results[item.id] = item.checks.map((command) => {
      try {
        const output = execSync(command, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: '0' } });
        return { command, ok: true, tail: output.trim().split('\n').slice(-3).join(' / ') };
      } catch (e) {
        const err = e as { stdout?: string; stderr?: string };
        return { command, ok: false, tail: `${err.stdout ?? ''}${err.stderr ?? ''}`.trim().split('\n').slice(-5).join(' / ') };
      }
    });
    console.log(`${item.id} ${results[item.id]!.every((r) => r.ok) ? 'checks ok' : 'CHECKS FAILED'} (${item.checks.length} command(s))`);
  }
}

const paths = pathsFor(ROOT);
const jobs = listJobs(paths).map((j) => ({ id: j.id, state: j.state, revisions: j.revisions.length, gates: gatesFor(paths, j.id) }));

const md: string[] = [
  '# Orchestration report',
  '',
  `Generated ${new Date().toISOString()} by \`npm run orchestrate${[...args].map((a) => ` -- ${a}`).join('')}\`.`,
  '',
  '## Software work items (dependency order)',
  '',
  '| Item | Stage | Agent | Status | Review | Open defects | Checks |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...ordered.map((i) => {
    const review = typeof i.review === 'object' && i.review ? `${i.review.verdict} by ${i.review.reviewer}` : (i.review ?? 'none');
    const checks = results[i.id] ? (results[i.id]!.every((r) => r.ok) ? 'ran: pass' : 'ran: FAIL') : i.checks.length ? 'not run' : 'none';
    return `| ${i.id} ${i.title} | ${i.stage} | ${i.agent} | ${i.status} | ${review} | ${i.defects.filter((d) => d.status === 'open').map((d) => d.id).join(', ') || 'none'} | ${checks} |`;
  }),
  '',
  '## Next work (dependencies satisfied, not done)',
  '',
  ...nextItems(items).map((i) => `- ${i.id} (${i.agent}): ${i.title}. Invoke with \`claude --agent ${i.agent} "Work item ${i.id}: see workflow/work-items.json"\``),
  '',
  '## Story production jobs',
  '',
  ...jobs.flatMap((j) => [`- ${j.id}: **${j.state}**, ${j.revisions} revision(s)`, ...j.gates.map((g) => `  - ${g.ok ? 'pass' : 'waiting'}: ${g.id}, ${g.detail}`)]),
  '',
  '## Problems found',
  '',
  ...(itemProblems.length || reqProblems.length ? [...itemProblems, ...reqProblems].map((p) => `- ${p}`) : ['None.']),
  '',
  '## Executable today vs planned',
  '',
  '- Executable: work-item and requirement checks, check commands (`--run`), story job status, traceability generation.',
  '- Manual: starting each agent (`claude --agent <name>`), human literacy review, parent decisions and publishing.',
  '- Planned: spawning agents automatically for the next work item, and a parent-facing studio that starts production jobs.',
  '',
];
writeTextFile(join(ROOT, 'reports', 'orchestration', 'latest.md'), md.join('\n'));
writeJsonFile(join(ROOT, 'reports', 'orchestration', 'latest.json'), { generatedAt: new Date().toISOString(), order: ordered.map((i) => i.id), results, jobs, problems: [...itemProblems, ...reqProblems] });

if (args.has('--trace')) {
  const counts = reqs.reduce<Record<string, number>>((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
  const trace = [
    '# Requirements traceability',
    '',
    `Generated from \`workflow/requirements.json\` by \`npm run orchestrate -- --trace\` on ${new Date().toISOString().slice(0, 10)}. Evidence paths and test names are checked to exist; do not edit this file by hand.`,
    '',
    `Summary: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}.`,
    '',
    '> The owner\'s master specification was not available. Requirements come from the bootstrap request; see `docs/PRODUCT_SPEC.md`.',
    '',
    '| Id | Requirement | Status | Evidence | Tests | Gaps and unverified |',
    '| --- | --- | --- | --- | --- | --- |',
    ...reqs.map((r) => `| ${r.id} | ${r.title} | ${r.status} | ${r.evidence.map((e) => `\`${e}\``).join('<br>')} | ${r.tests.join('<br>') || 'none'} | ${r.gaps.join('<br>') || 'none'} |`),
    '',
    reqProblems.length ? `## Problems\n\n${reqProblems.map((p) => `- ${p}`).join('\n')}\n` : 'All evidence paths and test names were found.\n',
  ];
  writeTextFile(join(ROOT, 'docs', 'REQUIREMENTS_TRACEABILITY.md'), trace.join('\n'));
  console.log('Wrote docs/REQUIREMENTS_TRACEABILITY.md');
}

console.log(`Wrote reports/orchestration/latest.md (${ordered.length} work items, ${jobs.length} story jobs)`);
const allProblems = [...itemProblems, ...reqProblems];
if (allProblems.length) console.error(`Problems:\n- ${allProblems.join('\n- ')}`);
const failedChecks = Object.values(results).flat().filter((r) => !r.ok);
if (failedChecks.length) console.error(`Failed checks:\n- ${failedChecks.map((r) => `${r.command}: ${r.tail}`).join('\n- ')}`);
process.exitCode = allProblems.length || failedChecks.length ? 1 : 0;

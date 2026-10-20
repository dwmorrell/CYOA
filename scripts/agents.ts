// npm run agents:check   static check of every agent definition
// npm run agents:smoke   invoke each agent through `claude -p --agent` and record the answers

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkAgent, EXPECTED_AGENTS, loadAgents } from './lib/agents';
import { ROOT, writeTextFile } from './lib/repo';

const mode = process.argv[2] ?? 'check';
const agents = loadAgents(ROOT);
let failed = false;

for (const a of agents) {
  const problems = checkAgent(a, (p) => existsSync(join(ROOT, p)));
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${a.frontmatter.name ?? a.file}${problems.length ? `\n  - ${problems.join('\n  - ')}` : ''}`);
  if (problems.length) failed = true;
}
const names = agents.map((a) => a.frontmatter.name);
for (const n of EXPECTED_AGENTS)
  if (!names.includes(n)) {
    failed = true;
    console.log(`FAIL missing agent ${n}`);
  }

if (mode === 'smoke' && !failed) {
  let version = 'unknown';
  try {
    version = execFileSync('claude', ['--version'], { encoding: 'utf8' }).trim();
  } catch {
    console.error('The claude CLI is not installed or not on PATH; smoke test not run.');
    process.exit(1);
  }
  const rows: string[] = [];
  for (const n of EXPECTED_AGENTS) {
    const prompt = 'Without using any tools, reply in one line: the role name in your top heading, then one thing you are not allowed to do.';
    let answer: string;
    try {
      answer = execFileSync('claude', ['-p', '--agent', n, '--max-turns', '2', prompt], { cwd: ROOT, encoding: 'utf8', timeout: 180_000, stdio: ['ignore', 'pipe', 'pipe'] })
        .trim()
        .replace(/\s+/g, ' ');
    } catch (e) {
      failed = true;
      answer = `ERROR: ${(e as Error).message.split('\n')[0]}`;
    }
    console.log(`${n}: ${answer}`);
    rows.push(`| \`${n}\` | ${answer.replace(/\|/g, '\\|')} |`);
  }
  writeTextFile(
    join(ROOT, 'reports', 'agents', 'invocation-smoke.md'),
    [
      '# Agent invocation smoke test',
      '',
      `Run ${new Date().toISOString()} with Claude Code ${version} using \`claude -p --agent <name>\`.`,
      'Each agent was asked, with no tools, to name its role and one limit of authority. The answers below are verbatim.',
      '',
      '| Agent | Answer |',
      '| --- | --- |',
      ...rows,
      '',
    ].join('\n'),
  );
  console.log('Wrote reports/agents/invocation-smoke.md');
}
process.exitCode = failed ? 1 : 0;

#!/usr/bin/env node
// Story production command line. Run `npm run story -- help`.

import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import type { ActorKind, Review } from '../src/production/job';
import { createJob, decide, evidenceFor, gatesFor, planJob, preview, publish, recordReview, StageError, submitDraft, type ReviewInput } from './lib/production';
import { listJobs, loadJob, pathsFor, readJsonFile } from './lib/repo';

const HELP = `Story production CLI

  new --request <file>                         Create a job: validate, brief, assess continuity, plan
  plan <jobId>                                 Retry planning (e.g. after adding a prequel)
  submit-draft <jobId> --file <story.json> --author <name> --author-kind <human|ai-agent> [--agent <name>]
  review <jobId> --file <review.json>          Record a review written by a reviewer
  evidence <path>...                           Print evidence hashes for a review file
  status <jobId>                               Show state, revisions, reviews and publication gates
  list                                         List jobs
  preview <jobId>                              Put the current draft on the parent-only preview shelf
  decide <jobId> --parent <name> --decision <approved|changes-requested|rejected> [--note <text>]
  publish <jobId> --by <name>                  Publish to the child library (all gates must pass)

Parent decisions and publishing refuse to run inside an AI agent session.`;

const PARENT_ONLY = new Set(['decide', 'publish']);

function main(argv: string[]): number {
  const [command, ...rest] = argv;
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      request: { type: 'string' },
      file: { type: 'string' },
      author: { type: 'string' },
      'author-kind': { type: 'string' },
      agent: { type: 'string' },
      parent: { type: 'string' },
      decision: { type: 'string' },
      note: { type: 'string' },
      by: { type: 'string' },
      root: { type: 'string' },
      json: { type: 'boolean' },
    },
  });
  const paths = pathsFor(values.root ? resolve(values.root) : undefined);
  const need = (v: string | undefined, name: string) => {
    if (!v) throw new StageError(`--${name} is required`);
    return v;
  };
  const jobId = () => need(positionals[0], 'jobId (first argument)');

  // Claude Code sets CLAUDECODE=1 for every command it runs. Parent-only
  // actions are refused there so no agent can approve or publish a story.
  if (command && PARENT_ONLY.has(command) && process.env.CLAUDECODE) {
    throw new StageError(`"${command}" is a parent action and is blocked inside AI agent sessions. Run it yourself in a normal terminal.`);
  }

  switch (command) {
    case 'new': {
      const job = createJob(paths, readJsonFile(resolve(need(values.request, 'request'))));
      print(values.json, job, `Created ${job.id} (${job.state})${job.failures.length ? `\nFailed: ${job.failures.at(-1)!.error}` : ''}`);
      return job.state === 'planned' ? 0 : 2;
    }
    case 'plan': {
      const job = planJob(paths, jobId());
      print(values.json, job, `${job.id}: ${job.state}`);
      return job.state === 'planned' ? 0 : 2;
    }
    case 'submit-draft': {
      const kind = need(values['author-kind'], 'author-kind') as ActorKind;
      if (kind !== 'human' && kind !== 'ai-agent') throw new StageError('--author-kind must be human or ai-agent');
      const r = submitDraft(paths, jobId(), resolve(need(values.file, 'file')), { name: need(values.author, 'author'), kind, agent: values.agent });
      print(values.json, r.job, `${r.job.id}: revision ${r.job.revisions.length} -> ${r.job.state}\n  ${r.summary.join('\n  ')}`);
      return r.ok ? 0 : 3;
    }
    case 'review': {
      const input = readJsonFile<ReviewInput & Partial<Review>>(resolve(need(values.file, 'file')));
      const job = recordReview(paths, jobId(), {
        role: input.role,
        reviewer: input.reviewer,
        revision: input.revision,
        draftSha256: input.draftSha256,
        verdict: input.verdict,
        findings: input.findings ?? [],
        evidence: input.evidence ?? [],
      });
      print(values.json, job, `${job.id}: ${input.role} review recorded -> ${job.state}`);
      return 0;
    }
    case 'evidence': {
      console.log(JSON.stringify(evidenceFor(paths, positionals), null, 2));
      return 0;
    }
    case 'status': {
      const job = loadJob(paths, jobId());
      const gates = gatesFor(paths, job.id);
      if (values.json) console.log(JSON.stringify({ job, gates }, null, 2));
      else {
        console.log(`${job.id}  story=${job.storyId}  state=${job.state}`);
        for (const r of job.revisions) console.log(`  revision ${r.revision}: v${r.storyVersion} by ${r.author.name} (${r.author.kind}) validation=${r.validation.ok ? 'ok' : 'FAILED'}\n    draft ${r.draft.path} sha256=${r.draft.sha256}`);
        for (const r of job.reviews) console.log(`  review ${r.id}: ${r.role} ${r.verdict} by ${r.reviewer.name} (${r.reviewer.kind}) on r${r.revision}${r.invalidatedBy ? ` [stale: superseded by r${r.invalidatedBy}]` : ''}`);
        for (const f of job.failures) console.log(`  failure at ${f.stage}: ${f.error}${f.recovered ? ` [recovered: ${f.recovered}]` : ''}`);
        console.log('  publication gates:');
        for (const g of gates) console.log(`    ${g.ok ? 'PASS' : 'WAIT'} ${g.id}: ${g.detail}`);
      }
      return 0;
    }
    case 'list': {
      for (const j of listJobs(paths)) console.log(`${j.id}\t${j.state}\t${j.storyId}\trevisions=${j.revisions.length}`);
      return 0;
    }
    case 'preview': {
      console.log(`Preview written to public/stories/${preview(paths, jobId())}`);
      return 0;
    }
    case 'decide': {
      const decision = need(values.decision, 'decision');
      if (!['approved', 'changes-requested', 'rejected'].includes(decision)) throw new StageError('--decision must be approved, changes-requested or rejected');
      const job = decide(paths, jobId(), {
        parent: { name: need(values.parent, 'parent'), kind: 'human' },
        decision: decision as 'approved',
        note: values.note,
        at: new Date().toISOString(),
      });
      print(values.json, job, `${job.id}: ${job.state}`);
      return 0;
    }
    case 'publish': {
      const job = publish(paths, jobId(), { name: need(values.by, 'by'), kind: 'human' });
      print(values.json, job, `${job.id}: published ${job.publication?.path}`);
      return 0;
    }
    default:
      console.log(HELP);
      return command && command !== 'help' ? 1 : 0;
  }
}

function print(json: boolean | undefined, data: unknown, text: string) {
  console.log(json ? JSON.stringify(data, null, 2) : text);
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  console.error(e instanceof StageError ? `error: ${e.message}` : e);
  process.exitCode = 1;
}

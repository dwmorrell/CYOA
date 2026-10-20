import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createJob, decide, evidenceFor, gatesFor, planJob, preview, publish, recordReview, StageError, submitDraft, type ReviewInput } from '../../scripts/lib/production';
import { loadCatalog, loadJob, type Paths } from '../../scripts/lib/repo';
import { normalizeRequest, validateRequest } from '../../src/production/request';
import { publishedRevisionGates } from '../../src/production/gates';
import { newJob, transition, TRANSITIONS, TransitionError, type Actor, type Job } from '../../src/production/job';
import { draftFor, request, sandbox, writeDraft } from '../production-helpers';

const author: Actor = { name: 'narrative-designer', kind: 'ai-agent', agent: 'narrative-designer' };
const qaAgent: Actor = { name: 'qa-engineer', kind: 'ai-agent', agent: 'qa-engineer' };
const litAgent: Actor = { name: 'literacy-specialist', kind: 'ai-agent', agent: 'literacy-specialist' };
const litHuman: Actor = { name: 'Ms Reviewer (literacy tutor)', kind: 'human' };
const parent: Actor = { name: 'Test Parent', kind: 'human' };
const T = (n: number) => new Date(Date.UTC(2026, 9, 20, 12, n));

function setup(): { paths: Paths; job: Job } {
  const paths = sandbox();
  const job = createJob(paths, request(), T(0));
  return { paths, job };
}

function submit(paths: Paths, job: Job, version = 1, edit?: Parameters<typeof draftFor>[1]) {
  const file = writeDraft(paths, `draft-v${version}.json`, draftFor(job.storyId, (s) => ((s.version = version), edit?.(s))));
  return submitDraft(paths, job.id, file, author, T(version));
}

function review(paths: Paths, id: string, role: ReviewInput['role'], reviewer: Actor, verdict: ReviewInput['verdict'] = 'pass', findings: ReviewInput['findings'] = []): Job {
  const job = loadJob(paths, id);
  const rev = job.revisions.at(-1)!;
  return recordReview(paths, id, {
    role,
    reviewer,
    revision: rev.revision,
    draftSha256: rev.draft.sha256,
    verdict,
    findings,
    evidence: evidenceFor(paths, [rev.draft.path, rev.validation.report.path]),
  });
}

describe('story request creation', () => {
  it('validates required fields and literacy concepts', () => {
    expect(validateRequest(request()).ok).toBe(true);
    const bad = validateRequest({ ...request(), genre: '', targetMinutes: 500, literacy: { targetConcepts: ['made-up'] } });
    expect(bad.ok).toBe(false);
    expect(bad.errors.join('\n')).toMatch(/genre is required/);
    expect(bad.errors.join('\n')).toMatch(/targetMinutes/);
    expect(bad.errors.join('\n')).toMatch(/unknown literacy concept "made-up"/);
  });

  it('normalizes deterministically', () => {
    const b = normalizeRequest({ ...request(), wordSettings: { sets: [{ label: ' SH  words ', words: ['Shed', 'shed', 'FISH'] }] } });
    expect(b).toEqual(normalizeRequest({ ...request(), wordSettings: { sets: [{ label: ' SH  words ', words: ['Shed', 'shed', 'FISH'] }] } }));
    expect(b.wordSets[0]).toMatchObject({ id: 'sh-words', label: 'SH words', words: ['shed', 'fish'], minOccurrences: 4 });
    expect(b.title).toBe('The Lost Kite');
  });

  it('creates a planned job with all planning artifacts on disk', () => {
    const { paths, job } = setup();
    expect(job.state).toBe('planned');
    expect(job.history.map((h) => h.to)).toEqual(['requested', 'briefed', 'planned']);
    for (const a of Object.values(job.artifacts)) expect(existsSync(join(paths.root, a!.path))).toBe(true);
    expect(job.storyId).toBe('the-lost-kite');
  });

  it('refuses an invalid request without creating a job', () => {
    const paths = sandbox();
    expect(() => createJob(paths, { genre: 'x' })).toThrow(StageError);
    expect(existsSync(paths.jobs)).toBe(false);
  });
});

describe('job state transitions', () => {
  it('allows only listed transitions', () => {
    const job = newJob('j', 's', parent, T(0).toISOString());
    expect(() => transition(job, 'published', parent, 'skip ahead', 'now')).toThrow(TransitionError);
    expect(TRANSITIONS.rejected).toEqual([]);
    expect(TRANSITIONS.planned).not.toContain('published');
    for (const [from, tos] of Object.entries(TRANSITIONS)) if (from !== 'approved') expect(tos, from).not.toContain('published');
  });

  it('moves through validation, review, parent approval and publication', () => {
    const { paths, job } = setup();
    expect(submit(paths, job).job.state).toBe('in-review');
    expect(review(paths, job.id, 'qa', qaAgent).state).toBe('in-review');
    // AI literacy pre-check alone is not enough under the default policy.
    expect(review(paths, job.id, 'literacy', litAgent).state).toBe('in-review');
    expect(review(paths, job.id, 'literacy', litHuman).state).toBe('awaiting-parent-approval');
    expect(decide(paths, job.id, { parent, decision: 'approved', at: T(9).toISOString() }).state).toBe('approved');
    const published = publish(paths, job.id, parent, T(10));
    expect(published.state).toBe('published');
    const catalog = loadCatalog(paths);
    expect(catalog.published.map((p) => p.id)).toEqual(['the-lost-kite']);
    expect(existsSync(join(paths.publicStories, catalog.published[0]!.path))).toBe(true);
  });
});

describe('artifact validation', () => {
  it('records failed validation and lets a fixed revision recover', () => {
    const { paths, job } = setup();
    const bad = submit(paths, job, 1, (s) => (s.passages[0]!.choices[0]!.target = 'nowhere'));
    expect(bad.ok).toBe(false);
    expect(bad.job.state).toBe('validation-failed');
    expect(bad.job.failures.at(-1)!.stage).toBe('validation');
    const good = submit(paths, job, 2);
    expect(good.ok).toBe(true);
    expect(good.job.state).toBe('in-review');
  });

  it('checks the draft against the brief', () => {
    const { paths, job } = setup();
    const r = submit(paths, job, 1, (s) => (s.literacy.wordSets[0]!.words = ['shed', 'fish']));
    expect(r.ok).toBe(false);
    const report = JSON.parse(readFileSync(join(paths.root, r.job.revisions[0]!.validation.report.path), 'utf8'));
    expect(report.brief.errors.join(' ')).toMatch(/dropped words: shut/);
  });

  it('requires the job story id', () => {
    const { paths, job } = setup();
    const file = writeDraft(paths, 'other.json', draftFor('some-other-story'));
    expect(submitDraft(paths, job.id, file, author, T(1)).ok).toBe(false);
  });
});

describe('failed-agent recovery', () => {
  it('records unparseable agent output as a stage failure and accepts a retry', () => {
    const { paths, job } = setup();
    const file = writeDraft(paths, 'broken.json', '{"schemaVersion": "1.0", "id": ');
    expect(() => submitDraft(paths, job.id, file, author, T(1))).toThrow(/not valid JSON/);
    const after = loadJob(paths, job.id);
    expect(after.state).toBe('planned');
    expect(after.failures).toHaveLength(1);
    const ok = submit(paths, job, 1);
    expect(ok.ok).toBe(true);
    expect(ok.job.failures[0]!.recovered).toMatch(/revision 1 validated/);
  });

  it('records a missing prequel as a planning failure and recovers on re-plan', () => {
    const paths = sandbox();
    const job = createJob(paths, request({ sequelTo: 'the-first-book', premise: 'Book Two. Max flies again.' }), T(0));
    expect(job.state).toBe('briefed');
    expect(job.failures[0]!.stage).toBe('continuity');
    // The prequel arrives in the library (here: as another job's draft).
    const prequel = createJob(paths, request({ premise: 'The First Book. Max starts out.' }), T(1));
    submitDraft(paths, prequel.id, writeDraft(paths, 'prequel.json', draftFor('the-first-book')), author, T(2));
    const replanned = planJob(paths, job.id, T(3));
    expect(replanned.state).toBe('planned');
    expect(replanned.failures[0]!.recovered).toBeDefined();
  });
});

describe('revision invalidation and versioning', () => {
  it('invalidates reviews and parent approval when a new revision arrives', () => {
    const { paths, job } = setup();
    submit(paths, job, 1);
    review(paths, job.id, 'qa', qaAgent);
    review(paths, job.id, 'literacy', litHuman);
    decide(paths, job.id, { parent, decision: 'approved', at: T(5).toISOString() });
    const r2 = submit(paths, job, 2, (s) => (s.passages[0]!.paragraphs[0] = 'Max ran up the big hill. His red kite was gone!'));
    expect(r2.job.state).toBe('in-review');
    expect(r2.job.reviews.every((r) => r.invalidatedBy === 2)).toBe(true);
    expect(r2.job.parentDecisions[0]!.invalidatedBy).toBe(2);
    const gates = gatesFor(paths, job.id);
    expect(gates.find((g) => g.id === 'review:qa')!.ok).toBe(false);
    expect(gates.find((g) => g.id === 'parent-approval')!.ok).toBe(false);
  });

  it('rejects stale reviews that point at an older draft', () => {
    const { paths, job } = setup();
    submit(paths, job, 1);
    const old = loadJob(paths, job.id).revisions[0]!;
    submit(paths, job, 2, (s) => (s.title = 'The Lost Kite Again'));
    expect(() =>
      recordReview(paths, job.id, { role: 'qa', reviewer: qaAgent, revision: 1, draftSha256: old.draft.sha256, verdict: 'pass', findings: [], evidence: evidenceFor(paths, [old.draft.path]) }),
    ).toThrow(/current draft is revision 2/);
  });

  it('requires a higher story version for each revision and after publication', () => {
    const { paths, job } = setup();
    submit(paths, job, 1);
    expect(() => submit(paths, job, 1, (s) => (s.title = 'Changed'))).toThrow(/raise "version"/);
    expect(loadJob(paths, job.id).revisions).toHaveLength(1);
  });

  it('keeps the published version in the library while a new version is reviewed', () => {
    const { paths, job } = setup();
    submit(paths, job, 1);
    review(paths, job.id, 'qa', qaAgent);
    review(paths, job.id, 'literacy', litHuman);
    decide(paths, job.id, { parent, decision: 'approved', at: T(5).toISOString() });
    publish(paths, job.id, parent, T(6));
    const r2 = submit(paths, job, 2, (s) => (s.title = 'The Lost Kite (revised)'));
    expect(r2.job.state).toBe('in-review');
    expect(loadCatalog(paths).published[0]!.version).toBe(1);
    expect(r2.job.publication!.storyVersion).toBe(1);
    // CI can still prove the published revision went through every gate.
    expect(publishedRevisionGates(r2.job).every((g) => g.ok)).toBe(true);
  });

  it('CI gate check fails for a job published without a human literacy review', () => {
    const { paths, job } = setup();
    submit(paths, job, 1);
    const j = loadJob(paths, job.id);
    const forged = { ...j, state: 'published' as const, publication: { storyVersion: 1, revision: 1, path: 'x', sha256: j.revisions[0]!.draft.sha256, at: '', by: parent } };
    expect(publishedRevisionGates(forged).filter((g) => !g.ok).map((g) => g.id)).toEqual(['review:qa', 'review:literacy', 'parent-approval']);
  });
});

describe('review and publication gates', () => {
  it('does not let the narrative author review their own draft', () => {
    const { paths, job } = setup();
    submit(paths, job);
    expect(() => review(paths, job.id, 'qa', author)).toThrow(/cannot/);
    expect(() => review(paths, job.id, 'literacy', { name: 'Someone', kind: 'ai-agent', agent: 'narrative-designer' })).toThrow(/cannot review/);
  });

  it('requires evidence that matches the files on disk', () => {
    const { paths, job } = setup();
    submit(paths, job);
    const rev = loadJob(paths, job.id).revisions[0]!;
    expect(() => recordReview(paths, job.id, { role: 'qa', reviewer: qaAgent, revision: 1, draftSha256: rev.draft.sha256, verdict: 'pass', findings: [], evidence: [] })).toThrow(/evidence/);
    expect(() =>
      recordReview(paths, job.id, { role: 'qa', reviewer: qaAgent, revision: 1, draftSha256: rev.draft.sha256, verdict: 'pass', findings: [], evidence: [{ path: rev.draft.path, sha256: 'f'.repeat(64) }] }),
    ).toThrow(/changed since/);
  });

  it('does not pass a review that lists blockers', () => {
    const { paths, job } = setup();
    submit(paths, job);
    expect(() => review(paths, job.id, 'qa', qaAgent, 'pass', [{ severity: 'blocker', message: 'broken' }])).toThrow(/blocker/);
  });

  it('a request for changes blocks progress until a new revision', () => {
    const { paths, job } = setup();
    submit(paths, job);
    expect(review(paths, job.id, 'qa', qaAgent, 'changes-requested', [{ severity: 'major', message: 'Ending two feels abrupt', passage: 'friend' }]).state).toBe('changes-requested');
    expect(() => decide(paths, job.id, { parent, decision: 'approved', at: T(3).toISOString() })).toThrow(/reviews to pass/);
  });

  it('never publishes just because validation passed', () => {
    const { paths, job } = setup();
    expect(submit(paths, job).ok).toBe(true);
    expect(() => publish(paths, job.id, parent, T(4))).toThrow(/Publication blocked/);
    expect(loadCatalog(paths).published).toEqual([]);
  });

  it('only a human parent can approve, and AI agents cannot publish', () => {
    const { paths, job } = setup();
    submit(paths, job);
    review(paths, job.id, 'qa', qaAgent);
    review(paths, job.id, 'literacy', litHuman);
    expect(() => decide(paths, job.id, { parent: qaAgent, decision: 'approved', at: T(3).toISOString() })).toThrow(/human parent/);
    decide(paths, job.id, { parent, decision: 'approved', at: T(4).toISOString() });
    expect(() => publish(paths, job.id, qaAgent, T(5))).toThrow(/person/);
  });

  it('refuses to publish a draft whose file was edited after review', () => {
    const { paths, job } = setup();
    submit(paths, job);
    review(paths, job.id, 'qa', qaAgent);
    review(paths, job.id, 'literacy', litHuman);
    decide(paths, job.id, { parent, decision: 'approved', at: T(4).toISOString() });
    const rev = loadJob(paths, job.id).revisions[0]!;
    writeFileSync(join(paths.root, rev.draft.path), '{"tampered": true}');
    expect(() => publish(paths, job.id, parent, T(5))).toThrow(/modified after submission/);
  });

  it('rejects a story that claims a passed literacy review nobody recorded', () => {
    const { paths, job } = setup();
    submit(paths, job, 1, (s) => (s.literacy.review = { status: 'passed', reviewer: 'nobody' }));
    review(paths, job.id, 'qa', qaAgent);
    const gate = gatesFor(paths, job.id).find((g) => g.id === 'story-literacy-claim')!;
    expect(gate.ok).toBe(false);
  });

  it('previews never reach the child library', () => {
    const { paths, job } = setup();
    submit(paths, job);
    preview(paths, job.id, T(2));
    const c = loadCatalog(paths);
    expect(c.previews.map((p) => p.id)).toEqual(['the-lost-kite']);
    expect(c.published).toEqual([]);
  });
});

// Story production job: a pure, serializable state machine. The CLI persists
// it as stories/jobs/<jobId>/job.json; nothing here touches the filesystem.

export type JobState =
  | 'requested'
  | 'briefed'
  | 'planned'
  | 'validation-failed'
  | 'in-review'
  | 'changes-requested'
  | 'awaiting-parent-approval'
  | 'approved'
  | 'published'
  | 'rejected';

export type ReviewRole = 'qa' | 'literacy' | 'narrative' | 'accessibility';
export type ActorKind = 'human' | 'ai-agent' | 'automation';

export interface Actor {
  name: string;
  kind: ActorKind;
  /** Agent definition name, e.g. "qa-engineer", when kind is ai-agent. */
  agent?: string;
}

export interface ArtifactRef {
  path: string;
  sha256: string;
}

export interface Revision {
  revision: number;
  storyVersion: number;
  draft: ArtifactRef;
  author: Actor;
  submittedAt: string;
  validation: { ok: boolean; report: ArtifactRef; literacyReport: ArtifactRef; graph: ArtifactRef; summary: string[] };
}

export interface Review {
  id: string;
  role: ReviewRole;
  reviewer: Actor;
  revision: number;
  draftSha256: string;
  verdict: 'pass' | 'changes-requested';
  findings: { severity: 'blocker' | 'major' | 'minor' | 'note'; message: string; passage?: string }[];
  /** Hashes of what the reviewer actually inspected. */
  evidence: ArtifactRef[];
  submittedAt: string;
  /** Set when a later revision makes this review stale. */
  invalidatedBy?: number;
}

export interface ParentDecision {
  revision: number;
  draftSha256: string;
  parent: Actor;
  decision: 'approved' | 'changes-requested' | 'rejected';
  note?: string;
  at: string;
  invalidatedBy?: number;
}

export interface StageFailure {
  stage: string;
  actor?: Actor;
  error: string;
  at: string;
  recovered?: string;
}

export interface HistoryEvent {
  at: string;
  from: JobState | null;
  to: JobState;
  actor: Actor;
  note: string;
}

export interface Job {
  jobVersion: 1;
  id: string;
  storyId: string;
  state: JobState;
  createdAt: string;
  updatedAt: string;
  artifacts: Partial<Record<'request' | 'brief' | 'continuity' | 'outline' | 'weavePlan' | 'generationPrompt', ArtifactRef>>;
  revisions: Revision[];
  reviews: Review[];
  parentDecisions: ParentDecision[];
  failures: StageFailure[];
  publication?: { storyVersion: number; revision: number; path: string; sha256: string; at: string; by: Actor };
  history: HistoryEvent[];
}

/** Allowed state transitions. Anything else is a bug or a misuse. */
export const TRANSITIONS: Record<JobState, JobState[]> = {
  requested: ['briefed'],
  briefed: ['planned'],
  planned: ['in-review', 'validation-failed'],
  'validation-failed': ['in-review', 'validation-failed'],
  'in-review': ['in-review', 'changes-requested', 'awaiting-parent-approval', 'validation-failed'],
  'changes-requested': ['in-review', 'validation-failed', 'rejected'],
  'awaiting-parent-approval': ['approved', 'changes-requested', 'rejected', 'in-review', 'validation-failed'],
  approved: ['published', 'in-review', 'validation-failed'],
  published: ['in-review', 'validation-failed'],
  rejected: [],
};

export class TransitionError extends Error {}

export function newJob(id: string, storyId: string, actor: Actor, now: string): Job {
  return {
    jobVersion: 1,
    id,
    storyId,
    state: 'requested',
    createdAt: now,
    updatedAt: now,
    artifacts: {},
    revisions: [],
    reviews: [],
    parentDecisions: [],
    failures: [],
    history: [{ at: now, from: null, to: 'requested', actor, note: 'Story request recorded' }],
  };
}

export function transition(job: Job, to: JobState, actor: Actor, note: string, now: string): Job {
  if (!TRANSITIONS[job.state].includes(to)) throw new TransitionError(`Job ${job.id}: cannot move from "${job.state}" to "${to}"`);
  return { ...job, state: to, updatedAt: now, history: [...job.history, { at: now, from: job.state, to, actor, note }] };
}

export function currentRevision(job: Job): Revision | undefined {
  return job.revisions.at(-1);
}

/** Record a failed stage without changing state, so the stage can be retried. */
export function recordFailure(job: Job, stage: string, error: string, now: string, actor?: Actor): Job {
  return { ...job, updatedAt: now, failures: [...job.failures, { stage, error, at: now, actor }] };
}

export function markRecovered(job: Job, stage: string, how: string): Job {
  return { ...job, failures: job.failures.map((f) => (f.stage === stage && !f.recovered ? { ...f, recovered: how } : f)) };
}

/**
 * Adding a revision invalidates every review and parent decision made on
 * earlier revisions: approval of old text never carries over to new text.
 */
export function addRevision(job: Job, rev: Omit<Revision, 'revision'>, actor: Actor, now: string): Job {
  if (job.state === 'requested' || job.state === 'briefed') throw new TransitionError(`Job ${job.id}: plan the story before submitting a draft`);
  if (job.state === 'rejected') throw new TransitionError(`Job ${job.id} was rejected by the parent`);
  const revision = job.revisions.length + 1;
  const prev = currentRevision(job);
  if (prev && rev.storyVersion <= prev.storyVersion && rev.draft.sha256 !== prev.draft.sha256)
    throw new TransitionError(`Revision ${revision} must raise the story version above ${prev.storyVersion}`);
  if (prev && rev.draft.sha256 === prev.draft.sha256) throw new TransitionError('Draft is identical to the current revision');
  if (job.publication && rev.storyVersion <= job.publication.storyVersion)
    throw new TransitionError(`Story version ${job.publication.storyVersion} is already published; use a higher version`);
  const withRev: Job = {
    ...job,
    revisions: [...job.revisions, { ...rev, revision }],
    reviews: job.reviews.map((r) => (r.invalidatedBy === undefined ? { ...r, invalidatedBy: revision } : r)),
    parentDecisions: job.parentDecisions.map((d) => (d.invalidatedBy === undefined ? { ...d, invalidatedBy: revision } : d)),
  };
  const to: JobState = rev.validation.ok ? 'in-review' : 'validation-failed';
  return transition(withRev, to, actor, `Revision ${revision} (story v${rev.storyVersion}) ${rev.validation.ok ? 'passed' : 'failed'} automated validation`, now);
}

export const activeReviews = (job: Job) => job.reviews.filter((r) => r.invalidatedBy === undefined);
export const activeParentDecision = (job: Job) => job.parentDecisions.filter((d) => d.invalidatedBy === undefined).at(-1);

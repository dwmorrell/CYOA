import type { Story } from '../engine/types';
import { activeParentDecision, activeReviews, currentRevision, transition, TransitionError, type Actor, type Job, type ParentDecision, type Review, type ReviewRole } from './job';

export interface PublicationPolicy {
  requiredReviews: ReviewRole[];
  /** Roles whose passing review must come from a human, not an AI agent. */
  requireHumanReviewFor: ReviewRole[];
}

export const DEFAULT_POLICY: PublicationPolicy = {
  requiredReviews: ['qa', 'literacy'],
  requireHumanReviewFor: [],
};

export interface GateResult {
  id: string;
  ok: boolean;
  detail: string;
}

/** Reasons a review cannot be accepted at all. Thrown, not just reported. */
export function checkReviewAdmissible(job: Job, review: Omit<Review, 'id' | 'submittedAt'>): void {
  const rev = currentRevision(job);
  if (!rev) throw new TransitionError('There is no draft to review');
  if (!['in-review', 'changes-requested', 'awaiting-parent-approval'].includes(job.state))
    throw new TransitionError(`Reviews are not accepted while the job is "${job.state}"`);
  if (review.revision !== rev.revision || review.draftSha256 !== rev.draft.sha256)
    throw new TransitionError(`Review is for revision ${review.revision} (${review.draftSha256.slice(0, 12)}), but the current draft is revision ${rev.revision} (${rev.draft.sha256.slice(0, 12)})`);
  if (sameActor(review.reviewer, rev.author))
    throw new TransitionError(`${review.reviewer.name} wrote this draft and cannot review it`);
  if (!review.evidence.some((e) => e.sha256 === rev.draft.sha256))
    throw new TransitionError('Review evidence must include the hash of the draft that was inspected');
  if (review.verdict === 'pass' && review.findings.some((f) => f.severity === 'blocker'))
    throw new TransitionError('A review with blocker findings cannot pass');
}

const norm = (s: string | undefined) => (s ?? '').trim().toLowerCase();
export function sameActor(a: Actor, b: Actor): boolean {
  return norm(a.name) === norm(b.name) || (a.agent !== undefined && norm(a.agent) === norm(b.agent));
}

export function reviewGates(job: Job, policy: PublicationPolicy): GateResult[] {
  const rev = currentRevision(job);
  const reviews = activeReviews(job);
  return policy.requiredReviews.map((role) => {
    const forRole = reviews.filter((r) => r.role === role);
    const latest = forRole.at(-1);
    const needsHuman = policy.requireHumanReviewFor.includes(role);
    if (!latest) return { id: `review:${role}`, ok: false, detail: `No ${role} review on revision ${rev?.revision ?? '-'}` };
    if (latest.verdict !== 'pass') return { id: `review:${role}`, ok: false, detail: `${role} review by ${latest.reviewer.name} requested changes` };
    if (needsHuman && !forRole.some((r) => r.verdict === 'pass' && r.reviewer.kind === 'human'))
      return { id: `review:${role}`, ok: false, detail: `${role} review passed only by ${latest.reviewer.kind}; policy requires a human ${role} reviewer` };
    return { id: `review:${role}`, ok: true, detail: `${role} passed by ${latest.reviewer.name} (${latest.reviewer.kind})` };
  });
}

/** Story-level claims must match what the job actually recorded. */
export function integrityGates(job: Job, story: Story, policy: PublicationPolicy): GateResult[] {
  const claimsPassed = story.literacy.review.status === 'passed';
  const literacyGate = reviewGates(job, policy).find((g) => g.id === 'review:literacy');
  return [
    {
      id: 'story-literacy-claim',
      ok: !claimsPassed || Boolean(literacyGate?.ok),
      detail: claimsPassed ? 'Story says its literacy review passed; checked against recorded reviews' : `Story literacy review is "${story.literacy.review.status}"`,
    },
  ];
}

export function publicationGates(job: Job, story: Story | undefined, policy: PublicationPolicy = DEFAULT_POLICY): GateResult[] {
  const rev = currentRevision(job);
  const gates: GateResult[] = [];
  gates.push({ id: 'draft-exists', ok: Boolean(rev), detail: rev ? `Revision ${rev.revision}, story v${rev.storyVersion}` : 'No draft submitted' });
  gates.push({ id: 'automated-validation', ok: Boolean(rev?.validation.ok), detail: rev ? rev.validation.summary.join('; ') : 'not run' });
  gates.push(...reviewGates(job, policy));
  if (story) gates.push(...integrityGates(job, story, policy));
  const decision = activeParentDecision(job);
  gates.push({
    id: 'parent-approval',
    ok: decision?.decision === 'approved' && decision.parent.kind === 'human' && decision.draftSha256 === rev?.draft.sha256,
    detail: decision ? `${decision.decision} by ${decision.parent.name} on revision ${decision.revision}` : 'Waiting for a parent decision',
  });
  return gates;
}

export const gatesPass = (gates: GateResult[]) => gates.every((g) => g.ok);

/** After a review lands, move the job to the state the reviews imply. */
export function settleAfterReview(job: Job, policy: PublicationPolicy, actor: Actor, now: string): Job {
  const reviews = activeReviews(job);
  if (reviews.some((r) => r.verdict === 'changes-requested' && isLatestForRole(reviews, r))) {
    return job.state === 'changes-requested' ? job : transition(job, 'changes-requested', actor, 'A reviewer requested changes', now);
  }
  const allPass = reviewGates(job, policy).every((g) => g.ok);
  if (allPass && job.state !== 'awaiting-parent-approval') return transition(job, 'awaiting-parent-approval', actor, 'All required reviews passed', now);
  if (!allPass && job.state === 'changes-requested') return transition(job, 'in-review', actor, 'Review updated', now);
  return job;
}

function isLatestForRole(reviews: Review[], r: Review): boolean {
  return reviews.filter((x) => x.role === r.role).at(-1) === r;
}

export function recordParentDecision(job: Job, d: Omit<ParentDecision, 'revision' | 'draftSha256'>, policy: PublicationPolicy): Job {
  const rev = currentRevision(job);
  if (!rev) throw new TransitionError('There is no draft to decide on');
  if (d.parent.kind !== 'human') throw new TransitionError('Only a human parent can approve or reject a story');
  if (sameActor(d.parent, rev.author) && rev.author.kind !== 'human') throw new TransitionError('The draft author cannot act as the parent');
  if (d.decision === 'approved') {
    if (job.state !== 'awaiting-parent-approval') throw new TransitionError(`Parent approval needs all reviews to pass first (job is "${job.state}")`);
    const failing = reviewGates(job, policy).filter((g) => !g.ok);
    if (failing.length) throw new TransitionError(`Reviews incomplete: ${failing.map((g) => g.detail).join('; ')}`);
  }
  const withDecision: Job = { ...job, parentDecisions: [...job.parentDecisions, { ...d, revision: rev.revision, draftSha256: rev.draft.sha256 }] };
  const to = d.decision === 'approved' ? 'approved' : d.decision === 'rejected' ? 'rejected' : 'changes-requested';
  return transition(withDecision, to, d.parent, `Parent ${d.decision}${d.note ? `: ${d.note}` : ''}`, d.at);
}

/**
 * Re-checks the gates for the revision that was actually published, even if
 * later revisions have since made those reviews stale. Used by CI to prove
 * every published catalog entry went through review and parent approval.
 */
export function publishedRevisionGates(job: Job, policy: PublicationPolicy = DEFAULT_POLICY): GateResult[] {
  const pub = job.publication;
  if (!pub) return [{ id: 'publication-record', ok: false, detail: 'Job has no publication record' }];
  const rev = job.revisions.find((r) => r.revision === pub.revision);
  const asOf: Job = {
    ...job,
    revisions: rev ? job.revisions.filter((r) => r.revision <= pub.revision) : [],
    reviews: job.reviews.filter((r) => r.revision === pub.revision).map((r) => ({ ...r, invalidatedBy: undefined })),
    parentDecisions: job.parentDecisions.filter((d) => d.revision === pub.revision).map((d) => ({ ...d, invalidatedBy: undefined })),
  };
  return [
    { id: 'publication-record', ok: Boolean(rev) && rev!.draft.sha256 === pub.sha256 && pub.by.kind === 'human', detail: `revision ${pub.revision} published by ${pub.by.name} (${pub.by.kind})` },
    { id: 'automated-validation', ok: Boolean(rev?.validation.ok), detail: rev?.validation.summary.join('; ') ?? 'missing revision' },
    ...reviewGates(asOf, policy),
    {
      id: 'parent-approval',
      ok: activeParentDecision(asOf)?.decision === 'approved' && activeParentDecision(asOf)?.parent.kind === 'human',
      detail: activeParentDecision(asOf) ? `${activeParentDecision(asOf)!.decision} by ${activeParentDecision(asOf)!.parent.name}` : 'no parent decision',
    },
  ];
}

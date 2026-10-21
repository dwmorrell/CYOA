// Filesystem-backed story production operations. Every stage reads and writes
// structured artifacts under stories/jobs/<jobId>/ so that agents hand work to
// each other through files, not conversation summaries.

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Story } from '../../src/engine/types';
import { literacyReportMarkdown } from '../../src/literacy/analyzer';
import { checkShelfSummary, labelShelfSummary, type ShelfSummary } from '../../src/literacy/shelf-summary';
import { assessContinuity, type ContinuityAssessment } from '../../src/production/continuity';
import { checkReviewAdmissible, gatesPass, publicationGates, recordParentDecision, sameActor, settleAfterReview } from '../../src/production/gates';
import { activeReviews, addRevision, currentRevision, markRecovered, newJob, recordFailure, transition, TransitionError, type Actor, type ArtifactRef, type Job, type ParentDecision, type Review } from '../../src/production/job';
import { compareWeave, outlineFor, storyGraph, weavePlanFor, type WordWeavePlan } from '../../src/production/plan';
import { normalizeRequest, slugify, validateRequest, type NormalizedBrief, type StoryRequest } from '../../src/production/request';
import { validateDraft } from '../../src/production/validate-draft';
import { sha256 } from '../../src/util/hash';
import { fileSha, jobDir, withJobLock, loadCatalog, loadJob, loadLibrary, loadPolicy, loadProfile, readJsonFile, readText, rel, saveCatalog, saveJob, writeJsonFile, writeTextFile, type Paths } from './repo';

const SYSTEM: Actor = { name: 'story-cli', kind: 'automation' };
/** Terminology profile for the shelf summary's word types. */
const SHELF_PROFILE = 'og-classic';

export class StageError extends Error {}

function ref(paths: Paths, abs: string, hash: string): ArtifactRef {
  return { path: rel(paths, abs), sha256: hash };
}

export function jobIdFor(request: StoryRequest, now: Date): string {
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `job-${day}-${slugify(request.premise).slice(0, 24).replace(/-$/, '')}-${sha256(JSON.stringify(request)).slice(0, 6)}`;
}

/** request -> briefed -> planned. Returns the job even if planning failed. */
export function createJob(paths: Paths, requestData: unknown, now = new Date(), actor: Actor = SYSTEM, fixedId?: string): Job {
  const check = validateRequest(requestData);
  if (!check.ok) throw new StageError(`Invalid story request:\n- ${check.errors.join('\n- ')}`);
  const request = requestData as StoryRequest;
  const brief = normalizeRequest(request);
  const id = fixedId ?? jobIdFor(request, now);
  const dir = jobDir(paths, id);
  if (existsSync(join(dir, 'job.json'))) throw new StageError(`Job ${id} already exists`);
  const at = now.toISOString();
  const storyId = slugify(brief.title);
  let job = newJob(id, storyId, { name: request.requestedBy, kind: 'human' }, at);
  job.artifacts.request = ref(paths, join(dir, 'request.json'), writeJsonFile(join(dir, 'request.json'), request));
  job.artifacts.brief = ref(paths, join(dir, 'brief.json'), writeJsonFile(join(dir, 'brief.json'), brief));
  job = transition(job, 'briefed', actor, 'Request validated and normalized into a brief', at);
  saveJob(paths, job);
  return planJobUnlocked(paths, id, now, actor);
}

/** briefed -> planned. Safe to re-run after a failure (e.g. the prequel was missing). */
function planJobUnlocked(paths: Paths, id: string, now = new Date(), actor: Actor = SYSTEM): Job {
  let job = loadJob(paths, id);
  if (job.state !== 'briefed') throw new StageError(`Job ${id} is "${job.state}"; only a briefed job can be planned`);
  const dir = jobDir(paths, id);
  const at = now.toISOString();
  const brief = readJsonFile<NormalizedBrief>(join(dir, 'brief.json'));
  const continuity = assessContinuity(brief, loadLibrary(paths));
  job.artifacts.continuity = ref(paths, join(dir, 'continuity.json'), writeJsonFile(join(dir, 'continuity.json'), continuity));
  if (!continuity.ok) {
    job = recordFailure(job, 'continuity', continuity.issues.join('; '), at, actor);
    saveJob(paths, job);
    return job;
  }
  const outline = outlineFor(brief, continuity);
  const weave = weavePlanFor(brief, outline);
  job.artifacts.outline = ref(paths, join(dir, 'outline.json'), writeJsonFile(join(dir, 'outline.json'), outline));
  job.artifacts.weavePlan = ref(paths, join(dir, 'word-weave-plan.json'), writeJsonFile(join(dir, 'word-weave-plan.json'), weave));
  const prompt = generationPrompt(paths, job, brief, continuity);
  job.artifacts.generationPrompt = ref(paths, join(dir, 'generation-prompt.md'), writeTextFile(join(dir, 'generation-prompt.md'), prompt));
  job = markRecovered(job, 'continuity', 'planning re-run succeeded');
  job = transition(job, 'planned', actor, 'Continuity assessed; outline, Word Weave Plan and generation prompt written', at);
  saveJob(paths, job);
  return job;
}

function generationPrompt(paths: Paths, job: Job, brief: NormalizedBrief, continuity: ContinuityAssessment): string {
  const template = readText(join(paths.root, 'prompts', 'new-story.md'));
  const values: Record<string, string> = {
    JOB_ID: job.id,
    STORY_ID: job.storyId,
    JOB_DIR: rel(paths, jobDir(paths, job.id)),
    BRIEF_JSON: JSON.stringify(brief, null, 2),
    CONTINUITY_JSON: JSON.stringify(continuity, null, 2),
  };
  return template.replace(/\{\{(\w+)\}\}/g, (m, k: string) => values[k] ?? m);
}

export interface SubmitResult {
  job: Job;
  ok: boolean;
  summary: string[];
}

/** Submit a draft story (any state after planning). Bad JSON is recorded as a stage failure. */
function submitDraftUnlocked(paths: Paths, id: string, draftFile: string, author: Actor, now = new Date()): SubmitResult {
  let job = loadJob(paths, id);
  const at = now.toISOString();
  const dir = jobDir(paths, id);
  let data: unknown;
  try {
    data = JSON.parse(readText(draftFile));
  } catch (e) {
    job = recordFailure(job, 'draft', `Draft is not valid JSON: ${(e as Error).message}`, at, author);
    saveJob(paths, job);
    throw new StageError(`Draft from ${author.name} is not valid JSON; recorded as a failed stage. Fix it and submit again.`);
  }
  if (job.state === 'requested' || job.state === 'briefed') throw new StageError(`Job ${id} is "${job.state}"; run planning first`);
  const brief = readJsonFile<NormalizedBrief>(join(dir, 'brief.json'));
  const continuity = readJsonFile<ContinuityAssessment>(join(dir, 'continuity.json'));
  const profile = loadProfile(paths, brief.profile);
  const result = validateDraft(data, brief, continuity, profile);
  const revision = job.revisions.length + 1;
  const story = data as Story;
  if (result.schema.ok && story.id !== job.storyId) {
    result.ok = false;
    result.brief.errors.push(`story id must be "${job.storyId}"`);
    result.summary.push(`story id mismatch: "${story.id}"`);
  }
  const prev = currentRevision(job);
  const storyVersion = result.schema.ok ? story.version : (prev?.storyVersion ?? 0) + 1;
  if (prev && result.schema.ok && storyVersion <= prev.storyVersion) {
    job = recordFailure(job, 'draft', `Story version ${storyVersion} must be higher than ${prev.storyVersion}`, at, author);
    saveJob(paths, job);
    throw new StageError(`A revised draft must raise "version" above ${prev.storyVersion}`);
  }
  const draftPath = join(dir, 'drafts', `story.r${revision}.json`);
  const draftHash = writeTextFile(draftPath, readText(draftFile));
  const reports = join(dir, 'reports');
  const validationHash = writeJsonFile(join(reports, `validation.r${revision}.json`), result);
  const literacyPath = join(reports, `literacy.r${revision}.json`);
  const literacyHash = writeJsonFile(literacyPath, result.literacy ?? null);
  if (result.literacy) writeTextFile(join(reports, `literacy.r${revision}.md`), literacyReportMarkdown(result.literacy));
  const graphPath = join(reports, `graph.r${revision}.json`);
  const graphHash = writeJsonFile(graphPath, result.schema.ok ? { ...storyGraph(story), validation: result.graph } : null);
  if (result.literacy) {
    const weave = readJsonFile<WordWeavePlan>(join(dir, 'word-weave-plan.json'));
    writeJsonFile(join(reports, `weave-comparison.r${revision}.json`), compareWeave(weave, result.literacy));
  }
  try {
    job = addRevision(
      job,
      {
        storyVersion,
        draft: ref(paths, draftPath, draftHash),
        author,
        submittedAt: at,
        validation: {
          ok: result.ok,
          report: ref(paths, join(reports, `validation.r${revision}.json`), validationHash),
          literacyReport: ref(paths, literacyPath, literacyHash),
          graph: ref(paths, graphPath, graphHash),
          summary: result.summary,
        },
      },
      author,
      at,
    );
  } catch (e) {
    if (e instanceof TransitionError) {
      job = recordFailure(job, 'draft', e.message, at, author);
      saveJob(paths, job);
      throw new StageError(e.message);
    }
    throw e;
  }
  if (result.ok) job = markRecovered(job, 'draft', `revision ${revision} validated`);
  else job = recordFailure(job, 'validation', `Revision ${revision}: ${[...result.schema.errors, ...(result.graph?.errors.map((x) => `${x.code} ${x.passage ?? ''}`) ?? []), ...result.brief.errors].slice(0, 12).join('; ')}`, at, SYSTEM);
  saveJob(paths, job);
  return { job, ok: result.ok, summary: result.summary };
}

export type ReviewInput = Omit<Review, 'id' | 'submittedAt' | 'invalidatedBy'>;

/** Record a review written to a file by a reviewer. Evidence hashes are re-checked against disk. */
function recordReviewUnlocked(paths: Paths, id: string, input: ReviewInput, now = new Date()): Job {
  let job = loadJob(paths, id);
  const at = now.toISOString();
  for (const e of input.evidence) {
    const abs = join(paths.root, e.path);
    if (!existsSync(abs)) throw new StageError(`Evidence file ${e.path} does not exist`);
    if (fileSha(abs) !== e.sha256) throw new StageError(`Evidence ${e.path} has changed since the reviewer hashed it`);
  }
  const rev = currentRevision(job);
  if (rev && input.role === 'qa' && sameActor(input.reviewer, rev.author)) throw new StageError('The narrative author cannot be the QA reviewer');
  if (input.shelfSummary !== undefined) {
    if (input.role !== 'literacy') throw new StageError('Only a literacy review can carry a shelf summary');
    const story = currentStory(paths, job);
    const errors = story ? checkShelfSummary(input.shelfSummary, story) : ['there is no draft to check it against'];
    if (errors.length) throw new StageError(`Shelf summary does not match the story:\n${errors.map((e) => `- ${e}`).join('\n')}`);
  }
  try {
    checkReviewAdmissible(job, input);
  } catch (e) {
    if (e instanceof TransitionError) throw new StageError(e.message);
    throw e;
  }
  const review: Review = { ...input, id: `review-${job.reviews.length + 1}-${input.role}`, submittedAt: at };
  writeJsonFile(join(jobDir(paths, id), 'reviews', `${review.id}.r${review.revision}.json`), review);
  job = { ...job, reviews: [...job.reviews, review], updatedAt: at };
  job = settleAfterReview(job, loadPolicy(paths), SYSTEM, at);
  saveJob(paths, job);
  return job;
}

function decideUnlocked(paths: Paths, id: string, d: Omit<ParentDecision, 'revision' | 'draftSha256'>): Job {
  let job = loadJob(paths, id);
  try {
    job = recordParentDecision(job, d, loadPolicy(paths));
  } catch (e) {
    if (e instanceof TransitionError) throw new StageError(e.message);
    throw e;
  }
  saveJob(paths, job);
  return job;
}

function currentStory(paths: Paths, job: Job): Story | undefined {
  const rev = currentRevision(job);
  if (!rev) return undefined;
  const abs = join(paths.root, rev.draft.path);
  if (fileSha(abs) !== rev.draft.sha256) throw new StageError(`Draft ${rev.draft.path} was modified after submission; submit it as a new revision`);
  return readJsonFile<Story>(abs);
}

export function gatesFor(paths: Paths, id: string) {
  const job = loadJob(paths, id);
  return publicationGates(job, currentStory(paths, job), loadPolicy(paths));
}

/** The latest passing literacy review's shelf summary, in the classic OG terms parents and tutors use. */
function shelfSummaryFor(paths: Paths, job: Job): ShelfSummary | undefined {
  const latest = activeReviews(job)
    .filter((r) => r.role === 'literacy')
    .at(-1);
  if (!latest || latest.verdict !== 'pass' || !latest.shelfSummary) return undefined;
  return labelShelfSummary(latest.shelfSummary, loadProfile(paths, SHELF_PROFILE));
}

/** Copy the current draft into the parent-only preview shelf. Never child-facing. */
export function preview(paths: Paths, id: string, now = new Date()): string {
  const job = loadJob(paths, id);
  const story = currentStory(paths, job);
  const rev = currentRevision(job);
  if (!story || !rev) throw new StageError('No draft to preview');
  const relPath = `previews/${story.id}.json`;
  const abs = join(paths.publicStories, relPath);
  mkdirSync(join(paths.publicStories, 'previews'), { recursive: true });
  copyFileSync(join(paths.root, rev.draft.path), abs);
  const catalog = loadCatalog(paths);
  const gates = publicationGates(job, story, loadPolicy(paths));
  const literacySummary = shelfSummaryFor(paths, job);
  const entry = {
    id: story.id,
    title: story.title,
    version: story.version,
    path: relPath,
    sha256: rev.draft.sha256,
    jobId: job.id,
    series: story.series,
    ...(literacySummary && { literacySummary }),
    jobState: job.state,
    gates,
    updatedAt: now.toISOString(),
  };
  catalog.previews = [...catalog.previews.filter((p) => p.id !== story.id), entry];
  saveCatalog(paths, catalog);
  return relPath;
}

/** The only path into the child-facing library. Re-checks every gate from disk. */
function publishUnlocked(paths: Paths, id: string, by: Actor, now = new Date()): Job {
  let job = loadJob(paths, id);
  const story = currentStory(paths, job);
  const rev = currentRevision(job);
  const gates = publicationGates(job, story, loadPolicy(paths));
  if (!gatesPass(gates) || !story || !rev)
    throw new StageError(`Publication blocked:\n${gates.filter((g) => !g.ok).map((g) => `- ${g.id}: ${g.detail}`).join('\n')}`);
  if (job.state !== 'approved') throw new StageError(`Job is "${job.state}"; only an approved job can be published`);
  if (by.kind !== 'human') throw new StageError('Publication must be carried out by a person');
  const at = now.toISOString();
  const literacySummary = shelfSummaryFor(paths, job);
  const relPath = `published/${story.id}.v${story.version}.json`;
  mkdirSync(join(paths.publicStories, 'published'), { recursive: true });
  copyFileSync(join(paths.root, rev.draft.path), join(paths.publicStories, relPath));
  const catalog = loadCatalog(paths);
  catalog.published = [
    ...catalog.published.filter((p) => p.id !== story.id),
    {
      id: story.id,
      title: story.title,
      version: story.version,
      path: relPath,
      sha256: rev.draft.sha256,
      jobId: job.id,
      series: story.series,
      ...(literacySummary && { literacySummary }),
      publishedAt: at,
      // The story file keeps the author's declaration; the job's recorded reviews are the authority.
      reviews: activeReviews(job).filter((r) => r.verdict === 'pass').map((r) => ({ role: r.role, reviewer: r.reviewer.name, kind: r.reviewer.kind })),
    },
  ];
  catalog.previews = catalog.previews.filter((p) => p.id !== story.id);
  saveCatalog(paths, catalog);
  job = { ...job, publication: { storyVersion: story.version, revision: rev.revision, path: relPath, sha256: rev.draft.sha256, at, by } };
  job = transition(job, 'published', by, `Published story v${story.version} to the child library`, at);
  saveJob(paths, job);
  return job;
}

export function evidenceFor(paths: Paths, relPaths: string[]): ArtifactRef[] {
  return relPaths.map((p) => ({ path: p, sha256: fileSha(join(paths.root, p)) }));
}

export const planJob = (paths: Paths, id: string, now = new Date(), actor: Actor = SYSTEM) => withJobLock(paths, id, () => planJobUnlocked(paths, id, now, actor));
export const submitDraft = (paths: Paths, id: string, draftFile: string, author: Actor, now = new Date()) => withJobLock(paths, id, () => submitDraftUnlocked(paths, id, draftFile, author, now));
export const recordReview = (paths: Paths, id: string, input: ReviewInput, now = new Date()) => withJobLock(paths, id, () => recordReviewUnlocked(paths, id, input, now));
export const decide = (paths: Paths, id: string, d: Omit<ParentDecision, 'revision' | 'draftSha256'>) => withJobLock(paths, id, () => decideUnlocked(paths, id, d));
export const publish = (paths: Paths, id: string, by: Actor, now = new Date()) => withJobLock(paths, id, () => publishUnlocked(paths, id, by, now));

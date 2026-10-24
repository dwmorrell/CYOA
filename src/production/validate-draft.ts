import type { Story } from '../engine/types';
import { analyzeStory, type LiteracyReport } from '../literacy/analyzer';
import type { TerminologyProfile } from '../literacy/taxonomy';
import { validateGraph, type GraphReport } from '../validation/graph';
import { validateSchema } from '../validation/schema';
import type { ContinuityAssessment } from './continuity';
import type { NormalizedBrief } from './request';

export interface DraftValidation {
  ok: boolean;
  schema: { ok: boolean; errors: string[] };
  graph?: GraphReport;
  literacy?: LiteracyReport;
  brief: { ok: boolean; errors: string[]; warnings: string[] };
  summary: string[];
}

/** Does the draft deliver what the brief asked for? */
export function checkAgainstBrief(story: Story, brief: NormalizedBrief, continuity?: ContinuityAssessment, literacy?: LiteracyReport): DraftValidation['brief'] {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const set of brief.wordSets) {
    const found = story.literacy.wordSets.find((s) => s.id === set.id);
    if (!found) {
      errors.push(`word set "${set.id}" from the brief is missing`);
      continue;
    }
    const missing = set.words.filter((w) => !found.words.includes(w));
    if (missing.length) errors.push(`word set "${set.id}" dropped words: ${missing.join(', ')}`);
    if (found.minOccurrences < set.minOccurrences) errors.push(`word set "${set.id}" lowered minOccurrences below ${set.minOccurrences}`);
  }
  for (const c of brief.targetConcepts) if (!story.literacy.targetConcepts.includes(c)) errors.push(`target concept "${c}" is not declared`);
  const endings = story.passages.filter((p) => p.ending).length;
  if (endings < brief.endingTarget) warnings.push(`${endings} endings; the brief aims for ${brief.endingTarget}`);
  if (story.passages.length < brief.passageTarget.min) warnings.push(`${story.passages.length} passages; the brief aims for at least ${brief.passageTarget.min}`);
  if (story.items.length === 0) errors.push('the story needs at least one inventory item');
  if (story.clues.length === 0) errors.push('the story needs at least one clue');
  if (!story.passages.some((p) => p.choices.some((c) => c.requires))) errors.push('the story needs at least one choice that depends on an item, clue or flag');
  if (literacy) {
    const tooLong = literacy.readability.longSentences.length;
    const overBrief = story.passages.flatMap((p) => p.paragraphs).flatMap((para) => para.split(/(?<=[.!?])\s+/)).filter((s) => (s.match(/[A-Za-z']+/g) ?? []).length > brief.maxSentenceWords);
    if (overBrief.length) warnings.push(`${overBrief.length} sentence(s) exceed the brief's ${brief.maxSentenceWords}-word limit${tooLong ? `, ${tooLong} exceed the hard limit` : ''}`);
  }
  if (continuity?.isSequel) {
    if (!story.series || story.series.previousStoryId !== continuity.previous?.id) errors.push(`series.previousStoryId must be "${continuity.previous?.id}"`);
    if (continuity.series && story.series && story.series.order !== continuity.series.order) errors.push(`series.order should be ${continuity.series.order}`);
  }
  return { ok: errors.length === 0, errors, warnings };
}

/** Flattens a validation report into the error and warning strings shown to a parent. */
export function validationIssues(validation: DraftValidation): { errors: string[]; warnings: string[] } {
  return {
    errors: [...validation.schema.errors, ...(validation.graph?.errors ?? []).map((e) => e.message), ...(validation.literacy?.automatedChecks ?? []).filter((c) => !c.ok).map((c) => `${c.id}: ${c.detail}`)],
    warnings: [...(validation.graph?.warnings ?? []).map((w) => w.message), ...(validation.literacy?.learningDesign.advisories ?? []).filter((a) => !a.ok).map((a) => a.detail)],
  };
}

export function validateDraft(data: unknown, brief?: NormalizedBrief, continuity?: ContinuityAssessment, profile?: TerminologyProfile): DraftValidation {
  const schema = validateSchema(data);
  if (!schema.ok) {
    return { ok: false, schema, brief: { ok: false, errors: ['schema invalid; brief not checked'], warnings: [] }, summary: [`schema: ${schema.errors.length} error(s)`] };
  }
  const story = data as Story;
  const graph = validateGraph(story);
  const literacy = analyzeStory(story, profile);
  const briefCheck = brief ? checkAgainstBrief(story, brief, continuity, literacy) : { ok: true, errors: [], warnings: ['no brief supplied'] };
  const ok = schema.ok && graph.ok && literacy.ok && briefCheck.ok;
  return {
    ok,
    schema,
    graph,
    literacy,
    brief: briefCheck,
    summary: [
      'schema: ok',
      `graph: ${graph.ok ? 'ok' : `${graph.errors.length} error(s)`}, ${graph.stats.reachableEndings.length}/${graph.stats.endings.length} endings reachable`,
      `literacy checks: ${literacy.ok ? 'ok' : literacy.automatedChecks.filter((c) => !c.ok).map((c) => c.id).join(', ') + ' failed'}`,
      `brief: ${briefCheck.ok ? 'ok' : `${briefCheck.errors.length} error(s)`}`,
    ],
  };
}

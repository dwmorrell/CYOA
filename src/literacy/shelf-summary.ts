import { LEARNING_TARGETS, type LearningTarget, type Story } from '../engine/types';
import { learningDesign, passageText, tokenize } from './analyzer';
import { conceptById, labelFor, type TerminologyProfile } from './taxonomy';

/** General Orton-Gillingham tutoring areas a parent or tutor can pick a story by. */
export const OG_CATEGORIES = [
  'Phonics',
  'Syllable types',
  'Syllable division',
  'Spelling rules',
  'Morphology',
  'Red words',
  'Vocabulary',
  'Fluency',
  'Comprehension',
] as const;
export type OgCategory = (typeof OG_CATEGORIES)[number];

/**
 * What the literacy reviewer tells a parent or tutor about a story at a
 * glance. It is written into the literacy review, checked against the story
 * text when the review is recorded, and copied onto the parent shelf.
 */
export interface ShelfSummary {
  /** One to three plain sentences for a parent or tutor. */
  blurb: string;
  /** Reading skills the story practises. Each must be tagged in the story. */
  skills: LearningTarget[];
  /** Spelling patterns the story uses, with words from the story text. */
  wordTypes: { concept: string; label?: string; examples: string[] }[];
  /** General OG tutoring areas the story fits. */
  ogCategories: OgCategory[];
}

export const BLURB_MAX = 400;
export const MAX_EXAMPLES = 4;

/**
 * Checks a summary against the story it describes. Every word type must be a
 * known concept, its examples must appear in the story and carry that
 * spelling pattern, and every concept the story targets must be listed.
 */
export function checkShelfSummary(summary: unknown, story: Story): string[] {
  if (typeof summary !== 'object' || summary === null) return ['shelfSummary must be an object'];
  const s = summary as Partial<ShelfSummary>;
  const errors: string[] = [];

  if (typeof s.blurb !== 'string' || s.blurb.trim().length < 20) errors.push('blurb needs at least 20 characters');
  else if (s.blurb.length > BLURB_MAX) errors.push(`blurb is ${s.blurb.length} characters; keep it to ${BLURB_MAX}`);

  const tagged = learningDesign(story).targets;
  if (!Array.isArray(s.skills) || s.skills.length === 0) errors.push('skills needs at least one reading skill');
  else
    for (const k of s.skills) {
      if (!LEARNING_TARGETS.includes(k)) errors.push(`skill "${String(k)}" is not one of ${LEARNING_TARGETS.join(', ')}`);
      else if (tagged[k] === 0) errors.push(`skill "${k}" is not tagged on any page or choice of the story`);
    }

  const words = new Set(story.passages.flatMap((p) => tokenize(passageText(story, p.id))));
  if (!Array.isArray(s.wordTypes) || s.wordTypes.length === 0) errors.push('wordTypes needs at least one word type');
  else {
    for (const wt of s.wordTypes) {
      const concept = conceptById.get(wt?.concept);
      if (!concept) {
        errors.push(`word type "${String(wt?.concept)}" is not a known concept`);
        continue;
      }
      if (!Array.isArray(wt.examples) || wt.examples.length === 0 || wt.examples.length > MAX_EXAMPLES) {
        errors.push(`word type "${wt.concept}" needs 1 to ${MAX_EXAMPLES} example words`);
        continue;
      }
      for (const ex of wt.examples) {
        const w = String(ex).toLowerCase();
        if (!words.has(w)) errors.push(`example "${ex}" for ${wt.concept} does not appear in the story`);
        else if (!concept.detect(w)) errors.push(`example "${ex}" does not carry the ${wt.concept} pattern (${concept.pattern})`);
      }
    }
    const listed = new Set(s.wordTypes.map((wt) => wt?.concept));
    for (const c of story.literacy.targetConcepts) if (!listed.has(c)) errors.push(`target concept "${c}" is missing from wordTypes`);
    if (listed.size !== s.wordTypes.length) errors.push('wordTypes lists a concept more than once');
  }

  if (!Array.isArray(s.ogCategories) || s.ogCategories.length === 0) errors.push('ogCategories needs at least one category');
  else {
    for (const c of s.ogCategories) if (!OG_CATEGORIES.includes(c)) errors.push(`OG category "${String(c)}" is not one of ${OG_CATEGORIES.join(', ')}`);
    if (new Set(s.ogCategories).size !== s.ogCategories.length) errors.push('ogCategories lists a category more than once');
  }
  return errors;
}

/** The summary as the shelf shows it, with each word type named in the profile's terms. */
export function labelShelfSummary(s: ShelfSummary, profile?: TerminologyProfile): ShelfSummary {
  return { ...s, wordTypes: s.wordTypes.map((wt) => ({ ...wt, label: labelFor(wt.concept, profile), examples: wt.examples.map((e) => e.toLowerCase()) })) };
}

import { conceptById } from '../literacy/taxonomy';

/** What a parent (or the narrative designer on their behalf) asks for. */
export interface StoryRequest {
  genre: string;
  theme: string;
  premise: string;
  /** Story id this is a sequel to, if any. */
  sequelTo?: string;
  targetMinutes: number;
  literacy: {
    profile?: string;
    targetConcepts: string[];
    /** Concepts from earlier stories to keep revisiting. */
    reviewConcepts?: string[];
    maxSentenceWords?: number;
  };
  wordSettings: {
    sets: { label: string; concept?: string; words: string[]; minOccurrences?: number }[];
  };
  continuity?: {
    characters?: string[];
    facts?: string[];
    avoid?: string[];
  };
  requestedBy: string;
}

export interface NormalizedBrief {
  title: string;
  genre: string;
  theme: string;
  premise: string;
  sequelTo?: string;
  targetMinutes: number;
  passageTarget: { min: number; max: number };
  endingTarget: number;
  maxSentenceWords: number;
  profile: string;
  targetConcepts: string[];
  reviewConcepts: string[];
  wordSets: { id: string; label: string; concept?: string; words: string[]; minOccurrences: number }[];
  continuity: { characters: string[]; facts: string[]; avoid: string[] };
  requiredMechanics: string[];
}

export interface RequestValidation {
  ok: boolean;
  errors: string[];
}

const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function validateRequest(input: unknown): RequestValidation {
  const errors: string[] = [];
  if (typeof input !== 'object' || input === null) return { ok: false, errors: ['request must be a JSON object'] };
  const r = input as Partial<StoryRequest>;
  for (const field of ['genre', 'theme', 'premise', 'requestedBy'] as const) if (!nonEmpty(r[field])) errors.push(`${field} is required`);
  if (typeof r.targetMinutes !== 'number' || r.targetMinutes < 3 || r.targetMinutes > 60) errors.push('targetMinutes must be a number from 3 to 60');
  if (r.sequelTo !== undefined && !/^[a-z0-9][a-z0-9-]*$/.test(r.sequelTo)) errors.push('sequelTo must be a story id');
  if (!r.literacy || !Array.isArray(r.literacy.targetConcepts)) errors.push('literacy.targetConcepts must be a list');
  else {
    for (const c of [...r.literacy.targetConcepts, ...(r.literacy.reviewConcepts ?? [])])
      if (!conceptById.has(c)) errors.push(`unknown literacy concept "${c}"`);
  }
  if (!r.wordSettings || !Array.isArray(r.wordSettings.sets) || r.wordSettings.sets.length === 0) errors.push('wordSettings.sets needs at least one word set');
  else
    r.wordSettings.sets.forEach((s, i) => {
      if (!nonEmpty(s.label)) errors.push(`wordSettings.sets[${i}].label is required`);
      if (!Array.isArray(s.words) || s.words.length === 0) errors.push(`wordSettings.sets[${i}].words needs at least one word`);
      else
        for (const w of s.words)
          if (typeof w !== 'string' || !/^[a-zA-Z]+$/.test(w.trim())) errors.push(`wordSettings.sets[${i}] has an invalid word "${String(w)}"`);
      if (s.concept !== undefined && !conceptById.has(s.concept)) errors.push(`wordSettings.sets[${i}].concept "${s.concept}" is unknown`);
    });
  return { ok: errors.length === 0, errors };
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'story';

const clean = (s: string) => s.trim().replace(/\s+/g, ' ');
const uniqLower = (xs: string[]) => [...new Set(xs.map((x) => x.trim().toLowerCase()).filter(Boolean))];

/** Deterministic normalization: same request in, same brief out. */
export function normalizeRequest(r: StoryRequest): NormalizedBrief {
  // Roughly one passage per minute of reading for an early reader, with
  // room for branches the child will not visit on one play-through.
  const min = Math.max(6, Math.round(r.targetMinutes * 0.8));
  const max = Math.max(min + 4, Math.round(r.targetMinutes * 2));
  return {
    title: clean(r.premise).split(/[.!?]/)[0]!.slice(0, 60),
    genre: clean(r.genre),
    theme: clean(r.theme),
    premise: clean(r.premise),
    sequelTo: r.sequelTo,
    targetMinutes: r.targetMinutes,
    passageTarget: { min, max },
    endingTarget: r.targetMinutes >= 15 ? 4 : 3,
    maxSentenceWords: r.literacy.maxSentenceWords ?? 16,
    profile: r.literacy.profile ?? 'structured-literacy',
    targetConcepts: uniqLower(r.literacy.targetConcepts),
    reviewConcepts: uniqLower(r.literacy.reviewConcepts ?? []),
    wordSets: r.wordSettings.sets.map((s) => ({
      id: slugify(s.label),
      label: clean(s.label),
      concept: s.concept,
      words: uniqLower(s.words),
      minOccurrences: s.minOccurrences ?? Math.max(3, uniqLower(s.words).length * 2),
    })),
    continuity: {
      characters: (r.continuity?.characters ?? []).map(clean),
      facts: (r.continuity?.facts ?? []).map(clean),
      avoid: (r.continuity?.avoid ?? []).map(clean),
    },
    requiredMechanics: ['choices', 'clues', 'inventory', 'multiple-endings'],
  };
}

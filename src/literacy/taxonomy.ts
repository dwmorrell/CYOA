// Program-neutral structured-literacy concept taxonomy.
//
// Concepts have stable neutral ids. What a family or tutor calls each concept
// varies by program, so display labels come from terminology profiles
// (config/literacy-profiles.json) rather than being hard-coded here.
//
// Detectors are ORTHOGRAPHIC heuristics: they match spelling patterns, not
// sounds. "ea" matches both "bead" and "bread". Every report says so, and the
// literacy review gate exists because only a qualified reviewer can confirm
// the phonological claims.

export interface Concept {
  id: string;
  /** Neutral description used when a profile has no label for the concept. */
  description: string;
  /** Spelling pattern the detector looks for, shown in reports. */
  pattern: string;
  detect: (word: string) => boolean;
  /** Suggested teaching order (lower comes first) for series progression. */
  stage: number;
}

const V = 'aeiou';
const isVowel = (ch: string | undefined) => ch !== undefined && V.includes(ch);
const vowelGroups = (w: string) => w.match(/[aeiouy]+/g) ?? [];

export const CONCEPTS: Concept[] = [
  {
    id: 'closed-syllable',
    description: 'Closed syllable with a short vowel (one vowel followed by a consonant)',
    pattern: 'one vowel, ends in a consonant (e.g. map, sit)',
    stage: 1,
    // Excludes igh (bright), r-controlled vowels (dark) and a+ll/lk (call,
    // talk), whose vowels are not short. Found in the literacy pre-review of
    // the first sample story.
    detect: (w) => /^[^aeiouy]*[aeiou][^aeiouy]+$/.test(w) && w.length <= 6 && !/igh|[aeiou]r|a(ll|lk)/.test(w),
  },
  {
    id: 'digraph-sh',
    description: 'Consonant digraph sh',
    pattern: 'sh',
    stage: 2,
    detect: (w) => w.includes('sh'),
  },
  {
    id: 'digraph-ch',
    description: 'Consonant digraph ch',
    pattern: 'ch (not tch)',
    stage: 2,
    detect: (w) => /(^|[^t])ch/.test(w),
  },
  {
    id: 'digraph-th',
    description: 'Consonant digraph th',
    pattern: 'th',
    stage: 2,
    detect: (w) => w.includes('th'),
  },
  {
    id: 'digraph-wh',
    description: 'Consonant digraph wh',
    pattern: 'wh at the start',
    stage: 2,
    detect: (w) => w.startsWith('wh'),
  },
  {
    id: 'digraph-ck',
    description: 'ck after a short vowel',
    pattern: 'vowel + ck',
    stage: 2,
    detect: (w) => /[aeiou]ck/.test(w),
  },
  {
    id: 'floss',
    description: 'Doubled f, l, s or z after a short vowel at the end of a one-syllable word',
    pattern: 'vowel + ff/ll/ss/zz at the end',
    stage: 3,
    detect: (w) => vowelGroups(w).length === 1 && /[aeiou](ff|ll|ss|zz)$/.test(w),
  },
  {
    id: 'initial-blend',
    description: 'Initial consonant blend',
    pattern: 'bl cl fl gl pl sl br cr dr fr gr pr tr sc sk sm sn sp st sw tw at the start',
    stage: 3,
    detect: (w) => /^(bl|cl|fl|gl|pl|sl|br|cr|dr|fr|gr|pr|tr|sc|sk|sm|sn|sp|st|sw|tw)[aeiouy]/.test(w),
  },
  {
    id: 'glued-ng-nk',
    description: 'Vowel + ng or nk unit',
    pattern: 'ang ing ong ung ank ink onk unk',
    stage: 3,
    detect: (w) => /[aiou]n[gk]/.test(w),
  },
  {
    id: 'trigraph-tch',
    description: 'tch after a short vowel',
    pattern: 'vowel + tch',
    stage: 4,
    detect: (w) => /[aeiou]tch/.test(w),
  },
  {
    id: 'silent-e',
    description: 'Vowel-consonant-e (silent e makes the vowel say its name)',
    pattern: 'single vowel + consonant + final e (e.g. lane, hope)',
    stage: 4,
    detect: (w) => w.length >= 3 && w.endsWith('e') && !isVowel(w.at(-2)) && isVowel(w.at(-3)) && !isVowel(w.at(-4)),
  },
  {
    id: 'vowel-team',
    description: 'Vowel team',
    pattern: 'ai ay ee ea oa oe ie igh ue',
    stage: 5,
    detect: (w) => /(ai|ay|ee|ea|oa|oe|ie|igh|ue)/.test(w),
  },
  {
    id: 'r-controlled',
    description: 'R-controlled vowel',
    pattern: 'ar er ir or ur',
    stage: 5,
    detect: (w) => /(ar|er|ir|or|ur)/.test(w),
  },
  {
    id: 'suffix-ing',
    description: 'Suffix -ing',
    pattern: 'ends in ing, with a base of three or more letters',
    stage: 6,
    detect: (w) => w.length >= 6 && w.endsWith('ing'),
  },
  {
    id: 'suffix-ed',
    description: 'Suffix -ed',
    pattern: 'ends in ed, with a base of three or more letters',
    stage: 6,
    detect: (w) => w.length >= 5 && w.endsWith('ed'),
  },
];

export const conceptById = new Map(CONCEPTS.map((c) => [c.id, c]));

export interface TerminologyProfile {
  id: string;
  name: string;
  note?: string;
  labels: Record<string, string>;
}

export function labelFor(conceptId: string, profile?: TerminologyProfile): string {
  return profile?.labels[conceptId] ?? conceptById.get(conceptId)?.description ?? conceptId;
}

/** Rough syllable estimate from vowel groups; used only for readability hints. */
export function estimateSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  let groups = vowelGroups(w).length;
  if (w.endsWith('e') && !w.endsWith('le') && groups > 1) groups--;
  return Math.max(1, groups);
}

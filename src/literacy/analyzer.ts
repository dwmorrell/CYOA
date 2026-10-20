import { LEARNING_TARGETS, type LearningTarget, type Story, type WordSet } from '../engine/types';
import { CONCEPTS, conceptById, estimateSyllables, labelFor, type TerminologyProfile } from './taxonomy';
import { contentHash } from '../util/hash';

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []).map((w) => w.replace(/'.*$/, ''));
}

export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** All text a reader sees in a passage, including its choice labels. */
export function passageText(story: Story, passageId: string): string {
  const p = story.passages.find((x) => x.id === passageId);
  if (!p) return '';
  return [p.title ?? '', ...p.paragraphs, ...p.choices.map((c) => c.label)].join(' ');
}

/** A word-set word matches itself plus simple -s / -es endings. */
export function matchesWord(token: string, word: string): boolean {
  return token === word || token === `${word}s` || token === `${word}es`;
}

export interface WordSetReport {
  id: string;
  label: string;
  concept?: string;
  minOccurrences: number;
  totalOccurrences: number;
  passagesWithSet: number;
  perWord: Record<string, number>;
  missingWords: string[];
  meetsMinimum: boolean;
  /** Occurrences along the shortest route to each ending (passage text plus the choice labels taken). */
  perEndingRoute: Record<string, number>;
  /** Spelling check: words in the set that do not match the declared concept. */
  conceptMismatches: string[];
}

export interface ConceptReport {
  id: string;
  label: string;
  pattern: string;
  targeted: boolean;
  matchingTokens: number;
  distinctWords: number;
  examples: string[];
}

export interface ReadabilityReport {
  totalWords: number;
  averageWordsPerPassage: number;
  averageSentenceLength: number;
  longSentences: { passage: string; words: number; sentence: string }[];
  longWords: string[];
  maxWordsInPassage: { passage: string; words: number };
}

export interface LiteracyReport {
  reportVersion: 1;
  storyId: string;
  storyVersion: number;
  storyHash: string;
  profile: string;
  method: string;
  limitations: string[];
  review: Story['literacy']['review'];
  wordSets: WordSetReport[];
  concepts: ConceptReport[];
  unknownTargetConcepts: string[];
  readability: ReadabilityReport;
  automatedChecks: { id: string; ok: boolean; detail: string }[];
  /** Master-spec design checks that are reported but do not fail validation. */
  learningDesign: LearningDesignReport;
  ok: boolean;
}

export interface LearningDesignReport {
  targets: Record<LearningTarget, number>;
  passagesTagged: number;
  missingTargets: LearningTarget[];
  glossaryWithDefinitions: number;
  advisories: { id: string; ok: boolean; detail: string }[];
}

export function learningDesign(story: Story): LearningDesignReport {
  const targets = Object.fromEntries(LEARNING_TARGETS.map((t) => [t, 0])) as Record<LearningTarget, number>;
  let tagged = 0;
  for (const p of story.passages) {
    const here = new Set([...(p.learningTargets ?? []), ...p.choices.flatMap((c) => c.learningTargets ?? [])]);
    if (here.size) tagged++;
    for (const t of here) targets[t]++;
  }
  const missingTargets = LEARNING_TARGETS.filter((t) => targets[t] === 0);
  const glossaryWithDefinitions = Object.values(story.glossary ?? {}).filter((g) => g.definition).length;
  return {
    targets,
    passagesTagged: tagged,
    missingTargets,
    glossaryWithDefinitions,
    advisories: [
      { id: 'learning-targets-tagged', ok: missingTargets.length === 0, detail: missingTargets.length ? `no moments tagged for: ${missingTargets.join(', ')}` : 'every learning objective has tagged moments' },
      { id: 'word-help-definitions', ok: glossaryWithDefinitions > 0, detail: `${glossaryWithDefinitions} glossary word(s) with a definition` },
    ],
  };
}

export const LONG_SENTENCE = 20;

/** Shortest route (by passages) from start to each ending, ignoring conditions. */
export function shortestRoutes(story: Story): Record<string, string[]> {
  const byId = new Map(story.passages.map((p) => [p.id, p]));
  const prev = new Map<string, string | null>([[story.start, null]]);
  const queue = [story.start];
  while (queue.length) {
    const id = queue.shift()!;
    for (const c of byId.get(id)?.choices ?? []) {
      if (!prev.has(c.target) && byId.has(c.target)) {
        prev.set(c.target, id);
        queue.push(c.target);
      }
    }
  }
  const routes: Record<string, string[]> = {};
  for (const p of story.passages) {
    if (!p.ending || !prev.has(p.id)) continue;
    const route: string[] = [];
    for (let at: string | null | undefined = p.id; at; at = prev.get(at)) route.unshift(at);
    routes[p.ending.id] = route;
  }
  return routes;
}

function routeTokens(story: Story, id: string, nextId: string | undefined): string[] {
  const p = story.passages.find((x) => x.id === id);
  if (!p) return [];
  const taken = nextId ? p.choices.find((c) => c.target === nextId)?.label ?? '' : '';
  return tokenize([p.title ?? '', ...p.paragraphs, taken].join(' '));
}

function wordSetReport(story: Story, set: WordSet, tokensByPassage: Map<string, string[]>, routes: Record<string, string[]>): WordSetReport {
  const perWord: Record<string, number> = Object.fromEntries(set.words.map((w) => [w, 0]));
  let passagesWithSet = 0;
  const countIn = (tokens: string[]) => tokens.reduce((n, t) => n + set.words.filter((w) => matchesWord(t, w)).length, 0);
  for (const tokens of tokensByPassage.values()) {
    let here = 0;
    for (const t of tokens)
      for (const w of set.words)
        if (matchesWord(t, w)) {
          perWord[w] = (perWord[w] ?? 0) + 1;
          here++;
        }
    if (here > 0) passagesWithSet++;
  }
  const total = Object.values(perWord).reduce((a, b) => a + b, 0);
  // A route counts what the reader actually sees on it: each passage's title
  // and paragraphs plus the label of the choice taken, not unchosen labels.
  const perEndingRoute: Record<string, number> = {};
  for (const [ending, route] of Object.entries(routes)) perEndingRoute[ending] = route.reduce((n, id, i) => n + countIn(routeTokens(story, id, route[i + 1])), 0);
  const concept = set.concept ? conceptById.get(set.concept) : undefined;
  return {
    id: set.id,
    label: set.label,
    concept: set.concept,
    minOccurrences: set.minOccurrences,
    totalOccurrences: total,
    passagesWithSet,
    perWord,
    missingWords: set.words.filter((w) => perWord[w] === 0),
    meetsMinimum: total >= set.minOccurrences,
    perEndingRoute,
    conceptMismatches: concept ? set.words.filter((w) => !concept.detect(w)) : [],
  };
}

export function analyzeStory(story: Story, profile?: TerminologyProfile): LiteracyReport {
  const tokensByPassage = new Map(story.passages.map((p) => [p.id, tokenize(passageText(story, p.id))]));
  const allTokens = [...tokensByPassage.values()].flat();
  const routes = shortestRoutes(story);

  const wordSets = story.literacy.wordSets.map((s) => wordSetReport(story, s, tokensByPassage, routes));
  const targeted = new Set(story.literacy.targetConcepts);
  const concepts: ConceptReport[] = CONCEPTS.map((c) => {
    const hits = allTokens.filter((t) => c.detect(t));
    const distinct = [...new Set(hits)].sort();
    return {
      id: c.id,
      label: labelFor(c.id, profile),
      pattern: c.pattern,
      targeted: targeted.has(c.id),
      matchingTokens: hits.length,
      distinctWords: distinct.length,
      examples: distinct.slice(0, 12),
    };
  });

  const longSentences: ReadabilityReport['longSentences'] = [];
  let sentenceCount = 0;
  let sentenceWords = 0;
  let maxPassage = { passage: '', words: 0 };
  for (const p of story.passages) {
    const words = p.paragraphs.reduce((n, para) => n + tokenize(para).length, 0);
    if (words > maxPassage.words) maxPassage = { passage: p.id, words };
    for (const para of p.paragraphs)
      for (const s of sentences(para)) {
        const n = tokenize(s).length;
        sentenceCount++;
        sentenceWords += n;
        if (n > LONG_SENTENCE) longSentences.push({ passage: p.id, words: n, sentence: s });
      }
  }
  const proseWords = story.passages.reduce((n, p) => n + p.paragraphs.reduce((m, para) => m + tokenize(para).length, 0), 0);
  const readability: ReadabilityReport = {
    totalWords: proseWords,
    averageWordsPerPassage: round(proseWords / story.passages.length),
    averageSentenceLength: round(sentenceWords / Math.max(1, sentenceCount)),
    longSentences,
    longWords: [...new Set(allTokens.filter((t) => estimateSyllables(t) >= 4))].sort(),
    maxWordsInPassage: maxPassage,
  };

  const unknownTargetConcepts = story.literacy.targetConcepts.filter((c) => !conceptById.has(c));
  const automatedChecks = [
    { id: 'word-set-minimums', ok: wordSets.every((s) => s.meetsMinimum), detail: wordSets.map((s) => `${s.id}: ${s.totalOccurrences}/${s.minOccurrences}`).join('; ') },
    { id: 'every-word-used', ok: wordSets.every((s) => s.missingWords.length === 0), detail: wordSets.flatMap((s) => s.missingWords.map((w) => `${s.id}:${w}`)).join(', ') || 'all words appear' },
    {
      id: 'word-sets-on-every-route',
      ok: wordSets.every((s) => Object.values(s.perEndingRoute).every((n) => n > 0)),
      detail: 'each word set appears on the shortest route to every ending',
    },
    { id: 'word-set-concepts-match-spelling', ok: wordSets.every((s) => s.conceptMismatches.length === 0), detail: wordSets.flatMap((s) => s.conceptMismatches.map((w) => `${s.id}:${w}`)).join(', ') || 'no mismatches' },
    { id: 'target-concepts-known', ok: unknownTargetConcepts.length === 0, detail: unknownTargetConcepts.join(', ') || 'all known' },
    {
      id: 'target-concepts-present',
      ok: concepts.filter((c) => c.targeted).every((c) => c.matchingTokens > 0),
      detail: concepts.filter((c) => c.targeted).map((c) => `${c.id}: ${c.matchingTokens}`).join('; '),
    },
    { id: 'sentence-length', ok: longSentences.length === 0, detail: `${longSentences.length} sentence(s) over ${LONG_SENTENCE} words` },
  ];

  return {
    reportVersion: 1,
    storyId: story.id,
    storyVersion: story.version,
    storyHash: contentHash(story),
    profile: profile?.id ?? 'neutral',
    method: 'Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.',
    limitations: [
      'Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").',
      'Syllable counts are estimates from vowel groups.',
      'These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.',
    ],
    review: story.literacy.review,
    wordSets,
    concepts,
    unknownTargetConcepts,
    readability,
    automatedChecks,
    learningDesign: learningDesign(story),
    ok: automatedChecks.every((c) => c.ok),
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

export function literacyReportMarkdown(r: LiteracyReport): string {
  const lines = [
    `# Literacy report: ${r.storyId} v${r.storyVersion}`,
    '',
    `Story hash (sha256 of canonical JSON): \`${r.storyHash}\``,
    `Terminology profile: ${r.profile}`,
    `Human literacy review status: **${r.review.status}**${r.review.reviewer ? ` (${r.review.reviewer}, ${r.review.reviewerKind ?? 'unknown'})` : ''}`,
    `Automated checks: **${r.ok ? 'all passed' : 'some failed'}**`,
    '',
    '## Automated checks',
    '',
    '| Check | Result | Detail |',
    '| --- | --- | --- |',
    ...r.automatedChecks.map((c) => `| ${c.id} | ${c.ok ? 'pass' : 'FAIL'} | ${c.detail} |`),
    '',
    '## Word sets',
    '',
    '| Set | Total / min | Passages | Missing | Per ending route |',
    '| --- | --- | --- | --- | --- |',
    ...r.wordSets.map(
      (s) =>
        `| ${s.label} | ${s.totalOccurrences} / ${s.minOccurrences} | ${s.passagesWithSet} | ${s.missingWords.join(', ') || 'none'} | ${Object.entries(s.perEndingRoute)
          .map(([e, n]) => `${e}: ${n}`)
          .join(', ')} |`,
    ),
    '',
    '## Concepts (spelling-pattern matches)',
    '',
    '| Concept | Targeted | Matches | Examples |',
    '| --- | --- | --- | --- |',
    ...r.concepts.filter((c) => c.targeted || c.matchingTokens > 0).map((c) => `| ${c.label} | ${c.targeted ? 'yes' : ''} | ${c.matchingTokens} | ${c.examples.join(', ')} |`),
    '',
    '## Learning design (master spec; advisory, does not fail validation)',
    '',
    ...r.learningDesign.advisories.map((a) => `- ${a.ok ? 'ok' : 'NEEDS WORK'} ${a.id}: ${a.detail}`),
    `- Tagged moments per objective: ${Object.entries(r.learningDesign.targets).map(([k, v]) => `${k} ${v}`).join(', ')}`,
    '',
    '## Readability',
    '',
    `- Words: ${r.readability.totalWords}, average per passage ${r.readability.averageWordsPerPassage}`,
    `- Average sentence length: ${r.readability.averageSentenceLength} words`,
    `- Longest passage: ${r.readability.maxWordsInPassage.passage} (${r.readability.maxWordsInPassage.words} words)`,
    `- Words estimated at 4+ syllables: ${r.readability.longWords.join(', ') || 'none'}`,
    '',
    '## Method and limitations',
    '',
    r.method,
    '',
    ...r.limitations.map((l) => `- ${l}`),
    '',
  ];
  return lines.join('\n');
}

import type { Story } from '../engine/types';
import type { LiteracyReport } from '../literacy/analyzer';
import type { ContinuityAssessment } from './continuity';
import type { NormalizedBrief } from './request';

export interface OutlineBeat {
  id: string;
  purpose: string;
  next: string[];
  mechanic?: 'clue' | 'item' | 'locked-choice' | 'ending';
}

export interface StoryOutline {
  briefTitle: string;
  beats: OutlineBeat[];
  endings: number;
  notes: string[];
}

export interface WordWeavePlan {
  sets: {
    id: string;
    label: string;
    minOccurrences: number;
    plannedOccurrences: number;
    placements: { beat: string; words: string[] }[];
  }[];
  rules: string[];
}

/**
 * Deterministic outline skeleton. The narrative designer is free to add
 * passages and rename ids; the skeleton only guarantees that the required
 * mechanics have a place in the story.
 */
export function outlineFor(brief: NormalizedBrief, continuity: ContinuityAssessment): StoryOutline {
  const endings = Array.from({ length: brief.endingTarget }, (_, i) => `ending-${i + 1}`);
  const beats: OutlineBeat[] = [
    { id: 'opening', purpose: 'Hook: introduce the hero, the place and the problem.', next: ['path-a', 'path-b'] },
    { id: 'path-a', purpose: 'First branch. Find an item that matters later.', next: ['gathering'], mechanic: 'item' },
    { id: 'path-b', purpose: 'Second branch. Learn a clue.', next: ['gathering'], mechanic: 'clue' },
    { id: 'gathering', purpose: 'Paths meet. The hero may go back for what was missed.', next: ['path-a', 'path-b', 'threshold'] },
    { id: 'threshold', purpose: 'A choice that is locked without the item or clue, with a hint, plus an open alternative.', next: ['climax', endings.at(-1)!], mechanic: 'locked-choice' },
    { id: 'climax', purpose: 'The big moment. Choices lead to different endings.', next: endings.slice(0, -1) },
    ...endings.map((id, i): OutlineBeat => ({
      id,
      purpose: i === 0 ? 'Best ending: earned with clue and item.' : i === endings.length - 1 ? 'Gentle setback ending that invites another try.' : 'Different, satisfying ending.',
      next: [],
      mechanic: 'ending',
    })),
  ];
  const notes = [
    `Aim for ${brief.passageTarget.min}-${brief.passageTarget.max} passages and ${brief.endingTarget} endings.`,
    `Keep sentences at or under ${brief.maxSentenceWords} words.`,
    'Every ending must be reachable; no passage may trap the reader.',
  ];
  if (continuity.isSequel && continuity.previous)
    notes.push(`Sequel to "${continuity.previous.title}". Items that may return: ${continuity.carriedItems.join(', ') || 'none'}.`);
  brief.continuity.facts.forEach((f) => notes.push(`Continuity fact: ${f}`));
  brief.continuity.avoid.forEach((a) => notes.push(`Avoid: ${a}`));
  return { briefTitle: brief.title, beats, endings: brief.endingTarget, notes };
}

export function weavePlanFor(brief: NormalizedBrief, outline: StoryOutline): WordWeavePlan {
  const proseBeats = outline.beats.map((b) => b.id);
  return {
    sets: brief.wordSets.map((set) => {
      // Rotate through the words so each beat carries some and every word
      // appears at least twice across the outline.
      const placements = proseBeats.map((beat, i) => ({
        beat,
        words: [set.words[i % set.words.length]!, set.words[(i + 1) % set.words.length]!].filter((w, j, a) => a.indexOf(w) === j),
      }));
      const planned = placements.reduce((n, p) => n + p.words.length, 0);
      return { id: set.id, label: set.label, minOccurrences: set.minOccurrences, plannedOccurrences: Math.max(planned, set.minOccurrences), placements };
    }),
    rules: [
      'Words must read naturally in context: no lists of target words and no forced rhymes.',
      'Each set should appear on every route to an ending, not only on one branch.',
      'Choice labels count as reading, so use set words there too when it fits.',
    ],
  };
}

/** Story graph artifact extracted from a draft, for reviewers and diagrams. */
export function storyGraph(story: Story) {
  return {
    storyId: story.id,
    version: story.version,
    start: story.start,
    nodes: story.passages.map((p) => ({ id: p.id, title: p.title ?? null, ending: p.ending ?? null })),
    edges: story.passages.flatMap((p) =>
      p.choices.map((c) => ({ from: p.id, to: c.target, choice: c.id, locked: Boolean(c.requires), requires: c.requires ?? null })),
    ),
  };
}

export interface WeaveComparison {
  ok: boolean;
  sets: { id: string; planned: number; minimum: number; actual: number; ok: boolean }[];
}

export function compareWeave(plan: WordWeavePlan, report: LiteracyReport): WeaveComparison {
  const sets = plan.sets.map((p) => {
    const actual = report.wordSets.find((s) => s.id === p.id)?.totalOccurrences ?? 0;
    return { id: p.id, planned: p.plannedOccurrences, minimum: p.minOccurrences, actual, ok: actual >= p.minOccurrences };
  });
  return { ok: sets.every((s) => s.ok), sets };
}

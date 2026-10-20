import type { Choice, Condition, Effects, GameState, Passage, Story } from './types';

/** Pure, deterministic story engine. All functions return new state objects. */

export function passageById(story: Story, id: string): Passage {
  const passage = story.passages.find((p) => p.id === id);
  if (!passage) throw new Error(`Unknown passage "${id}" in story "${story.id}"`);
  return passage;
}

function uniq(values: string[]): string[] {
  return [...new Set(values)];
}

export function applyEffects(state: GameState, effects: Effects | undefined): GameState {
  if (!effects) return state;
  const removed = new Set(effects.removeItems ?? []);
  return {
    ...state,
    items: uniq([...state.items.filter((i) => !removed.has(i)), ...(effects.addItems ?? [])]),
    clues: uniq([...state.clues, ...(effects.addClues ?? [])]),
    flags: uniq([...state.flags, ...(effects.setFlags ?? [])]),
  };
}

export function meetsCondition(state: GameState, condition: Condition | undefined): boolean {
  if (!condition) return true;
  const has = (list: string[], wanted: string[] | undefined) => (wanted ?? []).every((w) => list.includes(w));
  return (
    has(state.items, condition.items) &&
    has(state.clues, condition.clues) &&
    has(state.flags, condition.flags) &&
    (condition.notFlags ?? []).every((f) => !state.flags.includes(f))
  );
}

export function newGame(story: Story, now: Date = new Date()): GameState {
  const base: GameState = {
    storyId: story.id,
    storyVersion: story.version,
    current: story.start,
    items: [],
    clues: [],
    flags: [],
    history: [story.start],
    endingsSeen: [],
    puzzlesSolved: [],
    updatedAt: now.toISOString(),
  };
  return enterPassage(story, base, story.start, now);
}

function enterPassage(story: Story, state: GameState, id: string, now: Date): GameState {
  const passage = passageById(story, id);
  let next = applyEffects({ ...state, current: id, updatedAt: now.toISOString() }, passage.effects);
  if (passage.ending && !next.endingsSeen.includes(passage.ending.id)) {
    next = { ...next, endingsSeen: [...next.endingsSeen, passage.ending.id] };
  }
  return next;
}

export interface ChoiceView {
  choice: Choice;
  available: boolean;
}

export function choicesFor(story: Story, state: GameState): ChoiceView[] {
  return passageById(story, state.current).choices.map((choice) => ({
    choice,
    available: meetsCondition(state, choice.requires),
  }));
}

export function choose(story: Story, state: GameState, choiceId: string, now: Date = new Date()): GameState {
  const passage = passageById(story, state.current);
  const choice = passage.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`Choice "${choiceId}" is not offered in passage "${passage.id}"`);
  if (!meetsCondition(state, choice.requires)) throw new Error(`Choice "${choiceId}" is locked`);
  const afterChoice = applyEffects(state, choice.effects);
  return enterPassage(story, { ...afterChoice, history: [...afterChoice.history, choice.target] }, choice.target, now);
}

/** Restart from the beginning while remembering which endings were found. */
export function restart(story: Story, state: GameState, now: Date = new Date()): GameState {
  // Endings found carry over to the next playthrough; puzzles reset with the story.
  const fresh = newGame(story, now);
  return { ...fresh, endingsSeen: uniq([...state.endingsSeen, ...fresh.endingsSeen]) };
}

export const normalizeAnswer = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export interface PuzzleResult {
  state: GameState;
  solved: boolean;
}

/**
 * Check a typing-puzzle answer. There is no timer and no limit on attempts;
 * a wrong answer changes nothing.
 */
export function solvePuzzle(story: Story, state: GameState, answer: string, now: Date = new Date()): PuzzleResult {
  const puzzle = passageById(story, state.current).puzzle;
  if (!puzzle) throw new Error(`Passage "${state.current}" has no puzzle`);
  if (state.puzzlesSolved.includes(puzzle.id)) return { state, solved: true };
  const ok = puzzle.answers.some((a) => normalizeAnswer(a) === normalizeAnswer(answer));
  if (!ok) return { state, solved: false };
  const next = applyEffects({ ...state, puzzlesSolved: [...state.puzzlesSolved, puzzle.id], updatedAt: now.toISOString() }, puzzle.effects);
  return { state: next, solved: true };
}

export function isEnding(story: Story, state: GameState): boolean {
  return Boolean(passageById(story, state.current).ending);
}

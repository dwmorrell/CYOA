import type { Condition, Effects, Story } from '../engine/types';
import { applyEffects, meetsCondition } from '../engine/story-engine';
import type { GameState } from '../engine/types';

export interface Issue {
  code: string;
  message: string;
  passage?: string;
}

export interface GraphStats {
  passages: number;
  choices: number;
  endings: string[];
  reachableEndings: string[];
  shortestPathToEnding?: number;
  longestSimplePathToEnding?: number;
  exploredStates: number;
  stateSearchComplete: boolean;
}

export interface GraphReport {
  ok: boolean;
  errors: Issue[];
  warnings: Issue[];
  stats: GraphStats;
}

const MAX_STATES = 50_000;

/**
 * Deterministic structural validation of a story graph. Beyond plain link
 * checking it explores the game state space (items, clues, flags) so that it
 * can prove every ending is actually reachable and that no reachable state is
 * a soft-lock where every choice is locked.
 */
export function validateGraph(story: Story): GraphReport {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const ids = new Map<string, number>();
  for (const p of story.passages) ids.set(p.id, (ids.get(p.id) ?? 0) + 1);
  for (const [id, n] of ids) if (n > 1) errors.push({ code: 'duplicate-passage', message: `Passage id "${id}" is used ${n} times`, passage: id });

  const passages = new Map(story.passages.map((p) => [p.id, p]));
  if (!passages.has(story.start)) errors.push({ code: 'missing-start', message: `Start passage "${story.start}" does not exist` });

  const itemIds = new Set(story.items.map((i) => i.id));
  const clueIds = new Set(story.clues.map((c) => c.id));
  const flagsSet = new Set<string>();
  const collectFlags = (e?: Effects) => e?.setFlags?.forEach((f) => flagsSet.add(f));
  story.passages.forEach((p) => {
    collectFlags(p.effects);
    p.choices.forEach((c) => collectFlags(c.effects));
  });

  const checkRefs = (where: string, cond?: Condition, eff?: Effects) => {
    for (const i of [...(cond?.items ?? []), ...(eff?.addItems ?? []), ...(eff?.removeItems ?? [])])
      if (!itemIds.has(i)) errors.push({ code: 'unknown-item', message: `Unknown item "${i}"`, passage: where });
    for (const c of [...(cond?.clues ?? []), ...(eff?.addClues ?? [])])
      if (!clueIds.has(c)) errors.push({ code: 'unknown-clue', message: `Unknown clue "${c}"`, passage: where });
    for (const f of cond?.flags ?? [])
      if (!flagsSet.has(f)) errors.push({ code: 'unset-flag', message: `Flag "${f}" is required but never set`, passage: where });
  };

  const endingIds = new Map<string, number>();
  let choiceCount = 0;
  for (const p of story.passages) {
    checkRefs(p.id, undefined, p.effects);
    const choiceIds = new Set<string>();
    for (const c of p.choices) {
      choiceCount++;
      if (choiceIds.has(c.id)) errors.push({ code: 'duplicate-choice', message: `Choice id "${c.id}" repeats`, passage: p.id });
      choiceIds.add(c.id);
      if (!passages.has(c.target)) errors.push({ code: 'broken-link', message: `Choice "${c.id}" points to missing passage "${c.target}"`, passage: p.id });
      checkRefs(p.id, c.requires, c.effects);
    }
    if (p.ending) {
      endingIds.set(p.ending.id, (endingIds.get(p.ending.id) ?? 0) + 1);
      if (p.choices.length > 0) errors.push({ code: 'ending-has-choices', message: 'An ending passage must not offer choices', passage: p.id });
    } else if (p.choices.length === 0) {
      errors.push({ code: 'dead-end', message: 'Passage has no choices and is not an ending', passage: p.id });
    }
  }
  for (const [id, n] of endingIds) if (n > 1) errors.push({ code: 'duplicate-ending', message: `Ending id "${id}" is used ${n} times` });
  if (endingIds.size < 2) errors.push({ code: 'too-few-endings', message: `Story needs at least 2 endings, found ${endingIds.size}` });

  // Structural reachability, ignoring conditions.
  const structural = new Set<string>();
  const stack = passages.has(story.start) ? [story.start] : [];
  while (stack.length) {
    const id = stack.pop()!;
    if (structural.has(id)) continue;
    structural.add(id);
    passages.get(id)?.choices.forEach((c) => passages.has(c.target) && stack.push(c.target));
  }
  for (const p of story.passages)
    if (!structural.has(p.id)) warnings.push({ code: 'unreachable-passage', message: 'Passage cannot be reached from the start', passage: p.id });

  const stats: GraphStats = {
    passages: story.passages.length,
    choices: choiceCount,
    endings: [...endingIds.keys()],
    reachableEndings: [],
    exploredStates: 0,
    stateSearchComplete: false,
  };
  if (errors.length > 0) return { ok: false, errors, warnings, stats };

  // State-space exploration with real conditions and effects.
  const keyOf = (s: GameState) => `${s.current}|${[...s.items].sort()}|${[...s.clues].sort()}|${[...s.flags].sort()}`;
  const initial = applyEffects(
    { storyId: story.id, storyVersion: story.version, current: story.start, items: [], clues: [], flags: [], history: [], endingsSeen: [], updatedAt: '' },
    passages.get(story.start)!.effects,
  );
  const seen = new Map<string, GameState>([[keyOf(initial), initial]]);
  const edges = new Map<string, string[]>();
  const depth = new Map<string, number>([[keyOf(initial), 0]]);
  const queue = [initial];
  const reachableEndings = new Set<string>();
  let shortest: number | undefined;
  let complete = true;
  while (queue.length) {
    const state = queue.shift()!;
    const k = keyOf(state);
    const passage = passages.get(state.current)!;
    if (passage.ending) {
      reachableEndings.add(passage.ending.id);
      const d = depth.get(k)! + 1;
      shortest = shortest === undefined ? d : Math.min(shortest, d);
      edges.set(k, []);
      continue;
    }
    const out: string[] = [];
    const enqueue = (next: GameState, step = 1) => {
      const nk = keyOf(next);
      out.push(nk);
      if (!seen.has(nk)) {
        if (seen.size >= MAX_STATES) {
          complete = false;
          return;
        }
        seen.set(nk, next);
        depth.set(nk, depth.get(k)! + step);
        queue.push(next);
      }
    };
    const open = passage.choices.filter((c) => meetsCondition(state, c.requires));
    if (open.length === 0) {
      errors.push({ code: 'soft-lock', message: `All choices are locked when holding items [${state.items}] clues [${state.clues}] flags [${state.flags}]`, passage: passage.id });
    }
    for (const c of open) {
      const target = passages.get(c.target)!;
      enqueue(applyEffects(applyEffects({ ...state, current: c.target }, c.effects), target.effects));
    }
    edges.set(k, out);
  }

  // Every explored state must be able to reach some ending (no trap loops).
  const canFinish = new Set<string>();
  for (const [k, s] of seen) if (passages.get(s.current)!.ending) canFinish.add(k);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [k, out] of edges) {
      if (!canFinish.has(k) && out.some((o) => canFinish.has(o))) {
        canFinish.add(k);
        changed = true;
      }
    }
  }
  if (complete) {
    const trapped = new Set<string>();
    for (const [k, s] of seen) if (!canFinish.has(k)) trapped.add(s.current);
    for (const id of trapped) errors.push({ code: 'no-way-out', message: 'From some reachable state here, no ending can ever be reached', passage: id });
  } else {
    warnings.push({ code: 'state-search-truncated', message: `State search stopped after ${MAX_STATES} states; trap and soft-lock checks are incomplete` });
  }

  for (const e of endingIds.keys())
    if (!reachableEndings.has(e)) errors.push({ code: 'unreachable-ending', message: `Ending "${e}" cannot be reached in play` });

  stats.reachableEndings = [...reachableEndings].sort();
  stats.shortestPathToEnding = shortest;
  stats.longestSimplePathToEnding = longestSimplePath(story);
  stats.exploredStates = seen.size;
  stats.stateSearchComplete = complete;
  return { ok: errors.length === 0, errors, warnings, stats };
}

/** Longest loop-free route (in passages read) from start to any ending. */
function longestSimplePath(story: Story): number {
  const passages = new Map(story.passages.map((p) => [p.id, p]));
  let best = 0;
  let budget = 200_000;
  const visit = (id: string, onPath: Set<string>) => {
    if (budget-- <= 0) return;
    const p = passages.get(id);
    if (!p) return;
    if (p.ending) {
      best = Math.max(best, onPath.size + 1);
      return;
    }
    onPath.add(id);
    for (const c of p.choices) if (!onPath.has(c.target)) visit(c.target, onPath);
    onPath.delete(id);
  };
  visit(story.start, new Set());
  return best;
}

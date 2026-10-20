// Typing practice add-on: a pure engine. It has no timers, no story data and no
// network. Times are passed in as milliseconds, so the engine never waits on a
// clock and tests can check exact values. Nothing here is reading fluency, and
// no round has a time limit: speed is only measured from the keys typed.

/** Five characters make one "word" in the standard words-a-minute measure. */
export const CHARS_PER_WORD = 5;
export const MAX_WORDS = 40;
export const MAX_WORD_LENGTH = 24;
/** Shortest span used for speed, so the first key cannot read as a huge speed. */
const MIN_SPAN_MS = 1000;

/** A word list the parent, a tutor or any grown-up has written. */
export interface TypingList {
  id: string;
  name: string;
  words: string[];
}

/** One finished lap on a track's high score list. */
export interface ScoreEntry {
  name: string;
  /** Net words a minute, after mistakes. */
  wpm: number;
  accuracy: number;
  lapSeconds: number;
  /** When the lap was finished, as an ISO time. */
  at: string;
}

export const MAX_SCORES = 10;

/** One lap: the list's words, typed in order, separated by single spaces. */
export interface Lap {
  target: string;
  typed: string;
  /** Characters pressed, corrections included. Backspace does not count. */
  keystrokes: number;
  /** Pressed characters that did not match the target at their position. */
  errors: number;
  /** Time of the first character. */
  startedAt?: number;
  /** Time of the latest character; speed is measured up to here. */
  lastAt?: number;
  /** Time the typed text matched the target. */
  finishedAt?: number;
}

export const WORD_PATTERN = /^[a-z'-]+$/;

/**
 * Reads a word list typed by a grown-up. Words may be separated by spaces,
 * commas, semicolons or new lines. Words are kept in lower case, duplicates are
 * dropped, and anything with other characters is reported in `skipped`.
 */
export function parseWordList(text: string): { words: string[]; skipped: string[] } {
  const words = new Set<string>();
  const skipped: string[] = [];
  for (const raw of text.split(/[\s,;]+/)) {
    if (!raw) continue;
    const word = raw.toLowerCase();
    if (word.length > MAX_WORD_LENGTH || !WORD_PATTERN.test(word)) skipped.push(raw);
    else if (words.size < MAX_WORDS) words.add(word);
    else skipped.push(raw);
  }
  return { words: [...words], skipped };
}

export function startLap(words: string[]): Lap {
  return { target: words.join(' '), typed: '', keystrokes: 0, errors: 0 };
}

/**
 * Records the input's new value. Characters added count as keystrokes, and each
 * one that does not match the target at its position is an error. Removing
 * characters (backspace) costs nothing, but the errors already made still count,
 * so a corrected mistake lowers accuracy. Input past the end of the target is an
 * error and is not kept.
 */
export function typeInto(lap: Lap, value: string, nowMs: number): Lap {
  if (lap.finishedAt !== undefined || lap.target === '') return lap;
  let { keystrokes, errors } = lap;
  for (let i = lap.typed.length; i < value.length; i++) {
    keystrokes++;
    if (value[i] !== lap.target[i]) errors++;
  }
  const typed = value.slice(0, lap.target.length);
  const pressed = keystrokes > lap.keystrokes;
  return {
    ...lap,
    typed,
    keystrokes,
    errors,
    startedAt: lap.startedAt ?? (pressed ? nowMs : undefined),
    lastAt: pressed ? nowMs : lap.lastAt,
    finishedAt: typed === lap.target ? nowMs : undefined,
  };
}

/** Words a minute from keystrokes over the time up to the latest key. */
export function grossWpm(lap: Lap): number {
  if (lap.startedAt === undefined || lap.lastAt === undefined) return 0;
  const minutes = Math.max(lap.lastAt - lap.startedAt, MIN_SPAN_MS) / 60_000;
  return lap.keystrokes / CHARS_PER_WORD / minutes;
}

/** Share of keystrokes that were correct, from 0 to 1. Nothing typed counts as fully accurate. */
export function accuracy(lap: Lap): number {
  if (lap.keystrokes === 0) return 1;
  return (lap.keystrokes - lap.errors) / lap.keystrokes;
}

/** Speed for the car: gross words a minute, reduced by mistakes. */
export function netWpm(lap: Lap): number {
  return grossWpm(lap) * accuracy(lap);
}

/**
 * Seconds to drive one lap at a speed. A lap is as long as the target text, so
 * a faster speed gives a shorter lap. Undefined until there is a speed.
 */
export function lapSeconds(target: string, wpm: number): number | undefined {
  if (wpm <= 0) return undefined;
  return (target.length / CHARS_PER_WORD / wpm) * 60;
}

/** Seconds the finished lap took, or undefined while it is still being typed. */
export function lapTimeSeconds(lap: Lap): number | undefined {
  if (lap.finishedAt === undefined || lap.startedAt === undefined) return undefined;
  return Math.max(lap.finishedAt - lap.startedAt, MIN_SPAN_MS) / 1000;
}

/**
 * How far round the track the car is, from 0 to 1: the share of the lap typed
 * correctly from the start. A wrong letter stops the car until it is fixed.
 */
export function carProgress(lap: Lap): number {
  if (lap.target === '') return 0;
  return correctLength(lap) / lap.target.length;
}

/** Number of leading characters typed correctly. */
export function correctLength(lap: Lap): number {
  let n = 0;
  while (n < lap.typed.length && lap.typed[n] === lap.target[n]) n++;
  return n;
}

/** The score for a finished lap, or undefined while the lap is still being typed. */
export function scoreFor(lap: Lap, name: string, at: string): ScoreEntry | undefined {
  const lapTime = lapTimeSeconds(lap);
  if (lapTime === undefined) return undefined;
  return { name, wpm: netWpm(lap), accuracy: accuracy(lap), lapSeconds: lapTime, at };
}

/** Adds a lap to a track's list: faster net speed ranks higher, then the quicker lap. Only the top places are kept. */
export function addScore(scores: ScoreEntry[], entry: ScoreEntry): ScoreEntry[] {
  return [...scores, entry].sort((a, b) => b.wpm - a.wpm || a.lapSeconds - b.lapSeconds).slice(0, MAX_SCORES);
}

/** Formats seconds as m:ss for a lap time. */
export function formatLapTime(seconds: number): string {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

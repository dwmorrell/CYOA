import type { GameState } from './types';

// Pure validation helpers and reading preferences. Storage itself lives in
// src/storage (IndexedDB, per master spec section 6).

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

export function isGameState(v: unknown): v is GameState {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.storyId === 'string' &&
    typeof s.storyVersion === 'number' &&
    typeof s.current === 'string' &&
    isStringArray(s.items) &&
    isStringArray(s.clues) &&
    isStringArray(s.flags) &&
    isStringArray(s.history) &&
    isStringArray(s.endingsSeen) &&
    typeof s.updatedAt === 'string'
  );
}

export interface ReadingPrefs {
  fontScale: number;
  lineHeight: number;
  letterSpacing: number;
  /** 'dyslexic' is the optional OpenDyslexic font (master spec section 4). */
  font: 'system' | 'dyslexic' | 'rounded' | 'serif';
  theme: 'cream' | 'blue' | 'grey' | 'dark';
  lineFocus: boolean;
  readAloud: boolean;
  /** Optional word help: tap marked words for syllables and meanings. */
  wordHelp: boolean;
}

export const DEFAULT_PREFS: ReadingPrefs = {
  fontScale: 1.2,
  lineHeight: 1.8,
  letterSpacing: 0.05,
  font: 'system',
  theme: 'cream',
  lineFocus: false,
  readAloud: false,
  wordHelp: true,
};

export function isReadingPrefs(v: unknown): v is ReadingPrefs {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.fontScale === 'number' &&
    typeof p.lineHeight === 'number' &&
    typeof p.letterSpacing === 'number' &&
    ['system', 'dyslexic', 'rounded', 'serif'].includes(p.font as string) &&
    ['cream', 'blue', 'grey', 'dark'].includes(p.theme as string) &&
    typeof p.lineFocus === 'boolean' &&
    typeof p.readAloud === 'boolean' &&
    typeof p.wordHelp === 'boolean'
  );
}

export function clampPrefs(p: ReadingPrefs): ReadingPrefs {
  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  return {
    ...p,
    fontScale: clamp(p.fontScale, 0.9, 2.2),
    lineHeight: clamp(p.lineHeight, 1.4, 2.6),
    letterSpacing: clamp(p.letterSpacing, 0, 0.2),
  };
}

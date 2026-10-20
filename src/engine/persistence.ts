import type { GameState } from './types';

/**
 * Local-first persistence. Everything lives in the browser's localStorage; no
 * network service is required. Storage can be unavailable (private mode,
 * quota, managed Chromebooks), so every access is guarded and the app keeps
 * working in memory.
 */

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const PREFIX = 'cyoa:v1:';

export function memoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

export function browserStore(): KeyValueStore {
  try {
    const probe = `${PREFIX}probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStore();
  }
}

export function readJson<T>(store: KeyValueStore, key: string, isValid: (v: unknown) => v is T): T | undefined {
  try {
    const raw = store.getItem(PREFIX + key);
    if (raw === null) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function writeJson(store: KeyValueStore, key: string, value: unknown): boolean {
  try {
    store.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(store: KeyValueStore, key: string): void {
  try {
    store.removeItem(PREFIX + key);
  } catch {
    // Ignore: nothing to clean up if storage is unavailable.
  }
}

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

export const saveKey = (storyId: string) => `save:${storyId}`;

export function loadGame(store: KeyValueStore, storyId: string, storyVersion: number, passageIds: string[]): GameState | undefined {
  const saved = readJson(store, saveKey(storyId), isGameState);
  // A save from another story version may point at passages that no longer
  // exist; discard it rather than crash.
  if (!saved || saved.storyVersion !== storyVersion || !passageIds.includes(saved.current)) return undefined;
  return saved;
}

export function saveGame(store: KeyValueStore, state: GameState): boolean {
  return writeJson(store, saveKey(state.storyId), state);
}

export interface ReadingPrefs {
  fontScale: number;
  lineHeight: number;
  letterSpacing: number;
  font: 'system' | 'rounded' | 'serif';
  theme: 'cream' | 'blue' | 'grey' | 'dark';
  lineFocus: boolean;
  readAloud: boolean;
}

export const DEFAULT_PREFS: ReadingPrefs = {
  fontScale: 1.2,
  lineHeight: 1.8,
  letterSpacing: 0.05,
  font: 'system',
  theme: 'cream',
  lineFocus: false,
  readAloud: false,
};

export function isReadingPrefs(v: unknown): v is ReadingPrefs {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.fontScale === 'number' &&
    typeof p.lineHeight === 'number' &&
    typeof p.letterSpacing === 'number' &&
    ['system', 'rounded', 'serif'].includes(p.font as string) &&
    ['cream', 'blue', 'grey', 'dark'].includes(p.theme as string) &&
    typeof p.lineFocus === 'boolean' &&
    typeof p.readAloud === 'boolean'
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

import { describe, expect, it } from 'vitest';
import { choose, newGame } from '../../src/engine/story-engine';
import { clampPrefs, DEFAULT_PREFS, loadGame, memoryStore, saveGame, saveKey, type KeyValueStore } from '../../src/engine/persistence';
import { fixture } from '../helpers';

const story = fixture();
const ids = story.passages.map((p) => p.id);

describe('local persistence', () => {
  it('round-trips a saved game', () => {
    const store = memoryStore();
    const s = choose(story, newGame(story), 'go-pond');
    expect(saveGame(store, s)).toBe(true);
    expect(loadGame(store, story.id, story.version, ids)).toEqual(s);
  });

  it('discards saves from another story version or with unknown passages', () => {
    const store = memoryStore();
    saveGame(store, { ...newGame(story), storyVersion: 99 });
    expect(loadGame(store, story.id, story.version, ids)).toBeUndefined();
    saveGame(store, { ...newGame(story), current: 'deleted-passage' });
    expect(loadGame(store, story.id, story.version, ids)).toBeUndefined();
  });

  it('ignores corrupt data instead of crashing', () => {
    const store = memoryStore();
    store.setItem(`cyoa:v1:${saveKey(story.id)}`, '{not json');
    expect(loadGame(store, story.id, story.version, ids)).toBeUndefined();
  });

  it('reports failure when storage throws (quota or blocked storage)', () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => undefined,
    };
    expect(saveGame(broken, newGame(story))).toBe(false);
    expect(loadGame(broken, story.id, story.version, ids)).toBeUndefined();
  });

  it('clamps reading preferences to safe ranges', () => {
    const p = clampPrefs({ ...DEFAULT_PREFS, fontScale: 9, lineHeight: 0.5, letterSpacing: -1 });
    expect(p.fontScale).toBe(2.2);
    expect(p.lineHeight).toBe(1.4);
    expect(p.letterSpacing).toBe(0);
  });
});

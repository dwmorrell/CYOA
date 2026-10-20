import { describe, expect, it } from 'vitest';
import { choicesFor, choose, isEnding, newGame, restart } from '../../src/engine/story-engine';
import { fixture } from '../helpers';

const story = fixture();

describe('story engine', () => {
  it('starts at the start passage with empty inventory', () => {
    const s = newGame(story);
    expect(s.current).toBe('hill');
    expect(s.items).toEqual([]);
    expect(s.history).toEqual(['hill']);
  });

  it('applies passage effects: items and clues', () => {
    let s = choose(story, newGame(story), 'go-pond');
    expect(s.items).toEqual(['net']);
    s = choose(story, choose(story, newGame(story), 'go-shed'), 'back-hill');
    expect(s.clues).toEqual(['red-thread']);
  });

  it('locks choices until requirements are met', () => {
    const viaShed = choose(story, choose(story, newGame(story), 'go-shed'), 'back-hill');
    const views = Object.fromEntries(choicesFor(story, viaShed).map((v) => [v.choice.id, v.available]));
    expect(views).toEqual({ 'use-net': false, 'follow-thread': true, 'give-up': true, 'look-again': true });
    expect(() => choose(story, viaShed, 'use-net')).toThrow(/locked/);
  });

  it('reaches multiple distinct endings and remembers them across restarts', () => {
    let s = choose(story, choose(story, choose(story, newGame(story), 'go-pond'), 'to-top'), 'use-net');
    expect(isEnding(story, s)).toBe(true);
    expect(s.endingsSeen).toEqual(['kite-back']);
    s = restart(story, s);
    expect(s.current).toBe('hill');
    expect(s.items).toEqual([]);
    s = choose(story, choose(story, choose(story, s, 'go-pond'), 'to-top'), 'give-up');
    expect(s.endingsSeen).toEqual(['kite-back', 'home-again']);
  });

  it('rejects choices that are not offered', () => {
    expect(() => choose(story, newGame(story), 'use-net')).toThrow(/not offered/);
  });
});

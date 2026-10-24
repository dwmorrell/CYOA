import { describe, expect, it } from 'vitest';
import { validateGraph } from '../../src/validation/graph';
import { validateSchema } from '../../src/validation/schema';
import { clone, fixture } from '../helpers';

describe('story schema', () => {
  it('accepts the fixture story', () => {
    expect(validateSchema(fixture())).toEqual({ ok: true, errors: [] });
  });

  it('rejects missing fields, bad ids and unknown properties', () => {
    const s = clone(fixture()) as unknown as Record<string, unknown>;
    delete s.start;
    s.id = 'Bad Id';
    s.surprise = true;
    const r = validateSchema(s);
    expect(r.ok).toBe(false);
    expect(r.errors.join('\n')).toMatch(/start/);
    expect(r.errors.join('\n')).toMatch(/pattern/);
    expect(r.errors.join('\n')).toMatch(/additional/);
  });

  it('does not let a story carry a publication status field', () => {
    const s = clone(fixture()) as unknown as Record<string, unknown>;
    s.status = 'published';
    expect(validateSchema(s).ok).toBe(false);
  });
});

describe('story graph validation', () => {
  it('passes the fixture and proves every ending reachable', () => {
    const r = validateGraph(fixture());
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.stats.reachableEndings).toEqual(['home-again', 'kite-back', 'new-friend']);
    expect(r.stats.stateSearchComplete).toBe(true);
    expect(r.stats.shortestPathToEnding).toBe(4);
  });

  it('finds broken links and dead ends', () => {
    const s = clone(fixture());
    s.passages[0]!.choices[0]!.target = 'nowhere';
    s.passages[2]!.choices = [];
    const codes = validateGraph(s).errors.map((e) => e.code);
    expect(codes).toContain('broken-link');
    expect(codes).toContain('dead-end');
  });

  it('requires at least two choices on a non-ending passage', () => {
    const s = clone(fixture());
    s.passages.find((p) => p.id === 'shed')!.choices = [{ id: 'back-hill', label: 'Go back up the hill', target: 'top' }];
    const codes = validateGraph(s).errors.map((e) => e.code);
    expect(codes).toContain('single-choice');
  });

  it('finds endings that are unreachable in play because of item logic', () => {
    const s = clone(fixture());
    // Nobody can ever pick up the net now.
    delete s.passages.find((p) => p.id === 'pond')!.effects;
    const r = validateGraph(s);
    expect(r.ok).toBe(false);
    expect(r.errors).toContainEqual(expect.objectContaining({ code: 'unreachable-ending' }));
  });

  it('finds soft-locks where every choice is locked', () => {
    const s = clone(fixture());
    const top = s.passages.find((p) => p.id === 'top')!;
    // A second choice that is locked too, so a reader who only has the clue (not the net) is soft-locked.
    top.choices = [top.choices.find((c) => c.id === 'use-net')!, { id: 'locked-too', label: 'A harder path', target: 'win', requires: { items: ['net'], clues: ['red-thread'] } }];
    const r = validateGraph(s);
    expect(r.errors.map((e) => e.code)).toContain('soft-lock');
  });

  it('finds loops with no way out', () => {
    const s = clone(fixture());
    const shed = s.passages.find((p) => p.id === 'shed')!;
    shed.choices = [
      { id: 'stay', label: 'Stay', target: 'shed' },
      { id: 'stay-longer', label: 'Stay a bit longer', target: 'shed' },
    ];
    expect(validateGraph(s).errors.map((e) => e.code)).toContain('no-way-out');
  });

  it('requires at least two endings and unknown references are errors', () => {
    const s = clone(fixture());
    s.passages = s.passages.filter((p) => p.id !== 'friend' && p.id !== 'home');
    const top = s.passages.find((p) => p.id === 'top')!;
    top.choices = [top.choices[0]!, { id: 'x', label: 'x', target: 'win', requires: { items: ['ghost'] } }];
    const codes = validateGraph(s).errors.map((e) => e.code);
    expect(codes).toContain('too-few-endings');
    expect(codes).toContain('unknown-item');
  });

  it('warns about passages that cannot be reached', () => {
    const s = clone(fixture());
    s.passages.push({ id: 'orphan', paragraphs: ['Alone.'], choices: [{ id: 'o', label: 'o', target: 'hill' }] });
    expect(validateGraph(s).warnings.map((w) => w.code)).toContain('unreachable-passage');
  });
});

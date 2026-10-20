import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { newGame, normalizeAnswer, solvePuzzle } from '../../src/engine/story-engine';
import type { Story } from '../../src/engine/types';
import { analyzeStory, learningDesign } from '../../src/literacy/analyzer';
import { validateGraph } from '../../src/validation/graph';
import { validateSchema } from '../../src/validation/schema';
import { clone, fixture, ROOT } from '../helpers';

/** The fixture with an optional puzzle on the pond page that grants the net. */
function withPuzzle(): Story {
  const s = clone(fixture());
  s.passages.find((p) => p.id === 'pond')!.puzzle = { id: 'pond-word', prompt: 'Type the word on the sign: net', answers: ['net', 'a net'], hint: 'Three letters.', successText: 'The sign swings open.', effects: { setFlags: ['sign-read'] } };
  return s;
}

describe('typing puzzles', () => {
  it('accepts any listed answer, ignoring case and extra spaces', () => {
    const s = withPuzzle();
    const at = { ...newGame(s), current: 'pond' };
    expect(normalizeAnswer('  A   NET ')).toBe('a net');
    const wrong = solvePuzzle(s, at, 'nett');
    expect(wrong.solved).toBe(false);
    expect(wrong.state).toBe(at);
    const right = solvePuzzle(s, at, ' NET ');
    expect(right.solved).toBe(true);
    expect(right.state.puzzlesSolved).toEqual(['pond-word']);
    expect(right.state.flags).toContain('sign-read');
    expect(solvePuzzle(s, right.state, 'anything').state).toBe(right.state);
  });

  it('throws when the current page has no puzzle', () => {
    const s = withPuzzle();
    expect(() => solvePuzzle(s, newGame(s), 'net')).toThrow(/no puzzle/);
  });

  it('the schema accepts puzzles, learning targets and definitions', () => {
    const s = withPuzzle();
    s.passages[0]!.learningTargets = ['inference'];
    s.passages[0]!.choices[0]!.learningTargets = ['detail'];
    s.glossary = { pond: { syllables: ['pond'], definition: 'a small lake' } };
    expect(validateSchema(s).errors).toEqual([]);
    s.passages[0]!.learningTargets = ['spelling' as never];
    expect(validateSchema(s).ok).toBe(false);
  });

  it('an optional puzzle that unlocks a bonus choice keeps every ending reachable', () => {
    const s = withPuzzle();
    s.passages.find((p) => p.id === 'pond')!.choices.push({ id: 'bonus', label: 'Read the sign again', target: 'top', requires: { flags: ['sign-read'] } });
    const g = validateGraph(s);
    expect(g.errors).toEqual([]);
    expect(g.ok).toBe(true);
  });

  it('a story that depends on solving a puzzle is a soft-lock', () => {
    const s = withPuzzle();
    s.passages.find((p) => p.id === 'pond')!.choices = [{ id: 'to-top', label: 'Run to the top', target: 'top', requires: { flags: ['sign-read'] } }];
    const g = validateGraph(s);
    expect(g.ok).toBe(false);
    expect(g.errors.map((e) => e.code)).toContain('soft-lock');
  });

  it('rejects duplicate puzzle ids and puzzles on endings', () => {
    const s = withPuzzle();
    s.passages.find((p) => p.id === 'shed')!.puzzle = { ...s.passages.find((p) => p.id === 'pond')!.puzzle! };
    s.passages.find((p) => p.id === 'win')!.puzzle = { id: 'end-pz', prompt: 'x', answers: ['x'], successText: 'y' };
    const codes = validateGraph(s).errors.map((e) => e.code);
    expect(codes).toContain('duplicate-puzzle');
    expect(codes).toContain('puzzle-on-ending');
  });
});

describe('learning design report', () => {
  it('counts tagged learning targets and lists the missing ones', () => {
    const s = withPuzzle();
    s.passages[0]!.learningTargets = ['comprehension', 'detail'];
    s.passages[1]!.choices[0]!.learningTargets = ['inference'];
    const r = learningDesign(s);
    expect(r.targets.comprehension).toBe(1);
    expect(r.targets.inference).toBe(1);
    expect(r.passagesTagged).toBe(2);
    expect(r.missingTargets).toEqual(['sequencing', 'vocabulary', 'engagement']);
  });

  it('checks typing balance: neither absent nor overused', () => {
    expect(learningDesign(fixture()).typing.balanced).toBe(false);
    expect(learningDesign(withPuzzle()).typing.balanced).toBe(true);
    const many = withPuzzle();
    for (const id of ['hill', 'shed', 'top']) many.passages.find((p) => p.id === id)!.puzzle = { id: `pz-${id}`, prompt: 'p', answers: ['a'], successText: 's' };
    expect(learningDesign(many).typing.balanced).toBe(false);
  });

  it('is advisory: it never fails the literacy checks on its own', () => {
    const report = analyzeStory(fixture());
    expect(report.learningDesign.advisories.some((a) => !a.ok)).toBe(true);
    expect(report.automatedChecks.map((c) => c.id)).not.toContain('typing-balance');
  });
});

describe('no timers on reading activities', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : [];
    });

  it('the reader, engine and storage code never schedule timers', () => {
    const offenders = ['src/ui', 'src/engine', 'src/storage']
      .flatMap((d) => files(join(ROOT, d)))
      .filter((f) => /\b(setTimeout|setInterval|requestAnimationFrame)\s*\(/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

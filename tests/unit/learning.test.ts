import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { analyzeStory, learningDesign } from '../../src/literacy/analyzer';
import { validateSchema } from '../../src/validation/schema';
import { clone, fixture, ROOT } from '../helpers';

describe('typing is not part of a story', () => {
  it('the schema rejects a typing puzzle on a page', () => {
    const s = clone(fixture());
    (s.passages[0] as unknown as Record<string, unknown>).puzzle = { id: 'pz', prompt: 'Type it.', answers: ['x'], successText: 'Done.' };
    expect(validateSchema(s).ok).toBe(false);
  });

  it('the schema accepts learning targets and definitions', () => {
    const s = clone(fixture());
    s.passages[0]!.learningTargets = ['inference'];
    s.passages[0]!.choices[0]!.learningTargets = ['detail'];
    s.glossary = { pond: { syllables: ['pond'], definition: 'a small lake' } };
    expect(validateSchema(s).errors).toEqual([]);
    s.passages[0]!.learningTargets = ['spelling' as never];
    expect(validateSchema(s).ok).toBe(false);
  });
});

describe('learning design report', () => {
  it('counts tagged learning targets and lists the missing ones', () => {
    const s = clone(fixture());
    s.passages[0]!.learningTargets = ['comprehension', 'detail'];
    s.passages[1]!.choices[0]!.learningTargets = ['inference'];
    const r = learningDesign(s);
    expect(r.targets.comprehension).toBe(1);
    expect(r.targets.inference).toBe(1);
    expect(r.passagesTagged).toBe(2);
    expect(r.missingTargets).toEqual(['sequencing', 'vocabulary', 'engagement']);
  });

  it('is advisory: it never fails the literacy checks on its own', () => {
    const report = analyzeStory(fixture());
    expect(report.learningDesign.advisories.some((a) => !a.ok)).toBe(true);
  });

  it('typing is not part of the story checks: no typing-balance check or advisory', () => {
    const report = analyzeStory(fixture());
    expect(report.automatedChecks.map((c) => c.id)).not.toContain('typing-balance');
    expect(report.learningDesign.advisories.map((a) => a.id)).not.toContain('typing-balance');
  });
});

describe('no timers on reading activities', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : [];
    });

  it('the reader, engine, storage and typing code never schedule timers', () => {
    const offenders = ['src/ui', 'src/engine', 'src/storage', 'src/typing']
      .flatMap((d) => files(join(ROOT, d)))
      .filter((f) => /\b(setTimeout|setInterval|requestAnimationFrame)\s*\(/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { analyzeStory, literacyReportMarkdown, matchesWord, tokenize } from '../../src/literacy/analyzer';
import { CONCEPTS, conceptById, estimateSyllables, labelFor } from '../../src/literacy/taxonomy';
import { contentHash, sha256 } from '../../src/util/hash';
import profiles from '../../config/literacy-profiles.json';
import { clone, fixture } from '../helpers';

const detect = (id: string, w: string) => conceptById.get(id)!.detect(w);

describe('taxonomy detectors', () => {
  it.each([
    ['digraph-sh', 'ship', true],
    ['digraph-ch', 'chest', true],
    ['digraph-ch', 'match', false],
    ['trigraph-tch', 'match', true],
    ['digraph-th', 'path', true],
    ['floss', 'shell', true],
    ['floss', 'shells', false],
    ['silent-e', 'lane', true],
    ['silent-e', 'tree', false],
    ['closed-syllable', 'map', true],
    ['closed-syllable', 'boat', false],
    ['closed-syllable', 'bright', false],
    ['closed-syllable', 'dark', false],
    ['closed-syllable', 'call', false],
    ['closed-syllable', 'shell', true],
    ['vowel-team', 'boat', true],
    ['r-controlled', 'harbour', true],
    ['initial-blend', 'stop', true],
    ['glued-ng-nk', 'think', true],
  ])('%s on "%s" is %s', (id, word, expected) => {
    expect(detect(id, word)).toBe(expected);
  });

  it('every profile labels only known concepts', () => {
    for (const p of profiles.profiles) for (const id of Object.keys(p.labels)) expect(conceptById.has(id), `${p.id}:${id}`).toBe(true);
  });

  it('falls back to the neutral description without a profile', () => {
    expect(labelFor('digraph-sh')).toBe(CONCEPTS.find((c) => c.id === 'digraph-sh')!.description);
    expect(labelFor('silent-e', profiles.profiles[2])).toBe('Sneaky e');
  });

  it('estimates syllables roughly', () => {
    expect(estimateSyllables('lantern')).toBe(2);
    expect(estimateSyllables('lane')).toBe(1);
    expect(estimateSyllables('lighthouse')).toBe(2);
  });
});

describe('literacy report', () => {
  it('counts word-set words, routes and target concepts', () => {
    const r = analyzeStory(fixture());
    const set = r.wordSets[0]!;
    expect(set.totalOccurrences).toBeGreaterThanOrEqual(4);
    expect(set.missingWords).toEqual([]);
    expect(Object.keys(set.perEndingRoute).sort()).toEqual(['home-again', 'kite-back', 'new-friend']);
    expect(r.ok).toBe(true);
    expect(r.review.status).toBe('pending');
  });

  it('is reproducible: the same story gives the same report and hash', () => {
    expect(analyzeStory(fixture())).toEqual(analyzeStory(fixture()));
    expect(analyzeStory(fixture()).storyHash).toBe(contentHash(fixture()));
  });

  it('fails checks when a word set misses its minimum or a word is missing', () => {
    const s = clone(fixture());
    s.literacy.wordSets[0]!.words.push('shark');
    s.literacy.wordSets[0]!.minOccurrences = 50;
    const r = analyzeStory(s);
    expect(r.ok).toBe(false);
    expect(r.automatedChecks.find((c) => c.id === 'word-set-minimums')!.ok).toBe(false);
    expect(r.wordSets[0]!.missingWords).toEqual(['shark']);
  });

  it('flags word-set words that do not carry the declared spelling pattern', () => {
    const s = clone(fixture());
    s.literacy.wordSets[0]!.words.push('hill');
    expect(analyzeStory(s).wordSets[0]!.conceptMismatches).toEqual(['hill']);
  });

  it('flags long sentences', () => {
    const s = clone(fixture());
    s.passages[0]!.paragraphs.push(Array.from({ length: 25 }, () => 'run').join(' ') + '.');
    expect(analyzeStory(s).automatedChecks.find((c) => c.id === 'sentence-length')!.ok).toBe(false);
  });

  it('states its limitations in the markdown report', () => {
    const md = literacyReportMarkdown(analyzeStory(fixture()));
    expect(md).toMatch(/spelling, not sound/);
    expect(md).toMatch(/Human literacy review status: \*\*pending\*\*/);
  });

  it('tokenizes simply and matches plurals', () => {
    expect(tokenize("Fen's ship, the SHIP!")).toEqual(['fen', 'ship', 'the', 'ship']);
    expect(matchesWord('ships', 'ship')).toBe(true);
    expect(matchesWord('shipped', 'ship')).toBe(false);
  });
});

describe('sha256', () => {
  it('matches known vectors', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256('a'.repeat(1000))).toBe('41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3');
  });
});

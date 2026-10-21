import { describe, expect, it } from 'vitest';
import type { Story } from '../../src/engine/types';
import { checkShelfSummary, labelShelfSummary, type ShelfSummary } from '../../src/literacy/shelf-summary';
import { focusOptions, matchesFocus } from '../../src/ui/parent/LiteracySummary';
import { clone, fixture } from '../helpers';

function tagged(): Story {
  const s = clone(fixture());
  s.passages[0]!.learningTargets = ['inference'];
  s.passages[1]!.learningTargets = ['detail'];
  return s;
}

const good = (): ShelfSummary => ({
  blurb: 'A short hill adventure that practises sh words and short vowels while the reader works out where the kite went.',
  skills: ['inference', 'detail'],
  wordTypes: [
    { concept: 'digraph-sh', examples: ['shed', 'shut', 'fish'] },
    { concept: 'closed-syllable', examples: ['red', 'net'] },
  ],
  ogCategories: ['Phonics', 'Syllable types', 'Comprehension'],
});

describe('literacy shelf summary', () => {
  it('accepts a summary that matches the story text', () => {
    expect(checkShelfSummary(good(), tagged())).toEqual([]);
  });

  it('rejects example words the story does not use or that lack the pattern', () => {
    const s = good();
    s.wordTypes[0]!.examples = ['ship', 'red'];
    const errors = checkShelfSummary(s, tagged()).join('\n');
    expect(errors).toMatch(/"ship" for digraph-sh does not appear in the story/);
    expect(errors).toMatch(/"red" does not carry the digraph-sh pattern/);
  });

  it('requires every target concept of the story to be listed', () => {
    const s = good();
    s.wordTypes = s.wordTypes.filter((wt) => wt.concept !== 'closed-syllable');
    expect(checkShelfSummary(s, tagged()).join('\n')).toMatch(/target concept "closed-syllable" is missing/);
  });

  it('only names skills the story tags and OG areas from the fixed list', () => {
    const s = { ...good(), skills: ['inference', 'sequencing'], ogCategories: ['Phonics', 'Handwriting'] } as unknown as ShelfSummary;
    const errors = checkShelfSummary(s, tagged()).join('\n');
    expect(errors).toMatch(/skill "sequencing" is not tagged/);
    expect(errors).toMatch(/OG category "Handwriting" is not one of/);
  });

  it('keeps the blurb short and refuses unknown concepts', () => {
    const s = { ...good(), blurb: 'x'.repeat(401), wordTypes: [...good().wordTypes, { concept: 'made-up', examples: ['kite'] }] };
    const errors = checkShelfSummary(s, tagged()).join('\n');
    expect(errors).toMatch(/keep it to 400/);
    expect(errors).toMatch(/"made-up" is not a known concept/);
  });

  it('labels word types in the profile terms', () => {
    const labelled = labelShelfSummary(good(), { id: 'og', name: 'OG', labels: { 'digraph-sh': 'Consonant digraph /sh/' } });
    expect(labelled.wordTypes[0]).toEqual({ concept: 'digraph-sh', label: 'Consonant digraph /sh/', examples: ['shed', 'shut', 'fish'] });
  });

  it('builds shelf filters from the summaries and matches stories by word type or OG area', () => {
    const s = labelShelfSummary(good());
    const options = focusOptions([s, undefined]);
    expect(options.map((o) => o.value)).toEqual(['word:closed-syllable', 'word:digraph-sh', 'og:Comprehension', 'og:Phonics', 'og:Syllable types']);
    expect(matchesFocus(s, 'word:digraph-sh')).toBe(true);
    expect(matchesFocus(s, 'word:vowel-team')).toBe(false);
    expect(matchesFocus(s, 'og:Morphology')).toBe(false);
    expect(matchesFocus(undefined, 'og:Phonics')).toBe(false);
    expect(matchesFocus(undefined, '')).toBe(true);
  });
});

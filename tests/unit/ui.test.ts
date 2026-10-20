// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PREFS, memoryStore } from '../../src/engine/persistence';
import { startReader } from '../../src/ui/reader';
import { applyPrefs } from '../../src/ui/prefs';
import { validationView, saveVersion, loadVersions } from '../../src/ui/parent';
import { validateDraft } from '../../src/production/validate-draft';
import { fixture } from '../helpers';

const story = fixture();
let root: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  root = document.getElementById('app')!;
});

const click = (text: string) => {
  const btn = [...root.querySelectorAll('button')].find((b) => b.textContent?.includes(text));
  if (!btn) throw new Error(`No button "${text}"`);
  btn.click();
};

const open = (store = memoryStore()) => {
  startReader(root, story, { store, prefs: DEFAULT_PREFS, saveNamespace: '', onExit: () => undefined });
  return store;
};

describe('reader UI', () => {
  it('renders a passage with heading, paragraphs, choices and packs', () => {
    open();
    expect(root.querySelector('h1')!.textContent).toBe('The windy hill');
    expect(root.querySelectorAll('.para')).toHaveLength(2);
    expect([...root.querySelectorAll('.choice')].map((b) => b.textContent)).toEqual(['Look in the shed', 'Go to the fish pond']);
    expect(root.textContent).toContain('Backpack (0)');
    expect(root.textContent).toContain('Clue notebook (0)');
    expect(document.activeElement).toBe(root.querySelector('h1'));
  });

  it('shows locked choices with a described hint and ignores presses', () => {
    open();
    click('Look in the shed');
    click('Go back up the hill');
    const locked = root.querySelector<HTMLButtonElement>('.choice.locked')!;
    expect(locked.textContent).toBe('Use the net to get the kite');
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    const hint = document.getElementById(locked.getAttribute('aria-describedby')!)!;
    expect(hint.textContent).toBe('Something long could reach it.');
    locked.click();
    expect(root.querySelector('h1')!.textContent).toBe('The tree');
    expect(root.textContent).toContain('Clue notebook (1)');
  });

  it('shows an ending with endings found and play again', () => {
    open();
    click('Go to the fish pond');
    click('Run to the top');
    click('Use the net');
    expect(root.querySelector('h1')!.textContent).toBe('The kite is back');
    expect(root.textContent).toContain('You have found 1 of 3 endings.');
    expect(root.textContent).toContain('A bright ending');
    click('Play again');
    expect(root.querySelector('h1')!.textContent).toBe('The windy hill');
  });

  it('restores saved progress', () => {
    const store = open();
    click('Go to the fish pond');
    open(store);
    expect(root.querySelector('h1')!.textContent).toBe('The pond');
  });

  it('glossary words reveal syllables', () => {
    const s = { ...story, glossary: { pond: { syllables: ['pond'], hint: 'closed syllable' } } };
    startReader(root, s, { store: memoryStore(), prefs: DEFAULT_PREFS, saveNamespace: '', onExit: () => undefined });
    const word = root.querySelector<HTMLButtonElement>('button.word')!;
    expect(word.textContent).toBe('pond');
    expect(word.nextElementSibling!.hasAttribute('hidden')).toBe(true);
    word.click();
    expect(word.getAttribute('aria-expanded')).toBe('true');
    expect(word.nextElementSibling!.textContent).toBe('pond closed syllable');
  });
});

describe('reading preferences', () => {
  it('applies preferences as CSS variables and data attributes', () => {
    const el = document.documentElement;
    applyPrefs(el, { ...DEFAULT_PREFS, fontScale: 1.5, lineHeight: 2, letterSpacing: 0.1, theme: 'dark', lineFocus: true });
    expect(el.style.getPropertyValue('--font-scale')).toBe('1.5');
    expect(el.style.getPropertyValue('--line-height')).toBe('2');
    expect(el.style.getPropertyValue('--letter-spacing')).toBe('0.1em');
    expect(el.dataset.theme).toBe('dark');
    expect(el.dataset.lineFocus).toBe('true');
  });
});

describe('parent studio', () => {
  it('studio validation view shows checks and the pending literacy review', () => {
    const view = validationView(validateDraft(story));
    expect(view.textContent).toContain('All automated checks passed.');
    expect(view.textContent).toContain('Automated checks do not replace the literacy review');
    expect(view.textContent).toContain('Literacy review: pending');
  });

  it('saves local versions without duplicates', () => {
    const store = memoryStore();
    const json = JSON.stringify(story);
    saveVersion(store, story.id, json, true);
    saveVersion(store, story.id, json, true);
    saveVersion(store, story.id, JSON.stringify({ ...story, version: 2 }), true);
    expect(loadVersions(store, story.id).map((v) => v.version)).toEqual([1, 2]);
  });
});

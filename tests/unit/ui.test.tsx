// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PREFS } from '../../src/engine/persistence';
import { newGame } from '../../src/engine/story-engine';
import type { GameState, Story } from '../../src/engine/types';
import { memoryKv } from '../../src/storage/kv';
import { Repo } from '../../src/storage/repo';

import { App } from '../../src/ui/App';
import type { Catalog } from '../../src/ui/catalog';
import { AppContext, type AppCtx } from '../../src/ui/context';
import { applyPrefs } from '../../src/ui/prefs';
import { pageSpeech } from '../../src/ui/speech';
import { Reader } from '../../src/ui/Reader';
import { clone, fixture } from '../helpers';

const story = fixture();
const emptyCatalog: Catalog = { catalogVersion: 1, published: [], previews: [] };

beforeEach(() => {
  location.hash = '';
});
afterEach(cleanup);

const button = (name: string | RegExp) => screen.getByRole('button', { name });
const navigate = async (hash: string) => {
  await act(async () => {
    location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
};

async function readyRepo() {
  const repo = new Repo(memoryKv());
  await repo.setup('Sam', '2468', 'Ada');
  return repo;
}

describe('first run and profiles', () => {
  it('sets up a parent and child, then shows the child library', async () => {
    const repo = new Repo(memoryKv());
    render(<App repo={repo} catalog={emptyCatalog} />);
    fireEvent.change(await screen.findByLabelText('Reader’s name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Grown-up’s name'), { target: { value: 'Sam' } });
    fireEvent.change(screen.getByLabelText(/Grown-up PIN/), { target: { value: '2468' } });
    fireEvent.change(screen.getByLabelText('PIN again'), { target: { value: '2468' } });
    fireEvent.click(button('Start'));
    expect(await screen.findByText(/Hi Ada/)).toBeTruthy();
    expect(await screen.findByText('No adventures yet')).toBeTruthy();
    expect(screen.getByRole('note').textContent).toMatch(/not letting the game save/);
  });

  it('keeps the grown-up area behind the PIN', async () => {
    const repo = await readyRepo();
    render(<App repo={repo} catalog={emptyCatalog} />);
    await screen.findByText(/Hi Ada/);
    await navigate('#/parent');
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '0000' } });
    fireEvent.click(button('Open'));
    expect(await screen.findByText('That PIN is not right.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    expect(await screen.findByRole('heading', { level: 1, name: 'Grown-up area' })).toBeTruthy();
    expect(await screen.findByText(/No stories yet/)).toBeTruthy();
  });

  it('preview and editor routes are parent-only', async () => {
    const repo = await readyRepo();
    await repo.saveDraft(story, 'Sam', 'import');
    location.hash = `#/parent/edit/${story.id}`;
    render(<App repo={repo} catalog={emptyCatalog} />);
    expect(await screen.findByLabelText('Enter the grown-up PIN')).toBeTruthy();
    await navigate(`#/preview/device/${story.id}`);
    expect(await screen.findByLabelText('Enter the grown-up PIN')).toBeTruthy();
  });
});

describe('parent approval controls the child library', () => {
  const reviewedByHuman = (x: Story): Story => ({ ...x, literacy: { ...x.literacy, review: { status: 'passed', reviewer: 'Dr Rowan Ellis', reviewerKind: 'human', date: '2026-10-20' } } });

  async function openEditor(repo: Repo, id: string) {
    location.hash = '#/parent';
    render(<App repo={repo} catalog={emptyCatalog} />);
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    await screen.findByText('All automated checks pass.');
    void id;
  }

  it('a draft without a human literacy review cannot be approved in the editor', async () => {
    const repo = await readyRepo();
    await repo.saveDraft(story, 'Sam', 'import');
    render(<App repo={repo} catalog={emptyCatalog} />);
    expect(await screen.findByText('No adventures yet')).toBeTruthy();
    await navigate('#/parent');
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    expect(await screen.findByText(/A human literacy review must be recorded/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Approve version 1' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByLabelText(/no reading specialist/)).toBeNull();
  });

  it('a human-reviewed draft is approved in the editor and then offered to the child', async () => {
    const repo = await readyRepo();
    await repo.saveDraft(reviewedByHuman(story), 'Sam', 'import');
    render(<App repo={repo} catalog={emptyCatalog} />);
    await screen.findByText('No adventures yet');
    await navigate('#/parent');
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    expect(await screen.findByText(/Literacy review recorded by Dr Rowan Ellis on 2026-10-20/)).toBeTruthy();
    const approve = await screen.findByRole('button', { name: 'Approve version 1' });
    expect((approve as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(approve);
    expect(await screen.findByText(/is now in the reader’s library/)).toBeTruthy();
    expect((await repo.library())[0]?.approved?.literacyReview.reviewer).toBe('Dr Rowan Ellis');
    await navigate('#/');
    expect(await screen.findByRole('button', { name: `Start ${story.title}` })).toBeTruthy();
  });

  it('the editor cannot change the literacy review record, even through the JSON tab', async () => {
    const repo = await readyRepo();
    await repo.saveDraft(story, 'Sam', 'import');
    await openEditor(repo, story.id);
    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    const box = document.getElementById('ed-json') as HTMLTextAreaElement;
    const edited = JSON.parse(box.value) as Story;
    edited.title = 'The Lost Kite, edited';
    edited.literacy.review = { status: 'passed', reviewer: 'Me', reviewerKind: 'human', date: '2026-10-20' };
    fireEvent.change(box, { target: { value: JSON.stringify(edited) } });
    fireEvent.click(button('Apply JSON'));
    fireEvent.click(button('Save draft'));
    expect(await screen.findByText(/Changes to the literacy review record were ignored/)).toBeTruthy();
    const stored = await repo.draft(story.id);
    expect(stored?.literacy.review.status).toBe('pending');
    expect(stored?.title).toBe('The Lost Kite, edited');
  });

  it('editing an approved story saves a new version and keeps the child on the old one', async () => {
    const repo = await readyRepo();
    const child = (await repo.profiles()).find((p) => p.kind === 'child')!;
    await repo.saveDraft(reviewedByHuman(story), 'Sam', 'import');
    await repo.approve(story.id, { by: 'Sam', at: 'now' });
    await repo.startGame(child.id, reviewedByHuman(story));

    location.hash = '#/parent';
    render(<App repo={repo} catalog={emptyCatalog} />);
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    fireEvent.change(await screen.findByLabelText('Title'), { target: { value: 'The Lost Kite, revised' } });
    fireEvent.click(button('Save draft'));
    expect(await screen.findByText('Draft saved as version 2.')).toBeTruthy();
    fireEvent.click(await screen.findByRole('button', { name: 'Approve version 2' }));
    await screen.findByText(/Version 2 is now in the reader’s library/);

    fireEvent.click(button('← Grown-up area'));
    fireEvent.click(await screen.findByRole('button', { name: 'Lock and return to play' }));
    expect(await screen.findByText(/Your adventure is saved in version 1/)).toBeTruthy();
    expect((await repo.loadSave(child.id, story.id))?.story.title).toBe(story.title);
    fireEvent.click(button('Start the new version'));
    expect(await screen.findByRole('heading', { level: 1, name: 'The windy hill' })).toBeTruthy();
    await waitFor(async () => expect((await repo.loadSave(child.id, story.id))?.save.storyVersion).toBe(2));
  });
});

function renderReader(s: Story, initial: GameState = newGame(s)) {
  const states: GameState[] = [initial];
  const ctx = { prefs: DEFAULT_PREFS } as AppCtx;
  let current = initial;
  const view = render(
    <AppContext.Provider value={ctx}>
      <Reader story={s} state={current} onState={(n) => void states.push(n)} onExit={() => undefined} />
    </AppContext.Provider>,
  );
  const rerender = () => {
    current = states[states.length - 1]!;
    view.rerender(
      <AppContext.Provider value={ctx}>
        <Reader story={s} state={current} onState={(n) => void states.push(n)} onExit={() => undefined} />
      </AppContext.Provider>,
    );
  };
  return { states, rerender };
}

describe('reader', () => {
  it('renders a passage with heading, choices and packs, and focuses the heading', () => {
    renderReader(story);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('The windy hill');
    expect(document.activeElement).toBe(h1);
    expect(screen.getAllByRole('button', { name: /Look in the shed|Go to the fish pond/ })).toHaveLength(2);
    expect(screen.getByText('Backpack (0)')).toBeTruthy();
    expect(screen.getByText('Clue notebook (0)')).toBeTruthy();
  });

  it('locked choices stay visible with a hint and do nothing when pressed', () => {
    const atTop = { ...newGame(story), current: 'top' };
    const { states } = renderReader(story, atTop);
    const locked = button('Use the net to get the kite');
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(locked.getAttribute('aria-describedby')!)!.textContent).toBe('Something long could reach it.');
    fireEvent.click(locked);
    expect(states).toHaveLength(1);
  });

  it('shows an ending with endings found and play again', () => {
    const { states, rerender } = renderReader(story, { ...newGame(story), current: 'win', endingsSeen: ['win'] });
    expect(screen.getByText('You have found 1 of 3 endings.')).toBeTruthy();
    expect(screen.getByText('A bright ending')).toBeTruthy();
    fireEvent.click(button('Play again'));
    rerender();
    expect(states.at(-1)!.current).toBe('hill');
  });

  it('word help shows syllables and a meaning, and logs the look-up', () => {
    const s = { ...story, glossary: { pond: { syllables: ['pond'], definition: 'a small lake' } } };
    const { states } = renderReader(s, { ...newGame(s), current: 'pond' });
    const word = screen.getAllByRole('button', { name: 'pond' })[0]!;
    fireEvent.click(word);
    expect(word.getAttribute('aria-expanded')).toBe('true');
    expect(word.parentElement!.textContent).toContain('a small lake');
    expect(states).toHaveLength(2);
  });

  it('typing puzzles are optional, untimed and allow unlimited tries', () => {
    const s = clone(story);
    s.passages.find((p) => p.id === 'pond')!.puzzle = { id: 'pz', prompt: 'Type the word: kite', answers: ['kite'], hint: 'It flies.', successText: 'Well typed!' };
    const { states, rerender } = renderReader(s, { ...newGame(s), current: 'pond' });
    expect(button('Run to the top')).toBeTruthy();
    const input = screen.getByLabelText('Type the word: kite');
    fireEvent.change(input, { target: { value: 'kit' } });
    fireEvent.click(button('Try it'));
    expect(screen.getByText(/Not quite. Try again, or carry on without it./)).toBeTruthy();
    fireEvent.click(button('Hint'));
    expect(screen.getByText('It flies.')).toBeTruthy();
    fireEvent.change(input, { target: { value: ' KITE ' } });
    fireEvent.click(button('Try it'));
    rerender();
    expect(states.at(-1)!.puzzlesSolved).toEqual(['pz']);
    expect(screen.getByText('Well typed!')).toBeTruthy();
  });
});

describe('read-aloud and optional typing', () => {
  it('read-aloud speaks the page and an open typing prompt, marked optional', () => {
    const text = pageSpeech('The shed', ['A dusty room.'], 'Type the word: wick.');
    expect(text).toBe('The shed A dusty room. Optional typing: Type the word: wick. You can skip this and carry on.');
  });

  it('read-aloud leaves out the typing prompt once it is solved or absent', () => {
    expect(pageSpeech('The shed', ['A dusty room.'])).toBe('The shed A dusty room.');
  });

  it('the typing puzzle says it is optional on screen, before any try', () => {
    const s = clone(story);
    s.passages.find((p) => p.id === 'pond')!.puzzle = { id: 'pz2', prompt: 'Type it.', answers: ['x'], successText: 'Done.' };
    renderReader(s, { ...newGame(s), current: 'pond' });
    expect(screen.getByText('Optional. You can skip this and carry on.')).toBeTruthy();
  });
});

describe('reading preferences', () => {
  it('applies preferences as CSS variables and data attributes', () => {
    const el = document.documentElement;
    applyPrefs(el, { ...DEFAULT_PREFS, fontScale: 1.5, lineHeight: 2, letterSpacing: 0.1, theme: 'dark', lineFocus: true, font: 'dyslexic' });
    expect(el.style.getPropertyValue('--font-scale')).toBe('1.5');
    expect(el.style.getPropertyValue('--letter-spacing')).toBe('0.1em');
    expect(el.style.getPropertyValue('--reading-font')).toContain('OpenDyslexic');
    expect(el.dataset.theme).toBe('dark');
    expect(el.dataset.lineFocus).toBe('true');
  });
});

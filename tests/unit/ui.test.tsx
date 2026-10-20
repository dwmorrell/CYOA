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
import { fixture } from '../helpers';

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

  async function openEditor(repo: Repo, id: string) {
    location.hash = '#/parent';
    render(<App repo={repo} catalog={emptyCatalog} />);
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    await screen.findByText('All automated checks pass.');
    void id;
  }

  it('a draft is not approved in the editor until the parent confirms the AI reviews', async () => {
    const repo = await readyRepo();
    await repo.saveDraft(story, 'Sam', 'import');
    render(<App repo={repo} catalog={emptyCatalog} />);
    expect(await screen.findByText('No adventures yet')).toBeTruthy();
    await navigate('#/parent');
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    expect(await screen.findByText(/Confirm that the AI literacy review and the AI QA review/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Approve version 1' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('a draft the parent confirms against the AI reviews is approved in the editor and then offered to the child', async () => {
    const repo = await readyRepo();
    await repo.saveDraft(story, 'Sam', 'import');
    render(<App repo={repo} catalog={emptyCatalog} />);
    await screen.findByText('No adventures yet');
    await navigate('#/parent');
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    fireEvent.click(await screen.findByLabelText(/AI literacy review and the AI QA review for this version have passed/));
    const approve = await screen.findByRole('button', { name: 'Approve version 1' });
    expect((approve as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(approve);
    expect(await screen.findByText(/is now in the reader’s library/)).toBeTruthy();
    expect((await repo.library())[0]?.approved?.aiReviewsConfirmedAt).toBeTruthy();
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
    await repo.saveDraft(story, 'Sam', 'import');
    await repo.approve(story.id, { by: 'Sam', at: 'now', aiReviewsPassed: true });
    await repo.startGame(child.id, story);

    location.hash = '#/parent';
    render(<App repo={repo} catalog={emptyCatalog} />);
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.click(await screen.findByRole('button', { name: `Edit ${story.title}` }));
    fireEvent.change(await screen.findByLabelText('Title'), { target: { value: 'The Lost Kite, revised' } });
    fireEvent.click(button('Save draft'));
    expect(await screen.findByText('Draft saved as version 2.')).toBeTruthy();
    fireEvent.click(await screen.findByLabelText(/AI literacy review and the AI QA review for this version have passed/));
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
});

describe('read-aloud', () => {
  it('speaks the title and paragraphs of a page, and nothing else', () => {
    expect(pageSpeech('The shed', ['A dusty room.'])).toBe('The shed A dusty room.');
  });
});

describe('typing practice add-on', () => {
  const target = 'cat dog sun map net fog bell ship stone river';

  it('is not offered in the library until a keyboard is likely', async () => {
    const repo = await readyRepo();
    render(<App repo={repo} catalog={emptyCatalog} />);
    await screen.findByText(/Hi Ada/);
    expect(screen.queryByRole('button', { name: 'Typing practice' })).toBeNull();
  });

  it('is offered in the library once a hardware key has been pressed on this device', async () => {
    const repo = await readyRepo();
    await repo.markKeyboardSeen();
    render(<App repo={repo} catalog={emptyCatalog} />);
    await screen.findByText(/Hi Ada/);
    fireEvent.click(button('Typing practice'));
    expect(await screen.findByRole('heading', { name: 'Typing practice' })).toBeTruthy();
  });

  it('types the words from the list, shows speed and accuracy, and finishes the lap', async () => {
    const repo = await readyRepo();
    render(<App repo={repo} catalog={emptyCatalog} />);
    await navigate('#/typing');
    const input = await screen.findByLabelText('Type here');
    expect(screen.getByLabelText(`Words to type: ${target}`)).toBeTruthy();
    fireEvent.change(input, { target: { value: 'cax' } });
    expect(screen.getByText(/Accuracy 67 percent/)).toBeTruthy();
    fireEvent.change(input, { target: { value: 'ca' } });
    fireEvent.change(input, { target: { value: target } });
    expect(screen.getByText(/Lap 1 done in \d+:\d\d/)).toBeTruthy();
    expect(input.hasAttribute('readonly')).toBe(true);
    expect(await screen.findByText(/That is place 1 on this track/)).toBeTruthy();
    expect(screen.getByText(/Ada: \d+ words a minute, \d+ percent accurate, lap \d+:\d\d/)).toBeTruthy();
    expect((await repo.highScores('harbour-oval')).map((x) => x.name)).toEqual(['Ada']);
  });

  it('each race track keeps its own high scores, and changing track starts a new lap', async () => {
    const repo = await readyRepo();
    render(<App repo={repo} catalog={emptyCatalog} />);
    await navigate('#/typing');
    fireEvent.change(await screen.findByLabelText('Type here'), { target: { value: target } });
    await screen.findByText(/That is place 1 on this track/);
    fireEvent.change(screen.getByLabelText('Race track'), { target: { value: 'harbour-loop' } });
    expect(await screen.findByRole('heading', { name: 'High scores: Harbour loop' })).toBeTruthy();
    expect(screen.getByText('No laps finished on this track yet.')).toBeTruthy();
    expect((screen.getByLabelText('Type here') as HTMLInputElement).value).toBe('');
  });

  it('a grown-up writes a word list, and words with other characters are reported and left out', async () => {
    const repo = await readyRepo();
    render(<App repo={repo} catalog={emptyCatalog} />);
    await screen.findByText(/Hi Ada/);
    await navigate('#/parent');
    fireEvent.change(await screen.findByLabelText('Enter the grown-up PIN'), { target: { value: '2468' } });
    fireEvent.click(button('Open'));
    fireEvent.change(await screen.findByLabelText('Words'), { target: { value: 'Pebble, sea, boat, 3d, cove' } });
    fireEvent.click(button('Save word lists'));
    expect(await screen.findByText(/Left out: 3d/)).toBeTruthy();
    expect((await repo.typingLists())[0]!.words).toEqual(['pebble', 'sea', 'boat', 'cove']);
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

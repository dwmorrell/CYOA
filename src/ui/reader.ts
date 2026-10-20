import { choicesFor, choose, isEnding, newGame, passageById, restart } from '../engine/story-engine';
import { loadGame, saveGame, type KeyValueStore, type ReadingPrefs } from '../engine/persistence';
import type { GameState, Story } from '../engine/types';
import { focusHeading, h, icon, mount } from './dom';

export interface ReaderOptions {
  store: KeyValueStore;
  prefs: ReadingPrefs;
  /** Previews save separately so a parent's test run never touches the child's save. */
  saveNamespace: string;
  onExit: () => void;
  banner?: string;
}

const ENDING_WORDS: Record<string, string> = { triumph: 'A bright ending', bittersweet: 'A quiet ending', setback: 'Not the end yet' };

/** Wrap glossary words in buttons that reveal their syllable breaks. */
export function renderParagraph(text: string, story: Story): HTMLElement {
  const p = h('p', { class: 'para' });
  const glossary = story.glossary ?? {};
  for (const part of text.split(/(\b[A-Za-z]+\b)/)) {
    const entry = glossary[part.toLowerCase()];
    if (!entry) {
      p.append(part);
      continue;
    }
    const tip = h('span', { class: 'syllables', hidden: true }, entry.syllables.join(' · '), entry.hint ? h('span', { class: 'hint' }, ` ${entry.hint}`) : null);
    const btn = h('button', { type: 'button', class: 'word', 'aria-expanded': 'false' }, part);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      tip.hidden = !open;
    });
    p.append(h('span', { class: 'word-wrap' }, btn, tip));
  }
  return p;
}

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

/** Read-to-me toggle: one button starts and stops the browser's speech. */
function speechButton(text: string): HTMLButtonElement {
  const label = h('span', {}, 'Read to me');
  const btn = h('button', { type: 'button', class: 'btn small', 'aria-pressed': 'false' }, icon('🔊 '), label);
  const set = (on: boolean) => {
    btn.setAttribute('aria-pressed', String(on));
    label.textContent = on ? 'Stop reading' : 'Read to me';
  };
  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-pressed') === 'true') {
      stopSpeaking();
      set(false);
      return;
    }
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.onend = () => set(false);
    u.onerror = () => set(false);
    set(true);
    window.speechSynthesis.speak(u);
  });
  return btn;
}

export function startReader(root: HTMLElement, story: Story, opts: ReaderOptions): void {
  const ids = story.passages.map((p) => p.id);
  const saveId = `${opts.saveNamespace}${story.id}`;
  let state: GameState = loadGame(opts.store, saveId, story.version, ids) ?? { ...newGame(story), storyId: saveId };
  const persist = () => saveGame(opts.store, state);

  const exit = () => {
    stopSpeaking();
    opts.onExit();
  };
  const render = () => {
    stopSpeaking();
    const passage = passageById(story, state.current);
    const paragraphs = passage.paragraphs.map((t) => renderParagraph(t, story));
    let focusIndex = 0;
    const setFocus = (i: number) => {
      focusIndex = Math.max(0, Math.min(paragraphs.length - 1, i));
      paragraphs.forEach((p, j) => {
        p.classList.toggle('focused', j === focusIndex);
        if (j === focusIndex) p.setAttribute('aria-current', 'true');
        else p.removeAttribute('aria-current');
      });
      if (opts.prefs.lineFocus) paragraphs[focusIndex]?.scrollIntoView?.({ block: 'nearest' });
    };
    setFocus(0);
    paragraphs.forEach((p, i) => p.addEventListener('click', () => setFocus(i)));

    const nameOf = (list: Story['items'], id: string) => list.find((x) => x.id === id);
    const pack = h(
      'details',
      { class: 'pack' },
      h('summary', {}, `Backpack (${state.items.length})`),
      state.items.length
        ? h('ul', {}, ...state.items.map((id) => h('li', {}, h('strong', {}, nameOf(story.items, id)?.name ?? id), ` ${nameOf(story.items, id)?.description ?? ''}`)))
        : h('p', {}, 'Nothing yet.'),
    );
    const notes = h(
      'details',
      { class: 'pack' },
      h('summary', {}, `Clue notebook (${state.clues.length})`),
      state.clues.length
        ? h('ul', {}, ...state.clues.map((id) => h('li', {}, h('strong', {}, nameOf(story.clues, id)?.name ?? id), ` ${nameOf(story.clues, id)?.description ?? ''}`)))
        : h('p', {}, 'No clues yet.'),
    );

    const choiceButtons = choicesFor(story, state).map(({ choice, available }) => {
      const hintId = `hint-${choice.id}`;
      return h(
        'li',
        {},
        h(
          'button',
          {
            type: 'button',
            class: `btn choice${available ? '' : ' locked'}`,
            'aria-disabled': available ? undefined : 'true',
            'aria-describedby': available ? undefined : hintId,
            onclick: () => {
              if (!available) return;
              state = choose(story, state, choice.id);
              persist();
              render();
            },
          },
          choice.label,
        ),
        available ? null : h('p', { class: 'locked-hint', id: hintId }, choice.lockedHint ?? 'You need something else first.'),
      );
    });

    const allText = [passage.title ?? '', ...passage.paragraphs].join(' ');
    const ending = passage.ending;
    const totalEndings = story.passages.filter((p) => p.ending).length;
    mount(
      root,
      h(
        'main',
        { id: 'main', class: 'reader' },
        opts.banner ? h('p', { class: 'banner', role: 'note' }, opts.banner) : null,
        h(
          'nav',
          { class: 'reader-bar', 'aria-label': 'Story controls' },
          h('button', { type: 'button', class: 'btn small', onclick: exit }, icon('← '), 'Library'),
          h('span', { class: 'story-name' }, story.title),
          opts.prefs.readAloud && canSpeak() ? speechButton(allText) : null,
        ),
        h(
          'article',
          { class: 'page', 'aria-labelledby': 'passage-title' },
          h('h1', { id: 'passage-title' }, ending ? ending.title : (passage.title ?? story.title)),
          ...paragraphs,
          opts.prefs.lineFocus && paragraphs.length > 1
            ? h(
                'div',
                { class: 'focus-nav' },
                h('button', { type: 'button', class: 'btn small', onclick: () => setFocus(focusIndex - 1) }, icon('↑ '), 'Back'),
                h('button', { type: 'button', class: 'btn small', onclick: () => setFocus(focusIndex + 1) }, icon('↓ '), 'Next'),
              )
            : null,
        ),
        ending
          ? h(
              'section',
              { class: 'ending', 'aria-label': 'Ending' },
              h('p', { class: `ending-kind ${ending.kind}` }, ENDING_WORDS[ending.kind] ?? 'The end'),
              h('p', {}, `You have found ${state.endingsSeen.length} of ${totalEndings} endings.`),
              h(
                'button',
                {
                  type: 'button',
                  class: 'btn primary',
                  onclick: () => {
                    state = restart(story, state);
                    state = { ...state, storyId: saveId };
                    persist();
                    render();
                  },
                },
                'Play again',
              ),
            )
          : h('section', { class: 'choices', 'aria-labelledby': 'choices-title' }, h('h2', { id: 'choices-title', class: 'visually-hidden' }, 'What will you do?'), h('ul', {}, ...choiceButtons)),
        isEnding(story, state) ? null : h('aside', { class: 'packs', 'aria-label': 'Your things' }, pack, notes),
      ),
    );
    focusHeading(root);
  };
  persist();
  render();
}

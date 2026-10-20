import './styles.css';
import { browserStore, type ReadingPrefs } from './engine/persistence';
import { fetchCatalog, fetchStory, type Catalog, type CatalogEntry } from './ui/catalog';
import { focusHeading, h, icon, mount } from './ui/dom';
import { applyPrefs, loadPrefs, prefsPanel, savePrefs } from './ui/prefs';
import { startReader, stopSpeaking } from './ui/reader';

const root = document.getElementById('app')!;
const store = browserStore();
let prefs: ReadingPrefs = loadPrefs(store);
applyPrefs(document.documentElement, prefs);
let catalog: Catalog | undefined;
let parentUnlocked = false;

function setPrefs(next: ReadingPrefs) {
  prefs = next;
  savePrefs(store, prefs);
  applyPrefs(document.documentElement, prefs);
  // Re-render the settings and put focus back on the control that changed.
  const key = (document.activeElement as HTMLElement | null)?.dataset.key;
  settingsView(false);
  if (key) root.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`)?.focus();
}

async function getCatalog(): Promise<Catalog> {
  catalog ??= await fetchCatalog();
  return catalog;
}

function errorView(message: string) {
  const friendly = /fetch|network|load/i.test(message) ? 'The stories could not be loaded. Check the internet connection and try again.' : message;
  mount(
    root,
    h(
      'main',
      { id: 'main', class: 'library' },
      h('h1', {}, 'Something went wrong'),
      h('p', {}, friendly),
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn primary', onclick: () => ((catalog = undefined), route()) }, 'Try again'), h('button', { type: 'button', class: 'btn', onclick: () => go('#/') }, 'Back to library')),
    ),
  );
  focusHeading(root);
}

function loadingView() {
  mount(root, h('main', { id: 'main', class: 'library' }, h('p', { role: 'status' }, 'Loading…')));
}

const go = (hash: string) => {
  if (location.hash === hash) route();
  else location.hash = hash;
};

async function libraryView() {
  const cat = await getCatalog();
  const card = (e: CatalogEntry) =>
    h('li', { class: 'card' }, h('h2', {}, e.title), e.series ? h('p', { class: 'muted' }, `${e.series.title}, book ${e.series.order}`) : null, h('button', { type: 'button', class: 'btn primary', 'aria-label': `Read ${e.title}`, onclick: () => go(`#/read/${e.id}`) }, 'Read'));
  mount(
    root,
    h(
      'main',
      { id: 'main', class: 'library' },
      h('h1', {}, 'Story Quest'),
      h('p', {}, 'Pick a story. You choose what happens next.'),
      cat.published.length
        ? h('ul', { class: 'cards' }, ...cat.published.map(card))
        : h('div', { class: 'empty' }, h('h2', {}, 'No stories yet'), h('p', {}, 'A grown-up needs to approve a story before it shows up here.')),
      h(
        'div',
        { class: 'row footer-row' },
        h('button', { type: 'button', class: 'btn', onclick: () => go('#/settings') }, 'Reading settings'),
        h('button', { type: 'button', class: 'btn', onclick: () => go('#/parent') }, 'For grown-ups'),
      ),
    ),
  );
  focusHeading(root);
}

async function readerView(id: string, isPreview: boolean) {
  const cat = await getCatalog();
  const entry = isPreview ? cat.previews.find((p) => p.id === id) : cat.published.find((p) => p.id === id);
  if (!entry) return errorView(isPreview ? 'That preview is not available.' : 'That story is not in the library.');
  if (isPreview && !parentUnlocked) return go('#/parent');
  loadingView();
  const story = await fetchStory(entry);
  startReader(root, story, {
    store,
    prefs,
    saveNamespace: isPreview ? 'preview-' : '',
    onExit: () => go(isPreview ? '#/parent' : '#/'),
    banner: isPreview ? `Parent preview: draft version ${entry.version}, not yet approved. Literacy review: ${story.literacy.review.status}.` : undefined,
  });
}

async function parentView() {
  const { parentGate, startStudio } = await import('./ui/parent');
  if (!parentUnlocked) {
    parentGate(
      root,
      () => {
        parentUnlocked = true;
        route();
      },
      () => go('#/'),
    );
    return;
  }
  startStudio(root, { store, catalog: await getCatalog(), onExit: () => go('#/'), onPlayPreview: (e) => go(`#/preview/${e.id}`) });
}

function settingsView(focus = true) {
  mount(root, h('main', { id: 'main', class: 'library' }, h('nav', { class: 'reader-bar' }, h('button', { type: 'button', class: 'btn small', onclick: () => go('#/') }, icon('← '), 'Library')), prefsPanel(prefs, setPrefs)));
  if (focus) focusHeading(root);
}

function route() {
  const hash = location.hash || '#/';
  if (!hash.startsWith('#/')) return;
  const [, view, id] = hash.split('/');
  if (!catalog && view !== 'settings') loadingView();
  const run = async () => {
    if (view === 'read' && id) await readerView(decodeURIComponent(id), false);
    else if (view === 'preview' && id) await readerView(decodeURIComponent(id), true);
    else if (view === 'parent') await parentView();
    else if (view === 'settings') settingsView();
    else await libraryView();
  };
  run().catch((e: unknown) => errorView(e instanceof Error ? e.message : String(e)));
}

// The skip link must not change the route; it only moves focus to the page.
document.querySelector('.skip-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  root.querySelector<HTMLElement>('main')?.focus();
});

// Leaving a page by any route (including the Android back button) stops read-aloud.
window.addEventListener('hashchange', () => {
  stopSpeaking();
  route();
});
window.addEventListener('pagehide', stopSpeaking);
route();

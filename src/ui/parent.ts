// Parent story studio. Loaded on demand so the child-facing bundle does not
// carry the validator. Everything here runs locally in the browser.

import { readJson, writeJson, type KeyValueStore } from '../engine/persistence';
import type { Story } from '../engine/types';
import { validateDraft, type DraftValidation } from '../production/validate-draft';
import { contentHash } from '../util/hash';
import type { Catalog, PreviewEntry } from './catalog';
import { fetchStory } from './catalog';
import { focusHeading, h, icon, mount } from './dom';

interface LocalVersion {
  savedAt: string;
  version: number;
  hash: string;
  json: string;
  valid: boolean;
}

const versionsKey = (id: string) => `studio:versions:${id}`;
const isVersions = (v: unknown): v is LocalVersion[] => Array.isArray(v) && v.every((x) => typeof x === 'object' && x !== null && typeof (x as LocalVersion).json === 'string');

export function loadVersions(store: KeyValueStore, storyId: string): LocalVersion[] {
  return readJson(store, versionsKey(storyId), isVersions) ?? [];
}

export function saveVersion(store: KeyValueStore, storyId: string, json: string, valid: boolean, now = new Date()): LocalVersion[] {
  const data = JSON.parse(json) as Story;
  const entry: LocalVersion = { savedAt: now.toISOString(), version: data.version, hash: contentHash(data), json, valid };
  const list = loadVersions(store, storyId);
  if (list.at(-1)?.hash === entry.hash) return list;
  const next = [...list, entry].slice(-20);
  writeJson(store, versionsKey(storyId), next);
  return next;
}

export function validationView(v: DraftValidation): HTMLElement {
  const rows: [string, boolean, string][] = [
    ['Story file format', v.schema.ok, v.schema.ok ? 'Matches the story schema' : v.schema.errors.slice(0, 8).join('; ')],
  ];
  if (v.graph)
    rows.push([
      'Story paths',
      v.graph.ok,
      v.graph.ok
        ? `${v.graph.stats.passages} pages, ${v.graph.stats.reachableEndings.length} of ${v.graph.stats.endings.length} endings reachable, shortest route ${v.graph.stats.shortestPathToEnding} pages`
        : v.graph.errors.map((e) => `${e.code}${e.passage ? ` (${e.passage})` : ''}`).join('; '),
    ]);
  if (v.literacy) for (const c of v.literacy.automatedChecks) rows.push([`Reading check: ${c.id}`, c.ok, c.detail]);
  const lit = v.literacy;
  return h(
    'div',
    { class: 'validation' },
    h('p', { class: v.ok ? 'status ok' : 'status bad' }, v.ok ? 'All automated checks passed.' : 'Some automated checks need attention.'),
    h('p', { class: 'muted' }, 'Automated checks do not replace the literacy review or your approval.'),
    h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Check'), h('th', {}, 'Result'), h('th', {}, 'Detail'))), h('tbody', {}, ...rows.map(([name, ok, detail]) => h('tr', {}, h('td', {}, name), h('td', {}, ok ? 'Pass' : 'Needs work'), h('td', {}, detail))))),
    lit
      ? h(
          'div',
          {},
          h('h3', {}, 'Word sets'),
          h('ul', {}, ...lit.wordSets.map((s) => h('li', {}, `${s.label}: ${s.totalOccurrences} uses (aim ${s.minOccurrences}) in ${s.passagesWithSet} pages${s.missingWords.length ? `, missing ${s.missingWords.join(', ')}` : ''}`))),
          h('p', {}, `Literacy review: ${lit.review.status}${lit.review.reviewer ? ` by ${lit.review.reviewer}` : ''}`),
        )
      : null,
  );
}

function storyMap(story: Story): HTMLElement {
  return h(
    'details',
    { class: 'story-map' },
    h('summary', {}, `Story map (${story.passages.length} pages)`),
    h(
      'ol',
      {},
      ...story.passages.map((p) =>
        h(
          'li',
          {},
          h('strong', {}, p.id),
          p.ending ? ` — ending: ${p.ending.title} (${p.ending.kind})` : '',
          p.choices.length ? h('ul', {}, ...p.choices.map((c) => h('li', {}, `${c.label} → ${c.target}${c.requires ? ' (locked until found)' : ''}`))) : null,
        ),
      ),
    ),
  );
}

function safeStoryMap(story: Story): HTMLElement | null {
  try {
    return storyMap(story);
  } catch {
    return null;
  }
}

export interface StudioOptions {
  store: KeyValueStore;
  catalog: Catalog;
  onExit: () => void;
  onPlayPreview: (entry: PreviewEntry) => void;
}

export function parentGate(root: HTMLElement, onPass: () => void, onExit: () => void): void {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 4 + Math.floor(Math.random() * 6);
  const input = h('input', { id: 'gate-answer', inputmode: 'numeric', autocomplete: 'off', class: 'input' });
  const msg = h('p', { class: 'muted', role: 'status' });
  const form = h(
    'form',
    {
      class: 'gate',
      onsubmit: (e: Event) => {
        e.preventDefault();
        if (Number(input.value) === a * b) onPass();
        else msg.textContent = 'That is not right. Please ask a grown-up.';
      },
    },
    h('h1', {}, 'For grown-ups'),
    h('p', {}, 'This area lets a parent check and approve stories.'),
    h('label', { for: 'gate-answer' }, `What is ${a} × ${b}?`),
    input,
    h('div', { class: 'row' }, h('button', { type: 'submit', class: 'btn primary' }, 'Continue'), h('button', { type: 'button', class: 'btn', onclick: onExit }, 'Back')),
    msg,
    h('p', { class: 'muted small' }, 'This check keeps children out of the studio by accident. It is not a password.'),
  );
  mount(root, h('main', { id: 'main', class: 'studio' }, form));
  focusHeading(root);
}

export function startStudio(root: HTMLElement, opts: StudioOptions): void {
  const editorArea = h('div', { class: 'editor-area' });

  const openEditor = (story: Story, entry?: PreviewEntry) => {
    const text = h('textarea', { class: 'json', spellcheck: 'false', 'aria-label': 'Story file (JSON)', rows: 18 }) as HTMLTextAreaElement;
    text.value = JSON.stringify(story, null, 2);
    const result = h('div', { 'aria-live': 'polite' });
    const versions = h('div', {});
    const saved = h('p', { role: 'status', class: 'muted' });
    const run = (): DraftValidation | undefined => {
      try {
        const v = validateDraft(JSON.parse(text.value));
        mount(result, validationView(v));
        return v;
      } catch (e) {
        mount(result, h('p', { class: 'status bad' }, `This is not valid JSON: ${(e as Error).message}`));
        return undefined;
      }
    };
    const listVersions = () =>
      mount(
        versions,
        h('h3', {}, 'Saved versions on this device'),
        h(
          'ul',
          {},
          ...loadVersions(opts.store, String(story.id))
            .slice()
            .reverse()
            .map((v) =>
              h(
                'li',
                {},
                `v${v.version} saved ${new Date(v.savedAt).toLocaleString()} ${v.valid ? '(checks passed)' : '(checks failed)'} `,
                h('button', { type: 'button', class: 'btn small', onclick: () => ((text.value = v.json), run()) }, 'Load'),
              ),
            ),
        ),
      );
    const download = () => {
      const blob = new Blob([text.value], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: `${story.id}.json` });
      a.click();
      URL.revokeObjectURL(a.href);
    };
    mount(
      editorArea,
      h('h2', {}, `Check and edit: ${story.title ?? 'story file'}`),
      entry
        ? h(
            'div',
            { class: 'gates' },
            h('h3', {}, `Production status: ${entry.jobState}`),
            h('ul', {}, ...entry.gates.map((g) => h('li', {}, `${g.ok ? '✓' : '○'} ${g.id}: ${g.detail}`))),
            h('p', { class: 'muted' }, 'Approval and publishing are done with the story tool on a computer (see docs/STORY_AUTHORING.md). Edits saved here stay on this device until you download them.'),
          )
        : null,
      safeStoryMap(story),
      h(
        'div',
        { class: 'row' },
        h('button', { type: 'button', class: 'btn primary', onclick: run }, 'Run checks'),
        h(
          'button',
          {
            type: 'button',
            class: 'btn',
            onclick: () => {
              const v = run();
              if (v?.schema.ok) {
                saveVersion(opts.store, String(story.id), text.value, v.ok);
                listVersions();
                saved.textContent = `Saved version ${JSON.parse(text.value).version} on this device.`;
              }
            },
          },
          'Save version',
        ),
        h('button', { type: 'button', class: 'btn', onclick: download }, 'Download file'),
      ),
      saved,
      text,
      result,
      versions,
    );
    run();
    listVersions();
    focusHeading(editorArea);
  };

  const previews = opts.catalog.previews;
  mount(
    root,
    h(
      'main',
      { id: 'main', class: 'studio' },
      h('nav', { class: 'reader-bar' }, h('button', { type: 'button', class: 'btn small', onclick: opts.onExit }, icon('← '), 'Library'), h('span', { class: 'story-name' }, 'Parent studio')),
      h('h1', {}, 'Parent studio'),
      h('p', {}, 'Stories here are drafts. Children only see a story after it passes its reviews and you approve it.'),
      h('h2', {}, 'Stories waiting for review'),
      previews.length
        ? h(
            'ul',
            { class: 'cards' },
            ...previews.map((entry) =>
              h(
                'li',
                { class: 'card' },
                h('h3', {}, entry.title),
                h('p', {}, `Version ${entry.version} · status: ${entry.jobState}`),
                h(
                  'div',
                  { class: 'row' },
                  h('button', { type: 'button', class: 'btn primary', onclick: () => opts.onPlayPreview(entry) }, 'Play preview'),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'btn',
                      onclick: async () => {
                        try {
                          openEditor(await fetchStory(entry), entry);
                        } catch (e) {
                          mount(editorArea, h('p', { class: 'status bad' }, (e as Error).message));
                        }
                      },
                    },
                    'Check and edit',
                  ),
                ),
              ),
            ),
          )
        : h('p', {}, 'No drafts waiting.'),
      h(
        'label',
        { class: 'btn file-btn' },
        'Open a story file…',
        h('input', {
          type: 'file',
          accept: 'application/json,.json',
          class: 'visually-hidden',
          onchange: async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            try {
              openEditor(JSON.parse(await file.text()) as Story);
            } catch (err) {
              mount(editorArea, h('p', { class: 'status bad' }, `Could not open that file: ${(err as Error).message}`));
            }
          },
        }),
      ),
      editorArea,
    ),
  );
  focusHeading(root);
}

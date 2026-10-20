import { clampPrefs, DEFAULT_PREFS, isReadingPrefs, readJson, writeJson, type KeyValueStore, type ReadingPrefs } from '../engine/persistence';
import { h } from './dom';

const KEY = 'prefs';

export function loadPrefs(store: KeyValueStore): ReadingPrefs {
  return clampPrefs(readJson(store, KEY, isReadingPrefs) ?? DEFAULT_PREFS);
}

export function savePrefs(store: KeyValueStore, prefs: ReadingPrefs): void {
  writeJson(store, KEY, clampPrefs(prefs));
}

const FONTS: Record<ReadingPrefs['font'], string> = {
  system: "Verdana, Tahoma, 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif",
  rounded: "'Comic Sans MS', 'Comic Neue', 'Andika', 'Chalkboard SE', Roboto, sans-serif",
  serif: "Georgia, 'Noto Serif', 'Droid Serif', serif",
};

/** Typography lives in CSS custom properties so every screen picks it up. */
export function applyPrefs(root: HTMLElement, prefs: ReadingPrefs): void {
  root.style.setProperty('--font-scale', String(prefs.fontScale));
  root.style.setProperty('--line-height', String(prefs.lineHeight));
  root.style.setProperty('--letter-spacing', `${prefs.letterSpacing}em`);
  root.style.setProperty('--word-spacing', `${(prefs.letterSpacing * 2.5).toFixed(2)}em`);
  root.style.setProperty('--reading-font', FONTS[prefs.font]);
  root.dataset.theme = prefs.theme;
  root.dataset.lineFocus = String(prefs.lineFocus);
}

export function prefsPanel(prefs: ReadingPrefs, onChange: (p: ReadingPrefs) => void): HTMLElement {
  const update = (patch: Partial<ReadingPrefs>) => onChange(clampPrefs({ ...prefs, ...patch }));
  const stepper = (label: string, value: string, minus: () => void, plus: () => void) =>
    h(
      'div',
      { class: 'stepper', role: 'group', 'aria-label': label },
      h('span', { class: 'stepper-label' }, label),
      h('button', { type: 'button', class: 'btn small', onclick: minus, 'aria-label': `${label}: smaller`, 'data-key': `${label}-minus` }, '−'),
      h('output', { class: 'stepper-value', 'aria-live': 'polite' }, value),
      h('button', { type: 'button', class: 'btn small', onclick: plus, 'aria-label': `${label}: bigger`, 'data-key': `${label}-plus` }, '+'),
    );
  const radio = <K extends 'font' | 'theme'>(key: K, label: string, options: [ReadingPrefs[K], string][]) =>
    h(
      'fieldset',
      { class: 'radio-row' },
      h('legend', {}, label),
      ...options.map(([value, text]) =>
        h(
          'label',
          { class: 'radio' },
          h('input', { type: 'radio', name: key, value, 'data-key': `${key}-${value}`, checked: prefs[key] === value, onchange: () => update({ [key]: value } as Partial<ReadingPrefs>) }),
          h('span', {}, text),
        ),
      ),
    );
  const toggle = (key: 'lineFocus' | 'readAloud', text: string) =>
    h('label', { class: 'toggle' }, h('input', { type: 'checkbox', 'data-key': key, checked: prefs[key], onchange: (e: Event) => update({ [key]: (e.target as HTMLInputElement).checked }) }), h('span', {}, text));

  return h(
    'section',
    { class: 'prefs', 'aria-labelledby': 'prefs-title' },
    h('h1', { id: 'prefs-title' }, 'Reading settings'),
    h('p', { class: 'sample-text' }, 'The fox can see the ship by the dock.'),
    stepper('Text size', `${Math.round(prefs.fontScale * 100)}%`, () => update({ fontScale: prefs.fontScale - 0.1 }), () => update({ fontScale: prefs.fontScale + 0.1 })),
    stepper('Line spacing', prefs.lineHeight.toFixed(1), () => update({ lineHeight: prefs.lineHeight - 0.2 }), () => update({ lineHeight: prefs.lineHeight + 0.2 })),
    stepper('Letter spacing', prefs.letterSpacing.toFixed(2), () => update({ letterSpacing: prefs.letterSpacing - 0.02 }), () => update({ letterSpacing: prefs.letterSpacing + 0.02 })),
    radio('font', 'Letters', [
      ['system', 'Plain'],
      ['rounded', 'Rounded'],
      ['serif', 'Book'],
    ]),
    radio('theme', 'Page colour', [
      ['cream', 'Cream'],
      ['blue', 'Soft blue'],
      ['grey', 'Grey'],
      ['dark', 'Dark'],
    ]),
    toggle('lineFocus', 'Highlight one paragraph at a time'),
    toggle('readAloud', 'Show the "read to me" button'),
    h('button', { type: 'button', class: 'btn', 'data-key': 'reset', onclick: () => onChange({ ...DEFAULT_PREFS }) }, 'Reset settings'),
  );
}

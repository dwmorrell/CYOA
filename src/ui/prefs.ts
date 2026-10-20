import type { ReadingPrefs } from '../engine/persistence';

const FONTS: Record<ReadingPrefs['font'], string> = {
  system: "Verdana, Tahoma, 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif",
  dyslexic: "'OpenDyslexic', Verdana, Tahoma, Roboto, sans-serif",
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

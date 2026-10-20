# Accessibility and compatibility

## Targets

- WCAG 2.2 level AA for every screen.
- Dyslexia-informed presentation by default, adjustable by the reader.
- Android phones and tablets running Chrome (Android 10 and later, with
  Android 15 as a named target) and Chromebooks running current ChromeOS.
- Usable on slow or metered connections.

## How the app meets them

| Area | Approach | Where |
| --- | --- | --- |
| Typography | System sans-serif default, size 90–220%, line spacing 1.4–2.6, letter and word spacing, left-aligned, max 62ch line, no italics | `src/styles.css`, `src/ui/prefs.ts` |
| Colour | Cream, soft blue, grey and dark themes; dark-grey text, not pure black | `src/styles.css` |
| Reading supports | Tap-to-see syllables, one-paragraph focus, read-to-me via the browser's speech engine | `src/ui/Reader.tsx` |
| Targets | Buttons at least 48×48 CSS px | `.btn` in `src/styles.css` |
| Focus | Visible 3px focus ring; heading focused on each new page | `src/styles.css`, `src/ui/Reader.tsx` |
| Screen readers | Real buttons and headings, focus moved to each new page heading, targeted live regions only, locked choices use `aria-disabled` plus a described hint, decorative symbols hidden | `src/ui/` |
| Motion | No animation beyond a short fade, removed under `prefers-reduced-motion` | `src/styles.css` |
| Bandwidth | React and Vite; the OpenDyslexic font is bundled; no images in stories; grown-up area and editor loaded only when opened; stories are small JSON; the app shell works offline once cached | `vite.config.ts`, `src/main.tsx` |
| Old devices | Build target ES2020 / Chrome 90 | `vite.config.ts` |

## Verification status

| Check | Status |
| --- | --- |
| DOM tests for reader semantics and preference CSS variables | Automated (`tests/unit/ui.test.tsx`) |
| Bundle size | Printed by `npm run build`; recorded in the compatibility report |
| Code-review accessibility audit | `reports/accessibility/a11y-review-2026-10-20.md` (20 findings, all code-review). High findings A11Y-01 to 05 fixed in code; fixes not yet re-reviewed or tested on a device |
| Screen reader (TalkBack, ChromeVox) | **Not yet tested** |
| Android 15 phone and tablet, real device | **Not yet tested** |
| Chromebook, real device | **Not yet tested** |
| Automated axe or Lighthouse run | **Not yet set up** |

Untested rows must not be reported as passing. The
`accessibility-compatibility-reviewer` agent labels each finding as
`verified` (a tool or device was used) or `code-review` (read from source).

## Known gaps

- `color-mix()` used for the paragraph-focus highlight needs Chrome 111+;
  older browsers simply show no highlight tint (other paragraphs are still muted).
- Open findings from the audit: A11Y-14 (arithmetic parent gate), A11Y-15 (feedback on pressing a locked choice), A11Y-16 (glossary underline cue), A11Y-17 (UI-15 overstates target sizes), A11Y-19 (forced colours), A11Y-20 (reflow and spacing untested).
- Read-to-me depends on the device having a speech voice installed.
- No offline caching yet.

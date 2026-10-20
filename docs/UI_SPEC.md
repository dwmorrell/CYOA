# UI specification

Numbered requirements. "Test" names the automated check; "manual" means it
needs a person or device.

| Id | Requirement | Verification |
| --- | --- | --- |
| UI-1 | The library lists only `published` catalog entries; with none, it says a grown-up must approve a story first. | manual; `production.test.ts` "previews never reach the child library" covers the data side |
| UI-2 | A passage shows its title as the page heading, its paragraphs, then its choices as full-width buttons. | `ui.test.ts` "renders a passage" |
| UI-3 | A locked choice stays visible, is `aria-disabled`, does nothing when pressed, and shows its hint linked by `aria-describedby`. | `ui.test.ts` "locked choices" |
| UI-4 | Backpack and clue notebook are collapsible and show counts. | `ui.test.ts` "renders a passage" |
| UI-5 | Endings show the ending title, a kind label (never "you lose"), the number of endings found, and "Play again". | `ui.test.ts` "ending" |
| UI-6 | Progress saves after every choice and restores on reload. | `ui.test.ts` "restores saved progress"; `persistence.test.ts` |
| UI-7 | Reading settings change CSS variables for size, line spacing, letter and word spacing, font and theme, and persist. | `ui.test.ts` "applies preferences" |
| UI-8 | Glossary words are buttons that reveal syllables; `aria-expanded` reflects state. | `ui.test.ts` "glossary words" |
| UI-9 | Paragraph focus dims other paragraphs and offers Back and Next buttons. | manual |
| UI-10 | Read-to-me appears only if enabled and the browser supports speech; the same button stops reading, and speech stops on every page change. | manual |
| UI-11 | The parent studio is behind an arithmetic gate and loads on demand. | manual; build output shows a separate chunk |
| UI-12 | Previews play with a banner saying the draft is not approved and its literacy review status; preview saves are separate from the child's. | manual |
| UI-13 | The studio runs schema, graph and literacy checks, shows word-set counts, saves local versions and downloads the file. | `ui.test.ts` "studio validation view"; manual for download |
| UI-14 | Layout works from 320 CSS px wide to desktop with no horizontal scrolling. | manual |
| UI-15 | Buttons are at least 48×48 CSS px; checkboxes, radios and glossary words have 24px or larger targets inside 48px-tall labels (WCAG 2.5.8). Open finding A11Y-17 asks to raise these. | manual (CSS `--tap`) |

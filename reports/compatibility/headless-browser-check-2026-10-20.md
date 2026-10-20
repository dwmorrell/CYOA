# Headless browser check, 2026-10-20

**What this is:** the production build (`npm run build`, served by `vite preview`) driven by Playwright in headless Chromium 1194 with two emulated profiles. Script: `tests/browser/smoke.cjs`.

**What this is not:** a real-device test. Emulation sets viewport, pixel ratio, touch and user agent only. Android 15, Android WebView, a physical Chromebook, TalkBack and ChromeVox remain **untested**.

**Bug found and fixed by this check:** glossary syllable hints were visible before tapping, because `.syllables { display: inline-block }` overrode the `hidden` attribute. The jsdom unit test checks the attribute and could not see it. Fixed with `.syllables[hidden] { display: none }`.

Output after the fix (random play with a fixed seed, up to 12 playthroughs):

```
Pixel 7 (Android phone): library h1="Story Quest" text="Story QuestPick a story. You choose what happens next.No stories yetA grown-up n"
  preview first page: "The Fog Rolls In", choices=2, banner=1
  endings reached by random play: Two Keepers | A Brave Try | The Lamp Keeper
  reached: "The Lamp Keeper" ending=1 You have found 3 of 3 endings.
  after reload: "For grown-ups"
  horizontal overflow: false; page errors: none
Chromebook-size 1366x768: library h1="Story Quest" text="Story QuestPick a story. You choose what happens next.No stories yetA grown-up n"
  preview first page: "The Fog Rolls In", choices=2, banner=1
  endings reached by random play: Two Keepers | A Brave Try | The Lamp Keeper
  reached: "The Lamp Keeper" ending=1 You have found 3 of 3 endings.
  after reload: "For grown-ups"
  horizontal overflow: false; page errors: none
```

"after reload: For grown-ups" is expected: preview pages require passing the parent gate again after a reload.

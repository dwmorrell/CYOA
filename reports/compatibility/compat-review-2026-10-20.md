# Compatibility review, 2026-10-20

**Method:** source reading only. No device, emulator, browser or build was available, and `dist/` does not exist, so **no bundle sizes were measured** (`npm run build` was not run). All findings are `code-review`. `docs/ACCESSIBILITY_AND_COMPATIBILITY.md` records no device test, so every cell is `untested` unless marked `known issue`.

Legend: `tested` = run on that target; `untested` = not run; `known issue` = a specific problem found in source (not confirmed on a device).

## Device and browser matrix

| Target | Layout / touch | Keyboard | Screen reader | Offline / slow network | Read-to-me |
| --- | --- | --- | --- | --- | --- |
| Android 15, Chrome, phone | untested | untested | untested (TalkBack) | known issue (C-03, C-06) | untested; known issue C-05 |
| Android 15, Chrome, tablet | untested | untested | untested (TalkBack) | known issue (C-03, C-06) | untested; known issue C-05 |
| Android 10–14, Chrome | untested | untested | untested (TalkBack) | known issue (C-03, C-06) | untested |
| Android 10–15, WebView | untested | untested | untested | known issue (C-03) | untested; known issue C-05 |
| Chrome 90–91 (old, not updated) | known issue (C-02) | untested | untested | known issue (C-03) | untested |
| Chrome older than 111 | known issue (C-02, no `color-mix` tint) | untested | untested | known issue (C-03) | untested |
| ChromeOS, current Chrome, touch | untested | untested | untested (ChromeVox) | known issue (C-03) | untested |
| ChromeOS, current Chrome, keyboard/mouse | untested | known issues A11Y-01, 02, 07 (see a11y report) | untested (ChromeVox) | known issue (C-03) | untested |

## Findings

| id | severity | evidence | location | detail and recommendation | owner |
| --- | --- | --- | --- | --- | --- |
| C-01 | Medium | code-review | `src/ui/parent.ts` `download()` | `URL.revokeObjectURL(a.href)` runs synchronously after `a.click()` on a detached anchor. This can cancel the download on slower Android devices, and WebView does not download blobs unless the host app handles downloads. Append the anchor and delay the revoke (for example `setTimeout(..., 1000)`); test on Android Chrome and WebView. Parent-facing, so impact is limited. | app-engineer |
| C-02 | Low | code-review | `vite.config.ts` `target: ['es2020','chrome90']`; `src/ui/parent.ts:31` `list.at(-1)`; also `.at()` in `src/literacy/taxonomy.ts`, `src/production/*.ts` | The target is a syntax target only; esbuild adds no polyfills. `Array.prototype.at` is Chrome 92+, so "Chrome 90" is not guaranteed for code using it (the parent chunk does; check whether `src/literacy` reaches the child bundle). `color-mix()` in `styles.css` needs Chrome 111+ (already a documented gap). Use `arr[arr.length - 1]` or raise the stated floor. Confirm by inspecting `dist/` after a build. | app-engineer |
| C-03 | Medium | code-review | `index.html` manifest link; `public/manifest.webmanifest`; no service worker in `src/` or `public/` | No offline support (documented gap). The manifest has one SVG icon (`sizes: any`); install criteria on Android Chrome and PNG icon expectations are untested, so installability is unknown. If families have unreliable connections, add a service worker caching the shell and published stories, plus PNG icons. Needs a product decision on offline scope. | app-engineer |
| C-04 | Medium | code-review | `src/styles.css` `--reading-font`; `src/ui/prefs.ts` `FONTS` | The "Plain" stack leads with Verdana/Tahoma/Segoe UI, none shipped on Android or ChromeOS, so it falls through to Roboto/Noto Sans. The "Rounded" stack (`Comic Sans MS`, `Comic Neue`, `Andika`, `Chalkboard SE`) has no match on stock Android or ChromeOS, so it likely looks the same as "Plain". "Book" falls to Noto Serif. Two options may look identical on target devices. Options: bundle a subsetted woff2 (costs bandwidth against the "no web fonts" principle, so a decision) or drop or rename the option. Needs an on-device check. | ux-designer |
| C-05 | Medium | code-review | `src/ui/reader.ts` `speak()` and the `'speechSynthesis' in window` check | The button shows whenever the API exists, not when a voice exists. WebView and some ChromeOS profiles expose `speechSynthesis` with no voices, so the button may do nothing. Check `getVoices().length` (and `voiceschanged`) before showing it, and give feedback on failure. | app-engineer |
| C-06 | Medium | code-review | `src/main.ts`; `src/ui/catalog.ts` `fetchCatalog()` (`cache: 'no-cache'`) | Slow or metered networks: no loading indicator, a revalidation request for `catalog.json` on every load, no retry, and raw browser error text offline (see A11Y-12). Story JSON is small and the parent chunk is lazy, which helps. Bundle size unmeasured. | app-engineer |
| C-07 | Low | code-review | `src/main.ts` `go()` / hash routing | Each view adds a history entry but passages do not, so Android Back from a story goes to the library. Probably intended (progress saves per choice) but untested. | app-engineer |
| C-08 | Low | code-review | `src/styles.css` `#app` padding; `index.html` `viewport-fit=cover` | `env(safe-area-inset-*)` is used for top and bottom only; left/right insets (landscape phones with cutouts, foldables) are not. Untested. | ux-designer |
| C-09 | Low | code-review | `src/engine/persistence.ts` `browserStore()` (not read in full) | Storage uses a localStorage probe at start-up. Behaviour when storage is blocked (managed Chromebooks, restricted profiles) was not reviewed beyond the probe. Verify the fallback and that the child is told progress will not be kept. | app-engineer |

## Bundle sizes

Not measured. `dist/` is absent and the build was not run. Record `npm run build` output here once available, including the separate parent chunk (UI-11).

## Needed before any "compatible" claim

1. Run `npm run build`; record sizes; inspect `dist/` for `.at(` and `color-mix`.
2. Test on an Android 15 phone and tablet (Chrome) and a current Chromebook, with TalkBack and ChromeVox.
3. Test WebView if the app will ship inside one.
4. Set up an automated axe or Lighthouse run (listed "Not yet set up" in the docs).

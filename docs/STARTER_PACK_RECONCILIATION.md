# Starter pack reconciliation (The Whispering Vault, R26)

Status: assessed 2026-10-20. Source of truth is `docs/MASTER_SPEC.md`. The
starter pack is an input to be checked against it, not a standard.

## Provenance

- File: `adventure_rpg_mvp_starter.zip`, supplied in the project chat on
  2026-10-20 (coordinator relay).
- SHA-256 of the ZIP as received: `f13afdf4683ec52b8c4f018faf069b38bf77785066bf0245484450477b027c91`
- The ZIP's contents were read in a scratch directory. Nothing was copied into
  the repository, and no story from it has been imported, published or added to
  the device library.

## What the pack contains and what was decided

| File in the pack | What it is | Decision |
| --- | --- | --- |
| `README.md` | Planning pack, not a runnable app; stack suggestion (React, TypeScript, Vite, IndexedDB, Vitest, Playwright, PWA) | Stack adopted. Raw IndexedDB is used instead of `idb`. The 15 to 25 minute adventure is pending (R23). |
| `specs/MVP_SPEC.md` | Must-haves and UX rules | Mostly consistent with the master spec. Differences listed below. |
| `specs/IMPLEMENTATION_PLAN.md` | Milestones M0 to M7 | Status below. |
| `specs/STORY_SCHEMA.md` | A draft schema v1.0 with a different shape | Not adopted as a format. `schemas/story.schema.json` stays the contract. Its checks are compared below. |
| `specs/LEARNING_SPEC.md` | Learning dimensions and evidence types | Partly adopted. Evidence types and difficulty levels are pending (R27). |
| `qa/ACCEPTANCE_CHECKLIST.md` | Acceptance items | Mapped below. Device items are pending. |
| `agents/*.md` (5 files) | Role contracts | Mapped to our nine agents (see `docs/AGENTS_AND_WORKFLOW.md`). Principles adopted where we lacked them. |
| `stories/whispering-vault.json` | Illustrative sample story in the draft schema | Assessed below. Not imported. |

### Differences from the master spec (MVP_SPEC and LEARNING_SPEC)

- **Typing timer.** The pack says the typing game has a timer "off by default".
  The master spec says there are no timers on reading activities. This build
  has no timers at all. A typing timer option is not built, and if it is ever
  added it must be off, and must never affect reading.
- **Typing speed.** The pack asks the typing game to report speed. Not built
  (R28). Typing speed must never be reported as reading fluency.
- **Progress separation.** The pack asks for reading activity, mini-games, story
  achievements and skill evidence to be reported separately. Progress currently
  separates endings, clues, puzzles, words and pages. Skill evidence is not
  built (R27).
- **Settings do not reset progress.** Settings are stored under their own key
  and never touch saves. Not covered by a dedicated test yet.
- **Published updates do not replace an active run.** Implemented: a save keeps
  the snapshot hash it started with (R20), with a test.

### Starter schema checks compared with this build

| Check in the pack's STORY_SCHEMA | This build |
| --- | --- |
| IDs unique; references resolve | Implemented (`src/validation/graph.ts`). |
| All advertised endings reachable | Implemented (state search). |
| No accidental dead ends | Implemented. |
| Conditions cannot leave a reachable state with no valid choice | Implemented as soft-lock detection. |
| Required clues introduced before use and obtainable on every path that needs them | **Not implemented** (pending, R30). |
| Learning metadata matches the content | Advisory only (`learningDesign`). |
| Variants preserve clue logic | Not adopted; pending. |
| Published versions increment | Implemented. |
| Imports produce actionable field-level errors | Partly: schema errors are listed; they are not field-level pointers yet. |

### Implementation plan status

| Milestone | Status |
| --- | --- |
| M0 Foundation | Done (`npm run check`, CI). |
| M1 Story engine | Done (passages, choices, conditions, effects, clues, items, flags, endings). |
| M2 Persistence and profiles | Done (IndexedDB, profiles, PIN, version-bound saves). Real-device reload not tested. |
| M3 Reading experience | Partly. Typography, word help, read-aloud and focus done. "Safe pre-authored variants" not built. |
| M4 Parent story studio | Partly. Editor, versions, import and export done. Version diff not built (R29). Approval needs a human literacy review. |
| M5 Progress and mini-games | Partly. Progress and badges done. Skill evidence, typing accuracy and speed not built (R27, R28). |
| M6 Complete first adventure | Pending (R23). |
| M7 Packaging | Partly. PWA, icons, service worker built. Android and Chromebook tests pending (R25). |

### Acceptance checklist

- Engine: JSON loads without code changes (done); IDs and references (done); endings reachable and no dead ends (done); deterministic conditions and effects (done); hints non-punitive with no state effects (partly: hints are text only).
- Persistence and editor: a save is read back with its exact state (repo tests cover `loadSave`, not a browser reload); settings are stored and clamped (repo test); active run pinned to its version (repo test); an invalid import is rejected before it is stored (import test; no save-corruption test); editing, validation, import and export are covered by UI or repo tests; preview has no automated test; publish is not in-app (by policy); version diff pending (R29).
- Learning and accessibility: text settings do not hide controls (not tested on a device); read-aloud stop exists in code but is not tested in a browser; word help is optional (tested); no timed decisions (tested statically, R21); reading activity excludes menus (by design); evidence types pending (R27); no clinical claims (checked by reading the copy only).
- Keyboard and mini-game: keyboard use with visible focus (not tested with a real keyboard); typing corrections (no typing-speed game yet); no timer (static test); typing speed not reported (not built).
- Release: Android tablet test and Chromebook keyboard test not run; parent review of a complete story pending.

## The Whispering Vault sample (`stories/whispering-vault.json`)

Measured by reading the file and running a short script on a scratch copy. The
script checked reachability and continuity with conditions enforced.

- **Schema.** Not valid under `schemas/story.schema.json`. It uses a `story`
  wrapper, `passages[].text`, `choices[].nextPassageId`, a separate endings list,
  condition and effect types of its own, and `reviewStatus: illustrative_draft`.
  Converting it is a job for the narrative designer, not a copy.
- **Learning target not in the master spec.** Passage `p010` uses
  `summarization`. The master spec lists comprehension, inference, sequencing,
  vocabulary, attention to detail and reading engagement. Would fail our schema.
- **Length.** 10 passages, 278 words of prose in all. At an assumed 120 words a
  minute that is under 3 minutes of reading. The target is 15 to 25 minutes per
  complete path (R23).
- **Continuity defect (confirmed).** The route `c2 → c6 → c8 → c13 → c15`
  (take the card, take it to the platform, choose the footprint symbol, use the
  card on the cabinet, enter the workshop) reaches `p009`, which says "The one
  you freed offers you a brass insignia". The creature is freed only by `c11`
  on `p006`, which this route never takes. `p008` also says "The clockwork
  creature points toward a sealed arch" on that route, although the creature is
  not met on it.
- **Minor inconsistency.** `p005` has three knocks and then one more from the
  floor. `p007` says "the knocks always came in groups of three".
- **Missing link.** `p010` mentions "a map of its symbols" and no effect gives
  one. Minor.
- **Literacy design.** No word sets, glossary, or typing puzzle. The literacy
  analyzer has nothing to check, so it could not pass a literacy review as
  written.
- **Originality.** No franchise names or copied text were found on reading. A
  person should still confirm originality before any use.
- **Review status.** Illustrative draft. No one has reviewed it.

**Decision:** not imported. It may seed a new job for the full adventure (R23),
then go through the normal workflow: conversion, the continuity fix, the word
sets, the literacy review and the parent approval. It must not go into the device
library or the repository as it is.

## Requirements

- R26 is no longer blocked. The ZIP is accessible and assessed. The sample is not
  imported, and the full adventure remains pending under R23.
- New pending requirements from the pack: R27 skill evidence, R28 typing
  accuracy and speed, R29 draft-to-published version diff, R30 clue and item
  obtainability check in the validator.

# Product specification

Status: updated 2026-10-20 to follow the master specification in
`docs/MASTER_SPEC.md`, which is the source of truth. Where this file and the
master specification disagree, the master specification wins and this file
should be corrected. Anything not built yet is marked **pending**; nothing
here claims completion that the requirement trace does not show.

## 1. Product

Story Quest is a text-based choose-your-own-adventure (CYOA) reading game for a
dyslexic child aged 10 to 13. It improves reading comprehension and fluency
through an adventure that feels like a game first. Reading instruction is woven
into the story, clues, decisions and consequences; it is not a lesson with a
game skin.

Genres: fantasy, mystery, horror, suspense, cyberpunk, sci-fi and exploration.
Interests to draw on: LEGO, anime, Pokémon, Roblox, simulators, TTRPGs, card
games, D&D and puzzles. A complete story path should take about 15 to 25
minutes (**pending**: no full-length story exists yet; see R23).

Stories are written or drafted offline, reviewed, then imported and edited in
the app. The app never calls an AI service while a child plays.

## 2. Users

| User | Needs |
| --- | --- |
| Child reader (10 to 13, dyslexic) | An adventure first; calm, readable pages; choices that matter; no timers, no feeling tested |
| Parent or carer | Separate grown-up area behind a PIN; control over which stories appear; a way to edit and approve |
| Dyslexic Reading specialist (AI pre-review, human reviewer for approval) | Instructional quality, age fit, comprehension design |
| Story author (person or AI agent) | A clear brief and fast validator feedback |

## 3. Learning design

Comprehension comes first. The six objectives in the master specification are
comprehension, inference, sequencing, vocabulary, attention to detail and
reading engagement. Each passage or choice may be tagged with the objectives it
practises; `learningDesign` in the literacy report counts tags and lists any
objective with no tagged moment. These checks are advisory and do not fail
validation on their own.

Typing mini-games are optional, never timed and never blocking. Validation
explores the state where the reader solves each puzzle as well as the one where
they do not, so no story path can depend on a puzzle. The balance rule is a
working guess (at least one puzzle, at most one per four non-ending passages)
to be tuned with the Dyslexic Reading specialist.

Spelling-pattern word sets from the structured-literacy program (for example
Orton-Gillingham-style sequences) are still required and still checked by the
literacy analyzer, which only checks spelling, not sound.

## 4. Core requirements

Ids match `workflow/requirements.json` and `docs/REQUIREMENTS_TRACEABILITY.md`,
which holds the current status of each one.

| Id | Requirement |
| --- | --- |
| R1 | Immersive CYOA RPG with choices, clues, inventory and multiple endings |
| R2 | Dyslexia-informed reading presentation and optional reading support |
| R3 | Program-flexible structured-literacy terminology |
| R4 | Recurring word sets woven naturally through stories |
| R5 | Verifiable literacy reports and story-path validation |
| R6 | Parent-controlled story editing, versioning and approval |
| R7 | Series-level learning progression |
| R8 | Android phones, tablets and Chromebooks (installable web app) |
| R9 | Local-first persistence in IndexedDB; no mandatory runtime AI |
| R10 | Reusable AI story-generation requests and specialist review gates |
| R11 | Accessible UI, low-bandwidth considerations, automated testing, controlled deployment |
| R12 | Nine operational specialist agents with contracts and invocation |
| R13 | Orchestrated workflow passing structured artifacts between stages |
| R14 | Separate software and story production workflows |
| R15 | Review and publishing gates: no self-approval, human approval, no auto-publish |
| R16 | Automated tests for the story workflow and an end-to-end demonstration |
| R17 | Typing mini-games that are balanced, optional and never block the story |
| R18 | Progression that rewards reading without timers |
| R19 | Parent and child profiles on one device, parent controls apart from play |
| R20 | Each save tied to the story version it started with |
| R21 | No timers on reading activities |
| R22 | In-app story editor with import and export |
| R23 | A complete 15 to 25 minute adventure, validated (**pending**) |
| R24 | Research of classic CYOA books for pacing and suspense (**pending**) |
| R25 | Installable PWA tested on Android and a Chromebook (**pending**) |
| R26 | The Whispering Vault starter pack (**blocked**: not accessible to this repository) |

## 5. Technical decisions

- **Stack:** React, TypeScript and Vite, as an installable PWA with a service
  worker that caches the app shell and fonts. Stories load network-first and
  fall back to the cached copy. See `docs/ARCHITECTURE.md`.
- **Storage:** IndexedDB for saves, settings, profiles, the device story
  library and progression, with a memory fallback that the app reports to the
  user. No accounts, no cloud sync, no server.
- **Save versioning:** a save stores the content hash of the exact story it
  started with. Editing a story creates a new version; the child keeps playing
  the old one until they choose to start the new version.
- **Profiles:** one parent profile (PIN, stored as a salted hash) and one or more
  child profiles on one device. The PIN is a convenience lock, not security.
- **Story workflow:** AI agents may draft and pre-review stories offline. Human
  literacy review and parent approval are required before publication.
- **Publication policy:** QA and literacy reviews are required; the literacy
  review must be by a person; parent approval is always required. See
  `config/publication-policy.json`.
- **Specialist roles (nine):** orchestrator, product architect, UX designer,
  literacy specialist (the Dyslexic Reading specialist in the master
  specification), narrative designer (the CYOA author), app engineer (the app
  developer), QA engineer, accessibility and compatibility reviewer, release
  manager. See `docs/AGENTS_AND_WORKFLOW.md`.

## 6. Child experience

1. Library shows the stories the grown-up has approved on this device, with
   Start or Continue. A story with a newer version says so, and the child can
   choose to start that version.
2. Reading page: one passage at a time, a title, short paragraphs, then large
   choice buttons. There are no timers.
3. Locked choices stay visible with a gentle hint.
4. Backpack (items), clue notebook and "Story so far" (the order of places
   visited) are always available.
5. Endings are framed kindly: a setback invites another try. The game counts
   endings found.
6. Tapping a marked word shows its syllables and a short meaning (word help).
7. Optional typing puzzles with a hint and unlimited tries.
8. Reading settings: text size, line spacing, letter spacing, font (including an
   optional OpenDyslexic font), page colour, one-paragraph focus, read-to-me
   (browser speech), and word help. Settings are kept per reader.
9. Adventure log with simple badges (for example First Ending, Codebreaker).
   Progression across stories is **pending** (R18).
10. Progress saves automatically on the device after every choice.

## 7. Parent experience

1. "Grown-up area" behind a PIN, separate from play.
2. Add readers, change the PIN, and lock the grown-up area again.
3. Import a story file, write a new story, or copy a packaged story to edit.
4. Edit in the in-app editor: details, pages, choices, endings, items, clues,
   word help, typing puzzles, learning objectives, and a JSON tab for anything
   else. Live checks run on every change.
5. Save drafts. Changing an approved story saves a new draft with a higher
   version; the approved version stays in the reader's library until the new one
   is approved.
6. Preview a draft in memory. Previews never touch a child's save or progress.
7. Export a story file.
8. Approve for the reader's library. Approval needs a saved draft, passing
   automated checks, and an acknowledgement when no human literacy review is
   recorded. See the decision note below.

### Decision for the owner: in-app approval

The master specification asks for parent approval in the app. The repository's
story workflow keeps a human literacy review and a CLI publication step. These
do not yet meet, so the in-app approval:

- puts a story in this device's child library only; it does not publish to the
  repository or to other devices;
- requires passing automated checks;
- records whether a human literacy review exists, and asks the parent to
  acknowledge when none does.

Davis can change this, for example by requiring a recorded human literacy review
before any in-app approval.

## 8. Out of scope for the first version

Accounts, cloud synchronisation, analytics, in-app purchases, audio recording,
a publishing server, a native Android package, and AI generation inside the app
(the master specification says no live AI calls during play).

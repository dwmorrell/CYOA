# Product specification

Status: initial bootstrap, 2026-10-20.

> **Source note.** The owner refers to a "previously agreed master
> specification". That document was not available when this repository was
> bootstrapped. This specification is rebuilt from the requirements listed in
> the owner's bootstrap request. Items marked **(needs master spec)** are
> decisions made here that the master specification may override. Please add
> the master specification to `docs/` and reconcile.

## 1. Product

Story Quest is an immersive choose-your-own-adventure (CYOA) role-playing
reading game for children with dyslexia. Children read short passages, make
choices, collect items and clues, and reach one of several endings. The stories
quietly practise the spelling patterns and recurring words the child is
working on, using whatever structured-literacy or Orton-Gillingham-style
program their family or tutor uses.

Parents control which stories appear. Stories can be written by people or
drafted by AI agents offline, but every story passes automated validation,
independent review and parent approval before a child sees it.

## 2. Users

| User | Needs |
| --- | --- |
| Child reader (about 6 to 12, dyslexic or struggling reader) | Calm, readable pages; choices that matter; never feeling stuck or tested |
| Parent or carer | Control over content; confidence the story fits the child's program; easy approval |
| Tutor or literacy reviewer | Clear reports of what patterns and words a story practises; a way to record a review |
| Story author (person or AI agent) | A clear brief, fast feedback from validators |

## 3. Core requirements

Ids match `workflow/requirements.json` and `docs/REQUIREMENTS_TRACEABILITY.md`.

| Id | Requirement |
| --- | --- |
| R1 | Immersive CYOA RPG with choices, clues, inventory and multiple endings |
| R2 | Dyslexia-informed reading presentation and optional reading support |
| R3 | Program-flexible OG / structured-literacy terminology |
| R4 | Recurring word sets woven naturally through stories |
| R5 | Verifiable literacy reports and story-path validation |
| R6 | Parent-controlled story editing, versioning and publishing |
| R7 | Series-level learning progression |
| R8 | Android phones and tablets (including Android 15) and Chromebooks |
| R9 | Local-first persistence, no mandatory runtime AI service |
| R10 | Reusable AI story-generation requests and specialist review gates |
| R11 | Accessible UI, low-bandwidth considerations, automated testing, controlled deployment |
| R12 | Eight operational specialist agents with contracts and invocation |
| R13 | Orchestrated workflow passing structured artifacts between stages |
| R14 | Separate software and story production workflows |
| R15 | Review and publishing gates: no self-approval, human parent approval, no auto-publish |
| R16 | Automated tests for the full story workflow and an end-to-end demonstration |

## 4. Decisions made at bootstrap

- **Platform: installable web app (PWA-style)** built with TypeScript and Vite,
  running in Chrome on Android and ChromeOS. This covers phones, tablets and
  Chromebooks from one code base without app-store review. A native wrapper
  (for example a Trusted Web Activity) can come later. **(needs master spec)**
- **No accounts and no server.** All state is stored in the browser. Stories
  are static JSON files shipped with the app.
- **No runtime AI.** AI agents may draft and pre-review stories offline in a
  development environment. The app never calls an AI service.
- **Eight specialist roles** (see `docs/AGENTS_AND_WORKFLOW.md`): product
  architect, UX designer, literacy specialist, narrative designer, app
  engineer, QA engineer, accessibility and compatibility reviewer, release
  manager. The role list is reconstructed. **(needs master spec)**
- **Publication policy:** QA and literacy reviews are required; the literacy
  review must be by a human; parent approval is always required. See
  `config/publication-policy.json`.
- **Default terminology profile:** general structured literacy, with an
  Orton-Gillingham-style profile and a kid-friendly profile. **(needs master
  spec for the family's actual program)**

## 5. Child experience

1. Library shows only published stories.
2. Reading page: one passage at a time, a title, short paragraphs, then large choice buttons.
3. Locked choices stay visible with a gentle hint ("Something long could reach it").
4. Backpack (items) and clue notebook are always available.
5. Endings are framed kindly: a setback ending invites another try. The game counts endings found.
6. Progress saves automatically on the device.
7. Reading settings: text size, line spacing, letter spacing, letter style, page colour, one-paragraph focus, read-to-me (browser speech, offline-capable where the device supports it), and tap-to-see syllables for glossary words.

## 6. Parent experience

1. "For grown-ups" area behind a simple arithmetic gate (not a password).
2. Preview any draft: play it with a "not yet approved" banner, see the story map, run all automated checks, see word-set counts and review status.
3. Edit a story file in the browser, re-run checks, save versions on the device, and download the file for submission.
4. Approve and publish with the story tool on a computer (`npm run story -- decide` and `publish`). These commands refuse to run inside AI agent sessions.

## 7. Out of scope for the first slice

Accounts, cloud sync, analytics, in-app purchase, audio recordings, an
in-browser publishing server, a native Android package, and automatic AI
generation inside the app.

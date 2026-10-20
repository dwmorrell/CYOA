<!--
Source of truth. Copied verbatim from Davis's message in the project chat on
2026-10-20. Do not edit the specification text below; record decisions and
gaps in docs/PRODUCT_SPEC.md and docs/REQUIREMENTS_TRACEABILITY.md instead.
The starter ZIP mentioned in section 9 was not provided to this repository.
-->

Master Specification Summary: Reading Adventure RPG
1. Project goal
Build a text-based RPG / choose-your-own-adventure (CYOA) game for a dyslexic 10-13 year old child that improves reading comprehension and fluency through engaging reading, without making the experience feel like schoolwork.
The game should feel like an actual adventure first, with reading instruction embedded naturally into the story, clues, decisions, and consequences.
2. Target experience

* Genres: Fantasy, mystery, horror, suspense, cyberpunk, sci-fi, and exploration.
* Story length: Approximately 15–25 minutes per complete story path.
* Interests to draw from: LEGO, anime, Pokémon, Roblox, simulators, TTRPGs, card games, D&D, puzzles, etc...
* Devices: Android phones, tablets and Chromebook.
* Initial deployment: A local prototype, designed to work as an installable web app.
* Profiles: Parent and child, on a single device.
* Story editing: Available inside the app.

3. Learning design
Dyslexic people struggle with reading fluency and/or comprehension. The game should prioritize story and word comprehension while making reading feel immersive and interesting.
Core learning objectives:

* Comprehension: Understand what happened and why.
* Inference: Draw conclusions from clues and character behavior.
* Sequencing: Remember the order of events.
* Vocabulary: Learn unfamiliar words through context and optional help.
* Attention to detail: Notice information that affects later choices.
* Reading engagement: Encourage continued reading without pressure or time constraints.

Learning activities should be woven into exploration, dialogue, puzzles, and choices rather than presented as obvious quizzes. There should be no timers on reading activities.
4. Accessibility and personalization
The reading interface should support:

* Adjustable text size and spacing.
* An optional dyslexia-friendly font.
* Optional text-to-speech.
* Optional word help and definitions.
* A comprehension-first difficulty approach.
* Balanced typing mini-games, so typing is neither overused nor entirely absent.

These features should support the child without implying a diagnosis or making the game feel remedial.
5. Game and story system
Stories should use a structured branching format rather than unstructured prose alone. Each story should support:

* Passages connected through meaningful choices.
* Multiple routes and endings.
* Clues, inventory or other state, and consequences.
* Conditional passages and choices.
* Learning targets associated with relevant moments.
* Persistent progress and resumable play.

Each save should remain associated with the story version it started with, so editing a story does not unexpectedly break an existing playthrough.
6. Technical approach
The recommended initial architecture is a local-first Progressive Web App (PWA) using React, TypeScript, and Vite.

* IndexedDB for local saves and settings.
* No cloud synchronization in the initial version.
* No requirement for live AI calls during gameplay.
* Stories generated or reviewed separately, then imported and edited within the app.
* Support for exporting and importing story content.
* Parent controls separated from the child's gameplay experience.

This keeps the first version simpler, cheaper, and more reliable while leaving room for future expansion.
7. AI Agent (Specialist) roles
The project defines separate responsibilities for 5 or more specialist agents that will complete the work on behalf of the creator like a specialized software development team:

1. Orchestrator: Coordinates the workflow, manages handoffs, and resolves conflicting requirements.
2. Dyslexic Reading specialist: Reviews instructional quality, age suitability, and comprehension design, expert on integrating OG principles into the authors scripts
3. CYOA author: Creates engaging stories, branching paths, puzzles, and meaningful choices.
4. App developer: Implements the application and story engine.
5. QA engineer: Validates story branches, saves, accessibility, device behavior, and acceptance criteria.

These are currently role definitions and workflow instructions, not independently running agents or an already automated handoff system. So Claude code will need to create these roles based off my requirements and contract definitions. 
8. Development priorities for the agent team
The planned implementation order is:

1. Build the application shell and reading interface.
2. Implement the branching story engine.
3. Add local persistence and resumable play.
4. Implement accessibility settings.
5. Add the in-app story editor and import/export.
6. Add progression and mini-games.
7. Create and validate a complete 15–25-minute adventure.
8. Package and test the PWA on Android and Chromebook.

9. Current deliverable and remaining work
The existing starter ZIP contains the master specifications, specialist role instructions, QA checklist, implementation plan, and a small sample story called The Whispering Vault.
Download the starter project ZIP
Important: This is a planning and content starter pack, not a functioning game. The next major milestone is a runnable application skeleton with a working story engine. The other significant outstanding item is researching classic Choose Your Own Adventure books to inform pacing, branch structure, suspense, and replayability.
The guiding principle is simple: build a genuinely enjoyable adventure game whose structure quietly strengthens reading comprehension, rather than a reading lesson disguised with game graphics.

# Changelog

## Unreleased: race tracks, typing and approval

- Approval: the parent approves or denies a story in the app, after confirming
  that the AI literacy review and the AI QA review passed for that revision. The
  publication policy no longer requires a human literacy review. The app cannot
  check the AI review records itself.
- Typing is separate from the stories. The typing puzzle is removed from the
  reader, the story editor, the literacy checks and the story schema. The Fog
  story drops its puzzle in revision 9. Old saves that hold a puzzle count still load.
- Typing practice is an optional add-on, offered in the library only when a
  keyboard is likely connected. It types words from grown-up word lists, with a
  car on a track, a speed gauge and a lap time. There is no countdown.
- New stories: a target of five endings, with enough branches to re-read; longer stories allowed; items and clues
  as easter eggs rather than the main mechanic, and mature themes within limits
  (no sex, violence or gore, suicide, or specific religions). The literacy review
  writes one whole-story note on the skills the story practises.
- Each race track has its own high score list, kept on this device. The car
  drives round the track from a start and finish line, and a lap ends back on it.
  Changing track starts a new lap.
- Grown-up area: edit typing word lists. The starter list is the default.
- The Codebreaker badge and "Puzzles solved" count are removed from the log.

## Unreleased: master specification gaps

- React, TypeScript and Vite installable PWA with a service worker; IndexedDB
  for saves, settings, profiles and the device library (memory fallback).
- Saves bound to the story version they started with; older saves resume their
  own snapshot.
- Parent and child profiles on one device; the grown-up area sits behind a PIN.
- In-app story editor with live checks, versioned drafts, parent approval for
  this device only, export and import.
- Optional typing puzzles (never timed or blocking), learning objectives,
  word-help definitions, Adventure log badges.
- Orchestrator agent added (nine agents in total).
- Still pending: a complete 15 to 25 minute adventure, CYOA research, real-device
  PWA testing. The Whispering Vault starter pack is not accessible to this
  repository.

## 0.1.0 (unreleased)

Initial bootstrap: reading app vertical slice, story engine, local saves,
typography controls, parent studio, story schema and graph validation,
literacy analyzer, story production CLI with review and publication gates,
eight specialist agent definitions, orchestrator, CI and deployment
preparation. Not deployed.

# Revision notes (r5 findings, new version 5)

Follow-up to revision 4. The orchestrator found that the six connector
passages added in r4 (`locker-listen`, `oru-log-crew`, `not-yet-why`,
`dex-lamp-watch`, `dex-tools-sort`, `storm-engine-together`) were themselves
non-ending passages with only one choice each, which is the same defect the
r4 revision was meant to remove. This revision fixes that by giving each of
those six passages a genuine second choice. No new passages, items, clues
or endings were added in this round; every new choice targets an existing,
already-compliant passage.

## Fixes in this revision

- **locker-listen**: added "Hurry down to the engine room instead" ->
  `engine`. The passage already has Jun hearing the dust close in through
  the vents; this choice lets the reader skip the pod hall and head
  straight down, a genuinely different route (and shorter path) than
  "Walk out into the pod hall" -> `hall`.
- **oru-log-crew**: added "Hurry straight to the engine room" -> `engine`.
  Oru's line in this passage ("Check the engine room. Then static.") now has
  a real payoff: the reader can act on it immediately instead of walking to
  the hall first.
- **not-yet-why**: added "Skip the talk and lift the latch now" ->
  `captain-wakes`. The original choice ("Open the pod in the right order,
  step by step") and this one both resolve the pod puzzle and reach
  `captain-wakes`, but represent two different reader temperaments
  (methodical vs. decisive) after hearing Oru's explanation. A loop back to
  `not-yet` was considered and rejected, since rule 10 forbids sending the
  reader back over a page already read.
- **dex-lamp-watch**: added "Go straight to Dex's wall chart" ->
  `dex-chart`. This skips the `dex-fixed` recap (the leak is already shown
  fixed in this passage's own text) and heads directly to the chart scene,
  a real shortcut rather than a relabeled duplicate.
- **dex-tools-sort**: added "Head over to Dex's wall chart" -> `dex-chart`,
  for the same reason as `dex-lamp-watch`.
- **storm-engine-together**: added "Ask Dex to check the sensors once more
  first" -> `threshold`. Both choices still lead to the climax at
  `threshold` (skipping it was not safe: it is the story's one mandatory
  locked-choice decision point), but represent two different ways the pair
  heads into the storm.

## Why no new passages were added this time

Adding a brand-new short passage behind each new choice would have just
recreated the same problem one level deeper (a fresh non-ending passage
with a single way forward). Instead, every new choice either (a) skips
ahead to a different, already-compliant existing passage (a real change of
route, not an instant identical reconvergence), or, where skipping ahead
would have broken continuity (`not-yet-why`, `storm-engine-together`),
(b) reconnects to the same next passage as the original choice, matching
the "take the item or don't" pattern already used and passed by QA
elsewhere in this story (`captain-wakes`, `dex-fixed`, `dex-chart`,
`storm-bridge`).

## Verification

A script over the final draft confirms: **0 non-ending passages with fewer
than two choices** (28 passages total, 5 endings, all still reachable).

`npm run story -- submit-draft` reported on the first try:
schema: ok; graph: ok, 5/5 endings reachable; literacy checks: ok; brief: ok.

New revision: **5** (story version 5).
Draft sha256: `529b38788b8ff0d76727aef208c560c0ad7a06c17d905e8f0c098319da155a38`

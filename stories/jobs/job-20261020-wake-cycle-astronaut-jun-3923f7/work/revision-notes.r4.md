# Revision notes (r4 findings, new version 4)

Content revision only: added a second genuine choice to every non-ending
passage that offered just one way forward. No existing passage text, items,
clues or endings were removed. All six new branches reconnect into the
existing passage graph (hall, captain-wakes, dex-fixed or threshold), so no
new endings were needed and every ending is still reachable (5/5, confirmed
by `story submit-draft`).

I checked every non-ending passage in the draft for the single-choice
problem. The only ones with exactly one choice were the six named in the
task. No others were found.

## Passages fixed

- **locker**: added "Listen at the door before you go" -> new passage
  `locker-listen`. Jun hears the dust's whistle in the vents and learns it is
  closer than before (inference), then continues to `hall` as before.
- **oru-log**: added "Ask Oru about the crew's last call" -> new passage
  `oru-log-crew`. Oru reveals the crew's last message named the engine room
  before the static cut in, foreshadowing Dex needing help, then continues to
  `hall` as before.
- **not-yet**: added "Ask Oru why the order matters" -> new passage
  `not-yet-why`. Oru explains what the latch, switch and hatch each do
  (vocabulary/comprehension) before Jun retries, then continues to
  `captain-wakes` as before. (The original choice's label changed from "Wait
  for the Captain to wake" to "Try again, in the right order", and the
  paragraph that silently redid the sequence was moved into the new choices'
  resolutions so both options now lead to a real decision, not a foregone
  conclusion.)
- **dex-lamp**: added "Keep the lamp steady and watch for sparks" -> new
  passage `dex-lamp-watch`. Jun spots a spark, Dex says to back up, and the
  danger passes (detail/engagement), then continues to `dex-fixed` as before.
- **dex-tools**: added "Sort the spare tools while Dex checks the valve" ->
  new passage `dex-tools-sort`. Jun organizes the tools while Dex rechecks
  the valve (sequencing/engagement), then continues to `dex-fixed` as before.
- **storm-engine**: added "Ask Dex to come up and help at the wheel" -> new
  passage `storm-engine-together`. Dex joins Jun and they climb to the
  bridge together (theme: working with others), then continues to
  `threshold` as before.

## New passages added

`locker-listen`, `oru-log-crew`, `not-yet-why`, `dex-lamp-watch`,
`dex-tools-sort`, `storm-engine-together`. Each is a short (1 to 4
paragraph) scene with its own `learningTargets`, no sentence over the
brief's 16-word limit, and no new items, clues or endings. No glossary
additions were needed: the only word introduced that is over two syllables
("together") already appears twice in the existing, literacy-reviewed draft
without a glossary entry, so this keeps that precedent.

## Not changed (out of scope for this revision)

- The "take or skip the spare item" pairs (`captain-wakes`, `dex-fixed`,
  `dex-chart`, `storm-bridge`) already have two choices each and were called
  out by QA (r3, minor) as "thin choice design" but passed review. They were
  not in the task's list of passages to fix, so they were left untouched to
  avoid reopening already-passed findings outside this task's scope.
- No other passage besides the six listed had the single-choice problem.

## Validation

`npm run story -- submit-draft` reported on the first try:
schema: ok; graph: ok, 5/5 endings reachable; literacy checks: ok; brief: ok.

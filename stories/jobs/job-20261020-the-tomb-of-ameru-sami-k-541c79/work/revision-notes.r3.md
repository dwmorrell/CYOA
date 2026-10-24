# Revision notes — r3 (The Tomb of Ameru)

## Why this revision

Revision 2 added a second choice to the ten originally-flagged passages
(`map-nook`, `door-tap`, `door-push`, `sand-slip`, `water-dusted`,
`water-skip`, `song-hum`, `song-horn`, `fire-small`, `fire-big`) by routing
each new choice through a brand-new short detour passage. The orchestrator
correctly pointed out that those ten new detour passages
(`map-copy`, `tap-adjust`, `push-careful`, `slip-bird`, `dusted-ledge`,
`skip-hollis`, `hum-keeper`, `horn-crack`, `small-flame`, `big-scorch`) were
themselves non-ending passages with only one choice — the same defect moved
one hop deeper in the graph, not solved.

This revision gives each of those ten detour passages a genuine second
choice too, without creating any further single-choice passages, by routing
every new second choice to an already-compliant target: the existing
`ending-setback` ("Another Day") ending. `version` was raised from 2 to 3.

## Design: why this terminates cleanly

Every one of the ten detour passages now offers:
1. its original choice, continuing deeper into the tomb (unchanged target), and
2. a new choice where the team decides they have done enough for the day,
   leading straight to the existing `ending-setback` passage.

Because `ending-setback` is an ending (zero choices, by schema definition),
this does not create another single-choice passage further down the chain —
the graph does not need a third layer. Each "stop for today" choice is
preceded by one new line of dialogue in the detour passage itself (a
character suggesting it is time to go), so the two choices are genuinely
different in consequence (press on vs. end the day), not an instant,
identical reconvergence.

## Passages edited (the ten r2 detour passages)

- **map-copy**: added dialogue ("Hollis yawned...") and choice
  `copy-leave` → `ending-setback`.
- **tap-adjust**: added dialogue ("Ren rubbed tired eyes...") and choice
  `adjust-leave` → `ending-setback`.
- **push-careful**: added dialogue ("Hollis brushed dust...") and choice
  `careful-leave` → `ending-setback`.
- **slip-bird**: added dialogue ("Hollis rubbed his dusty knee...") and
  choice `bird-leave` → `ending-setback`.
- **dusted-ledge**: added dialogue ("Sami looked at the new clue...") and
  choice `ledge-leave` → `ending-setback`.
- **skip-hollis**: added dialogue ("Ren sighed...") and choice
  `hollis-leave` → `ending-setback`.
- **hum-keeper**: added dialogue ("Hollis yawned...") and choice
  `keeper-leave` → `ending-setback`.
- **horn-crack**: added dialogue ("Maybe we push our luck too far...") and
  choice `crack-leave` → `ending-setback`.
- **small-flame**: added dialogue ("Ren looked at the last door...") and
  choice `flame-leave` → `ending-setback`.
- **big-scorch**: added dialogue ("Sami looked tired...") and choice
  `scorch-leave` → `ending-setback`.

No new passages or endings were added in this revision; all new choices
reconnect into the existing `ending-setback` ending.

## Why `ending-setback`'s text was reworded

`ending-setback` is now reachable from points much earlier in the story than
before (previously only from `fork`, after three chambers). Its old text
("Two chambers are left," and "walked back up the stair") assumed a specific,
deep stopping point. I generalized it so it reads true no matter which of
the eleven "stop for today" choices (the original `fork-leave` plus the ten
new ones) the reader took:

- Old: "The team walked back up the stair and out into the sun." /
  "...past the dry bank of the old river..." / "Two chambers are left..."
- New: "The team packed up carefully and started back toward camp." /
  "Soon they reached the cart, parked past a dry bank of sand." /
  "\"We got far today,\" said Sami. \"We have good notes, and that matters.\""

This keeps the same word-set words ("cart", "bank", "far") and sentence
lengths at or under the brief's 16-word limit, while removing claims tied to
one specific depth in the tomb.

## Verification

A script check confirms zero non-ending passages have fewer than two
choices:

```
version: 3  passages: 35  single-choice non-ending passages: 0  []
```

I also ran the project's own `validateDraft` (schema + graph + literacy +
brief) against the draft before submitting, and the shortest route to the
`another-day` ending (now via `camp → map-nook → map-copy → ending-setback`,
much shorter than before) still carries all three word sets in sufficient
counts (r-controlled 8, ed-endings 2, ng/nk 3 on that specific route; all
word-set minimums story-wide are still well above the brief's thresholds:
r-controlled 40/10, ed-endings 27/8, ng/nk 23/8).

## Validation result (revision 3)

```
job-20261020-the-tomb-of-ameru-sami-k-541c79: revision 3 -> in-review
  schema: ok
  graph: ok, 5/5 endings reachable
  literacy checks: ok
  brief: ok
```

## Handoff

Revision 3 is ready for independent review by `qa-engineer` and
`literacy-specialist`. The r1 and r2 reviews are now stale (superseded by
r3). I have not reviewed, decided on or published this draft myself.

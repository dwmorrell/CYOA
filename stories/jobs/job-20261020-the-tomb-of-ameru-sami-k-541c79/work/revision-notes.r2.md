# Revision notes — r2 (The Tomb of Ameru)

## What this revision addresses

The r1 draft validated cleanly and had passing QA and literacy reviews, but
several non-ending passages offered only one real choice. This revision adds
a genuine second choice to each of those passages, so every non-ending,
non-junction passage now has at least two choices that lead to different
content before the story moves on. `version` was raised from 1 to 2.

## Passages fixed (the ten named in the task)

For each passage, the original single choice is kept, and a new second
choice was added that leads into a short new passage with its own content,
before rejoining the story's existing route forward (no backtracking, no new
endings needed):

- **map-nook** → new choice "Help Ren copy the picture first" leads to new
  passage **map-copy** (Ren copies the tapping picture into the notebook,
  a quiet, patient beat for Sami) → rejoins at `door-front`.
- **door-tap** → new choice "Wait for your eyes to adjust to the dark" leads
  to new passage **tap-adjust** (the team lets their eyes adjust before
  stepping in) → rejoins at `hall-sand`.
- **door-push** → new choice "Check the Keeper's carving for cracks" leads to
  new passage **push-careful** (Sami checks the carving survived the forced
  door; it did) → rejoins at `hall-sand`.
- **sand-slip** → new choice "Look at the tile that tipped, before moving on"
  leads to new passage **slip-bird** (Ren finds a tiny carved bird under the
  tile, pointing to the safe path — the hall was trying to help) → rejoins at
  `hall-water`.
- **water-dusted** → new choice "Rest a moment on the ledge first" leads to
  new passage **dusted-ledge** (the team rests; Hollis hums a tune close to
  the carved note) → rejoins at `hall-song`.
- **water-skip** → new choice "Ask Hollis what he thinks they missed" leads
  to new passage **skip-hollis** (Hollis and Sami reflect on pressing on
  without reading the dusty wall) → rejoins at `hall-song`.
- **song-hum** → new choice "Look back at the Keeper before walking on" leads
  to new passage **hum-keeper** (Ren notices the Keeper's carved mouth seems
  to smile, reinforcing the "welcome, not warning" theme) → rejoins at
  `fork`.
- **song-horn** → new choice "Look at the horn you just blew" leads to new
  passage **horn-crack** (Hollis finds a thin crack from blowing too hard —
  a real, if small, consequence of the loud route) → rejoins at `fork`.
- **fire-small** → new choice "Look at the carving once more by the warm
  light" leads to new passage **small-flame** (Ren sees the Keeper's carved
  flames more clearly by lamplight) → rejoins at `hall-sleeper`.
- **fire-big** → new choice "Check the scorch mark before leaving" leads to
  new passage **big-scorch** (Sami and Ren look at the lasting scorch mark
  left by the big torch) → rejoins at `hall-sleeper`.

## Additional single-choice passages found

I re-checked every non-ending passage in the draft. No passages beyond the
ten listed in the task had only one choice; `camp`, `cart`, `door-front`,
`hall-sand`, `hall-water`, `hall-song`, `fork`, `hall-fire`, `hall-sleeper`
and `sleeper-read` already had two or more choices and were left unchanged.

## New passages added (10)

`map-copy`, `tap-adjust`, `push-careful`, `slip-bird`, `dusted-ledge`,
`skip-hollis`, `hum-keeper`, `horn-crack`, `small-flame`, `big-scorch`.

Each is a short (3–4 paragraph) detour that adds its own consequence or
detail — not a trivial filler choice and not an instant, identical
reconvergence — before rejoining the existing passage graph at the same
point the original choice already reached. No new items, clues or endings
were needed; all five existing endings remain reachable (confirmed by
`graph: ok, 5/5 endings reachable`).

## Literacy / brief conformance

- All new sentences are at or under the brief's 16-word `maxSentenceWords`
  limit (checked by hand; longest new sentence is 12 words).
- New prose reuses word-set words naturally where it fit without forcing them
  (e.g. "dark", "far" in `tap-adjust`; "rested", "long" in `dusted-ledge`;
  "walked" in `map-copy` and `slip-bird`). No word-set minimum or route
  coverage regressed — the original choice in each fixed passage was kept
  first in the choices array, so the shortest route to every ending is
  unchanged from r1.
- `literacy.review.status` remains `"pending"`.

## Validation result (revision 2)

```
job-20261020-the-tomb-of-ameru-sami-k-541c79: revision 2 -> in-review
  schema: ok
  graph: ok, 5/5 endings reachable
  literacy checks: ok
  brief: ok
```

## Handoff

Revision 2 is ready for independent review by `qa-engineer` and
`literacy-specialist`. I have not reviewed, decided on or published this
draft myself.

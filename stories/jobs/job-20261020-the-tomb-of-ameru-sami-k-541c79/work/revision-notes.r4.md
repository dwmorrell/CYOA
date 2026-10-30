# Revision notes — r4 (The Tomb of Ameru)

## Why this revision

Independent QA review `review-7-qa` (recorded against revision 3) flagged
five findings, all carried over unaddressed across earlier revisions. This
revision fixes all five without restructuring the graph beyond what finding
4 required. `version` was raised from 3 to 4.

## Findings addressed

### 1. water-dusted / dusted-ledge double-rest

`water-dusted`'s last line claimed the team had already rested on the ledge
("climbed the ladder, one rung at a time, and rested on the ledge"), so the
detour choice into `dusted-ledge` re-narrated the same rest.

Fix: `water-dusted`'s last line now stops short of resting — "They climbed
the ladder, one rung at a time, toward the ledge above." `dusted-ledge`'s
opening line ("They rested on the ledge and drank a little water.") is now
the first time the rest happens, whichever choice the reader took.

### 2. fire-big/big-scorch, sand-slip/slip-bird, song-horn/horn-crack

In each pair, the first passage's closing line claimed the party had already
left or moved past the room, while the detour choice sent the reader into a
passage that narrates still being there.

- `sand-slip`: "The sand settled. Everyone walked on the pale tiles after
  that." → "The sand settled, and everyone stood on the pale tiles to catch
  a breath." They are still in the Hall of Sand, so `slip-bird`'s "Ren bent
  down and looked at the tile that had tipped" is no longer a contradiction.
- `song-horn`: "Everyone slipped through, a bit shaky but safe." → "Everyone
  was shaky but safe, still catching their breath by the horn." They have
  not yet gone through the door, so `horn-crack`'s examination of the horn
  still happens in the same room.
- `fire-big`: "Everyone was quiet. Then they walked on with one small lamp."
  → "Everyone was quiet, still standing near the scorch mark on the wall."
  They have not yet stepped into the last chamber, so `big-scorch`'s close
  look at the mark is consistent.

In all three cases the non-detour choice (`slip-on`, `horn-on`, `big-on`)
still leads straight to its own target passage, which opens fresh without
needing a "walked on" line from the passage before it — the same pattern
already used by every other non-detour transition in the story (e.g.
`push-careful` → `hall-sand`, `tap-adjust` → `hall-sand`).

### 3. song-horn verb mismatch

`hall-song` establishes the horn as "a bronze horn set in the wall" (a
wall-fixed carving), but `song-horn` had Hollis "lifted the horn." Fixed by
changing the action to one consistent with a fixed horn: "Hollis pressed his
lips to the horn and blew." `hall-song` was left unchanged — this was the
smaller, safer edit of the two options the review offered.

### 4. map-copy / copy-leave narration mismatch

`copy-leave` reaches an ending directly from the very start of the story
(right after looking at Ren's map, before the team ever leaves camp or
approaches the sealed door), but it used to route to `ending-setback`, whose
text narrates a full day of exploration and travel ("packed up... started
back toward camp," "reached the cart") that never happened on this route.

Fix (option a, the preferred/smaller change): added a new ending passage,
`ending-setback-early` ("Enough For Today"), with its own short text that
reads true for stopping this early — the team is still at camp, the
notebook and copied picture are put away, and tomorrow is left open as a
fresh start. `copy-leave`'s target was changed from `ending-setback` to
`ending-setback-early`. No other passage or choice was touched; `ending-setback`
keeps its original text unchanged for the ten deeper stopping points
(`fork-leave`, `careful-leave`, `bird-leave`, `ledge-leave`, `hollis-leave`,
`keeper-leave`, `crack-leave`, `flame-leave`, `scorch-leave`, `adjust-leave`),
which still describes a real day of travel for those routes.

This is the one finding that required a new passage. It adds a sixth ending
(the brief's `endingTarget` of 5 is a minimum, and the acceptance criteria
only require "at least" that many, all reachable). `ending.id`
`another-day-early` is distinct from `another-day`, so the graph validator's
duplicate-ending check still passes, and the new ending shows up correctly
as reachable (`6/6 endings reachable`).

### 5. ending-seal reachable without ever picking up tap-card

`ending-seal`'s text said "Sami closed the door with three slow taps,"
narrating the specific three-tap sequence learned from `tap-card`
(`map-nook`/`door-tap`), but a route exists that reaches `ending-seal`
without ever visiting `map-nook` or `door-tap`
(`camp → cart → door-front → door-push → hall-sand → sand-slip → hall-water →
water-skip → hall-song → song-horn → fork → hall-fire → fire-big →
hall-sleeper → sleeper-read → read-seal → ending-seal`).

Fix (the preferred, smaller reword): removed the specific "three" and the
implication of a learned sequence. New line: "Sami eased the door shut and
tapped it closed, slow and careful." This reads naturally whether or not the
reader ever learned the tap-card pattern, and keeps the `tapped` word-set
word.

## Verification

`npm run story -- submit-draft` reported:

```
job-20261020-the-tomb-of-ameru-sami-k-541c79: revision 4 -> in-review
  schema: ok
  graph: ok, 6/6 endings reachable
  literacy checks: ok
  brief: ok
```

`reports/validation.r4.json` confirms:
- `brief.ok: true`, `brief.warnings: []` — no sentence over the brief's
  16-word limit.
- `literacy.automatedChecks` all `ok: true`, including `word-set-minimums`
  (r-controlled 44/10, ed-endings 24/8, ng-and-nk-words 24/8) and
  `word-sets-on-every-route` (each set appears on the shortest route to
  every ending, including the new `another-day-early` ending).

`reports/weave-comparison.r4.json` confirms all three word sets still clear
`minOccurrences` story-wide (44/10, 24/8, 24/8), with healthy margin despite
the handful of lines reworded for findings 1-2 removing a few incidental
occurrences of `rested`, `walked` and `lifted` (the new `ending-seal` and
`ending-setback-early` text added back occurrences of `tapped`, `far`,
`cart` and `long`).

## Scope

No passage was removed. Only one passage was added (`ending-setback-early`,
required by finding 4's preferred fix). No other graph edges were changed
beyond the two re-targeted choices (`copy-leave`, and none needed for
findings 1-3/5, which were pure text edits). `public/stories/previews/` was
not touched.

## Handoff

Revision 4 is ready for independent review by `qa-engineer` and
`literacy-specialist`. Reviews `review-6-literacy` and `review-7-qa` (both
on r3) are now stale, superseded by r4. I have not reviewed, decided on or
published this draft myself.

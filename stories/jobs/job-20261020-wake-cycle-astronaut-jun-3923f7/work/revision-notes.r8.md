# Revision notes (r8, addressing review-11-qa.r6.json findings, new version 8)

This revision fixes the five `minor` continuity findings that qa-engineer
carried over, unaddressed, across review-3-qa, review-7-qa, review-9-qa and
review-11-qa. (An earlier attempt at this revision failed schema validation
as revision 7 — `storm-bridge` briefly had 7 paragraphs, one over the
schema's 6-paragraph limit — and was fixed by merging two sentences into one
paragraph before resubmitting as v8/revision 8.)

## Finding 1: `storm-engine` vs. `storm-engine-together` — backup wheel location

**QA's point:** `storm-engine` puts the backup wheel "on the wall" in the
engine room, but `storm-engine-together` has Jun and Dex "climbed the steps
together... At the top, the dust storm filled the window in a wall of
white" with no mention of the wheel, implying it lives somewhere else.

**Fix:** added a clause so the wheel is explicitly the same object, carried
from the same wall mount, in both branches.

- Old: `"Dex grabbed a spare lamp and a coil of wire. \"Lead the way.\""` /
  `"They climbed the steps together as the ship rattled around them."`
- New: `"Jun lifted the backup wheel from its mount on the wall. Dex grabbed
  a spare lamp and a coil of wire."` / `"They climbed the steps together,
  the wheel between them, as the ship rattled around them."`

Now both the `take-backup-wheel` route (takes the wheel, goes straight to
`threshold`) and the `bring-dex-along` route (takes the same wheel, carries
it up with Dex) agree: one backup wheel, mounted on the engine-room wall,
carried to the bridge to steer with.

## Finding 2: `bridge` — pod-order choice is a re-reading exercise, not inference

**QA's point:** Oru states the order ("First the latch. Then the switch.
Last the hatch") immediately before the three-way choice, so the choice
tests memory of the last line, not inference. QA flagged this as `not
blocking` since the `not-yet`/`not-yet-why` wrong-guess loop is a reasonable
mitigation, and said I could leave it unchanged if a rewrite seemed risky.

**Decision:** I rewrote it, because a small wording change (no
restructuring) was enough to turn it into a genuine inference moment.

- Old: `"\"Pod steps go in order,\" said Oru. \"First the latch. Then the
  switch. Last the hatch.\""` / `"The latch sat at the foot of the pod. The
  switch glowed by the glass. The hatch was the lid."` / `"Jun stood still
  and thought. Which step comes first?"`
- New: `"\"Pod steps must go in order,\" said Oru. \"Skip one, and the pod
  will just wait.\""` / `"The latch sat at the foot of the pod, low and
  still. The switch glowed by the glass, waiting for power. The hatch was
  the lid, shut tight on top."` / `"Jun stood still and thought. Which step
  should come first?"`

Oru no longer gives the answer away. The reader must now reason from the
physical description (the latch is low, at the foot — simplest, logical
starting point; the switch is "waiting for power," implying it comes after
something unlocks it; the hatch is the lid, which you'd only open last to
reach in). This still lines up with `not-yet-why`'s explanation ("The latch
unlocks... The switch wakes the heartbeat... The hatch lets in air."),
which remains the fallback hint after a wrong guess. The three choices,
their targets, and the `not-yet`/`not-yet-why` loop are all unchanged —
only the setup paragraph changed, so no restructuring occurred.

## Finding 3: `captain-wakes` vs. `storm-bridge`/`storm-engine`/`ending-1` — comms contradiction

**QA's point:** the Captain says comms "cannot get through" and the panel
"stays dark," but later scenes have working voice comms (Dex on the inside
speaker, Captain Holm's voice reaching the engine room, cheering over the
speaker at the end).

**Fix:** changed the Captain's assessment from flatly dead to intermittent.

- Old: `"The Captain tapped the comm panel. It stayed dark. She looked at
  the thin white haze outside and nodded."` / `"\"Calls to far decks cannot
  get through. That is why no one answered.\""`
- New: `"The Captain tapped the comm panel. It flickered, crackled, then
  went quiet. She looked at the thin white haze outside and nodded."` /
  `"\"Calls to far decks keep breaking up. That is why no one answered
  clearly.\""`

This now matches `storm-bridge`'s "Dex's voice crackled from the ship's
inside speaker," and reads consistently with `storm-engine`'s existing line
"Oru had woken her pod once the power was steady" (comms get clearer as
power stabilizes) and `ending-1`'s clean cheering once everything is fixed.

## Finding 4: `oru-log`/`dex-chart` vs. `storm-bridge` — screen reliability contradiction

**QA's point:** `oru-log` warns that bent sensors mean "maps may not match
what is real," yet `storm-bridge`'s study-ghosts branch shows the correct
lane directly on the bent screen, while `dex-chart` praises the paper chart
specifically because it does *not* match the (same) bent screen.

**Fix:** distinguished the two screens so the claims no longer contradict:
the bridge's main screen gets one lucky, brief glimpse of the truth; the
engine room's screen stays wrong.

- `storm-bridge`, added to the existing paragraph: `"On the big screen,
  ghost shapes flickered. Between two dust waves ran a thin, clear lane. It
  was only a short peek. The bent screen might not show it again."`
- `dex-chart`, old: `"It did not match the bent screens. The chart looked
  right."` New: `"The engine room's screen still showed one wall of white.
  The chart did not match that screen. The chart looked right."`

Both statements are now true of the same strange, bent sensors: a brief,
lucky peek at the bridge (the mitigation already explained `dust-map` as a
confirming clue on that branch), paired with a consistently wrong reading
in the engine room, where the paper chart earns its trust.

## Finding 5: `dex-lamp-watch`/`dex-tools-sort` vs. `dex-chart` — chart introduced twice

**QA's point:** both routes already show Jun a "paper chart" on the wall,
named as such, before `dex-fixed`; then `dex-chart` narrates the same chart
as a first-time discovery, contradicting the earlier routes.

**Fix (per QA's own suggested alternative — adjusting the earlier glances
rather than touching the shared `dex-chart` passage, which four different
routes converge on):** made the earlier sightings vague, so they no longer
name the object as a "paper chart."

- `dex-lamp-watch`, old: `"Across the room, a paper chart hung on the
  wall."` New: `"Across the room, something pale hung on the far wall."`
  Choice label `go-to-chart`, old: `"Glance at the wall chart while Dex
  wraps up"`. New: `"Glance at the far wall while Dex wraps up"`.
- `dex-tools-sort`, old: `"Across the room, Dex's paper chart hung on the
  wall."` New: `"Across the room, something pale hung on the far wall."`
  Choice label `go-to-chart-tools`, old: `"Glance at the wall chart while
  Dex checks the valve"`. New: `"Glance at the far wall while Dex checks
  the valve"`.

`dex-chart`'s own text is unchanged, so it is now the first and only place
that reveals what the pale shape on the wall actually is: "Dex tapped a
paper chart pinned to the wall." This holds for all four routes that
converge through `dex-fixed` into `dex-chart` — the two that glanced at the
far wall early and the two that went straight to `dex-fixed` — with no
contradiction for any of them. The `dust-map` clue effects, targets and
graph structure on both choices are unchanged.

## Validation

`npm run story -- submit-draft` reports schema ok, graph ok (5/5 endings
reachable), literacy checks ok, brief ok, as revision 8 (story version 8).
Word-set totals after the edits: wh-words 42/10, ck-words 46/8, tch-words
33/8 (all words still present at least once; no sentence exceeds 16 words).

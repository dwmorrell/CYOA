# Revision notes (r6, addressing qa-review.r5.json findings, new version 6)

This revision responds to `review-9-qa` (qa-review.r5.json, verdict
`changes-requested`, three `major` findings on revision 5). All three are
fixed. The three carried-over `minor` findings (storm-engine-together wheel
location, bridge pod-order telegraphing, captain-wakes comms-dark
inconsistency, oru-log "bent sensors" vs. storm-bridge study-ghosts) were not
touched, as instructed, because none of the fixes below naturally touched
that text.

## Finding 1 (major): `not-yet-why` — fake fork, both choices identical

**QA's point:** both choices targeted `captain-wakes` with no `effects`, so
the two labels ("Open the pod in the right order, step by step" / "Skip the
talk and lift the latch now") produced a byte-for-byte identical outcome —
not a genuine branch.

**Fix:** added one sentence of new content — a small panel by the pod
blinks with thin white dust lines, echoing Oru's dust-storm screen from
`oru-log` — then split the two choices on that detail:

- `after-not-yet-why`, relabeled **"Check the panel, then open the pod step
  by step"** → `captain-wakes`, now carries `"effects": { "addClues":
  ["dust-map"] }` and `learningTargets: ["detail", "sequencing"]`.
- `skip-explanation`, relabeled **"Skip the panel and lift the latch now"**
  → `captain-wakes`, unchanged otherwise (open alternative, no effect).

This mirrors the exact pattern QA already approved elsewhere in this story
(`captain-wakes` take-rack-pack/skip-rack-pack, `dex-fixed`
take-bench-pack/skip-bench-pack, `storm-bridge` study-ghosts/wheel-now-b,
`dex-chart` copy-lane/skip-lane): same target, one choice is an informed,
explicit clue gain, the other an informed, explicit decline. The "latch"
word is preserved in the second choice's new label so `tch-words` coverage
is unaffected.

## Finding 2 (major): `storm-engine-together` — same fake-fork defect

**QA's point:** "Face the storm together" and "Ask Dex to check the sensors
once more first" both target `threshold` with no effects, and `threshold`
never acknowledges a sensor re-check happened.

**Fix:** added one sentence — Dex's handheld sensor blinks with a glimpse of
the clear dust lane — then gave the sensor-check choice a real payoff:

- `double-check-sensors` now carries `"effects": { "addClues": ["dust-map"]
  }`. Checking the sensors literally produces the dust-map clue, which is
  exactly what the label promises and what the new sentence sets up.
- `to-threshold-together` ("Face the storm together") is unchanged: the
  open, faster alternative.

Same idiom as finding 1: same target (`threshold`), one choice is an
informed clue gain, the other an informed decline. I did not make
`threshold` display different text for the two arrivals, because the schema
has no conditional-text mechanism — passage paragraphs are the same
regardless of which choice was taken to reach them, exactly like the four
QA-approved precedents above, none of which vary the destination passage's
text either.

## Finding 3 (major): `dex-lamp-watch` / `dex-tools-sort` — silent bypass of `dex-fixed`

**QA's point:** `go-to-chart` (in `dex-lamp-watch`) and `go-to-chart-tools`
(in `dex-tools-sort`) both skipped straight to `dex-chart`, bypassing
`dex-fixed` — the only remaining place on an engine-first route to pick up
`tool-pack`. QA traced a concrete, reachable route (wake → ask-log →
ask-oru-more → hurry-to-engine-crew → engine → pass-tools → sort-tools →
go-to-chart-tools → dex-chart → storm-engine → … → threshold → thin-lane →
climax-lane) where `use-clicker` was locked out with no warning, making
ending-1 unreachable on that path.

**Fix:** retargeted both choices from `dex-chart` to `dex-fixed`, so
`dex-fixed` — and its explicit, informed tool-pack offer — is now visited on
every engine-room route, with no silent skip possible. To keep each choice a
genuine branch rather than a duplicate of its sibling ("Ask Dex what is
next" → `dex-fixed`, unchanged), both relabeled choices now also award the
`dust-map` clue, representing Jun glancing at Dex's wall chart (visible in
the same room) while Dex wraps up, instead of just asking what's next:

- `dex-lamp-watch`: added the sentence "Across the room, a paper chart hung
  on the wall." Choice `go-to-chart` relabeled **"Glance at the wall chart
  while Dex wraps up"** → `dex-fixed`, `"effects": { "addClues":
  ["dust-map"] }`.
- `dex-tools-sort`: added the sentence "Across the room, Dex's paper chart
  hung on the wall." Choice `go-to-chart-tools` relabeled **"Glance at the
  wall chart while Dex checks the valve"** → `dex-fixed`,
  `"effects": { "addClues": ["dust-map"] }`.

`dex-chart` (the full chart scene) stays fully reachable afterward, through
`dex-fixed`'s own two choices (`take-bench-pack` / `skip-bench-pack`), both
of which still lead to `dex-chart` unchanged. No route can now reach
`storm-engine` without having passed through `dex-fixed`'s pack offer.

## Why no new passages were added

Every fix above reuses an existing passage as the shared target and
differentiates the pair with an `effects` block, following the same idiom
QA already validated at `captain-wakes`, `dex-fixed`, `storm-bridge` and
`dex-chart`. I considered adding brand-new intermediate passages instead,
but rejected it: any new passage would itself need two genuinely different
choices to satisfy the graph validator, which is exactly the trap that
produced the r5 defects one level deeper. Reusing the item/clue-gate idiom
needed only one new sentence per passage and no new passages, items or
endings.

## Word-weave and literacy impact

No target-word sentences were removed. The small additions keep or add
target words naturally (e.g. "latch" in the new `skip-explanation` label).
A full-text scan of the submitted draft shows: `wh-words` 37 occurrences
(min 10), `ck-words` 42 (min 8), `tch-words` 33 (min 8) — all well above the
brief's minimums, consistent with before this revision. No sentence exceeds
the brief's 16-word limit (checked by script over every paragraph).

## Verification

`npm run story -- submit-draft job-20261020-wake-cycle-astronaut-jun-3923f7
--file stories/jobs/job-20261020-wake-cycle-astronaut-jun-3923f7/work/draft.json
--author narrative-designer --author-kind ai-agent --agent narrative-designer`
reported on the first try:

```
job-20261020-wake-cycle-astronaut-jun-3923f7: revision 6 -> in-review
  schema: ok
  graph: ok, 5/5 endings reachable
  literacy checks: ok
  brief: ok
```

`npm run story -- status job-20261020-wake-cycle-astronaut-jun-3923f7`
confirms the automated-validation gate passes for revision 6 (story v6):
schema ok; graph ok, 5/5 endings reachable; literacy checks ok; brief ok.

New revision: **6** (story version 6).
Draft sha256: `b64c4e09a41c26640d13c9a0e97af0582e61a0ba5e4e483e6eb0f6ebe1a17970`

Handing off to `qa-engineer` and `literacy-specialist` for independent
re-review of revision 6.

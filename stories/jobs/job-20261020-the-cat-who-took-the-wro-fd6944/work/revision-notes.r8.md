# Revision 8 notes — the-cat-who-took-the-wrong-turn

Base: revision 7 (`drafts/story.r7.json`, sha256
`3a05d6f751b2e994f53f09ceb1dca50fd6140bc5b054bf849cbf5547882ab0d2`).
This revision addresses the carried-over, non-blocking minor finding from
`reviews/review-9-qa.r7.json` (repeated across review-6-qa/r6 and
review-8-literacy/r7):

> "watch-the-frog-hop / look-back-at-the-marsh / last-step-up /
> steady-your-nerves / one-more-breath / settle-in-the-mud: both choices in
> each of these round-2 connector passages rejoin the same next passage with
> no visible acknowledgement of which choice was taken, so they read as
> decorative forks..."

The coordinator's instruction for this revision was explicit: fix this
**without** restructuring the graph (each of the six must keep its existing
single shared target), by having the destination passage briefly acknowledge
which choice was taken, following the model of `careful-hop` and
`last-look-at-the-gate`.

## Architecture finding, checked before writing anything

I traced every predecessor of the four shared destinations before editing,
because the fix has to not say anything false for a reader who arrives by a
different route:

- `the-stairs` has **9** incoming choices from 7 different passages, not just
  the two flagged connectors (`watch-the-frog-hop`'s `call-thanks` /
  `smile-and-go`, `look-back-at-the-marsh`'s `nod-to-frog` /
  `turn-to-stairs`). It is also reached directly from `meet-lira`
  (`take-stairs`, which skips the marsh entirely), from `frog-helped` and
  `thank-the-frog`, and from `stone-hop` and `careful-hop`.
- `tower-hall` has 5 incoming choices from 4 passages (`last-step-up`'s two,
  plus `the-stairs`, `the-prints`, `show-lira-the-prints`).
- `lantern-room` has 8 incoming choices from 6 passages — it is the shared
  target of **two** flagged connectors (`steady-your-nerves` and
  `one-more-breath`) plus `net-lid`, `check-on-ash`, `ladder-climb`,
  `help-lira-up`.
- `varro` has 6 incoming choices from 5 passages (`settle-in-the-mud`'s two,
  plus the three fall variants and `check-the-book`).

That matters because `careful-hop` and `last-look-at-the-gate` (the cited
models) achieve their "acknowledgement" by sending their two choices to
*different* destinations — `the-stairs` vs. `look-back-at-the-marsh` for
`careful-hop`; `the-slow-slip` vs. `the-quick-slip` for
`last-look-at-the-gate` (r7's fix for the same complaint). That approach is
exactly the "restructure the graph" option this task rules out for the six
passages at hand, and it isn't available here: every one of the four shared
destinations also serves predecessors that never faced the binary choice in
question, so any sentence that reads as true only for one of the two flagged
choices would misdescribe several other readers' routes. Concretely: adding
any backward-glance text to `the-stairs` would contradict `stone-hop`, which
explicitly says "Eli did not look back" when leaving the marsh — the exact
kind of continuity problem this job's QA reviews have flagged before.

## Fix implemented

Two complementary changes, both confirmed safe against every predecessor
listed above:

**1. Each flagged choice now carries its own small, specific payoff in its
label** — visible to the reader at the moment they choose it, so it cannot
contradict anyone who took a different path to the same destination:

- `watch-the-frog-hop`: "Call out one more thank you" → "Call out one more
  thank you, feeling glad"; "Just smile, and walk on to Lira" → "Just smile
  to yourself, and walk on to Lira."
- `look-back-at-the-marsh`: "Give the frog a small nod" → "Give the frog one
  more small, friendly nod"; "Turn and walk on to the stairs" → "Turn away,
  and walk on to the stairs."
- `last-step-up`: "Climb on steadily, one step at a time" → "Keep climbing
  steadily, one step at a time"; "Take the last steps two at a time" → "Keep
  climbing fast, two steps at a time" (both now use the ing-set word
  "climbing," a natural fit since the action already is climbing).
- `steady-your-nerves`: "Step in slowly, one foot first" → "Step in slowly,
  one careful foot first"; "Step in boldly, all at once" → "Step in boldly,
  all at once, feeling brave."
- `one-more-breath`: "Step in side by side with Lira" → "Step in side by
  side with Lira, hand in hand"; "Go in first, and wave Lira forward" → "Go
  in first, brave, and wave Lira forward."
- `settle-in-the-mud`: "Sit a moment longer in the mud" → "Sit a moment
  longer in the cool mud"; "Stand right up and brush off" → "Stand right up
  fast, and brush off the mud" (adds the closed-syllable word "mud," a
  natural fit since the scene is literally about standing up out of the
  mud).

**2. Each shared destination's opening now carries one new, honest sentence
that explicitly names the fact that a choice was just made**, without
asserting which one — so it stays true for every predecessor, including the
ones who never saw that particular fork:

- `the-stairs`: + "Whatever Eli had just decided, he turned to climb the
  stairs."
- `tower-hall`: + "However he had climbed those last steps, Eli reached the
  top at last." (also picks up the blend-word "steps" as a side effect.)
- `lantern-room`: + "Whichever way he'd stepped in, Eli was here now."
- `varro`: + "However he'd done it, Eli was back on his feet."

This is a deliberate, narrower interpretation of "acknowledge which of the
two choices the reader took" than a literal per-choice callback, because a
literal callback is not available for a destination with other, unrelated
predecessors without either introducing a continuity error (as the
`stone-hop` example shows) or restructuring the graph (ruled out for this
task). The "whatever/however/whichever he'd done" phrasing is the most
specific acknowledgement I could write that remains true for every single
predecessor of each hub, not just the two flagged choices — combined with
the choice-label payoffs above, each of the six forks now reads as a real
beat (a feeling, a word, a gesture) rather than two identical buttons to the
same inert text, even though the shared destination still can't name the
exact option taken. If literal per-choice destination text is wanted, that
would need either new intermediate passages (graph restructuring, out of
scope here) or an engine feature for conditional paragraph text based on the
incoming choice, which does not exist today (checked `src/engine/types.ts`
and `src/engine/story-engine.ts`: passages render a static `paragraphs`
array; flags only gate choice `requires`, they do not select text). That
would be a job for `app-engineer`, not a content change, and I'm flagging it
here rather than attempting it.

## Validation

```
npm run story -- submit-draft job-20261020-the-cat-who-took-the-wro-fd6944 \
  --file stories/jobs/job-20261020-the-cat-who-took-the-wro-fd6944/work/draft.json \
  --author narrative-designer --author-kind ai-agent --agent narrative-designer

job-20261020-the-cat-who-took-the-wro-fd6944: revision 8 -> in-review
  schema: ok
  graph: ok, 5/5 endings reachable
  literacy checks: ok
  brief: ok
```

`npm run story -- status job-20261020-the-cat-who-took-the-wro-fd6944` shows
revision 8, draft
`stories/jobs/job-20261020-the-cat-who-took-the-wro-fd6944/drafts/story.r8.json`,
sha256 `76d39b92d3180b99ce7ef9e524b83bff6225bd766350d1357d5cc17734baf002`, with
the `automated-validation` publication gate passing and `review:qa` /
`review:literacy` waiting on fresh reviews of this revision.

`reports/validation.r8.json` confirms:
- schema ok; graph ok (40 passages, 73 choices, 5/5 endings reachable,
  `stateSearchComplete: true`).
- All three word sets still meet their brief minimum, and increased slightly
  from the new text: blend-words 95/10 (was 94), closed-syllable-words 64/8
  (was 63), ing-words 29/8 (was 27). `word-sets-on-every-route: ok` on the
  shortest route to every ending (per-ending-route counts: blend-words
  11–24, closed-syllable-words 18–27, ing-words 8–12).
- The pre-existing 3-sentence brief warning (`late-for-school`,
  `frog-helped`, `home-too-soon`, each 1 word over the 16-word soft limit) is
  unchanged — none of the six passages touched this revision were among
  them, confirmed by diffing `story.r7.json` against `story.r8.json`: only
  the six connector passages' choice labels and the four destinations'
  opening sentences changed; `version` is the only other diff.

Diffing `story.r7.json` against `story.r8.json` directly (not just reading
the notes) confirms nothing else moved: no choice `target`, no item/clue
effect, no ending, and no passage outside the ten listed above changed.

## Explicitly out of scope (left unchanged)

- The three sentences one word over the brief's 16-word soft limit, carried
  over since r4/r6/r7.
- The "bus" (1 occurrence) and ing-word-concentration literacy notes about
  pre-existing content, carried over since r4.
- Conditional-text engine support that would allow a shared destination to
  literally name which of several incoming choices a reader took — flagged
  above as a possible future `app-engineer` item, not attempted here.

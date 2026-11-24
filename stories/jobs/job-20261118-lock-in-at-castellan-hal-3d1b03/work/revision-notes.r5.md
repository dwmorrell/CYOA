# Revision 5 notes — Lock-In at Castellan Hall

Responding to `qa-review.r4.json`, the "ending-5 logic bug" major finding
only. The other major finding in that review (the brief-level `steps`
letter-avoidance contradiction in `brief.json`/`continuity.json`) is being
fixed separately by product-architect; I did not touch `brief.json`,
`continuity.json`, or any word lists.

## The problem

At `threshold`, the `try-alone` choice (target `ending-5`) has no
`requires`/`lockedHint` — by design it is meant to stay open as a safe,
non-punishing alternate ending for a reader who hasn't collected the rusty
key and Wren's note yet. But `ending-5`'s prose asserted the reader's state
rather than just narrating the attempt: it opened with "Without the key and
the note, the lock would not give way" and closed with "They never did find
Wren Castellan's secret way out. Next time, they would look for the note
and the key first." QA traced a real route (`opening -> go-stage -> path-a
-> check-shelf -> path-a-shelf -> shove-back -> path-a-find -> keep-key-a ->
gathering -> back-clue -> detour-clue -> with-note-a -> the-gate ->
shine-torch -> threshold -> try-alone -> ending-5`) where the reader is
holding both tracked items when they reach this ending, making those two
sentences false for them.

## The fix (option a from the review: rewrite the prose, keep the ending unlocked)

I kept `try-alone` reachable from any inventory state (no new lock added —
that would make a passage already offering a free "try it yourself" choice
suddenly feel punishing or like a trap, which the brief's gentle-setback
design avoids) and rewrote the two sentences that made an inventory claim so
neither one depends on whether the reader happens to be carrying the key or
the note:

- `"Without the key and the note, the lock would not give way."` ->
  `"Trying it alone, the lock would not give way."` — this now narrates the
  *action* (trying the gate solo, without pairing key and note together,
  which is what the `use-both` choice requires) rather than asserting the
  reader lacks the items.
- `"They never did find Wren Castellan's secret way out. Next time, they
  would look for the note and the key first."` -> `"They never did open
  Wren Castellan's secret way out. Next time, they would try the key and
  the note together."` — same correction: it's now about *using both
  together*, which is literally true regardless of whether the reader
  already has one, both, or neither item, instead of claiming they never
  found them.

The three middle sentences ("Theo gave the gate a few hard tugs...",
"They sat on the steps and waited...", "At last the storm let up...", "The
gate swung wide...") were already state-agnostic and needed no change —
tugging the gate alone failing, and the storm eventually letting the lock go
on its own, are true no matter what the reader is carrying.

No other passage, choice, item, clue, or `requires`/`lockedHint` was
touched. `threshold`'s `try-alone` choice is unchanged (still unlocked, by
design, as the gentle alternate-ending route for a reader without both
items — and now also correct prose for a reader who has both).

## Sentence-length check

Both rewritten sentences are well under the brief's 13-word limit:

- "Trying it alone, the lock would not give way." — 9 words.
- "They never did open Wren Castellan's secret way out." — 9 words.
- "Next time, they would try the key and the note together." — 11 words.

## Validation

Bumped `version` to 5 (required by `submit-draft`) and ran:

```
npm run story -- submit-draft job-20261118-lock-in-at-castellan-hal-3d1b03 \
  --file stories/jobs/job-20261118-lock-in-at-castellan-hal-3d1b03/work/draft.json \
  --author narrative-designer --author-kind ai-agent --agent narrative-designer
```

Result: revision 5, state `in-review`:

```
schema: ok
graph: ok, 5/5 endings reachable
literacy checks: ok
brief: ok
```

`npm run story -- status job-20261118-lock-in-at-castellan-hal-3d1b03`
confirms revision 5 validation `ok` and publication gate
`automated-validation: PASS` (schema: ok; graph: ok, 5/5 endings reachable;
literacy checks: ok; brief: ok). The `steps` word-list finding remains open
pending product-architect's brief-level fix; I left it untouched as
instructed.

## Handoff

This revision is ready for an independent qa-engineer and literacy-specialist
review on revision 5 (reviews on r2 and r4 are stale/superseded). I have not
run, and will not run, `story decide` or `story publish`, and have not
reviewed my own draft.

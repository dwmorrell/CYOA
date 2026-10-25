# Revision 10 notes — the-rain-courier

## Finding addressed (major, from qa-review.r9.json)

QA found that the `dash-duck` choice added in r9 to fix `dash-past`'s
single-choice flag retargeted into `hide-shade`, a passage written for a
different context (entering from `drone-street` while drones are still
actively passing close by). Reused from `dash-past`, where Mara has already
lost the drones ("the hum fell behind her") and the fork leads to "a shaded
doorway" (not the "bus shelter" named only by `drone-street`'s choice label),
`hide-shade`'s text ("The drones passed so close... Their flash slid over
the shelter and moved on.") described an active drone threat and an object
("the shelter") with no antecedent on that route — a continuity break.

## Fix (option a: new passage for the fork)

- `stories/jobs/job-20261020-the-rain-courier-mara-is-1b7daf/work/draft.json`,
  the `dash-past` passage: changed the `dash-duck` choice's `target` from
  `hide-shade` to a new passage, `catch-breath`. The choice id and label
  ("Duck into the shaded doorway to catch her breath") are unchanged — they
  already fit `dash-past`'s own fork text ("Ahead, the street forked. One
  way led straight to the bridge gate. The other had a shaded doorway.").
- Added a new passage, `catch-breath` ("Catching Her Breath"), inserted
  between `dash-past` and `threshold`. It is written specifically for
  arriving from `dash-past`: the drones are already gone ("The hum is
  gone," said Nine), Mara is winded from the dash and leans in the doorway
  she was just described heading toward, and Nine's warning is about the
  bridge gate ahead, not an active chase. No reused sentences from
  `hide-shade`, and no reference to "the shelter" or any object without an
  antecedent on this route.
- `catch-breath` offers a genuine fork, not a filler rejoin: `catch-onward`
  continues to `threshold` (the main path, same destination as
  `dash-onward`), and `catch-give-up` offers the gentle setback — waving
  down a drone and giving up the bag — which routes to `ending-5`, mirroring
  the kind of real choice `hide-shade`'s own `shade-give-up` offers, but
  written for this passage's own moment of exhaustion rather than copied
  from it.
- `hide-shade` itself is untouched. It still only receives entries from
  `drone-street` (`hide-in-shade`) and `alley-clue`'s shortcut route
  (`clue-shortcut` → `drone-street` → `hide-in-shade`), both of which match
  the active-drone-passing text it was written for.

## Word-set / literacy goals

- `catch-breath`'s five short paragraphs use the story's existing
  closed-syllable word "dash" (twice) and the "-ing" suffix target concept
  ("giving"), reinforcing vocabulary already seeded at this point in the
  story without needing new word-set words (all three word sets already
  clear their `minOccurrences` with wide margin — see counts below — and
  every set word still appears at least once, including the single
  pre-existing occurrences of "shot" and "chase" in `drone-street`, which
  this change does not touch).
- No sentence in the new passage exceeds the brief's 16-word
  `maxSentenceWords` limit (longest is 15 words).
- Did not touch the two minor QA findings explicitly marked
  not-required-for-this-revision: `gathering`'s "Ride back to..." choice
  labels, and the 17-word sentence in `ending-4`. Neither is touched by this
  fix.

## Validation

`npm run story -- submit-draft job-20261020-the-rain-courier-mara-is-1b7daf --file stories/jobs/job-20261020-the-rain-courier-mara-is-1b7daf/work/draft.json --author narrative-designer --author-kind ai-agent --agent narrative-designer`
produced revision 10:

```
job-20261020-the-rain-courier-mara-is-1b7daf: revision 10 -> in-review
  schema: ok
  graph: ok, 5/5 endings reachable
  literacy checks: ok
  brief: ok
```

`npm run story -- status job-20261020-the-rain-courier-mara-is-1b7daf` shows
the `automated-validation` publication gate PASS on revision 10
(draft sha256 `cd47470280e067bdee10c78b40a6190558b42d7fa385fb3bad1b251d66b933e8`),
with `review:qa` and `review:literacy` waiting for independent re-review, as
expected. The brief-conformance warning about one sentence over 16 words
(in `ending-4`) is still present, unchanged, and pre-existing, as noted in
the QA review as a non-blocking item left for the literacy reviewer.

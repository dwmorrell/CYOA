# Revision notes — r10

## Why this revision

An orchestrator review of r9 found that three non-ending passages offered
only one real choice each: `shed-chest`, `bench`, and `bench-clue`. A good
branching passage needs at least two choices that lead to genuinely
different next content, not a single forced step. This revision adds one
real second choice to each of those three passages. I checked every other
non-ending passage (`start`, `shed`, `gathering`, `threshold`, `climax`) and
found no other single-choice passages: all of them already had two or more
choices.

## Changes, passage by passage

### `shed-chest`
- Had one choice: "Take the cloth to the tower" → `gathering`.
- Added a second choice: "Take the cloth straight to Gran Tull" → `bench`.
  This lets the reader skip the hub and go straight to Gran Tull with the
  cloth in hand, instead of always routing back through `gathering`. Both
  choices lead to different immediate passage content (the multi-choice hub
  vs. a direct conversation with Gran Tull), and both still lead toward the
  same endings.

### `bench`
- Had one choice: "Ask Gran Tull what the mirror can tell you" →
  `bench-clue`.
- Added a second choice: "Ask Pip about the shell she keeps tapping" →
  a brand-new short passage, `bench-shell`.
- New passage `bench-shell` ("Pip and the Shell"): Fen looks at the shell
  Pip keeps tapping, Pip hops off down the path, and Gran Tull makes a
  small aside about the gull. It gives the reader a genuine detour with its
  own content before they decide what to do next. It offers two choices of
  its own, so it is not a new single-choice passage:
  - "Ask Gran Tull about the mirror now" → `bench-clue` (same place the
    main `bench` choice reaches, if the reader wants the clue after all).
  - "Head down to the foot of the tower" → `gathering` (skips the clue for
    now; the reader can always come back to `bench` later via
    `gather-bench` to get the clue, so no path is a trap).

### `bench-clue`
- Had one choice: "Go to the foot of the tower" → `gathering`.
- Added a second choice: "Go to the shed to grab the cloth you still need"
  → `shed`. This lets a reader who got the clue first go straight to the
  shed for the cloth, instead of only being able to go back through the
  hub. Revisiting the shed and reopening the chest is harmless (items are a
  set, already noted as fine by QA on r9), so this adds no new risk.

## New passages added

- `bench-shell` ("Pip and the Shell"), described above. It does not add a
  new ending; every path through it reconnects to `bench-clue` or
  `gathering`, both of which already lead to all three existing endings.

## No new endings, no dropped mechanics

The story still has exactly the brief's 3 endings (`ending-beam`,
`ending-help`, `ending-dock`), all reachable. The one locked choice with a
hint (`wipe-mirror` at `threshold`) is unchanged. No application code was
touched.

## Word-set and literacy checks

New prose for `bench-shell` keeps sentences at or under the brief's 16-word
maximum (longest new sentence is 13 words: "Pip hopped off down the path.
She had much to do." is actually two shorter sentences; the longest single
sentence added is "Pip tapped the shell again, tap, tap, tap on the bench."
at 11 words). The new text naturally reuses `shell`, `path`, `much`, and
`bench` from the word sets without listing or spelling them out. Word-set
minimums were already well above the brief's floor before this revision and
remain so after it (see `reports/validation.r10.json`):

- sh-words: 25/10 (was 25 on r9; wording changed but all words still used)
- ch-words: 25/8
- th-words: 19/8

No new glossary entries were needed: no word introduced in this revision
has more than two syllables.

## Validation result for r10

```
schema: ok
graph: ok, 3/3 endings reachable
literacy checks: ok
brief: ok
```

12 passages, 20 choices, 32 explored states, state search complete, no
graph warnings, 0 long sentences.

## Handoff

This draft has not been reviewed by anyone yet on revision 10 (expected —
qa-engineer and literacy-specialist need to review it fresh, since I cannot
review my own work). `literacy.review.status` remains `"pending"`. I did
not run `story review`, `story decide`, or `story publish`.

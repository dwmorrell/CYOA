# Revision 9 notes — genuine branch points for engine-trace and nib-ask

This revision addresses the two "major" findings in
`stories/jobs/job-20261020-the-derelict-salvage-cap-f8f7ea/work/qa-review.r8.json`
(also recorded as `reviews/review-5-qa.r8.json`): the two choices added in
revision 8 to clear the `single-choice` graph error on `engine-trace` and
`nib-ask` both pointed at the same target with no state difference, so they
were cosmetic filler rather than a real decision. Both passages now give the
reader a genuine fork, following the same model QA praised for `hull-marks`
and `porthole` in that same revision: a real difference in what the reader
walks away with, not just a different button label.

## `engine-trace` (QA finding 1)

Both choices still lead to `nib` (it is the only, mandatory way to meet the
bot from the engine-room branch, so there is nothing to skip or reroute the
way `hull-marks`/`porthole` could). Instead the two choices now produce a
genuinely different player state:

- Added a closing line to the passage: "Then it gave a soft thud, twice,
  like a secret code." This sets up a detail that only one choice lets the
  reader act on.
- `trace-on`: relabelled "Follow the cable's path to the light" (unchanged
  target, no effects) — the quiet, technical approach.
- `call-out`: relabelled "Call out, and keep listening for an answer" and
  given `effects: { addClues: ["blink-code"] }` — the reader who calls out
  gets a new clue, "The blinking code," that the quiet approach does not.

This is a real, player-visible difference (the clue appears in the reader's
clue list only on that branch), matching the brief's "different
requires/effects" option for a genuine branch point. The new clue is a
flavour/atmosphere collectible per hard rule 8 (clues are easter eggs, not a
required gate) and is not wired into any `requires`, so it cannot break
existing reachability.

## `nib-ask` (QA finding 2)

Same mandatory-convergence situation (`nib-ask`'s only exits are to
`threshold`). QA's specific complaint here was sharper: the `promise-nib`
label implied a consequence ("Promise Nib you will be careful") that nothing
ever delivered. Fixed by making the promise concrete and immediate rather
than a deferred, unfulfilled gesture:

- Added a closing line to the passage: "Nib snapped off a small chalk note
  and held it out, like a gift."
- `nib-ask-on`: unchanged, "Go with Nib to the cargo door," no effects — the
  reader moves on without taking the note.
- `promise-nib`: relabelled "Promise to keep the chalk note safe, then take
  it" and given `effects: { addItems: ["chalk-note"] }` — the promise is now
  something the reader actually keeps: a new item, "Nib's chalk note,"
  appears in their inventory only if they take this choice.

The label now describes exactly what happens (take the note and promise to
keep it safe) instead of implying an off-page consequence, so there is no
longer a gap between what the choice says and what it does.

## Word-set and literacy impact

Both new closing lines and relabelled choices were written to reinforce the
brief's word sets rather than dilute them (same approach QA noted had
strengthened coverage in the `hull-marks`/`porthole` fixes):

- `engine-trace` adds "thud" (th-words) in the new paragraph.
- `engine-trace`'s `call-out` label adds "keep" (vowel-team-words); the
  `trace-on` label adds "path" (th-words).
- `nib-ask` adds "note" (silent-e-words) twice (paragraph + choice label).

Comparing `reports/validation.r8.json` to `reports/validation.r9.json`,
total occurrences rose on all three sets (vowel-team 31 -> 33, silent-e 48
-> 50, th-words 57 -> 59); no word dropped below its brief minimum and no
word set lost a word. Graph stats: still 24 passages, 5/5 endings reachable
(`ending-garden`, `ending-carry`, `ending-tow`, `ending-closed`,
`ending-rush`), schema ok, brief ok.

## What was not touched

- No other passage was changed. `hull-marks`, `porthole`, and every other
  connector QA already approved are untouched.
- No existing choice's `target`, `requires`, or reachability changed; the
  one required locked choice (`open-careful` at `threshold`, requiring
  `hook-pole` + `late-log`, with its `lockedHint`) is unchanged.
- The two new collectibles (`chalk-note` item, `blink-code` clue) are purely
  additive and are not referenced by any `requires`, so they cannot create a
  new soft-lock or unreachable state.

Validated with:
`npm run story -- submit-draft job-20261020-the-derelict-salvage-cap-f8f7ea --file stories/jobs/job-20261020-the-derelict-salvage-cap-f8f7ea/work/draft.r9.json --author narrative-designer --author-kind ai-agent --agent narrative-designer`

Result: revision 9, validation ok (schema: ok; graph: ok, 5/5 endings
reachable; literacy checks: ok; brief: ok).

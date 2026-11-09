# Revision notes — r12

Addresses the four minor findings carried over in `reviews/review-9-qa.r10.json`
(and repeated in review-1-qa and review-7-qa). All four are now fixed; no
graph structure (targets, items, clues, flags) or endings changed.

Note: the first submit attempt was recorded as revision 11 (schema failure —
`climax-gate` briefly had 7 paragraphs after my first edit, one over the
6-paragraph limit). I folded that content into an existing paragraph and
resubmitted; the fix landed as revision 12.

## 1. `gathering` choice labels presumed a visit that not every route makes

Old:
- `gather-shop`: "Ride back to Tam's shop"
- `gather-alley`: "Ride back to the dark alley"

New:
- `gather-shop`: "Ride to Tam's shop"
- `gather-alley`: "Ride to the dark alley"

Dropping "back" makes both labels true whether the reader already visited
that location (e.g. shop → shop-pick → alley → gathering) or is heading
there for the first time (e.g. start → alley → alley-leave → gathering,
which never visits the shop). Targets (`shop`, `alley`) are unchanged.

## 2. `climax-gate`: no explanation for how Vex got past the shut, locked gate

Old paragraphs (relevant excerpt):
> "The lock fell open. She slipped through and eased the gate shut behind her."
> ...
> "Halfway across the bridge, Vex stepped out of the fog. A drone captain stood beside him."

New (added a continuity clause, merged into the existing fourth paragraph so
the passage still has 6 paragraphs, not 7):
> "A loose fence panel stood beside the old gate. Vex always slipped through
> there, unseen. Halfway across the bridge, he stepped out of the fog. A
> drone captain stood beside him."

This explains Vex's entry without contradicting the growling cab engine
heard behind Mara at `threshold` (he was already close by) and fits his
established character as someone who deals in hidden routes and keeps his
face hidden — he knows an unofficial way past the gate he himself picked as
the handover point. No targets, items or endings changed.

## 3. `ending-4`: 17-word sentence over the brief's 16-word limit

Old (17 words):
> "At the far end, a woman in a lit booth pulled her inside and shut the door."

New (16 words):
> "At the far end, a woman pulled her into a lit booth and shut the door."

Same scene and meaning (a woman in a lit booth pulls Mara in and shuts the
door); the sentence immediately after ("It was Aunt Ila.") is unchanged.

## 4. `catch-breath` give-up label duplicated `hide-shade`'s give-up label

Old:
- `hide-shade` / `shade-give-up`: "Wave the drone down and give up the bag" (unchanged)
- `catch-breath` / `catch-give-up`: "Wave down a drone and give up the bag"

New:
- `catch-breath` / `catch-give-up`: "Call a drone and hand over the bag"

Changed only the newer, mutually-exclusive `catch-breath` label (the two
branches are never both seen in one playthrough, but the near-identical
reordered phrasing read as a careless duplicate on replay). "Hand over the
bag" also echoes the drone's own line in `ending-5` ("Hand over the bag"),
giving it a distinct voice from `hide-shade`'s phrasing. Target (`ending-5`)
and `learningTargets` unchanged.

## Validation

`npm run story -- submit-draft job-20261020-the-rain-courier-mara-is-1b7daf --file stories/jobs/job-20261020-the-rain-courier-mara-is-1b7daf/work/draft.json --author narrative-designer --author-kind ai-agent --agent narrative-designer`

Result: revision 12, validation ok — schema: ok; graph: ok, 5/5 endings
reachable; literacy checks: ok; brief: ok.

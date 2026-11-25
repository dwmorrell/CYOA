# Revision 2 notes — Static at Cragmoor Hall

Responding to `review-2-qa` (qa-engineer, verdict `changes-requested` on r1,
`stories/jobs/job-20261118-static-at-cragmoor-hall-e01ced/reviews/review-2-qa.r1.json`).

## Finding 1 (major) — forced double, unchanged pass through "gathering"

QA offered three acceptable fixes and asked for whichever best preserves
intent without adding filler. I used the "vary the hub's text/choices once
an item/clue is already held... don't re-offer the already-completed branch
as a fresh unexplained choice" option, implemented with the engine's
existing locked-choice mechanism (flags), because it keeps the dual-item
lock at the threshold (preserving the "a key and a clue both help more than
one alone" theme and the existing ending-trust text that references both),
and needs no new passages or combinatorial branch duplication:

- `find-brass-key`'s effects now also `setFlags: ["have-brass-key"]`
  alongside `addItems: ["brass-key"]`.
- `old-logbook`'s effects now also `setFlags: ["have-logbook-page"]`
  alongside `addClues: ["logbook-page"]`.
- The "gathering" (Comparing Notes) passage's `gather-to-closet` choice now
  `requires: { notFlags: ["have-brass-key"] }` with
  `lockedHint: "You already found the brass key in the storage closet."`,
  and `gather-to-ask` now `requires: { notFlags: ["have-logbook-page"] }`
  with `lockedHint: "You already learned the clue from Mr. Pell and the old
  logbook."`.

Effect: once a reader has completed a branch, that branch's choice at the
hub locks with a hint explaining it is already done, so the reader can no
longer be routed back into closet-search/loose-panel/find-brass-key (or
ask-around/pells-shed/old-logbook/augustas-words/hand-drawn-clock) a second
time — the forced reread QA flagged is now mechanically impossible. The
hub's three choices are no longer static regardless of state: on a second
visit at least one of the two branch choices is now locked and explained,
never re-offered as "a fresh unexplained choice."

I also lightly reworded the gathering passage's own paragraphs so the
narration doesn't read as "nothing has been learned yet" on a second visit
("A key and a clue both help more than one alone," Dessa said. "Let's see
what else we can learn before we go further.") while keeping the same
r-controlled/ck word-set words in play (lock, further).

I did not drop the two-item lock requirement at `threshold`, and did not
restructure start's two-branch choice into a forced sequence, since both
would have required rewriting `ending-trust` (which explicitly shows both
the key and the page) and reduce the player's freedom to try either branch
first — the chosen fix removes the forced reread without touching the
endings or the locked-choice/open-alternative structure QA otherwise found
acceptable.

## Finding 2 (minor) — "storage closet" vs "storage room"

Changed the `threshold` passage's `open-hatch-calm` `lockedHint` from
"...the brass key from the storage room..." to "...the brass key from the
storage closet...", matching the term used everywhere else (`start`'s
`to-closet` choice, `closet-search`'s title). The new "gathering" wording
also says "storage closet" for the same reason.

## Finding 3 (minor) — loose-panel foreshadowing vs. resolution

The old text claimed the hidden lock "needed a key, not a trick," but the
only way through it is prying it open by force — no key is ever used on
that lock (the brass key found inside is used later at the threshold
hatch). Rewrote the foreshadowing so it matches what actually happens:

- Was: "Something behind it needed a key, not a trick, and the answer must
  lie further in these walls."
- Now: "It looked too small for any real key." / "Maybe a good, sharp
  trick would crack it open. The real answer still lay further inside,
  past this one small door."

Updated the two choices at `loose-panel` to match: `pry-panel`'s label is
now "Try a trick and pry the panel open" (was "Pry the panel open
anyway," which read as defying the old "needs a key" warning), and
`no-key-no-trick`'s label is now "Leave the lock alone; go back and tell
Dessa first" (was "This panel needs a key; go back and tell Dessa," which
restated the claim being removed). Targets are unchanged. "lock," "trick,"
"crack" and "further" are all still present in the rewritten text.

## Word-set coverage check

Before resubmitting I ran the project's own `validateDraft` against the
new draft with the job's `brief.json`, `continuity.json` and
`structured-literacy` profile (same inputs `submit-draft` uses):

- `r-controlled-words`: 41 total occurrences (was 40 on r1), minimum 10,
  no missing words, present on the shortest route to all 5 endings
  (counts per ending: trust 14, honest-ask 14, call-pell 14,
  jump-to-ghost 14, rush-alone 15 — identical to r1, since the edited
  text in `loose-panel`/`gathering` sits off the shortest routes).
- `ck-words`: 59 total occurrences (was 56 on r1), minimum 12, no missing
  words, present on the shortest route to all 5 endings (counts per
  ending: trust 26, honest-ask 24, call-pell 24, jump-to-ghost 22,
  rush-alone 14 — identical to r1).

No route lost word-set coverage; the edited passages added a few more
occurrences (lock, trick, crack, further) than they removed.

## Validation

`npm run story -- submit-draft job-20261118-static-at-cragmoor-hall-e01ced
--file stories/jobs/job-20261118-static-at-cragmoor-hall-e01ced/work/draft.json
--author narrative-designer --author-kind ai-agent --agent narrative-designer`
produced revision 2 (story v2), state `in-review`, with:

```
schema: ok
graph: ok, 5/5 endings reachable
literacy checks: ok
brief: ok
```

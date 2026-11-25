# Revision 4 notes — Static at Cragmoor Hall

Responding to `review-6-qa` (qa-engineer, verdict `changes-requested` on r3,
`stories/jobs/job-20261118-static-at-cragmoor-hall-e01ced/reviews/review-6-qa.r3.json`).

## Finding 1 (major) — r3's gating on item possession reopens the hub loop
after a reader *bails* from a branch instead of finishing it

QA's r3 finding showed that `closet-report-to-gathering` /
`clue-report-to-gathering` only checked the *other* branch's item flag
(`have-logbook-page` / `have-brass-key`). A reader who uses either branch's
own pre-existing "leave early" choice (`back-to-dessa-1` at `closet-search`,
`no-key-no-trick` at `loose-panel`, `skip-to-gathering-b` at `ask-around`,
`thanks-back` at `pells-shed`) exits that branch without ever setting its
item flag, so the "go tell Dessa"/"go hear Mr. Pell" choice at the report
passage stays unlocked, routes back to `gathering`, and from `gathering` the
*same* branch can be re-entered (because `gather-to-closet`/`gather-to-ask`
were also keyed on item possession, which a bail never sets) and finished on
a second pass — re-reading `gathering`, and that branch's own passages,
twice.

This confirms the root cause review-6-qa named directly: the gating must key
on whether a branch has been **attempted** (entered at all), not on whether
its item was **collected**. I implemented exactly the fix review-6-qa
suggested, with no alternative approach:

1. Added two new flags: `attempted-closet` and `attempted-ask`. Each is set
   by `effects.setFlags` on **every** choice that enters that branch from
   outside it — both entry points:
   - `attempted-closet`: `to-closet` at `start`, and `gather-to-closet` at
     `gathering`.
   - `attempted-ask`: `to-ask-around` at `start`, and `gather-to-ask` at
     `gathering`.
2. `gathering`'s own two branch choices now gate on the attempt flag, not
   the item flag:
   - `gather-to-closet`: `requires.notFlags: ["attempted-closet"]` (was
     `have-brass-key`).
   - `gather-to-ask`: `requires.notFlags: ["attempted-ask"]` (was
     `have-logbook-page`).
   Because these flags are set the instant a branch is entered — bail or
   finish — gathering can never route back into a branch that has already
   been attempted even once, permanently, regardless of whether that branch
   was finished.
3. `closet-report`'s two choices now gate on the *other* branch's attempt
   flag, not its item flag:
   - `closet-report-to-gathering`: `requires.notFlags: ["attempted-ask"]`
     (was `notFlags: ["have-logbook-page"]`).
   - `closet-report-to-wall`: `requires.flags: ["attempted-ask"]` (was
     `flags: ["have-logbook-page"]`).
   `clue-report`'s two choices are the mirror image, now keyed on
   `attempted-closet` instead of `have-brass-key`.
4. Left the dual-item lock at `threshold` (`open-hatch-calm`, requiring the
   actual `brass-key` item and `logbook-page` clue) completely unchanged, so
   bailing out of a branch before collecting its item still costs the
   reader that item for the rest of the playthrough — the reader simply
   cannot re-enter that branch to collect it later. That is the intended,
   gentle consequence review-6-qa flagged as consistent with the existing
   design ("a route that bails... simply means that branch's item is
   permanently missed"). It never traps the reader: `climb-vent-alone` at
   `threshold` is always open and leads to the complete `ending-rush-alone`
   setback ending.

### Why this makes the graph acyclic by construction, not just by trace

Once a branch's attempt flag is set, two independent locks now point the
same way: `gathering` can never re-offer that branch, and that branch's own
report passage can never again route to `gathering` (because doing so
requires the *other* branch to still be unattempted, and the reader's own
branch choice at `gathering` already used up the only chance to attempt it).
So the reader's very first move (at `start`) attempts exactly one branch
once; its report passage sees the other branch unattempted and sends them to
`gathering` exactly once; `gathering`'s own gating now excludes the branch
just attempted, leaving only the untried branch (attempted exactly once) or
heading straight to `threshold`; that second branch's report passage now
sees the first branch's attempt flag set and skips straight to `threshold`.
Every hub/report/branch passage is visited at most once on any route to any
ending — not just the two routes traced by hand in r3, which is why I did
not rely on hand-tracing this time (see verification below).

### Bail-choice wording (small text tweak only, no structural change)

Per the task's note that leaving a branch now has a real, permanent
consequence, I reworded the four existing "leave early" choice labels so
they no longer read as a free, reversible detour:

- `back-to-dessa-1` (`closet-search`): "This room feels too creepy; go wake
  Dessa instead" → "Give up on this closet for good and go wake Dessa
  instead."
- `no-key-no-trick` (`loose-panel`): "Leave the lock alone; go back and tell
  Dessa first" → "Leave this lock for good and go tell Dessa now."
- `skip-to-gathering-b` (`ask-around`): "This feels silly; go back to the
  dorm instead" → "Give up on asking around for good and go back to the
  dorm."
- `thanks-back` (`pells-shed`): "Say thanks and hurry back to Dessa" → "Say
  thanks, but stop here for good, and hurry back to Dessa."

No passage paragraph text, `gathering`'s narration, the report passages'
narration, the dual-item lock, or either branch's content changed. The two
previously-fixed minor findings (storage-closet naming, loose-panel
foreshadowing) are untouched.

## Verification method (not hand-tracing)

Wrote a throwaway script (not committed; lived at
`/tmp/claude-0/.../scratchpad/verify-no-repeats.ts`, deleted after use) that
imports the real engine directly from `src/engine/story-engine.ts`
(`newGame`, `choicesFor`, `choose`, `isEnding` — unmodified, read in full
first to confirm flags/items/clues only ever accumulate via `applyEffects`,
never clear, exactly as required before trusting a BFS/DFS over it) and runs
an exhaustive depth-first search over every sequence of *available* choices
from `start`:

- At each passage, `choicesFor` is used to filter out locked choices exactly
  as the real reader UI would, so only legal routes are explored.
- Each recursive call carries the full path of passage ids taken so far,
  plus a set of "state signatures" already seen on that path (current
  passage id + sorted flags + sorted items + sorted clues). If the same
  signature recurs, every future choice/transition from there is
  identical forever, so that branch is a genuine infinite loop and is
  recorded and stopped there rather than being traced forever.
- Whenever a path reaches a passage with an `ending`, the script records
  that ending and scans the whole path for any passage id that appears more
  than once.

**Run against the unmodified r3 draft first (to confirm the script actually
catches the bug QA described, not a false negative):**

```
Total choice-sequences explored (all branch points): 1771
Max path depth seen: 22
Total complete paths that reached an ending: 940
Distinct endings reached: [ending-call-pell, ending-honest-ask,
  ending-jump-to-ghost, ending-rush-alone, ending-trust]
Paths with a repeated passage id: 624
True infinite loops detected (repeated full state signature): 12
```

624 of 940 ending-reaching paths on r3 repeat a passage id — confirming and
substantially widening review-6-qa's finding (it traced one repro route by
hand; the exhaustive search shows the large majority of routes to the four
best endings are affected) — and the search also turned up 12 genuine
infinite loops in r3 that nobody had reported yet (e.g. `start -> closet-
search -> loose-panel -> closet-report -> gathering -> closet-search -> ...`
repeating forever when the reader bails from `loose-panel` without the key:
`have-brass-key` never gets set, so `gather-to-closet` stays unlocked every
time `gathering` is revisited, with no way to break out except giving up on
the playthrough).

**Run against the new r4 draft (`work/draft.json`):**

```
Total choice-sequences explored (all branch points): 687
Max path depth seen: 18
Total complete paths that reached an ending: 340
Distinct endings reached: [ending-call-pell, ending-honest-ask,
  ending-jump-to-ghost, ending-rush-alone, ending-trust]
Paths with a repeated passage id: 0
True infinite loops detected (repeated full state signature): 0
CLEAN: no path to any ending repeats a passage id, and no infinite loops exist.
```

All 340 complete legal playthroughs (every combination of available choices,
including every bail-early option in either order, both branches finished
or abandoned) reach one of the 5 endings with zero passage-id repeats and
zero infinite loops.

## Word-set coverage check (unchanged from r3)

Ran the project's own `analyzeStory` (`src/literacy/analyzer.ts`) against
both the r3 and r4 drafts directly, side by side:

- `r-controlled-words`: 44 total occurrences on both r3 and r4 (minimum 10),
  no missing words, present on the shortest route to all 5 endings with
  identical per-ending counts (trust 12, honest-ask 12, call-pell 12,
  jump-to-ghost 12, rush-alone 13).
- `ck-words`: 61 total occurrences on both r3 and r4 (minimum 12), no
  missing words, present on the shortest route to all 5 endings with
  identical per-ending counts (trust 26, honest-ask 24, call-pell 24,
  jump-to-ghost 22, rush-alone 14).

Identical before/after because the fix only changed `requires`/`effects`
fields (not counted by the analyzer) plus four choice-label wordings that
were checked individually: three of the four reworded labels contained no
word-set words before or after (`back-to-dessa-1`, `skip-to-gathering-b`,
`thanks-back`); `no-key-no-trick` contained "lock" before (a `ck-words`
word) and still does after ("Leave this lock for good..."), so no word-set
word was dropped by the wording tweak.

## Validation

`npm run story -- submit-draft job-20261118-static-at-cragmoor-hall-e01ced
--file stories/jobs/job-20261118-static-at-cragmoor-hall-e01ced/work/draft.json
--author narrative-designer --author-kind ai-agent --agent narrative-designer`
produced revision 4 (story v4). See CLI output for the exact summary line.

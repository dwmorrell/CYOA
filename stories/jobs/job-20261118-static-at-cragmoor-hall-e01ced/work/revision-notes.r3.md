# Revision 3 notes — Static at Cragmoor Hall

Responding to `review-4-qa` (qa-engineer, verdict `changes-requested` on r2,
`stories/jobs/job-20261118-static-at-cragmoor-hall-e01ced/reviews/review-4-qa.r2.json`).

## Finding 1 (major) — r2's fix locked the *choices* at "gathering" but never
touched its *narration*, so the forced duplicate read was still there

QA's r2 finding was specific: `gathering`'s own paragraphs never vary by
flag state, so a reader who collects the brass key via `closet-search` and
the logbook page via `ask-around` (the only route, besides abandoning one
branch entirely, to the four best endings behind `threshold`'s
`open-hatch-calm`) still passes through `gathering` twice and reads the
exact same four paragraphs both times. Locking the re-entry choices
(`gather-to-closet` / `gather-to-ask`) in r2 only stopped a *third* visit
into an already-finished branch; it did nothing about the *second* visit to
`gathering` itself, which was the actual complaint.

I checked for an engine-level per-flag passage-text mechanism first, as
instructed: `grep`ing `src/engine/story-engine.ts`, `src/ui/Reader.tsx` and
`schemas/story.schema.json` shows passages have a single fixed `paragraphs`
array (schema `passage.paragraphs`, required, no conditional/variant form)
and the engine always renders that one array (`Reader.tsx` line ~142,
`passage.paragraphs.map`). There is no existing conditional-text
mechanism, so option (a) would need an engine change, which is out of
scope per `CLAUDE.md` rule 6 ("story production must never need
application code changes") and the task instructions. I did not touch
`src/` or `schemas/`.

I used option (c), restructuring the graph so each branch can feed straight
into the other without a second pass through `gathering`, while keeping
`gathering` as a genuine one-time meeting point (folding in a touch of
option (b) — the branch exits now land on a short new transition passage
first, not on `gathering` directly):

- Added two new passages, each with their own, unique text (never repeated
  on any route): `closet-report` ("Back From the Closet") and
  `clue-report` ("Back With the Clue"). Every choice that used to return
  from inside the `closet-search`/`loose-panel`/`find-brass-key`/
  `crack-in-wall`/`three-knocks` branch straight to `gathering` now targets
  `closet-report` instead (`back-to-dessa-1`, `no-key-no-trick`,
  `key-to-dessa`, `tell-dessa-light`, `to-gathering-a-end`,
  `to-gathering-a-end2`). Symmetrically, every return choice from inside
  `ask-around`/`pells-shed`/`old-logbook`/`augustas-words`/
  `hand-drawn-clock` now targets `clue-report` instead of `gathering`
  (`skip-to-gathering-b`, `thanks-back`, `logbook-to-dessa`,
  `enough-reading-to-gathering`, `to-gathering-b-end`,
  `to-gathering-b-end2`).
- Each of these two new passages offers exactly two choices, gated on the
  *other* branch's flag (the engine's existing `requires`/`lockedHint`
  mechanism, same one r2 already used):
  - `closet-report`: "Go tell Dessa everything you found" (`requires:
    notFlags: [have-logbook-page]`) → `gathering`; or "Skip ahead and head
    straight to the old dorm wall" (`requires: flags: [have-logbook-page]`)
    → `threshold` directly.
  - `clue-report`: the mirror image, gated on `have-brass-key`, with
    `gathering` or `threshold` as the two possible targets.

Net effect: whichever branch the reader finishes *first*, the other
branch's flag is not set yet, so the "go tell Dessa" choice is the only
one available and routes to `gathering` — this is the reader's one and
only visit, exactly as before. From `gathering` they pick the other
branch (`gather-to-closet` / `gather-to-ask`, unchanged from r2, still
locked+hinted against the branch already done). When they finish that
*second* branch, the other flag is now set, so this time the "skip ahead,
straight to the old dorm wall" choice is the one available, and it routes
straight to `threshold` — `gathering` is never reached again. The
dual-item lock at `threshold` (`open-hatch-calm`, requiring both
`brass-key` and `logbook-page`) is completely unchanged, so the "a key and
a clue both help more than one alone" theme and the existing ending text
(which explicitly references both the key and the page) are preserved
exactly as written.

### Manual trace (both branch orders), reading every passage's actual text

**Closet first, then clue:**
`start` → `to-closet` → `closet-search` → `pry-board` → `loose-panel` →
`pry-panel` → `find-brass-key` (sets `have-brass-key`) → `key-to-dessa` →
`closet-report` (new text; `have-logbook-page` unset, so only
"tell Dessa" is open) → `gathering` **(1st and only visit, full text
read once)** → `gather-to-ask` (open, since `have-logbook-page` unset) →
`ask-around` → `find-pell` → `pells-shed` → `see-records` → `old-logbook`
(sets `have-logbook-page`) → `logbook-to-dessa` → `clue-report` (new text;
`have-brass-key` is now set, so only "skip ahead to the wall" is open) →
`threshold` (`gathering` not revisited) → `open-hatch-calm` (both held) →
`into-the-walls` → `theo-marsh` → any of the four best endings.

**Clue first, then closet** (the symmetric order): `start` →
`to-ask-around` → `ask-around` → `find-pell` → `pells-shed` →
`see-records` → `old-logbook` (sets `have-logbook-page`) →
`logbook-to-dessa` → `clue-report` (`have-brass-key` unset, only "tell
Dessa" open) → `gathering` **(1st and only visit)** → `gather-to-closet`
(open) → `closet-search` → `pry-board` → `loose-panel` → `pry-panel` →
`find-brass-key` (sets `have-brass-key`) → `key-to-dessa` →
`closet-report` (`have-logbook-page` now set, only "skip ahead to the
wall" open) → `threshold` (`gathering` not revisited) → `open-hatch-calm`
→ `into-the-walls` → `theo-marsh` → endings.

I read every passage's paragraphs on both traces by hand against
`work/draft.json`: `gathering`'s four paragraphs ("Rowan found Dessa
waiting..." / "A key and a clue..." / "The lock on the old dorm wing
door..." / "Outside, a small storm...") appear exactly once on each
traced route to each of the five endings — never twice. `closet-report`
and `clue-report` each appear at most once per playthrough and have their
own, never-repeated text.

I did not fully close off every theoretical path (e.g. a reader who
*bails* out of a branch without the item, visits `gathering`, then goes
back and successfully finishes the *same* branch a second time could in
principle see `gathering` again — this voluntary retry-after-bail loop
existed identically in r1/r2 and was not part of QA's finding, which was
specifically about the *mandatory* route to the best endings). The
mandatory route — the only way, short of abandoning a branch entirely via
`climb-vent-alone`, to reach the four best endings — now reads `gathering`
exactly once, which is what review-4-qa asked for.

### Why option (c) over (b)/(d)

(c) keeps the two-item lock and both the brass key and the logbook page
mattering exactly as the brief/outline intend ("Paths meet. The hero may
go back for what was missed" and the locked-choice mechanic requiring
"the item or clue"), with no loss of word-set coverage on any route and no
new combinatorial branch duplication beyond two small transition
passages. (d), dropping the two-item requirement, would have let a
reader reach the best endings from only one branch, undercutting the
"both matter" design the brief, outline and `ending-trust`'s text all
rely on. (a) needs an engine change, which is out of scope for this role.

## Word-set coverage check

Ran the project's own `validateDraft` (same brief/continuity/profile
inputs `submit-draft` uses) against the new draft before resubmitting:

- `r-controlled-words`: 44 total occurrences (was 41 on r2), minimum 10,
  no missing words, present on the shortest route to all 5 endings
  (counts per ending: trust 12, honest-ask 12, call-pell 12,
  jump-to-ghost 12, rush-alone 13).
- `ck-words`: 61 total occurrences (was 59 on r2), minimum 12, no missing
  words, present on the shortest route to all 5 endings (counts per
  ending: trust 26, honest-ask 24, call-pell 24, jump-to-ghost 22,
  rush-alone 14).

Both sets gained occurrences (the two new passages use "door"/"closet"-ish
r-controlled and ck wording naturally — "knock in the wall", "common room
door" — on top of the unchanged existing text); no route lost coverage.

## Validation

`npm run story -- submit-draft job-20261118-static-at-cragmoor-hall-e01ced
--file stories/jobs/job-20261118-static-at-cragmoor-hall-e01ced/work/draft.json
--author narrative-designer --author-kind ai-agent --agent narrative-designer`
produced revision 3 (story v3), state `in-review`, with:

```
schema: ok
graph: ok, 5/5 endings reachable
literacy checks: ok
brief: ok
```

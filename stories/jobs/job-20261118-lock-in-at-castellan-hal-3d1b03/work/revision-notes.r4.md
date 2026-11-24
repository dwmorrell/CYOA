# Revision 4 notes — Lock-In at Castellan Hall

Responding to the stale `review-2-literacy` (literacy-specialist, verdict
`changes-requested` on r2) finding: a word-set concept/spelling mismatch.
literacy-specialist has since fixed the root cause in `brief.json` (and the
embedded brief copy in `generation-prompt.md`) by splitting the single
merged `closed-syllable-words` word set into two separate sets. This
revision brings the draft's `literacy.wordSets` in line with that corrected
brief — no prose, passages, items, clues or endings changed.

## What changed

`literacy.wordSets` in `draft.json` previously declared one merged set:

- `closed-syllable-words` (no `concept` field), words `lock, key, chest,
  stage, exit, gate, steps, clock, coin`, `minOccurrences: 12`.

That single set mixed four words that genuinely fit the `closed-syllable`
spelling pattern with five words that do not, which is exactly the
mismatch literacy-specialist flagged. The brief now declares two sets, and
the draft is updated to mirror it exactly (same ids, concept fields, words,
and `minOccurrences`, copied verbatim from `brief.json`):

- `closed-syllable-words`, concept `closed-syllable`, words `lock, chest,
  steps, clock`, `minOccurrences: 30`.
- `castle-key-words`, no `concept` field (these words — `key, stage, exit,
  gate, coin` — don't match any taxonomy spelling pattern; the brief is
  honest about that rather than forcing a false concept claim), words `key,
  stage, exit, gate, coin`, `minOccurrences: 40`.

Top-level `literacy.targetConcepts` (`digraph-sh`, `closed-syllable`) was
already correct and unchanged.

I did not change which words belong to which group, and did not touch any
passage text, item/clue descriptions, or endings — the actual word usage in
the story is untouched. I only corrected how the existing usage is declared
in the literacy metadata.

## Verifying the new minOccurrences are met without inflating anything

Before resubmitting I counted actual occurrences in the unchanged prose
(same token-matching rule the validator uses: exact match or `+s`/`+es`):

- `closed-syllable-words` (`lock, chest, steps, clock`): 42 total
  (lock 10, chest 9, steps 10, clock 13) — above the brief's new minimum of
  30, every word present, and present on the shortest route to all 5
  endings.
- `castle-key-words` (`key, stage, exit, gate, coin`): 60 total (key 24,
  stage 9, exit 2, gate 18, coin 7) — above the brief's new minimum of 40,
  every word present, and present on the shortest route to all 5 endings.

Both totals already clear the brief's minimums with the existing prose, so
no `minOccurrences` adjustment or word reassignment was needed.

## Validation

`npm run story -- submit-draft job-20261118-lock-in-at-castellan-hal-3d1b03
--file work/draft.json --author narrative-designer --author-kind ai-agent
--agent narrative-designer` produced revision 4, state `in-review`, with:

```
schema: ok
graph: ok, 5/5 endings reachable
literacy checks: ok
brief: ok
```

`reports/literacy.r4.json` automated checks all pass, specifically:

- `word-set-concepts-match-spelling`: **true**, detail `no mismatches` (this
  is the check the stale review flagged — it now passes for all three word
  sets, including the renamed `closed-syllable-words` and the new
  `castle-key-words`).
- `word-set-minimums`: true — `sh-words: 40/10; closed-syllable-words:
  42/30; castle-key-words: 60/40`.
- `every-word-used`: true — all words appear at least once.
- `word-sets-on-every-route`: true — each of the three word sets appears on
  the shortest route to every ending.
- `target-concepts-known` / `target-concepts-present`: true.
- `sentence-length`: true (0 sentences over the 20-word automated check
  threshold).

`reports/validation.r4.json` reports `ok: true` overall (schema, graph,
literacy, brief). One pre-existing warning remains, unchanged from revision
3 and not something this revision was scoped to touch: "1 sentence(s)
exceed the brief's 13-word limit" (a warning, not an error; `brief.ok` is
still `true`). This is unrelated to the word-set fix and was already present
before this revision.

## Handoff

This revision is ready for an independent qa-engineer and literacy-specialist
review on revision 4 (the prior reviews on r2 are stale/superseded). I have
not run, and will not run, `story decide` or `story publish`, and have not
reviewed my own draft.

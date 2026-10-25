# Revision 7 notes — the-cat-who-took-the-wrong-turn

Base: revision 6 (`drafts/story.r6.json`, sha256 `ede654f1be...653414d`).
This revision addresses the independent QA review (`work/qa-review.r6.json`,
verdict `changes-requested`) and the independent literacy review
(`work/literacy-review.r6.json`, verdict `changes-requested`), both filed
against revision 6.

## QA finding 1 (major) — `how-to-go-down` contradicted `the-fall`

QA: both choices in `how-to-go-down` ("Jump in fast, feet first" and "Ease
yourself down slowly instead") targeted `the-fall`, whose opening narrates an
accidental slip ("The rim was wet. Eli's shoe slid, and down he went."),
denying the deliberate action the reader had just chosen.

Fix: added two new passages, `the-quick-slip` and `the-slow-slip`, each with
its own opening that first honors the reader's chosen action and then shows
the wet rim defeating it — the classic "tried to do X, but Y happened"
pattern, rather than silently ignoring the choice.

- `the-quick-slip`: "Eli did not wait. He was ready for jumping in, fast and
  bold. But the rim was wet. His feet slid before he could jump at all." Then
  the same fall-and-landing beats as `the-fall` (slow spin, soft mud, no
  hurt, sitting up), reworded so it is not a verbatim copy.
- `the-slow-slip`: "Eli trusted the cat. He went slow, climbing down with
  care. But the rim was wet too. His foot slid, and down he went anyway."
  Same landing beats, reworded again, slightly gentler in tone than the quick
  version.

Both new passages end with the same two choices as `the-fall` ("Stand up and
look around" → `varro`; "Check your bag before standing up" →
`check-the-book`), so the downstream story, items, clues and endings are
unaffected.

`how-to-go-down`'s choices now target these new passages instead of
`the-fall`:
- "Jump in fast, feet first" → `the-quick-slip`
- "Ease yourself down slowly instead" → `the-slow-slip`

`the-fall` itself is untouched and still serves its other four predecessors
(`lean-over`, `lean-after-call`, `lean-over-gate`, `lean-after-call-help`),
all of which describe leaning over or crouching to look down the hole — an
accidental slip while peering over the edge is consistent with all of those,
so no change was needed there.

## QA finding 2 (major) — `last-look-at-the-gate` contradicted `the-fall`

Same contradiction, same fix approach. `last-look-at-the-gate`'s choices now
target the two new passages:
- "Trust the cat and climb down" → `the-slow-slip` (matches its explicit
  "climb down" wording)
- "Decide to follow the cat anyway" → `the-quick-slip` (a more impulsive,
  no-more-hesitating decision)

This keeps both choices genuine branch points: within `how-to-go-down`, the
two choices now lead to visibly different text (quick vs. careful, and a
different landing detail — squelch vs. splash); within
`last-look-at-the-gate`, likewise. Neither choice is a decorative fork to an
identical page, and neither promises an outcome ("a jump," "a controlled
climb") that the following text then denies.

Net passage count: 38 → 40 (two new passages added), still within the
brief's `passageTarget.max` of 40.

## Literacy finding 1 (moderate) — round-2 passages carry no suffix-ing words

Literacy review: of the 18 small passages added in r5/r6 to fix single-choice
errors, only `look-at-the-moss` contained an ing-set word; the nine r6
passages (including `how-to-go-down`) contained none, and `how-to-go-down`
and `watch-the-hill` contained no word-set word from any of the three sets at
all.

Fix, done as part of the same edits above (not a separate pass):

- `how-to-go-down`: "He could try jumping in fast, or ease down slow
  instead." — adds the ing-set word "jumping" directly to this passage's own
  text (previously had zero word-set words of any kind).
- `last-look-at-the-gate`: "It was shut tight. Climbing down through the
  hole was the only way now." — adds the ing-set word "climbing" (previously
  only had "cat" via a choice label, no ing word).
- `the-quick-slip` (new): uses "jumping" again in its opening line.
- `the-slow-slip` (new): uses "climbing" again in its opening line ("He went
  slow, climbing down with care.").

Together these add real, newly-authored ing-set coverage to exactly the
passages the review called out, rather than relying only on r4 content.
Full-story ing-words total rose from a thinner margin at r6 to 27 occurrences
against the floor of 8 (`reports/literacy.r7.json`), and the worst-case
per-ending-route count is now 8–12 across all five endings (still ≥ the
floor of 8 on every route, `word-sets-on-every-route: ok`).

## Literacy finding 2 (moderate) — `watch-the-hill` dropped the -ing form

Literacy review: `watch-the-hill` paraphrased "the girl running down the
hill" (used that way in both `varro`'s choice label and `look-at-the-moss`'s
text) as "the girl run closer down the hill," dropping the word-set word at
the one new passage inserted into this exact scene.

Fix: restored the -ing form, reconciling the grammar as the review
suggested: "Eli watched the girl, still running, come closer down the hill."
`watch-the-hill` no longer has zero word-set words, and the three passages
describing this beat (`varro`, `look-at-the-moss`, `watch-the-hill`) are now
consistent in using "running."

## Literacy finding 3 (minor, optional) — decorative-fork template

Not required by the review, and left alone except where finding 1/2's edits
already touched the same passages. `how-to-go-down`, `last-look-at-the-gate`
and `watch-the-hill` all gained a little more texture as a side effect of the
fixes above (two genuinely different landing passages instead of one shared
one; a concrete detail — "climbing down through the hole" — replacing a
generic line). The other six round-2 connector passages
(`settle-in-the-mud`, `watch-the-frog-hop`, `look-back-at-the-marsh`,
`last-step-up`, `steady-your-nerves`, `one-more-breath`) were not touched,
per the coordinator's instruction that this item is optional and non-blocking.

## Explicitly out of scope (left unchanged)

- The three sentences one word over the brief's 16-word soft limit
  (`late-for-school`, `frog-helped`, `home-too-soon`), carried over since r4.
  Confirmed still exactly 3 in `reports/validation.r7.json`'s brief warnings
  — no new over-length sentences were introduced by this revision.
- The "bus" (1 occurrence) and "jumping"-concentration literacy notes about
  pre-existing r4 content.
- The other six round-2 "decorative fork" connector passages (see above).

## Validation

```
npm run story -- submit-draft job-20261020-the-cat-who-took-the-wro-fd6944 \
  --file stories/jobs/job-20261020-the-cat-who-took-the-wro-fd6944/work/draft.json \
  --author narrative-designer --author-kind ai-agent --agent narrative-designer

job-20261020-the-cat-who-took-the-wro-fd6944: revision 7 -> in-review
  schema: ok
  graph: ok, 5/5 endings reachable
  literacy checks: ok
  brief: ok
```

`npm run story -- status job-20261020-the-cat-who-took-the-wro-fd6944` shows
revision 7, draft `stories/jobs/job-20261020-the-cat-who-took-the-wro-fd6944/drafts/story.r7.json`,
sha256 `3a05d6f751b2e994f53f09ceb1dca50fd6140bc5b054bf849cbf5547882ab0d2`, with
the `automated-validation` publication gate passing. `review:qa` and
`review:literacy` are waiting on fresh reviews of this revision.

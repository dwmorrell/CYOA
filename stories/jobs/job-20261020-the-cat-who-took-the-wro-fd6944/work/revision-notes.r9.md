# Revision 9 notes — the-cat-who-took-the-wrong-turn

Base: revision 8 (`drafts/story.r8.json`, sha256
`76d39b92d3180b99ce7ef9e524b83bff6225bd766350d1357d5cc17734baf002`).

This revision responds to `reviews/review-10-qa.r8.json` (verdict
`changes-requested`, major finding) and the agreeing note in
`reviews/review-11-literacy.r8.json` (verdict `pass`, but flagged the same
concern as minor and also flagged two small wording nits). QA's r8 finding,
verified independently against `src/ui/Reader.tsx`, was that r8's fix (a
payoff phrase on each choice label, plus one generic acknowledgement
sentence at each shared hub) left the six round-2 connectors decorative in
practice: the reader's journey/history records passage *titles*, not the
label text clicked, so nothing about which option was taken survives past
the click. This round, graph restructuring was put in scope, mirroring the
pattern already used successfully in this story by `careful-hop` (splits to
`the-stairs` vs. `look-back-at-the-marsh`) and r7's fix for
`last-look-at-the-gate` (splits to `the-slow-slip` vs. `the-quick-slip`).

## What changed

Each of the six flagged connectors now sends its two choices to two
**different** new one-beat passages, instead of both choices sharing the
hub directly. Each new passage carries one or two sentences of genuinely
different content (a feeling, a small observation, a character beat) drawn
from the r8 choice-label payoff text, then both members of a pair offer
their own two choices that converge back onto the same hub the pair
originally shared — exactly preserving the prior graph shape, reachability,
gating and endings, just with one extra beat of real difference in between.

| Connector | Choice A → new passage | Choice B → new passage | Shared destination (unchanged) |
|---|---|---|---|
| `watch-the-frog-hop` | `call-thanks` → **`frog-wave-back`** ("Eli called out his thanks, loud and glad. The frog's throat puffed once, like a small answer back.") | `smile-and-go` → **`pocket-the-smile`** ("Eli smiled to himself and said nothing more. He liked keeping the small moment just for himself.") | `the-stairs` |
| `look-back-at-the-marsh` | `nod-to-frog` → **`one-more-nod`** ("Eli gave the frog a small, friendly nod. The frog blinked slowly back, as if it understood.") | `turn-to-stairs` → **`eyes-on-the-path`** ("Eli turned away and did not look back again. He kept his eyes on the path ahead.") | `the-stairs` |
| `last-step-up` | `climb-steady` → **`steady-count`** ("Eli counted his steps, slow and steady. One, two, three, climbing on without a trip.") | `climb-fast` → **`quick-count`** ("Eli took the steps two at a time, fast and bold. His heart beat quick by the time he reached the top.") | `tower-hall` |
| `steady-your-nerves` | `step-slow` → **`slow-foot-in`** ("Eli set one foot down slowly, then the other. The lantern room felt cool and still around him.") | `step-bold` → **`bold-foot-in`** ("Eli stepped in all at once, feeling brave and bold. His heart was still pounding fast when he landed inside.") | `lantern-room` |
| `one-more-breath` | `side-by-side` → **`holding-on`** ("Eli and Lira stepped in together, hand in hand. Holding on to a friend made the dark room feel less scary.") | `go-first` → **`leading-the-way`** ("Eli went in first, brave and quick. He turned and waved for Lira to follow.") | `lantern-room` |
| `settle-in-the-mud` | `sit-moment` → **`cool-mud-moment`** ("Eli sat a moment longer in the cool, soft mud. It felt strange, but not bad, to rest there.") | `stand-right-up` → **`quick-stand`** ("Eli jumped right up and brushed the mud from his hands. He was ready to see where he had landed.") | `varro` |

Each new passage has its own two choices, both leading on to the shared
destination named above (the convergence point is unchanged from r8/r7), so
no choice `target` outside this set of 12 moved, no `requires`/`effects`
changed anywhere, no ending changed, and reachability/gating is identical to
r8. The only change to the original six connectors is retargeting their two
existing choices from the hub directly to the matching new passage; their
own text and labels are untouched from r8.

This is a genuine fix, not a label-only one: a reader who replays one of the
six connectors and picks the other option now reads different passage text
(different title in the journey/history, different paragraphs) before
reaching the hub — this is no longer invisible past the click, unlike r8's
label-only approach.

### Why 12 new passages, not 6

The task allowed either 6 (one shared per connector) or up to 12 (one per
choice). A single shared passage per connector would not have differentiated
the two choices at all, so it would not have fixed anything. I used the
full 12, one per original choice, so every one of the twelve choices gets
its own distinct beat. No two of the twelve share a target passage.

### Each new passage still has two choices (schema requirement)

The graph validator rejects any non-ending passage with fewer than two
choices (`single-choice`). Each of the 12 new passages therefore has two
choices of its own, both leading on to the shared hub the pair converged to
before. These forward choices are deliberately plain ("Walk on to the
stairs" / "...still smiling", etc.) — the real differentiation already
happened one step earlier, in which of the two new passages the reader
landed on. This mirrors a pattern already present and unflagged elsewhere in
this story (`watch-the-hill`, whose two choices — "Wave first" / "Wait
quietly" — both lead to `meet-lira`); it was not changed, being outside this
revision's scope.

## Hub text: contradiction re-check

Before editing, I re-derived the full predecessor list of each of the four
hubs directly from `story.r9.json` (not just trusting `work/revision-notes.r8.md`),
because the six connectors no longer point at the hubs directly — the new
passages do:

- `the-stairs`: 13 incoming choices — the 5 pre-existing ones unchanged from
  r7/r8 (`meet-lira`/`take-stairs`, `frog-helped`/`to-stairs-kind`,
  `thank-the-frog`/`to-stairs-crumb`, `stone-hop`/`to-stairs-fast`,
  `careful-hop`/`to-stairs-careful`), plus 2 choices each from
  `frog-wave-back`, `pocket-the-smile`, `one-more-nod`, `eyes-on-the-path`.
- `tower-hall`: 7 incoming — 3 pre-existing (`the-stairs`/`keep-climbing`,
  `the-prints`/`up-after-prints`, `show-lira-the-prints`/`up-after-showing`),
  plus 2 each from `steady-count`, `quick-count`.
- `lantern-room`: 12 incoming — 4 pre-existing (`net-lid`/`up-net`,
  `check-on-ash`/`step-in-after-ash`, `ladder-climb`/`up-ladder`,
  `help-lira-up`/`step-in-after-helping`), plus 2 each from `slow-foot-in`,
  `bold-foot-in`, `holding-on`, `leading-the-way`.
- `varro`: 8 incoming — 4 pre-existing (the three fall variants'
  `look-around*` choices, `check-the-book`/`stand-after-check`), plus 2 each
  from `cool-mud-moment`, `quick-stand`.

I re-read every predecessor's closing text against each hub's opening
sentence. The hub sentences stay generic ("Whatever Eli had just decided...",
"However he had climbed those last steps...", the two edited this round —
see below) and still make no claim about which specific choice was taken, so
they remain true for every predecessor, including the ones that never faced
the originally flagged forks (`meet-lira`, `the-prints`,
`show-lira-the-prints`, `net-lid`, `check-on-ash`, `ladder-climb`,
`help-lira-up`, the three `the-*-slip`/`the-fall` variants, `check-the-book`).
In particular `stone-hop`'s "Eli did not look back" still cannot be
contradicted by `the-stairs`'s opening sentence, which makes no claim about
looking back either way — re-confirmed, matching both r8 reviews'
independent checks of the same fact.

## Literacy wording fixes (both flagged by review-11-literacy.r8.json)

1. **Verb-contraction consistency.** `he'd` was the story's only verb
   contraction (the rest of the book spells out "he had", "I am", "do not");
   the two sibling hub sentences already used the full form ("Eli had just
   decided", "he had climbed"). Fixed both remaining instances:
   - `lantern-room`: "Whichever way he'd stepped in, Eli was here now." is
     replaced (see next point) rather than just patched, since its opening
     clause is being reworded anyway.
   - `varro`: "However he'd done it, Eli was back on his feet." → "However
     **he had** done it, Eli was back on his feet." Only the contraction
     changed; the rest of the sentence and paragraph is untouched.
2. **Stacked "-ever" constructions in `lantern-room`.** The pre-existing
   fourth paragraph already has "Whatever was in the Tower's heart was not a
   villain." Having the new opening sentence also start with a "-ever" word
   (`Whichever way he'd stepped in...`) put two different "-ever"
   constructions with two different referents close together, which the
   literacy review flagged as a risk of readers briefly blending the two
   unrelated uncertainties. Since the real acknowledgment-of-choice job now
   belongs to the 8 new predecessor passages feeding `lantern-room`, I
   reworded the hub's opening clause to drop the "-ever" pattern entirely:
   "Whichever way he'd stepped in, Eli was here now." → "**By one path or
   the other**, Eli was here now." This also resolves the contraction
   finding for this passage in the same edit. The sentence remains true for
   all 12 predecessors of `lantern-room` listed above.

`the-stairs` and `tower-hall` hub sentences were not touched this
revision — they already used the full "had" form in r8 and were not named
in either wording finding.

## Validation

```
npm run story -- submit-draft job-20261020-the-cat-who-took-the-wro-fd6944 \
  --file stories/jobs/job-20261020-the-cat-who-took-the-wro-fd6944/work/draft.json \
  --author narrative-designer --author-kind ai-agent --agent narrative-designer

job-20261020-the-cat-who-took-the-wro-fd6944: revision 9 -> in-review
  schema: ok
  graph: ok, 5/5 endings reachable
  literacy checks: ok
  brief: ok
```

`reports/validation.r9.json` confirms:

- schema ok; graph ok — **52** passages (was 40; +12 new), **97** choices
  (was 73; +24, i.e. the 12 new passages' own two choices each), 5/5 endings
  reachable (`warm-den`, `drum-song`, `the-grab`, `two-heads`,
  `home-too-soon`), `stateSearchComplete: true`. `shortestPathToEnding`
  unchanged at 8 (the new passages sit on branches that were never the
  globally shortest route); `longestSimplePathToEnding` moved from 25 to 27,
  reflecting the one extra beat now possible on routes that use these
  connectors — well inside any structural limit.
- All three word sets still meet their brief minimum and still clear their
  floor on the shortest route to every one of the 5 endings:
  blend-words 105/10 (perEndingRoute 11–24), closed-syllable-words 66/8
  (perEndingRoute 18–27), ing-words 30/8 (perEndingRoute 8–12).
  `word-sets-on-every-route: ok`. The new passages picked up a few set words
  naturally (e.g. "trip", "steps" in `steady-count`; "mud" in
  `cool-mud-moment`/`quick-stand`) without being forced.
- Brief `ok`, with the same pre-existing warning as every prior revision
  since r4: "3 sentence(s) exceed the brief's 16-word limit"
  (`late-for-school`, `frog-helped`, `home-too-soon` — none of them touched
  this revision, confirmed by diff below).
- Every sentence in the 12 new passages and the 2 edited hub sentences is
  well under the 16-word brief limit (7–12 words each, by direct count);
  `sentence-length` automated check reports 0 sentences over 20 words.
- Scanned the full story text for verb contractions (`'ve/'d/'ll/'re/'m/n't`)
  after this revision: zero remain anywhere, confirming both `he'd`
  instances are gone and no new passage introduced one.

Diffing `story.r8.json` against `story.r9.json` directly confirms the exact
scope: 12 passages added (`frog-wave-back`, `pocket-the-smile`,
`one-more-nod`, `eyes-on-the-path`, `steady-count`, `quick-count`,
`slow-foot-in`, `bold-foot-in`, `holding-on`, `leading-the-way`,
`cool-mud-moment`, `quick-stand`); 8 existing passages changed (the six
connectors, retargeted only — labels/paragraphs untouched from r8 — plus
`lantern-room` and `varro`'s opening sentences); `the-stairs` and
`tower-hall` are byte-identical to r8; no passage outside this list changed;
no choice `requires`/`effects` changed anywhere; no ending changed; `version`
8 → 9. `public/stories/previews/` was not touched.

## Explicitly out of scope (left unchanged)

- The three sentences one word over the brief's 16-word soft limit, carried
  over since r4/r6/r7/r8.
- The pre-existing "bus" (1 occurrence) and ing-word-concentration literacy
  notes, carried over since r4.
- `watch-the-hill`'s own two-choices-same-target structure (unflagged by any
  review so far) — not touched, outside the six passages named in scope.

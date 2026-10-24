# Revision 5 notes — single-choice passage fix

Scope: this revision only adds a second genuine choice to the nine non-ending
passages identified as having only one real choice. No existing paragraph
text was changed, no items/clues/endings were added, and the five existing
endings are unchanged. `version` is bumped to 5.

## Audit of the rest of the draft

I checked every non-ending passage in r4 for the single-choice problem.
Beyond the nine listed in the task, I found none: `late-for-school` (2),
`meet-lira` (2), `the-marsh` (2), `the-stairs` (2), `tower-hall` (3) and
`lantern-room` (4) already offered real branches, and the five `ending-*`
passages plus `home-too-soon` correctly have no choices.

## Fixes (one new choice + one new short passage each)

1. **through-the-gap** → added "Call softly to the cat first" leading to new
   passage `call-to-the-cat` (Eli calls down the hole, hears the cat answer,
   feels braver before leaning over). Rejoins the existing target `the-fall`.
2. **the-gate** → added "Call for help over the fence" leading to new passage
   `call-for-help` (Eli tries shouting for a grown-up first, no one comes, he
   goes back to the cat). Rejoins `the-fall`.
3. **the-fall** → added "Check your bag before standing up" leading to new
   passage `check-the-book` (Eli checks his library book and its map survived
   the fall — a continuity callback to the map mentioned in `late-for-school`).
   Rejoins `varro`.
4. **varro** → added "Kneel down and look at the glowing moss" leading to new
   passage `look-at-the-moss` (a close look at the moss before Lira arrives).
   Rejoins `meet-lira`.
5. **frog-helped** → added "Leave the frog a crumb before you go" leading to
   new passage `thank-the-frog` (Eli thanks the frog with food from his lunch
   box — foreshadows the lunch-box crumbs used in the `ending-the-grab` and
   `ending-two-heads` endings). Rejoins `the-stairs`.
6. **stone-hop** → added "Try the last stones again, more carefully" leading
   to new passage `careful-hop` (a second, successful attempt, a different
   emotional beat from the muddy first try). Rejoins `the-stairs`.
7. **the-prints** → added "Show Lira the marks before going up" leading to
   new passage `show-lira-the-prints` (Lira offers a different, wrong guess —
   "maybe a bird" — sharpening Eli's own inference by contrast). Rejoins
   `tower-hall`.
8. **net-lid** → added "Check on Ash before stepping in" leading to new
   passage `check-on-ash` (Eli notices the cat is tense and comforts him).
   Rejoins `lantern-room`.
9. **ladder-climb** → added "Reach down and help Lira up" leading to new
   passage `help-lira-up` (Eli pulls Lira up the last rung instead of going
   in alone — a small, different act of kindness). Rejoins `lantern-room`.

No new endings were added; every new passage reconnects to an existing
passage already on the path to one of the five endings. Each new choice was
appended as the *second* entry in its passage's `choices` array (after the
original choice), so none of the pre-existing shortest routes used by the
literacy word-set checks changed; `npm run story -- status` confirms graph
ok with 5/5 endings reachable and literacy checks ok.

## Word sets, sentence length and tone

The nine new passages use short, concrete sentences (5–12 words, under the
brief's 16-word maximum) and keep the existing cast, items and clues. Several
naturally reuse word-set vocabulary already active in the story (`map`,
`hop`/`hopped`, `step`, `glowing`, `stone`) without listing or forcing them.
No new vocabulary needing a glossary entry was introduced.

Three pre-existing sentences carried over unchanged from revision 4 are still
one word over the brief's 16-word limit (`late-for-school`: "Eli's library
book had a map in it, and he was meant to show it in class."; `frog-helped`:
"She was waiting at the start of the stairs, and she gave him a small,
surprised smile."; `home-too-soon`: "He looked at his muddy shoes and
thought of the marsh, the stairs and the dark hatch."). These were already
present in the approved, reviewed revision 4 and are outside this
revision's scope (fixing single-choice passages only); they were already
flagged as non-blocking "minor" findings by the r4 literacy review and do
not fail automated validation (the hard limit is 20 words). I left them
untouched rather than rewrite content beyond the requested fix.

## Validation

`npm run story -- submit-draft` for revision 5 reports:
`schema: ok` / `graph: ok, 5/5 endings reachable` / `literacy checks: ok` /
`brief: ok`.

Draft hash: `sha256=263ac68ecdeec27780666125dc13f1e53207b44a2e08299d6a79fc448af05846`.

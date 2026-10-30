# Revision 10 notes — fix the engine-trace clue claim and the two dead-end collectibles

This revision addresses the two findings recorded against revision 9 in
`reviews/review-7-qa.r9.json` (QA, verdict pass with findings) and cross-checked
against `reviews/review-6-literacy.r9.json` (literacy, verdict pass with
findings). Both findings were "minor" and did not block r9, but both are
fixed here as instructed. Nothing else in the story was touched: diffing
`drafts/story.r9.json` against the new draft shows exactly five changed
lines (the `version` bump plus the four lines described below).

## Finding 1 — `engine-trace` clue causal mismatch (QA)

The passage's unconditional text already said "Then it gave a soft thud,
twice, like a secret code" before either choice (`trace-on` / `call-out`)
is picked. But the `blink-code` clue's own text said "When Ivy called out,
the little box blinked and thudded twice..." — asserting that calling out
*caused* the thud, when the passage shows the thud happens regardless of
which choice is taken.

Fix applied: option (b) from the finding, the smaller and safer edit.
Reworded the `blink-code` clue description to drop the causal claim:

- Before: "When Ivy called out, the little box blinked and thudded twice,
  slow and quick. Something was listening."
- After: "The little box blinked and thudded twice, slow and quick, like a
  secret code."

This now simply echoes what the passage already shows, with no
cause-and-effect claim the passage doesn't support. I did not move the
`thud` line into the `call-out` branch only (option a) because that would
have required restructuring passage text shared by both choices for no
extra benefit — the reworded clue text fully resolves the contradiction on
its own.

Word-set note: item and clue `description` fields are never tokenized by
the literacy analyzer (`src/literacy/analyzer.ts`'s `passageText()` only
joins passage `title`, `paragraphs` and choice `label`s — collectibles are
a separate array). So this edit has **zero** effect on any word-set count;
confirmed below.

## Finding 2 — `chalk-note` / `blink-code` dead-end collectibles (QA)

QA's finding offered two independent remedies: "either reference the chalk
note or the blinking code again later ... or rewrite the two choice labels
so they read as pure atmosphere rather than a kept 'promise'/discovered
'code' that the story then drops."

I checked whether a later, truthful callback was possible first. It is
not, without changing the graph: `engine-trace`'s two choices (`trace-on`,
`call-out`) both converge on `nib`, and `nib-ask`'s two choices
(`nib-ask-on`, `promise-nib`) both converge on `threshold`. The engine has
no conditional/branching text within a single passage (`schemas/story.schema.json`'s
`passage.paragraphs` is a flat string array, and `choice` has no
outcome text, only a `label` and `lockedHint`) — passage text is the same
for every reader who reaches that passage, regardless of which prior
choice they took. Both `climax-careful` and `threshold` are reached by
routes that do *not* always pass through `call-out` or `promise-nib` (a
reader can skip `engine-trace` and `nib-ask` entirely, or take their other
choice). So any unconditional line asserting "Ivy still has the chalk
note" or "the blinking code" at `climax-careful` or anywhere downstream
would be **false** for readers who didn't take that specific branch — that
would trade one content-integrity bug for a worse one. A gated
(`requires`) callback was also not viable without restructuring: `threshold`
already has the schema-maximum 4 choices, and `requires` conditions are
AND-only (no "any of" alternative), so there's no room to add a new
gated choice there, and the task instructions ask to avoid graph
restructuring beyond what's strictly needed.

So I used QA's other sanctioned remedy: reworded the two choice labels (and
the one line that staged `nib-ask`'s gift) so neither reads as a kept
promise or a discovered code that the story then drops. Each is now plain,
present-tense atmosphere — something the reader either takes or doesn't,
with no implied future payoff:

- `engine-trace` / `call-out`: "Call out, and keep listening for an
  answer" → "Call out, and keep listening to the box" (drops the implied,
  never-delivered "answer").
- `nib-ask` passage text: "Nib snapped off a small chalk note and held it
  out, like a gift." → "Nib snapped off a small chalk note. It lay there,
  like a tiny gift." (the note is now something lying there to pick up or
  not, not a gift personally offered and then silently ignored by the
  `nib-ask-on` branch — this also resolves QA's specific sub-note that
  "the `nib-ask-on` branch silently ignores an already-offered gift with
  no acknowledgement either way").
- `nib-ask` / `promise-nib`: "Promise to keep the chalk note safe, then
  take it" → "Pick up the small chalk note to keep" (drops "Promise ...
  safe", which implied an ongoing commitment the story never revisits).

The item (`chalk-note`) and clue (`blink-code`) themselves were already
plain, atmospheric descriptions ("A small square Nib snapped off its own
chalk board. It has a tiny doodle of Nib on it.") and needed no change.
Both remain flavour/collectible only, with no `requires` anywhere
referencing them (confirmed by grep), so this does not change ending
reachability or create a soft-lock.

### Word-set impact: none

Each rewording keeps exactly the same word-set words it had before,
so none of the three totals moved:

| Label (old → new) | vowel-team words kept | silent-e words kept |
| --- | --- | --- |
| "...keep listening for an answer" → "...keep listening to the box" | `keep` (1→1) | — |
| "...held it out, like a gift." → "...It lay there, like a tiny gift." | — | — |
| "Promise to keep the chalk note safe, then take it" → "Pick up the small chalk note to keep" | `keep` (1→1) | `note` (1→1) |

Verified by an independent word-count script over `drafts/story.r10.json`
(the same tokenize-and-match logic as `src/literacy/analyzer.ts`) and by
`reports/literacy.r10.json`: totals are unchanged from r9 — vowel-team
33/10, silent-e 50/8, th-words 59/8 — `missingWords: []` and
`conceptMismatches: []` on all three sets, and `perEndingRoute` is
identical to r9's for every one of the five endings.

## What was not touched

- No passage was added, removed or retargeted. No `requires`, `effects`,
  `lockedHint` or choice `target` changed. The locked choice
  `open-careful` at `threshold` (requiring `hook-pole` + `late-log`) is
  unchanged, as are the `hook-pole`/`late-log` payoffs in `climax-careful`.
- The two carried-over findings the task explicitly excluded (the "blue
  tube"/Kestrel's-dome continuity notes in `ending-carry`/`nib`, and the
  `late-log` unreachable-on-some-routes design question at `threshold`)
  were left untouched, as instructed.
- `public/stories/previews/` was not touched.

## Validation

```
npm run story -- submit-draft job-20261020-the-derelict-salvage-cap-f8f7ea \
  --file stories/jobs/job-20261020-the-derelict-salvage-cap-f8f7ea/work/draft.r10.json \
  --author narrative-designer --author-kind ai-agent --agent narrative-designer
```

Result: revision 10 (story v10), validation ok —
`schema: ok; graph: ok, 5/5 endings reachable; literacy checks: ok; brief: ok`.

`npm run story -- status job-20261020-the-derelict-salvage-cap-f8f7ea` confirms
revision 10 validation=ok, draft sha256
`0c22648dda9ba2983f8d43d4f4b8a4aea5e69a8b3159e95cfd4e2ee6b6d8fa8f`, and the
automated-validation publication gate passing with the same summary. The
`review:qa` and `review:literacy` gates now wait on fresh reviews of
revision 10 (the r9 reviews are marked stale/superseded), as expected for a
new revision.

# New story generation request

<!--
Reusable template. `npm run story -- new --request <file>` fills the
{{PLACEHOLDERS}} and writes the result to the job folder as
generation-prompt.md. Hand that file to the narrative-designer agent:

  claude --agent narrative-designer "Draft the story for job {{JOB_ID}}. Follow {{JOB_DIR}}/generation-prompt.md."

No AI service is called by the app or by the CLI. Generation happens offline
in an agent session, and the result enters the same validation and review
pipeline as a story a person writes by hand.
-->

Job: `{{JOB_ID}}`
Story id to use: `{{STORY_ID}}`
Job folder: `{{JOB_DIR}}`

## What to produce

Write one JSON file that validates against `schemas/story.schema.json`, save it
as `{{JOB_DIR}}/work/draft.json`, then submit it:

```
npm run story -- submit-draft {{JOB_ID}} --file {{JOB_DIR}}/work/draft.json --author narrative-designer --author-kind ai-agent --agent narrative-designer
```

Read the validation summary it prints, and the full reports in
`{{JOB_DIR}}/reports/`. If validation fails, fix the draft, raise `version`,
and submit again. Do not edit files in `drafts/` or `reports/` by hand.

## Who the story is for

- Reader: a dyslexic child aged 10 to 13. Write for comprehension first: the
  reader should understand what happened and why, and feel the story pull them
  on. Reading practice is woven in, never announced.
- Length: one complete path should take about 15 to 25 minutes. Plan a total of
  roughly 2,500 to 4,000 words across all passages on the shortest path plus the
  side routes, with short paragraphs. Some stories can run longer, with more
  content; when the brief's `targetMinutes` is larger, scale the words to the
  minutes in the same way.
- Genre and tone: pick one of fantasy, mystery, horror (gentle, never gory),
  suspense, cyberpunk, sci-fi or exploration. Draw on the interests in the brief
  (LEGO, anime, Pokémon, Roblox, simulators, TTRPGs, card games, D&D, puzzles)
  without using any real brand or character names.
- Mature themes: suspense can go further when the story needs it, such as a sea
  voyage where a ship is lost, or a lost relative and a strange postcard that
  starts a search. Keep it tense, not gory. A cosmic-horror mood is welcome, but
  use original creatures and names, never Cthulhu or any named creature from
  existing mythology.

## Learning design

- Tag passages and choices with `learningTargets` from: comprehension,
  inference, sequencing, vocabulary, detail, engagement. Cover every objective
  at least once across the story.
- Make clues and details matter later: an early detail should change a later
  choice or ending (attention to detail), and inference should come from what a
  character does, not from being told.
- Include a sequencing moment: a choice or clue that depends on the order in
  which things happened.
- Add vocabulary through context and a `glossary` entry with a short plain
  `definition` (under 200 characters) for each key word.
- Do not add typing puzzles. Typing is a separate add-on that uses grown-up word lists, not story pages.
- Make the reading skills the story practises visible in the text. The literacy
  reviewer writes one note about them for the whole story, not one per ending.
- No timers, countdowns or "hurry" mechanics on any page.

## Hard rules

1. Original work only. No characters, places, plots or text from existing books, films, games or other brands. Classic CYOA books may inform pacing only; do not copy their structure or wording.
2. Use the story id above, `"schemaVersion": "1.0"`, and start at `"version": 1` (raise it for each revision).
3. Set `literacy.review.status` to `"pending"`. You are not a literacy reviewer, and nobody has reviewed it yet.
4. Set `metadata.authorship.origin` to `"ai-generated"` and `metadata.authorship.narrative` to `"narrative-designer (AI agent)"`.
5. Copy every word set from the brief into `literacy.wordSets` with the same `id`, `words` and `minOccurrences`, and copy `targetConcepts`.
6. Weave the word-set words into natural sentences. Never list them, bold them or make a character spell them out.
7. Keep sentences at or under the brief's `maxSentenceWords`. Prefer short paragraphs (one to three sentences).
8. Aim for the number of endings in the brief (five for new stories). Branches matter more than the count: a second read should take a different route through the story. Every ending must be reachable and no path may trap the reader. Include at least one inventory item and one clue, but keep items and clues to a minimum: they are easter eggs that add context, new-word help and atmosphere, not the main mechanic. Include one choice that `requires` an item or clue (with a `lockedHint`), and give it an open alternative.
9. Content must suit a 10 to 13 year old. Mature themes and suspense are allowed when they serve the story, but never sexual content, violence or gore, suicide or self-harm, romance, brand names, real people, or references to specific religions. Setbacks are gentle and invite another try.
10. Do not make the reader go back over pages they have already read just to pick something up or to reach an ending. Each route should move forward.
11. Add a `glossary` entry with syllable breaks for any word over two syllables that a struggling reader may stumble on.

## Normalized brief

```json
{{BRIEF_JSON}}
```

## Series continuity assessment

```json
{{CONTINUITY_JSON}}
```

The outline skeleton and Word Weave Plan are in `{{JOB_DIR}}/outline.json` and
`{{JOB_DIR}}/word-weave-plan.json`. You may add passages or rename beats; you
may not drop required mechanics.

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

## Hard rules

1. Original work only. No characters, places, plots or text from existing books, films or games.
2. Use the story id above, `"schemaVersion": "1.0"`, and start at `"version": 1` (raise it for each revision).
3. Set `literacy.review.status` to `"pending"`. You are not a literacy reviewer, and nobody has reviewed it yet.
4. Set `metadata.authorship.origin` to `"ai-generated"` and `metadata.authorship.narrative` to `"narrative-designer (AI agent)"`.
5. Copy every word set from the brief into `literacy.wordSets` with the same `id`, `words` and `minOccurrences`, and copy `targetConcepts`.
6. Weave the word-set words into natural sentences. Never list them, bold them or make a character spell them out.
7. Keep sentences at or under the brief's `maxSentenceWords`. Prefer short paragraphs (one to three sentences).
8. Include at least one inventory item, one clue, one choice that `requires` an item or clue (with a kind `lockedHint`), and the number of endings in the brief. Every ending must be reachable and no path may trap the reader.
9. Content must suit a young reader: no gore, cruelty, romance, brand names or real people. Setbacks are gentle and invite another try.
10. Add a `glossary` entry with syllable breaks for any word over two syllables that a struggling reader may stumble on.

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

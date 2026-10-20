# Story authoring

Stories are JSON files that follow `schemas/story.schema.json`. They can be
written by a person, or drafted by the `narrative-designer` agent from a job's
generation prompt. Either way they go through the same pipeline.

## Request format

Put a request in `stories/requests/<name>.json`:

```json
{
  "genre": "Seaside mystery adventure",
  "theme": "Courage and asking for help",
  "premise": "Title Of Story. One or two sentences of premise.",
  "sequelTo": "optional-id-of-previous-story",
  "targetMinutes": 12,
  "literacy": {
    "profile": "structured-literacy",
    "targetConcepts": ["digraph-sh", "closed-syllable"],
    "reviewConcepts": ["concepts-from-earlier-books"],
    "maxSentenceWords": 16
  },
  "wordSettings": {
    "sets": [{ "label": "sh words", "concept": "digraph-sh", "words": ["ship", "shell"], "minOccurrences": 6 }]
  },
  "continuity": { "characters": ["…"], "facts": ["…"], "avoid": ["…"] },
  "requestedBy": "Parent name"
}
```

The first sentence of `premise` becomes the title and the story id.
Concept ids are listed in `src/literacy/taxonomy.ts` and
`docs/LITERACY_MODEL.md`.

## Story file essentials

- `start` names the first passage. Each passage has 1 to 6 short
  `paragraphs` and up to 4 `choices`, or an `ending` and no choices.
- `effects` (on a passage or a choice) can `addItems`, `removeItems`,
  `addClues`, `setFlags`.
- `requires` on a choice locks it until the reader has the listed items,
  clues or flags. Locked choices stay visible with `lockedHint`.
- `glossary` words show tap-to-reveal syllables.
- `literacy.review.status` stays `"pending"`. The AI reviews are recorded in the
  job, not in the story file. Validation fails a story that claims `"passed"`
  without a recorded review.
- Raise `version` for every revision.

## Writing guidance for readers with dyslexia

- Short sentences (aim for 8 to 12 words; the brief sets a maximum).
- One idea per paragraph, one to three sentences.
- Concrete, familiar words; introduce harder words with context and add them to the glossary.
- Weave word-set words into natural sentences, never as lists or puzzles.
- Every path should feel worthwhile. Setback endings are gentle and point to another try.
- No gore, cruelty, romance, brand names or real people.

## Checking a story

```bash
npm run validate:stories                 # every story in the repo
npm run story -- status <jobId>          # gates for one job
```

The parent studio in the app ("For grown-ups") runs the same checks in the
browser and can open any story file from the device.

## Approving and publishing (parents)

Run these in your own terminal, not through an AI assistant:

```bash
npm run story -- decide <jobId> --parent "Your name" --decision approved
npm run story -- publish <jobId> --by "Your name"
```

Publishing copies the approved draft into `public/stories/published/` and
adds it to `public/stories/catalog.json`. Commit that change in a pull
request; CI re-checks every gate. Shipping it to devices is a separate
deployment step (`docs/DEPLOYMENT.md`).

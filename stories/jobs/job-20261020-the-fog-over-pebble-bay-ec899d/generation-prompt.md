# New story generation request

<!--
Reusable template. `npm run story -- new --request <file>` fills the
{{PLACEHOLDERS}} and writes the result to the job folder as
generation-prompt.md. Hand that file to the narrative-designer agent:

  claude --agent narrative-designer "Draft the story for job job-20261020-the-fog-over-pebble-bay-ec899d. Follow stories/jobs/job-20261020-the-fog-over-pebble-bay-ec899d/generation-prompt.md."

No AI service is called by the app or by the CLI. Generation happens offline
in an agent session, and the result enters the same validation and review
pipeline as a story a person writes by hand.
-->

Job: `job-20261020-the-fog-over-pebble-bay-ec899d`
Story id to use: `the-fog-over-pebble-bay`
Job folder: `stories/jobs/job-20261020-the-fog-over-pebble-bay-ec899d`

## What to produce

Write one JSON file that validates against `schemas/story.schema.json`, save it
as `stories/jobs/job-20261020-the-fog-over-pebble-bay-ec899d/work/draft.json`, then submit it:

```
npm run story -- submit-draft job-20261020-the-fog-over-pebble-bay-ec899d --file stories/jobs/job-20261020-the-fog-over-pebble-bay-ec899d/work/draft.json --author narrative-designer --author-kind ai-agent --agent narrative-designer
```

Read the validation summary it prints, and the full reports in
`stories/jobs/job-20261020-the-fog-over-pebble-bay-ec899d/reports/`. If validation fails, fix the draft, raise `version`,
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
{
  "title": "The Fog over Pebble Bay",
  "genre": "Seaside mystery adventure",
  "theme": "Courage, noticing small details, and asking for help",
  "premise": "The Fog over Pebble Bay. When thick fog swallows the harbour, young lamp keeper Fen must find out why the old lighthouse lamp went dark before the fishing boats come home.",
  "targetMinutes": 12,
  "passageTarget": {
    "min": 10,
    "max": 24
  },
  "endingTarget": 3,
  "maxSentenceWords": 16,
  "profile": "structured-literacy",
  "targetConcepts": [
    "digraph-sh",
    "digraph-ch",
    "digraph-th",
    "closed-syllable"
  ],
  "reviewConcepts": [],
  "wordSets": [
    {
      "id": "sh-words",
      "label": "sh words",
      "concept": "digraph-sh",
      "words": [
        "ship",
        "shell",
        "fish",
        "shed",
        "shut"
      ],
      "minOccurrences": 10
    },
    {
      "id": "ch-words",
      "label": "ch words",
      "concept": "digraph-ch",
      "words": [
        "chest",
        "chain",
        "bench",
        "much"
      ],
      "minOccurrences": 8
    },
    {
      "id": "th-words",
      "label": "th words",
      "concept": "digraph-th",
      "words": [
        "path",
        "thick",
        "moth",
        "cloth"
      ],
      "minOccurrences": 8
    }
  ],
  "continuity": {
    "characters": [
      "Fen, a ten-year-old lamp keeper's helper",
      "Gran Tull, the retired lamp keeper",
      "Pip, a small grey gull"
    ],
    "facts": [
      "This is book 1 of the Pebble Bay series",
      "The lighthouse lamp is lit by an oil wick and a brass mirror"
    ],
    "avoid": [
      "anyone drowning or being badly hurt",
      "villains who are cruel"
    ]
  },
  "requiredMechanics": [
    "choices",
    "clues",
    "inventory",
    "multiple-endings"
  ]
}
```

## Series continuity assessment

```json
{
  "isSequel": false,
  "series": null,
  "carriedItems": [],
  "carriedClues": [],
  "establishedConcepts": [],
  "droppedConcepts": [],
  "progressionWarnings": [],
  "issues": [],
  "ok": true
}
```

The outline skeleton and Word Weave Plan are in `stories/jobs/job-20261020-the-fog-over-pebble-bay-ec899d/outline.json` and
`stories/jobs/job-20261020-the-fog-over-pebble-bay-ec899d/word-weave-plan.json`. You may add passages or rename beats; you
may not drop required mechanics.

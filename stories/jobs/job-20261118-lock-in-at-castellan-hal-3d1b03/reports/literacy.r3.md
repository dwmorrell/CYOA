# Literacy report: lock-in-at-castellan-hall v3

Story hash (sha256 of canonical JSON): `2d3054f5d5cd35d1146a340b2834c80ab89b3f9784c68c0ca0b1cb8e3acce5dd`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | sh-words: 40/10; closed-syllable-words: 102/12 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 542; digraph-sh: 52 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| sh words | 40 / 10 | 19 | none | ending-1: 17, ending-2: 17, ending-3: 21, ending-4: 20, ending-5: 16 |
| closed-syllable words | 102 / 12 | 20 | none | ending-1: 51, ending-2: 51, ending-3: 47, ending-4: 49, ending-5: 39 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 542 | an, and, as, ask, at, back, best, big, both, but, calm, check |
| Digraph sh | yes | 52 | crash, flash, flashes, hush, rush, rushed, she, shelf, shine, shock, shove, show |
| Digraph ch |  | 18 | check, chest, chose, reached, school, torch |
| Digraph th |  | 261 | another, both, other, others, something, that, the, theater, their, them, then, theo |
| Digraph wh |  | 1 | when |
| ck spelling |  | 44 | back, check, click, clock, crack, lock, locked, quick, shock, stuck, ticked, ticket |
| FLOSS rule (ff, ll, ss, zz) |  | 39 | call, fall, fell, full, grass, hall, small, still, tall, voss, wall, well |
| Beginning blend |  | 127 | clean, click, clock, close, clue, crack, crash, crawled, dry, flash, flashes, floor |
| ng / nk units |  | 19 | along, angle, footing, getting, lightning, long, losing, rang, showing, something, strange, swung |
| tch spelling |  | 2 | watch |
| Vowel-consonant-e syllable |  | 138 | above, before, beside, came, chose, close, gate, gave, give, gone, hole, home |
| Vowel team syllable |  | 97 | again, agreed, air, away, clean, clue, coat, curtain, day, dead, deep, eased |
| R-controlled syllable |  | 137 | air, another, around, before, careful, counter, curious, curtain, far, first, floor, for |
| Suffix -ing |  | 7 | footing, getting, lightning, losing, showing, something, waiting |
| Suffix -ed |  | 32 | agreed, crawled, eased, fixed, helped, listened, locked, looked, moved, needed, reached, returned |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 5 glossary word(s) with a definition
- Tagged moments per objective: comprehension 2, inference 3, sequencing 2, vocabulary 1, detail 2, engagement 1

## Readability

- Words: 1162, average per passage 52.8
- Average sentence length: 8.5 words
- Longest passage: opening (123 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

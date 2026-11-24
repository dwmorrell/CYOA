# Literacy report: lock-in-at-castellan-hall v1

Story hash (sha256 of canonical JSON): `5844e9df01b3010922711655c55ba3e53227798c7e21a736e09bba60a4d83b3f`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **some failed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | sh-words: 40/10; closed-syllable-words: 100/12 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | FAIL | closed-syllable-words:key, closed-syllable-words:stage, closed-syllable-words:exit, closed-syllable-words:gate, closed-syllable-words:coin |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 537; digraph-sh: 52 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| sh words | 40 / 10 | 19 | none | ending-1: 17, ending-2: 17, ending-3: 21, ending-4: 20, ending-5: 16 |
| closed-syllable words | 100 / 12 | 20 | none | ending-1: 50, ending-2: 50, ending-3: 46, ending-4: 48, ending-5: 38 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 537 | an, and, as, ask, at, back, best, big, both, but, calm, check |
| Digraph sh | yes | 52 | crash, flash, flashes, hush, rush, rushed, she, shelf, shine, shock, shove, show |
| Digraph ch |  | 18 | check, chest, chose, reached, school, torch |
| Digraph th |  | 254 | both, other, others, something, that, the, theater, their, them, then, theo, there |
| Digraph wh |  | 1 | when |
| ck spelling |  | 42 | back, check, click, clock, crack, lock, locked, quick, shock, stuck, ticked, ticket |
| FLOSS rule (ff, ll, ss, zz) |  | 39 | call, fall, fell, full, grass, hall, small, still, tall, voss, wall, well |
| Beginning blend |  | 127 | clean, click, clock, close, clue, crack, crash, crawled, dry, flash, flashes, floor |
| ng / nk units |  | 19 | along, angle, footing, getting, lightning, long, losing, rang, showing, something, strange, swung |
| tch spelling |  | 2 | watch |
| Vowel-consonant-e syllable |  | 138 | above, before, beside, came, chose, close, gate, gave, give, gone, hole, home |
| Vowel team syllable |  | 96 | again, agreed, air, away, clean, clue, coat, curtain, day, dead, deep, eased |
| R-controlled syllable |  | 135 | air, around, before, careful, counter, curious, curtain, far, first, floor, for, founder |
| Suffix -ing |  | 7 | footing, getting, lightning, losing, showing, something, waiting |
| Suffix -ed |  | 32 | agreed, crawled, eased, fixed, helped, listened, locked, looked, moved, needed, reached, returned |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 5 glossary word(s) with a definition
- Tagged moments per objective: comprehension 2, inference 3, sequencing 2, vocabulary 1, detail 2, engagement 1

## Readability

- Words: 1152, average per passage 52.4
- Average sentence length: 8.5 words
- Longest passage: opening (123 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

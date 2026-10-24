# Literacy report: the-rain-courier v9

Story hash (sha256 of canonical JSON): `e292f73591dceecbc0838d8aa28734ff3d5d5f3d74f444f0edd2b0e7cd71c84c`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | closed-syllable-words: 43/10; sh-words: 28/8; ch-words: 28/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 595; digraph-sh: 63; digraph-ch: 38; suffix-ing: 21 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| closed syllable words | 43 / 10 | 15 | none | ending-1: 19, ending-2: 21, ending-3: 20, ending-4: 22, ending-5: 16 |
| sh words | 28 / 8 | 17 | none | ending-1: 13, ending-2: 13, ending-3: 14, ending-4: 14, ending-5: 12 |
| ch words | 28 / 8 | 15 | none | ending-1: 8, ending-2: 8, ending-3: 10, ending-4: 10, ending-5: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 595 | and, as, ask, at, back, bag, bell, best, big, black, box, bus |
| Digraph sh | yes | 63 | dash, dashed, flash, pushed, shade, shaded, she, shell, shelter, shone, shop, shops |
| Digraph ch | yes | 38 | chain, chase, check, checked, chest, chill, chip, choice, crouched, lunch, much, pouch |
| Digraph th |  | 247 | booth, breath, cloth, forth, nothing, other, thanks, that, the, their, them, then |
| Digraph wh |  | 17 | what, wheel, when, where, whispered, white, who, whole, why |
| ck spelling |  | 46 | back, black, check, checked, click, clicked, duck, hack, lock, locked, pick, picked |
| FLOSS rule (ff, ll, ss, zz) |  | 31 | all, bell, call, chill, fell, off, shell, small, still, tall, tell, will |
| Beginning blend |  | 171 | black, blinked, blinking, blue, breath, bridge, broker, click, clicked, close, closed, cloth |
| ng / nk units |  | 37 | along, blinked, blinking, crossing, doing, dripping, giving, humming, hung, link, long, longer |
| tch spelling |  | 4 | catch, patched, watch, watching |
| Vowel-consonant-e syllable |  | 170 | above, alone, anyone, are, ate, became, beside, bike, came, chase, close, come |
| Vowel team syllable |  | 159 | again, ahead, away, been, believe, blue, breath, captain, chain, clue, coat, courier |
| R-controlled syllable |  | 219 | after, are, arm, around, broker, courier, couriers, dark, door, doorway, early, easier |
| Suffix -ing | yes | 21 | blinking, crossing, dripping, giving, humming, morning, nothing, pounding, raining, rising, waiting, watching |
| Suffix -ed |  | 85 | asked, blinked, called, checked, clicked, closed, crossed, crouched, dashed, dropped, drummed, eased |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 4 glossary word(s) with a definition
- Tagged moments per objective: comprehension 9, inference 7, sequencing 5, vocabulary 3, detail 4, engagement 7

## Readability

- Words: 1518, average per passage 89.3
- Average sentence length: 7.4 words
- Longest passage: start (148 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

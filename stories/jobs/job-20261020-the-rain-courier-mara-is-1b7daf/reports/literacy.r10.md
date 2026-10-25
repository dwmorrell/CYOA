# Literacy report: the-rain-courier v10

Story hash (sha256 of canonical JSON): `b85216f7273e683c45a5f466abf8731d96ad2e78dd5a7ecfcc5a17854c52c8fb`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | closed-syllable-words: 47/10; sh-words: 29/8; ch-words: 29/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 626; digraph-sh: 69; digraph-ch: 41; suffix-ing: 23 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| closed syllable words | 47 / 10 | 16 | none | ending-1: 19, ending-2: 21, ending-3: 20, ending-4: 22, ending-5: 16 |
| sh words | 29 / 8 | 18 | none | ending-1: 13, ending-2: 13, ending-3: 14, ending-4: 14, ending-5: 12 |
| ch words | 29 / 8 | 16 | none | ending-1: 8, ending-2: 8, ending-3: 10, ending-4: 10, ending-5: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 626 | and, as, ask, at, back, bag, bell, best, big, black, box, brick |
| Digraph sh | yes | 69 | dash, dashed, flash, push, pushed, shade, shaded, she, shell, shelter, shone, shook |
| Digraph ch | yes | 41 | chain, chase, check, checked, chest, chill, chip, choice, crouched, lunch, much, pouch |
| Digraph th |  | 259 | booth, breath, cloth, forth, nothing, other, than, thanks, that, the, their, them |
| Digraph wh |  | 17 | what, wheel, when, where, whispered, white, who, whole, why |
| ck spelling |  | 47 | back, black, brick, check, checked, click, clicked, duck, hack, lock, locked, pick |
| FLOSS rule (ff, ll, ss, zz) |  | 35 | all, bell, call, chill, fell, off, shell, small, still, tall, tell, wall |
| Beginning blend |  | 182 | black, blinked, blinking, blue, breath, brick, bridge, broker, click, clicked, close, closed |
| ng / nk units |  | 39 | along, blinked, blinking, catching, crossing, doing, dripping, giving, humming, hung, link, long |
| tch spelling |  | 6 | catch, catching, patched, watch, watched, watching |
| Vowel-consonant-e syllable |  | 179 | above, alone, anyone, are, ate, became, beside, bike, came, chase, close, come |
| Vowel team syllable |  | 167 | again, ahead, away, been, believe, blue, breath, captain, chain, clue, coat, courier |
| R-controlled syllable |  | 231 | after, are, arm, around, broker, courier, couriers, dark, door, doorway, early, easier |
| Suffix -ing | yes | 23 | blinking, catching, crossing, dripping, giving, humming, morning, nothing, pounding, raining, rising, waiting |
| Suffix -ed |  | 91 | asked, blinked, called, checked, clicked, closed, crossed, crouched, dashed, dropped, drummed, eased |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 4 glossary word(s) with a definition
- Tagged moments per objective: comprehension 9, inference 8, sequencing 5, vocabulary 3, detail 4, engagement 8

## Readability

- Words: 1584, average per passage 88
- Average sentence length: 7.5 words
- Longest passage: start (148 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

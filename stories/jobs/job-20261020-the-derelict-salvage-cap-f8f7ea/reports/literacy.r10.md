# Literacy report: the-derelict-salvage v10

Story hash (sha256 of canonical JSON): `6941e4711b15b0ef86677ad9d067b4dd8f289263b8926e39123eb07f5c78ee09`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | vowel-team-words: 33/10; silent-e-words: 50/8; th-words: 59/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-th: 369; silent-e: 179; vowel-team: 199 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| vowel team words | 33 / 10 | 17 | none | ending-garden: 9, ending-carry: 17, ending-tow: 16, ending-closed: 11, ending-rush: 10 |
| silent e words | 50 / 8 | 21 | none | ending-garden: 24, ending-carry: 18, ending-tow: 17, ending-closed: 18, ending-rush: 16 |
| th words | 59 / 8 | 22 | none | ending-garden: 17, ending-carry: 20, ending-tow: 18, ending-closed: 14, ending-rush: 16 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 760 | an, and, as, ask, at, back, bag, best, big, bit, bot, box |
| Digraph sh |  | 38 | rushed, shaky, shapes, she, shelf, shell, shelves, ship, ships, shone, shut, smashed |
| Digraph ch |  | 25 | chalk, check, checked, choose, chose, each, inch, torch, touched |
| Digraph th | yes | 369 | breath, breathe, breathed, further, moth, moths, nothing, others, path, porthole, something, than |
| Digraph wh |  | 18 | what, wheel, when, where, whispered, white, whole, why |
| ck spelling |  | 40 | back, check, checked, dock, knocked, lock, locked, locker, packed, pick, stuck, thick |
| FLOSS rule (ff, ll, ss, zz) |  | 59 | all, call, dull, fell, full, glass, hiss, hull, off, shell, small, still |
| Beginning blend |  | 182 | blinked, blinking, blue, breath, breathe, breathed, bright, bring, brought, climb, climbed, close |
| ng / nk units |  | 42 | along, blinked, blinking, bring, clunk, glowing, going, humming, hung, ink, keeping, link |
| tch spelling |  | 13 | catch, hatch, latch, latches, scratched, scratches |
| Vowel-consonant-e syllable | yes | 179 | alive, alone, anyone, are, before, beside, came, care, case, cave, chose, close |
| Vowel team syllable | yes | 199 | aboard, again, ahead, air, aisle, beacon, beeped, between, blue, board, boat, breath |
| R-controlled syllable |  | 211 | aboard, after, air, are, arm, around, before, better, board, camera, care, cargo |
| Suffix -ing |  | 12 | blinking, glowing, humming, keeping, listening, moving, nothing, reading, something |
| Suffix -ed |  | 106 | asked, beeped, blinked, bobbed, breathed, bumped, checked, climbed, cooled, crawled, drifted, ended |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 10 glossary word(s) with a definition
- Tagged moments per objective: comprehension 11, inference 13, sequencing 10, vocabulary 7, detail 13, engagement 11

## Readability

- Words: 1773, average per passage 73.9
- Average sentence length: 6.7 words
- Longest passage: ending-garden (102 words)
- Words estimated at 4+ syllables: navigator, somebody

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

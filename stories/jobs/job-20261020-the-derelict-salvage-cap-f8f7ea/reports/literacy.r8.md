# Literacy report: the-derelict-salvage v8

Story hash (sha256 of canonical JSON): `95cf09caf6826e1dbae89efb249fffd499727ed9c0c9cf4a8c1a41298e53d458`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | vowel-team-words: 31/10; silent-e-words: 48/8; th-words: 57/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-th: 365; silent-e: 172; vowel-team: 197 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| vowel team words | 31 / 10 | 16 | none | ending-garden: 9, ending-carry: 17, ending-tow: 16, ending-closed: 11, ending-rush: 10 |
| silent e words | 48 / 8 | 20 | none | ending-garden: 24, ending-carry: 18, ending-tow: 17, ending-closed: 18, ending-rush: 16 |
| th words | 57 / 8 | 22 | none | ending-garden: 17, ending-carry: 20, ending-tow: 18, ending-closed: 14, ending-rush: 16 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 751 | an, and, as, ask, at, back, bag, best, big, bit, bot, box |
| Digraph sh |  | 38 | rushed, shaky, shapes, she, shelf, shell, shelves, ship, ships, shone, shut, smashed |
| Digraph ch |  | 23 | chalk, check, checked, choose, chose, each, inch, torch, touched |
| Digraph th | yes | 365 | breath, breathe, breathed, further, moth, moths, nothing, others, path, porthole, something, than |
| Digraph wh |  | 19 | what, wheel, when, where, whispered, white, who, whole, why |
| ck spelling |  | 39 | back, check, checked, dock, knocked, lock, locked, locker, packed, stuck, thick, tucked |
| FLOSS rule (ff, ll, ss, zz) |  | 57 | all, call, dull, fell, full, glass, hiss, hull, off, shell, small, still |
| Beginning blend |  | 179 | blinked, blinking, blue, breath, breathe, breathed, bright, bring, brought, climb, climbed, close |
| ng / nk units |  | 41 | along, blinked, blinking, bring, clunk, glowing, going, humming, hung, ink, keeping, link |
| tch spelling |  | 13 | catch, hatch, latch, latches, scratched, scratches |
| Vowel-consonant-e syllable | yes | 172 | alive, alone, anyone, are, before, beside, came, care, case, cave, chose, close |
| Vowel team syllable | yes | 197 | aboard, again, ahead, air, aisle, beacon, beeped, between, blue, board, boat, breath |
| R-controlled syllable |  | 213 | aboard, after, air, answers, are, arm, around, before, better, board, camera, care |
| Suffix -ing |  | 11 | blinking, glowing, humming, keeping, moving, nothing, reading, something |
| Suffix -ed |  | 105 | asked, beeped, blinked, bobbed, breathed, bumped, checked, climbed, cooled, crawled, drifted, ended |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 10 glossary word(s) with a definition
- Tagged moments per objective: comprehension 11, inference 13, sequencing 10, vocabulary 7, detail 12, engagement 11

## Readability

- Words: 1748, average per passage 72.8
- Average sentence length: 6.6 words
- Longest passage: ending-garden (102 words)
- Words estimated at 4+ syllables: navigator, somebody

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

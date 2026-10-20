# Literacy report: the-derelict-salvage v5

Story hash (sha256 of canonical JSON): `5248bc5efd3e254bee0e048296e05de49793f5fb2187828bcfb811f8b358956b`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **some failed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | vowel-team-words: 30/10; silent-e-words: 42/8; th-words: 48/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | FAIL | vowel-team-words:moon |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-th: 308; silent-e: 142; vowel-team: 174 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| vowel team words | 30 / 10 | 14 | none | ending-garden: 11, ending-carry: 18, ending-tow: 17, ending-closed: 10, ending-rush: 10 |
| silent e words | 42 / 8 | 17 | none | ending-garden: 24, ending-carry: 18, ending-tow: 17, ending-closed: 18, ending-rush: 16 |
| th words | 48 / 8 | 18 | none | ending-garden: 17, ending-carry: 20, ending-tow: 18, ending-closed: 14, ending-rush: 16 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 667 | an, and, as, ask, at, back, bag, best, big, bit, bot, bring |
| Digraph sh |  | 31 | rushed, she, shelf, shelves, ship, ships, shone, shut, smashed |
| Digraph ch |  | 17 | chalk, check, checked, choose, each, inch, torch |
| Digraph th | yes | 308 | breath, breathe, breathed, moth, moths, nothing, others, path, something, than, that, the |
| Digraph wh |  | 13 | what, wheel, when, where, whispered, white, whole |
| ck spelling |  | 33 | back, check, checked, dock, knocked, lock, locked, locker, packed, stuck, thick, tucked |
| FLOSS rule (ff, ll, ss, zz) |  | 44 | all, call, dull, fell, full, glass, hiss, hull, off, small, still, tall |
| Beginning blend |  | 153 | blinked, blue, breath, breathe, breathed, bright, bring, brought, climb, climbed, close, closely |
| ng / nk units |  | 35 | along, blinked, bring, clunk, glowing, going, humming, hung, ink, keeping, link, long |
| tch spelling |  | 8 | catch, hatch, latch, latches, scratches |
| Vowel-consonant-e syllable | yes | 142 | alive, alone, anyone, are, before, beside, came, case, cave, close, come, date |
| Vowel team syllable | yes | 174 | aboard, again, ahead, air, aisle, beacon, beeped, between, blue, board, boat, breath |
| R-controlled syllable |  | 185 | aboard, after, air, are, arm, around, before, better, board, camera, cargo, carry |
| Suffix -ing |  | 8 | glowing, humming, keeping, nothing, reading, something |
| Suffix -ed |  | 90 | beeped, blinked, bobbed, breathed, bumped, checked, climbed, cooled, crawled, drifted, ended, fixed |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 10 glossary word(s) with a definition
- Tagged moments per objective: comprehension 10, inference 9, sequencing 8, vocabulary 4, detail 9, engagement 6

## Readability

- Words: 1578, average per passage 78.9
- Average sentence length: 6.6 words
- Longest passage: ending-garden (102 words)
- Words estimated at 4+ syllables: navigator, somebody

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

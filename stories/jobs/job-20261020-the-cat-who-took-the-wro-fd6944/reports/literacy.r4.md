# Literacy report: the-cat-who-took-the-wrong-turn v4

Story hash (sha256 of canonical JSON): `3096c6f55ebf30b1b30aa67ef8c16fb0b319043bed14cd0fca36f94c16969157`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | blend-words: 67/10; closed-syllable-words: 44/8; ing-words: 18/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 778; initial-blend: 218; suffix-ing: 33 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| blend words | 67 / 10 | 16 | none | warm-den: 20, drum-song: 22, the-grab: 23, two-heads: 21, home-too-soon: 10 |
| closed syllable words | 44 / 8 | 14 | none | warm-den: 27, drum-song: 25, the-grab: 25, two-heads: 25, home-too-soon: 18 |
| ing words | 18 / 8 | 11 | none | warm-den: 11, drum-song: 10, the-grab: 12, two-heads: 9, home-too-soon: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 778 | am, and, as, ash, ask, at, back, bell, bend, big, both, box |
| Digraph sh |  | 46 | ash, marsh, pushed, shaking, shape, shared, she, shivering, shoe, shoes, shone, shook |
| Digraph ch |  | 24 | ache, arched, chain, cheered, crunched, each, lunch, reach, reached, school, squelch |
| Digraph th |  | 269 | another, anything, both, either, fifth, nothing, path, something, than, that, the, their |
| Digraph wh |  | 19 | what, whatever, when, where, while, whispered, who, whoever, whole |
| ck spelling |  | 16 | back, kicked, kicking, licked, locked, picked, quick, speck, stuck |
| FLOSS rule (ff, ll, ss, zz) |  | 50 | all, bell, class, fall, fell, glass, hall, hill, mill, moss, off, small |
| Beginning blend | yes | 218 | blinked, braver, bread, bright, brings, class, claws, climb, climbed, climbing, close, closely |
| ng / nk units |  | 56 | anything, banging, blinked, brings, climbing, glowing, going, hiding, holding, hung, jumping, kicking |
| tch spelling |  | 10 | catch, hatch, watched |
| Vowel-consonant-e syllable |  | 131 | above, advice, alive, alone, are, bare, came, close, come, creature, gate, gave |
| Vowel team syllable |  | 131 | afraid, again, against, ahead, air, been, bread, bright, chain, cheered, clues, creak |
| R-controlled syllable |  | 201 | after, air, another, apart, arched, are, around, bare, bigger, braver, cheered, creature |
| Suffix -ing | yes | 33 | anything, banging, climbing, glowing, hiding, holding, jumping, kicking, missing, nothing, ringing, rolling |
| Suffix -ed |  | 75 | arched, blinked, called, cheered, climbed, crunched, curled, filled, followed, frowned, grabbed, helped |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 8 glossary word(s) with a definition
- Tagged moments per objective: comprehension 11, inference 11, sequencing 8, vocabulary 3, detail 7, engagement 9

## Readability

- Words: 1722, average per passage 86.1
- Average sentence length: 8 words
- Longest passage: meet-lira (132 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

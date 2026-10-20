# Literacy report: the-cat-who-took-the-wrong-turn v2

Story hash (sha256 of canonical JSON): `edd3b9a554c9e554d518cf373ab9645e68ab3b6cd31a021d51ee321cb5e280bf`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | blend-words: 65/10; closed-syllable-words: 45/8; ing-words: 19/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 786; initial-blend: 220; suffix-ing: 34 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| blend words | 65 / 10 | 17 | none | warm-den: 20, drum-song: 22, the-grab: 20, two-heads: 21, home-too-soon: 11 |
| closed syllable words | 45 / 8 | 14 | none | warm-den: 28, drum-song: 26, the-grab: 26, two-heads: 26, home-too-soon: 19 |
| ing words | 19 / 8 | 12 | none | warm-den: 11, drum-song: 10, the-grab: 12, two-heads: 9, home-too-soon: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 786 | am, and, as, ash, ask, at, back, bag, bell, bend, big, both |
| Digraph sh |  | 45 | ash, marsh, pushed, shaking, shape, shared, she, shivering, shoe, shoes, shone, shook |
| Digraph ch |  | 24 | ache, arched, chain, cheered, crunched, each, lunch, reach, reached, school, squelch |
| Digraph th |  | 268 | another, anything, both, either, fifth, nothing, path, something, than, that, the, their |
| Digraph wh |  | 19 | what, whatever, when, where, while, whispered, who, whoever, whole |
| ck spelling |  | 18 | back, crack, kicked, kicking, licked, locked, picked, quick, speck, stuck |
| FLOSS rule (ff, ll, ss, zz) |  | 53 | all, bell, class, fall, fell, glass, hall, hill, mill, moss, off, small |
| Beginning blend | yes | 220 | blinked, braver, bread, bright, brings, class, claws, climb, climbed, climbing, close, closely |
| ng / nk units |  | 56 | anything, banging, blinked, brings, climbing, glowing, going, hiding, holding, hung, jumping, kicking |
| tch spelling |  | 10 | catch, hatch, watched |
| Vowel-consonant-e syllable |  | 130 | above, advice, alive, alone, are, bare, came, close, come, creature, gate, gave |
| Vowel team syllable |  | 131 | afraid, again, against, ahead, air, been, bread, bright, chain, cheered, clues, creak |
| R-controlled syllable |  | 198 | after, air, another, apart, arched, are, around, bare, bigger, braver, cheered, creature |
| Suffix -ing | yes | 34 | anything, banging, climbing, glowing, hiding, holding, jumping, kicking, missing, nothing, ringing, rolling |
| Suffix -ed |  | 74 | arched, blinked, called, cheered, climbed, crunched, curled, filled, followed, frowned, grabbed, helped |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 8 glossary word(s) with a definition
- Tagged moments per objective: comprehension 11, inference 11, sequencing 8, vocabulary 3, detail 7, engagement 9

## Readability

- Words: 1731, average per passage 86.6
- Average sentence length: 8.1 words
- Longest passage: ending-warm-den (132 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

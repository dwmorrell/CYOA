# Literacy report: the-cat-who-took-the-wrong-turn v6

Story hash (sha256 of canonical JSON): `d06ff38a05951996eb8178f9c87deba13384bd6405d598a6d8bc6415906e2c21`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | blend-words: 92/10; closed-syllable-words: 60/8; ing-words: 22/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 1060; initial-blend: 324; suffix-ing: 51 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| blend words | 92 / 10 | 26 | none | warm-den: 20, drum-song: 22, the-grab: 23, two-heads: 21, home-too-soon: 10 |
| closed syllable words | 60 / 8 | 22 | none | warm-den: 27, drum-song: 25, the-grab: 25, two-heads: 25, home-too-soon: 18 |
| ing words | 22 / 8 | 12 | none | warm-den: 11, drum-song: 10, the-grab: 12, two-heads: 9, home-too-soon: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 1060 | am, and, as, ash, ask, at, back, bag, bell, bend, bent, big |
| Digraph sh |  | 58 | ash, brush, marsh, pushed, shaking, shape, shared, she, shivering, shoe, shoes, shone |
| Digraph ch |  | 35 | ache, arched, chain, charm, check, checked, cheered, crouch, crouched, crunched, each, lunch |
| Digraph th |  | 371 | another, anything, both, breath, either, fifth, nothing, path, something, than, thank, thanks |
| Digraph wh |  | 22 | what, whatever, when, where, which, while, whispered, who, whoever, whole |
| ck spelling |  | 28 | back, check, checked, kicked, kicking, licked, locked, picked, quick, speck, stuck, tucked |
| FLOSS rule (ff, ll, ss, zz) |  | 77 | all, bell, call, class, fall, fell, glass, hall, hill, mill, moss, off |
| Beginning blend | yes | 324 | blinked, braver, bread, breath, bright, brings, brush, class, claws, climb, climbed, climbing |
| ng / nk units |  | 87 | anything, banging, blinked, brings, calling, climbing, frowning, giving, glowing, going, grinning, helping |
| tch spelling |  | 18 | catch, hatch, watch, watched, watching |
| Vowel-consonant-e syllable |  | 198 | above, advice, alive, alone, are, bare, before, came, close, come, creature, decide |
| Vowel team syllable |  | 184 | afraid, again, against, ahead, air, anyway, away, been, bread, breath, bright, chain |
| R-controlled syllable |  | 307 | after, air, another, apart, arched, are, around, bare, before, bigger, bird, braver |
| Suffix -ing | yes | 51 | anything, banging, calling, climbing, frowning, giving, glowing, grinning, helping, hiding, holding, hoping |
| Suffix -ed |  | 111 | arched, blinked, called, checked, cheered, climbed, crouched, crunched, curled, drifted, filled, followed |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 8 glossary word(s) with a definition
- Tagged moments per objective: comprehension 13, inference 16, sequencing 19, vocabulary 4, detail 14, engagement 27

## Readability

- Words: 2206, average per passage 58.1
- Average sentence length: 8.1 words
- Longest passage: meet-lira (132 words)
- Words estimated at 4+ syllables: carefully

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

# Literacy report: the-cat-who-took-the-wrong-turn v5

Story hash (sha256 of canonical JSON): `b760f2279f82427607a2967f861c43d84450207f877148e81428eb105d630d02`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | blend-words: 76/10; closed-syllable-words: 52/8; ing-words: 22/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 927; initial-blend: 274; suffix-ing: 49 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| blend words | 76 / 10 | 21 | none | warm-den: 20, drum-song: 22, the-grab: 23, two-heads: 21, home-too-soon: 10 |
| closed syllable words | 52 / 8 | 18 | none | warm-den: 27, drum-song: 25, the-grab: 25, two-heads: 25, home-too-soon: 18 |
| ing words | 22 / 8 | 12 | none | warm-den: 11, drum-song: 10, the-grab: 12, two-heads: 9, home-too-soon: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 927 | am, and, as, ash, ask, at, back, bag, bell, bend, bent, big |
| Digraph sh |  | 52 | ash, marsh, pushed, shaking, shape, shared, she, shivering, shoe, shoes, shone, shook |
| Digraph ch |  | 34 | ache, arched, chain, charm, check, checked, cheered, crouch, crouched, crunched, each, lunch |
| Digraph th |  | 326 | another, anything, both, breath, either, fifth, nothing, path, something, than, thank, thanks |
| Digraph wh |  | 21 | what, whatever, when, where, while, whispered, who, whoever, whole |
| ck spelling |  | 22 | back, check, checked, kicked, kicking, licked, locked, picked, quick, speck, stuck, tucked |
| FLOSS rule (ff, ll, ss, zz) |  | 64 | all, bell, call, class, fall, fell, glass, hall, hill, mill, moss, off |
| Beginning blend | yes | 274 | blinked, braver, bread, breath, bright, brings, class, claws, climb, climbed, climbing, close |
| ng / nk units |  | 78 | anything, banging, blinked, brings, calling, climbing, frowning, giving, glowing, going, grinning, helping |
| tch spelling |  | 12 | catch, hatch, watched |
| Vowel-consonant-e syllable |  | 151 | above, advice, alive, alone, are, bare, before, came, close, come, creature, face |
| Vowel team syllable |  | 161 | afraid, again, against, ahead, air, away, been, bread, breath, bright, chain, cheered |
| R-controlled syllable |  | 255 | after, air, another, apart, arched, are, around, bare, before, bigger, bird, braver |
| Suffix -ing | yes | 49 | anything, banging, calling, climbing, frowning, giving, glowing, grinning, helping, hiding, holding, hoping |
| Suffix -ed |  | 103 | arched, blinked, called, checked, cheered, climbed, crouched, crunched, curled, drifted, filled, followed |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 8 glossary word(s) with a definition
- Tagged moments per objective: comprehension 12, inference 15, sequencing 11, vocabulary 4, detail 11, engagement 19

## Readability

- Words: 2030, average per passage 70
- Average sentence length: 8 words
- Longest passage: meet-lira (132 words)
- Words estimated at 4+ syllables: carefully

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

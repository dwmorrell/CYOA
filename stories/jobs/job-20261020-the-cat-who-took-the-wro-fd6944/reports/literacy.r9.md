# Literacy report: the-cat-who-took-the-wrong-turn v9

Story hash (sha256 of canonical JSON): `78241e073084ca41d99594de2d7bf7298dadf0da74b2bb240d593f3fcf013aa6`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | blend-words: 105/10; closed-syllable-words: 66/8; ing-words: 30/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 1309; initial-blend: 417; suffix-ing: 78 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| blend words | 105 / 10 | 33 | none | warm-den: 21, drum-song: 23, the-grab: 24, two-heads: 22, home-too-soon: 11 |
| closed syllable words | 66 / 8 | 26 | none | warm-den: 27, drum-song: 25, the-grab: 25, two-heads: 25, home-too-soon: 18 |
| ing words | 30 / 8 | 19 | none | warm-den: 11, drum-song: 10, the-grab: 12, two-heads: 9, home-too-soon: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 1309 | am, and, as, ash, ask, at, back, bad, bag, bell, bend, bent |
| Digraph sh |  | 61 | ash, brush, brushed, flash, marsh, pushed, shaking, shape, shared, she, shivering, shoe |
| Digraph ch |  | 42 | ache, arched, chain, charm, check, checked, cheered, crouch, crouched, crunched, each, lunch |
| Digraph th |  | 437 | another, anything, both, breath, breathing, either, fifth, nothing, other, path, something, than |
| Digraph wh |  | 27 | what, whatever, when, where, which, while, whispered, who, whoever, whole |
| ck spelling |  | 39 | back, check, checked, kicked, kicking, licked, locked, picked, quick, speck, stuck, tucked |
| FLOSS rule (ff, ll, ss, zz) |  | 95 | all, bell, call, class, fall, fell, glass, hall, hill, less, mill, moss |
| Beginning blend | yes | 417 | blinked, brave, braver, bread, breath, breathing, bright, brings, brush, brushed, class, claws |
| ng / nk units |  | 118 | anything, banging, blinked, breathing, brings, calling, catching, climbing, feeling, frowning, giving, glowing |
| tch spelling |  | 19 | catch, catching, hatch, watch, watched, watching |
| Vowel-consonant-e syllable |  | 234 | above, advice, alive, alone, are, bare, before, brave, came, care, close, come |
| Vowel team syllable |  | 251 | afraid, again, against, ahead, air, anyway, away, beat, been, bread, breath, breathing |
| R-controlled syllable |  | 398 | after, air, another, answer, apart, arched, are, around, bare, before, bigger, bird |
| Suffix -ing | yes | 78 | anything, banging, breathing, calling, catching, climbing, feeling, frowning, giving, glowing, grinning, helping |
| Suffix -ed |  | 138 | arched, blinked, brushed, called, checked, cheered, climbed, counted, crouched, crunched, curled, decided |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 8 glossary word(s) with a definition
- Tagged moments per objective: comprehension 14, inference 16, sequencing 26, vocabulary 4, detail 23, engagement 40

## Readability

- Words: 2599, average per passage 50
- Average sentence length: 8.1 words
- Longest passage: meet-lira (132 words)
- Words estimated at 4+ syllables: carefully

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

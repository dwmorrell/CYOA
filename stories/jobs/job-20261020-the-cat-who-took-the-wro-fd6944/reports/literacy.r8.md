# Literacy report: the-cat-who-took-the-wrong-turn v8

Story hash (sha256 of canonical JSON): `b1da5f21b715cc7c61eccb3cb32dac16cb4cce75fe8695ce5305c6114cfdb293`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | blend-words: 95/10; closed-syllable-words: 64/8; ing-words: 29/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 1162; initial-blend: 352; suffix-ing: 62 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| blend words | 95 / 10 | 28 | none | warm-den: 21, drum-song: 23, the-grab: 24, two-heads: 22, home-too-soon: 11 |
| closed syllable words | 64 / 8 | 24 | none | warm-den: 27, drum-song: 25, the-grab: 25, two-heads: 25, home-too-soon: 18 |
| ing words | 29 / 8 | 18 | none | warm-den: 11, drum-song: 10, the-grab: 12, two-heads: 9, home-too-soon: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 1162 | am, and, as, ash, ask, at, back, bag, bell, bend, bent, big |
| Digraph sh |  | 59 | ash, brush, marsh, pushed, shaking, shape, shared, she, shivering, shoe, shoes, shone |
| Digraph ch |  | 40 | ache, arched, chain, charm, check, checked, cheered, crouch, crouched, crunched, each, lunch |
| Digraph th |  | 383 | another, anything, both, breath, either, fifth, nothing, path, something, than, thank, thanks |
| Digraph wh |  | 26 | what, whatever, when, where, which, whichever, while, whispered, who, whoever, whole |
| ck spelling |  | 33 | back, check, checked, kicked, kicking, licked, locked, picked, quick, speck, stuck, tucked |
| FLOSS rule (ff, ll, ss, zz) |  | 78 | all, bell, call, class, fall, fell, glass, hall, hill, mill, moss, off |
| Beginning blend | yes | 352 | blinked, brave, braver, bread, breath, bright, brings, brush, class, claws, climb, climbed |
| ng / nk units |  | 98 | anything, banging, blinked, brings, calling, climbing, feeling, frowning, giving, glowing, going, grinning |
| tch spelling |  | 18 | catch, hatch, watch, watched, watching |
| Vowel-consonant-e syllable |  | 211 | above, advice, alive, alone, are, bare, before, brave, came, care, close, come |
| Vowel team syllable |  | 201 | afraid, again, against, ahead, air, anyway, away, been, bread, breath, bright, chain |
| R-controlled syllable |  | 335 | after, air, another, apart, arched, are, around, bare, before, bigger, bird, braver |
| Suffix -ing | yes | 62 | anything, banging, calling, climbing, feeling, frowning, giving, glowing, grinning, helping, hiding, holding |
| Suffix -ed |  | 123 | arched, blinked, called, checked, cheered, climbed, crouched, crunched, curled, decided, drifted, filled |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 8 glossary word(s) with a definition
- Tagged moments per objective: comprehension 13, inference 16, sequencing 21, vocabulary 4, detail 16, engagement 29

## Readability

- Words: 2378, average per passage 59.5
- Average sentence length: 8.1 words
- Longest passage: meet-lira (132 words)
- Words estimated at 4+ syllables: carefully

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

# Literacy report: the-fog-over-pebble-bay v10

Story hash (sha256 of canonical JSON): `a8c9b949d8b86fef4c192ab22ec5defa231015c8bf471e9be306d8506aa0e77c`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | sh-words: 25/10; ch-words: 25/8; th-words: 19/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 436; digraph-sh: 49; digraph-ch: 26; digraph-th: 173 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| sh words | 25 / 10 | 11 | none | ending-beam: 14, ending-help: 15, ending-dock: 13 |
| ch words | 25 / 8 | 11 | none | ending-beam: 10, ending-help: 10, ending-dock: 7 |
| th words | 19 / 8 | 8 | none | ending-beam: 8, ending-help: 9, ending-dock: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 436 | an, and, as, ask, at, back, bench, bit, brass, but, can, chest |
| Digraph sh | yes | 49 | dish, fish, fishing, fresh, pushed, she, shed, shelf, shell, shine, shines, ship |
| Digraph ch | yes | 26 | bench, chain, chest, each, much |
| Digraph th | yes | 173 | breath, cloth, lighthouse, moth, path, that, the, their, then, there, they, thick |
| Digraph wh |  | 3 | what, whole |
| ck spelling |  | 21 | back, dock, picked, pocket, struck, thick, tucked, wick |
| FLOSS rule (ff, ll, ss, zz) |  | 55 | brass, call, dull, gull, off, pull, shell, small, smell, still, tell, tull |
| Beginning blend |  | 92 | brass, brave, breath, bright, broken, clean, climb, climbed, cloth, creaked, dry, flame |
| ng / nk units |  | 9 | asking, fishing, hung, long, rang, tapping, thing |
| tch spelling |  | 2 | match, matches |
| Vowel-consonant-e syllable |  | 40 | alone, are, brave, came, flame, gave, have, here, home, inside, more, one |
| Vowel team syllable |  | 78 | afraid, again, air, away, bay, beak, beam, been, boat, boats, breath, bright |
| R-controlled syllable |  | 87 | after, air, answer, answered, are, arm, around, circled, dark, door, every, far |
| Suffix -ing |  | 4 | asking, fishing, tapping |
| Suffix -ed |  | 43 | answered, asked, called, circled, climbed, creaked, danced, fluttered, folded, hopped, lifted, looked |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 18 glossary word(s) with a definition
- Tagged moments per objective: comprehension 2, inference 3, sequencing 1, vocabulary 1, detail 3, engagement 1

## Readability

- Words: 760, average per passage 63.3
- Average sentence length: 7.7 words
- Longest passage: ending-help (100 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

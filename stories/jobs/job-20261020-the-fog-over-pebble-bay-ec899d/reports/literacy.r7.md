# Literacy report: the-fog-over-pebble-bay v7

Story hash (sha256 of canonical JSON): `355704eddb3cb7d95d52baf365d301978de2b2462998053a06e8134a65dbbc1d`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | sh-words: 20/10; ch-words: 23/8; th-words: 16/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 401; digraph-sh: 42; digraph-ch: 24; digraph-th: 166 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| sh words | 20 / 10 | 8 | none | ending-beam: 14, ending-help: 15, ending-dock: 13 |
| ch words | 23 / 8 | 10 | none | ending-beam: 10, ending-help: 10, ending-dock: 7 |
| th words | 16 / 8 | 6 | none | ending-beam: 8, ending-help: 9, ending-dock: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 401 | an, and, as, ask, at, back, bench, bit, brass, but, can, chest |
| Digraph sh | yes | 42 | dish, fish, fishing, fresh, pushed, she, shed, shelf, shell, shine, shines, ship |
| Digraph ch | yes | 24 | bench, chain, chest, each, much |
| Digraph th | yes | 166 | breath, cloth, lighthouse, moth, path, that, the, their, then, there, they, thick |
| Digraph wh |  | 3 | what, whole |
| ck spelling |  | 21 | back, dock, pocket, struck, thick, tucked, wick |
| FLOSS rule (ff, ll, ss, zz) |  | 43 | brass, call, dull, gull, off, pull, shell, small, smell, tell, tull, wall |
| Beginning blend |  | 80 | brass, brave, breath, bright, broken, clean, climb, climbed, cloth, creaked, dry, flame |
| ng / nk units |  | 9 | asking, fishing, hung, rang, string, thing |
| tch spelling |  | 2 | match, matches |
| Vowel-consonant-e syllable |  | 39 | above, alone, are, brave, came, flame, gave, have, here, home, inside, more |
| Vowel team syllable |  | 72 | afraid, again, air, away, bay, beak, beam, been, boat, boats, breath, bright |
| R-controlled syllable |  | 89 | after, air, answer, answered, are, arm, around, burns, circled, dark, door, every |
| Suffix -ing |  | 5 | asking, fishing, string |
| Suffix -ed |  | 39 | answered, asked, called, circled, climbed, creaked, danced, fluttered, folded, hopped, lifted, looked |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok typing-balance: 1 typing puzzle(s) in 8 non-ending passages (aim: 1 to 2)
- ok word-help-definitions: 18 glossary word(s) with a definition
- Tagged moments per objective: comprehension 2, inference 2, sequencing 1, vocabulary 1, detail 2, engagement 1

## Readability

- Words: 713, average per passage 64.8
- Average sentence length: 7.8 words
- Longest passage: ending-help (99 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

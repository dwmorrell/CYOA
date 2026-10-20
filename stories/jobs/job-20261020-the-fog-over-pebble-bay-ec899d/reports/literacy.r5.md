# Literacy report: the-fog-over-pebble-bay v5

Story hash (sha256 of canonical JSON): `6d770b50628b3e831957f892cd2126b2e18237a2ee2eb4e6b25257274b428d6c`
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
| target-concepts-present | pass | closed-syllable: 377; digraph-sh: 43; digraph-ch: 24; digraph-th: 155 |
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
| Closed syllable | yes | 377 | an, and, as, ask, at, back, bench, bit, brass, but, can, chest |
| Digraph sh | yes | 43 | dish, fish, fishing, fresh, pushed, she, shed, shelf, shell, shine, shines, ship |
| Digraph ch | yes | 24 | bench, chain, chest, each, much |
| Digraph th | yes | 155 | breath, cloth, lighthouse, moth, path, that, the, their, then, there, they, thick |
| Digraph wh |  | 3 | what, whole |
| ck spelling |  | 20 | back, dock, pocket, struck, thick, tucked, wick |
| FLOSS rule (ff, ll, ss, zz) |  | 41 | brass, call, dull, gull, off, pull, shell, small, smell, tell, tull, wall |
| Beginning blend |  | 80 | brass, brave, breath, bright, broken, clean, climb, climbed, cloth, creaked, dry, flame |
| ng / nk units |  | 7 | asking, fishing, hung, rang, thing |
| tch spelling |  | 2 | match, matches |
| Vowel-consonant-e syllable |  | 38 | alone, are, brave, came, flame, gave, have, here, home, inside, more, one |
| Vowel team syllable |  | 72 | afraid, again, air, away, bay, beak, beam, been, boat, boats, breath, bright |
| R-controlled syllable |  | 82 | after, air, answer, answered, are, arm, around, circled, dark, door, every, far |
| Suffix -ing |  | 3 | asking, fishing |
| Suffix -ed |  | 37 | answered, asked, called, circled, climbed, creaked, danced, fluttered, folded, hopped, lifted, looked |

## Learning design (master spec; advisory, does not fail validation)

- NEEDS WORK learning-targets-tagged: no moments tagged for: comprehension, inference, sequencing, vocabulary, detail, engagement
- NEEDS WORK typing-balance: 0 typing puzzle(s) in 8 non-ending passages (aim: 1 to 2)
- ok word-help-definitions: 18 glossary word(s) with a definition
- Tagged moments per objective: comprehension 0, inference 0, sequencing 0, vocabulary 0, detail 0, engagement 0

## Readability

- Words: 690, average per passage 62.7
- Average sentence length: 7.6 words
- Longest passage: start (82 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

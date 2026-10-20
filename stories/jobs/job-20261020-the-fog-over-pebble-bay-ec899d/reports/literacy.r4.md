# Literacy report: the-fog-over-pebble-bay v4

Story hash (sha256 of canonical JSON): `b0ba0f43e2ab77de78e3dfc97c81301b22046c659fdb4f16a83d32661d388b4a`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | sh-words: 20/10; ch-words: 20/8; th-words: 17/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 379; digraph-sh: 40; digraph-ch: 21; digraph-th: 150 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| sh words | 20 / 10 | 8 | none | ending-beam: 14, ending-help: 15, ending-dock: 13 |
| ch words | 20 / 8 | 10 | none | ending-beam: 9, ending-help: 9, ending-dock: 7 |
| th words | 17 / 8 | 7 | none | ending-beam: 7, ending-help: 8, ending-dock: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 379 | an, and, as, ask, at, back, bench, bit, brass, but, can, chest |
| Digraph sh | yes | 40 | dish, fish, fishing, fresh, pushed, she, shed, shelf, shell, shine, shines, ship |
| Digraph ch | yes | 21 | bench, chain, chest, each, much |
| Digraph th | yes | 150 | cloth, lighthouse, moth, path, that, the, their, then, there, they, thick, thing |
| Digraph wh |  | 3 | what, whole |
| ck spelling |  | 21 | back, dock, pocket, struck, thick, tucked, wick |
| FLOSS rule (ff, ll, ss, zz) |  | 44 | brass, call, dull, glass, gull, off, pull, shell, small, smell, tell, tull |
| Beginning blend |  | 79 | brass, brave, bright, broken, clean, climb, climbed, cloth, creaked, dry, flame, flat |
| ng / nk units |  | 7 | asking, fishing, hung, rang, thing |
| tch spelling |  | 2 | match, matches |
| Vowel-consonant-e syllable |  | 39 | alone, are, brave, came, flame, gave, home, inside, made, more, one, shine |
| Vowel team syllable |  | 70 | afraid, again, air, away, bay, beak, beam, been, boat, boats, bright, chain |
| R-controlled syllable |  | 82 | after, air, answer, answered, are, arm, around, circled, dark, door, every, far |
| Suffix -ing |  | 3 | asking, fishing |
| Suffix -ed |  | 35 | answered, asked, called, circled, climbed, creaked, danced, fluttered, folded, hopped, lifted, looked |

## Readability

- Words: 682, average per passage 62
- Average sentence length: 8.1 words
- Longest passage: ending-dock (85 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

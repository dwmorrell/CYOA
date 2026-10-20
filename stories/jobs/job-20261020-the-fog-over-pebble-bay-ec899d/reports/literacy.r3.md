# Literacy report: the-fog-over-pebble-bay v3

Story hash (sha256 of canonical JSON): `0d372d78d927985873258fe1a524921ead014eecc012ef9f98b0144da8f3400d`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | sh-words: 19/10; ch-words: 17/8; th-words: 16/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 353; digraph-sh: 39; digraph-ch: 18; digraph-th: 143 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| sh words | 19 / 10 | 7 | none | ending-beam: 15, ending-help: 16, ending-lantern: 14 |
| ch words | 17 / 8 | 8 | none | ending-beam: 12, ending-help: 12, ending-lantern: 8 |
| th words | 16 / 8 | 6 | none | ending-beam: 7, ending-help: 7, ending-lantern: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 353 | an, and, as, ask, at, back, bench, bit, brass, but, can, chest |
| Digraph sh | yes | 39 | dish, fish, fishing, fresh, pushed, she, shed, shelf, shell, shine, shines, ship |
| Digraph ch | yes | 18 | bench, chain, chest, each, much |
| Digraph th | yes | 143 | cloth, lighthouse, moth, path, that, the, their, then, there, they, thick, thing |
| Digraph wh |  | 3 | what, whole |
| ck spelling |  | 20 | back, dock, pocket, struck, thick, tucked, wick |
| FLOSS rule (ff, ll, ss, zz) |  | 42 | brass, call, dull, glass, gull, off, pull, shell, small, smell, tell, tull |
| Beginning blend |  | 75 | brass, brave, bright, broken, clean, climb, climbed, cloth, creaked, dry, flame, flat |
| ng / nk units |  | 7 | asking, fishing, hung, rang, thing |
| tch spelling |  | 2 | match, matches |
| Vowel-consonant-e syllable |  | 38 | alone, are, brave, came, flame, gave, home, inside, more, one, shine, shone |
| Vowel team syllable |  | 68 | afraid, again, air, away, bay, beak, beam, been, boat, boats, bright, chain |
| R-controlled syllable |  | 76 | after, air, answer, answered, are, arm, around, circled, dark, door, every, far |
| Suffix -ing |  | 3 | asking, fishing |
| Suffix -ed |  | 34 | answered, asked, called, circled, climbed, creaked, danced, fluttered, folded, hopped, lifted, looked |

## Readability

- Words: 634, average per passage 57.6
- Average sentence length: 7.9 words
- Longest passage: ending-lantern (79 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

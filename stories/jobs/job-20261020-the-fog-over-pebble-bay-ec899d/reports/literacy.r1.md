# Literacy report: the-fog-over-pebble-bay v1

Story hash (sha256 of canonical JSON): `d6eb1df5cb871d604fd1317aa6a29dd4cc8e1700d8a66a82c66c90d4335ba6d6`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | sh-words: 18/10; ch-words: 15/8; th-words: 19/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | closed-syllable: 366; digraph-sh: 37; digraph-ch: 17; digraph-th: 149 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| sh words | 18 / 10 | 7 | none | ending-beam: 16, ending-help: 14, ending-lantern: 14 |
| ch words | 15 / 8 | 7 | none | ending-beam: 8, ending-help: 10, ending-lantern: 8 |
| th words | 19 / 8 | 9 | none | ending-beam: 9, ending-help: 10, ending-lantern: 8 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable | yes | 366 | an, and, ask, at, back, bench, bit, brass, bright, but, call, can |
| Digraph sh | yes | 37 | dish, fish, fishing, fresh, pushed, she, shed, shelf, shell, shines, ship, shone |
| Digraph ch | yes | 17 | bench, chain, chased, chest, each, much |
| Digraph th | yes | 149 | cloth, lighthouse, moth, path, than, that, the, their, then, there, they, thick |
| Digraph wh |  | 3 | what, whole |
| ck spelling |  | 14 | back, dock, pocket, thick, tucked, wick |
| FLOSS rule (ff, ll, ss, zz) |  | 39 | brass, call, dull, glass, gull, off, shell, small, smell, tell, tull, wall |
| Beginning blend |  | 74 | brass, brave, bright, broken, clean, climb, climbed, cloth, creaked, dry, flame, flat |
| ng / nk units |  | 9 | asking, fishing, hung, longer, rang, thing, think |
| Vowel-consonant-e syllable |  | 31 | alone, brave, came, flame, gave, home, inside, late, more, one, shone, sure |
| Vowel team syllable |  | 63 | afraid, again, ahead, air, away, bay, beak, beam, been, boat, boats, bright |
| R-controlled syllable |  | 76 | after, air, answer, answered, around, dark, door, every, far, faster, first, fluttered |
| Suffix -ing |  | 3 | asking, fishing |
| Suffix -ed |  | 31 | answered, asked, called, chased, climbed, creaked, danced, fluttered, folded, hopped, lifted, looked |

## Readability

- Words: 589, average per passage 53.5
- Average sentence length: 7.6 words
- Longest passage: ending-lantern (67 words)
- Words estimated at 4+ syllables: none

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

# Literacy report: static-at-cragmoor-hall v3

Story hash (sha256 of canonical JSON): `4e750af3b553ef45f942b2ac48db90f6f1ee12a24ed7ce3f3749c20046135956`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | r-controlled-words: 44/10; ck-words: 61/12 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-ck: 85; r-controlled: 295 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| r-controlled words | 44 / 10 | 22 | none | ending-trust: 12, ending-honest-ask: 12, ending-call-pell: 12, ending-jump-to-ghost: 12, ending-rush-alone: 13 |
| ck words | 61 / 12 | 22 | none | ending-trust: 26, ending-honest-ask: 24, ending-call-pell: 24, ending-jump-to-ghost: 22, ending-rush-alone: 14 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 634 | act, an, and, as, ask, at, back, bad, both, brass, but, calm |
| Digraph sh |  | 27 | bookshelf, cushions, hush, marsh, shape, shared, sharp, she, shed, shelf, short, should |
| Digraph ch |  | 23 | chain, chairs, check, children, chin, chose, finch, reach, reached, school, search, teacher |
| Digraph th |  | 324 | beneath, both, breath, everything, further, grandmother, other, something, than, thanks, that, the |
| Digraph wh |  | 18 | what, wheel, when, while, who, whoever, whole, why |
| ck spelling | yes | 85 | back, backing, check, click, clock, crack, flicked, knock, knocked, knocking, knocks, lock |
| FLOSS rule (ff, ll, ss, zz) |  | 68 | all, brass, call, fell, glass, hall, off, pell, small, still, tall, tell |
| Beginning blend |  | 168 | blanket, brass, brave, breath, broken, clear, click, climb, climbed, clock, close, closer |
| ng / nk units |  | 67 | along, angry, asking, backing, blanket, comparing, danger, deciding, drawing, everything, finger, getting |
| tch spelling |  | 14 | fetch, hatch, match, matched, scratches, sketch, watch |
| Vowel-consonant-e syllable |  | 167 | above, advice, alone, anyone, anywhere, are, assume, before, beside, brave, came, care |
| Vowel team syllable |  | 205 | again, against, agreed, ahead, already, anyway, asleep, away, beam, been, believe, believed |
| R-controlled syllable | yes | 295 | answer, anywhere, are, around, arrived, before, bigger, bird, board, care, careful, carve |
| Suffix -ing |  | 37 | asking, backing, comparing, deciding, drawing, everything, getting, jumping, keeping, knocking, making, missing |
| Suffix -ed |  | 70 | agreed, arrived, asked, believed, called, climbed, counted, covered, decided, flicked, folded, haunted |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 11 glossary word(s) with a definition
- Tagged moments per objective: comprehension 12, inference 8, sequencing 4, vocabulary 2, detail 7, engagement 7

## Readability

- Words: 1706, average per passage 77.5
- Average sentence length: 9.7 words
- Longest passage: theo-marsh (129 words)
- Words estimated at 4+ syllables: everything, everywhere, explanation, remembered

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

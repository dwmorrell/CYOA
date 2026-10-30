# Literacy report: the-tomb-of-ameru v4

Story hash (sha256 of canonical JSON): `804900083a40b454b7351983ed7e5ccd0661a42d61223a0c35acf935982d0c2e`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | r-controlled-words: 44/10; ed-endings: 24/8; ng-and-nk-words: 24/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | glued-ng-nk: 85; r-controlled: 385; suffix-ed: 169 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| r-controlled words | 44 / 10 | 19 | none | keeper-friend: 17, open-lid: 17, every-line: 18, door-sealed: 17, another-day: 15, another-day-early: 9 |
| ed endings | 24 / 8 | 17 | none | keeper-friend: 10, open-lid: 11, every-line: 10, door-sealed: 9, another-day: 4, another-day-early: 2 |
| ng and nk words | 24 / 8 | 16 | none | keeper-friend: 14, open-lid: 16, every-line: 15, door-sealed: 15, another-day: 7, another-day-early: 3 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 855 | an, and, as, ask, at, back, bad, bank, bell, belt, bent, big |
| Digraph sh |  | 46 | brush, brushed, finish, fresh, push, pushed, rushed, shaky, shapes, shirt, shook, should |
| Digraph ch |  | 49 | arch, archaeologist, chamber, chambers, check, checked, children, each, much, reach, reached, school |
| Digraph th |  | 380 | another, beneath, both, bothered, breath, cloth, everything, fourth, further, mouth, nothing, other |
| Digraph wh |  | 15 | what, when, where, while, whispered, who, whole, why |
| ck spelling |  | 44 | back, black, check, checked, clicked, crack, cracked, cracks, knock, lock, luck, lucky |
| FLOSS rule (ff, ll, ss, zz) |  | 57 | all, bell, call, cross, fell, hall, hill, less, off, puff, small, still |
| Beginning blend |  | 213 | black, blew, blow, blown, break, breath, bright, broken, bronze, brush, brushed, clapped |
| ng / nk units | yes | 85 | along, asking, bank, being, carving, carvings, catching, copying, drank, everything, finger, fingers |
| tch spelling |  | 5 | catch, catching, scratched, snatched, watch |
| Vowel-consonant-e syllable |  | 222 | above, are, aside, ate, awake, before, beside, came, care, come, crate, decide |
| Vowel team syllable |  | 276 | again, agree, ahead, air, always, ancient, anyway, away, been, beneath, break, breath |
| R-controlled syllable | yes | 385 | afternoon, air, ameru, another, arch, archaeologist, are, arm, bark, before, better, bigger |
| Suffix -ing |  | 36 | asking, carving, catching, copying, everything, groaning, holding, leaving, listening, looking, missing, moving |
| Suffix -ed | yes | 169 | asked, bothered, bounced, brushed, carved, checked, circled, clapped, clicked, climbed, closed, copied |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 4 glossary word(s) with a definition
- Tagged moments per objective: comprehension 27, inference 25, sequencing 10, vocabulary 8, detail 22, engagement 22

## Readability

- Words: 2225, average per passage 61.8
- Average sentence length: 7.4 words
- Longest passage: ending-lid (93 words)
- Words estimated at 4+ syllables: archaeologist, carefully, everything, excitement

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

# Literacy report: the-tomb-of-ameru v2

Story hash (sha256 of canonical JSON): `432e393ecefc6fdf6c5ed18d98735aa0489e284c080c830d3673f9326752ca89`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | r-controlled-words: 40/10; ed-endings: 29/8; ng-and-nk-words: 22/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | glued-ng-nk: 79; r-controlled: 341; suffix-ed: 151 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| r-controlled words | 40 / 10 | 18 | none | keeper-friend: 17, open-lid: 17, every-line: 18, door-sealed: 17, another-day: 19 |
| ed endings | 29 / 8 | 20 | none | keeper-friend: 11, open-lid: 12, every-line: 11, door-sealed: 9, another-day: 8 |
| ng and nk words | 22 / 8 | 14 | none | keeper-friend: 14, open-lid: 16, every-line: 15, door-sealed: 15, another-day: 14 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 799 | an, and, as, ask, at, back, bad, bank, bell, belt, bent, big |
| Digraph sh |  | 36 | brush, brushed, finish, fresh, push, pushed, shaky, shapes, shook, should, shove, showed |
| Digraph ch |  | 48 | arch, archaeologist, chamber, chambers, check, checked, children, each, much, reach, school, scorch |
| Digraph th |  | 368 | another, beneath, both, bothered, breath, cloth, everything, fourth, mouth, nothing, other, path |
| Digraph wh |  | 15 | what, where, while, whispered, who, whole, why |
| ck spelling |  | 34 | back, black, check, checked, clicked, crack, cracked, cracks, knock, lock, lucky, quick |
| FLOSS rule (ff, ll, ss, zz) |  | 54 | all, bell, cross, fell, hall, hill, less, off, puff, small, still, tall |
| Beginning blend |  | 194 | black, blew, blow, blown, break, breath, bright, broken, bronze, brush, brushed, clapped |
| ng / nk units | yes | 79 | along, asking, bank, being, carving, carvings, copying, drank, everything, finger, fingers, going |
| tch spelling |  | 3 | scratched, snatched, watch |
| Vowel-consonant-e syllable |  | 196 | above, are, aside, ate, awake, before, beside, came, care, come, crate, done |
| Vowel team syllable |  | 224 | again, ahead, air, ancient, anyway, away, been, beneath, break, breath, bright, clay |
| R-controlled syllable | yes | 341 | after, afternoon, air, ameru, another, arch, archaeologist, are, bark, before, better, bigger |
| Suffix -ing |  | 33 | asking, carving, copying, everything, groaning, holding, leaving, listening, looking, missing, moving, nothing |
| Suffix -ed | yes | 151 | asked, bothered, bounced, brushed, carved, checked, circled, clapped, clicked, climbed, closed, copied |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 4 glossary word(s) with a definition
- Tagged moments per objective: comprehension 18, inference 25, sequencing 10, vocabulary 8, detail 22, engagement 14

## Readability

- Words: 2039, average per passage 58.3
- Average sentence length: 7.3 words
- Longest passage: ending-lid (93 words)
- Words estimated at 4+ syllables: archaeologist, everything

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

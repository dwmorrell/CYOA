# Literacy report: the-tomb-of-ameru v1

Story hash (sha256 of canonical JSON): `f0d5ae7ad137fe625a272778bf3a818df2fca32511c56e9dda523109a3255053`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | r-controlled-words: 32/10; ed-endings: 25/8; ng-and-nk-words: 21/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | glued-ng-nk: 56; r-controlled: 262; suffix-ed: 119 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| r-controlled words | 32 / 10 | 15 | none | keeper-friend: 17, open-lid: 17, every-line: 18, door-sealed: 17, another-day: 19 |
| ed endings | 25 / 8 | 16 | none | keeper-friend: 11, open-lid: 12, every-line: 11, door-sealed: 9, another-day: 8 |
| ng and nk words | 21 / 8 | 13 | none | keeper-friend: 14, open-lid: 16, every-line: 15, door-sealed: 15, another-day: 14 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 650 | an, and, as, ask, at, back, bad, bank, bell, belt, bent, big |
| Digraph sh |  | 34 | brush, brushed, finish, fresh, push, pushed, shaky, shook, should, shove, showed, shows |
| Digraph ch |  | 39 | arch, archaeologist, chamber, chambers, checked, children, each, much, reach, school, scorch, teaches |
| Digraph th |  | 296 | another, beneath, both, bothered, breath, cloth, everything, fourth, mouth, nothing, other, path |
| Digraph wh |  | 12 | what, where, whispered, who, whole, why |
| ck spelling |  | 21 | back, black, checked, clicked, crack, knock, lock, rock, tucked |
| FLOSS rule (ff, ll, ss, zz) |  | 48 | all, bell, cross, fell, hall, hill, less, off, puff, small, still, tall |
| Beginning blend |  | 156 | black, blew, blow, breath, bright, broken, bronze, brush, brushed, clapped, clay, clear |
| ng / nk units | yes | 56 | asking, bank, carving, everything, finger, going, groaning, holding, listening, long, looking, missing |
| tch spelling |  | 2 | snatched, watch |
| Vowel-consonant-e syllable |  | 157 | above, are, aside, ate, awake, beside, came, care, come, crate, done, everyone |
| Vowel team syllable |  | 182 | again, ahead, air, ancient, anyway, away, been, beneath, breath, bright, clay, clear |
| R-controlled syllable | yes | 262 | after, afternoon, air, ameru, another, arch, archaeologist, are, bark, better, bigger, bird |
| Suffix -ing |  | 20 | asking, carving, everything, groaning, holding, listening, looking, missing, nothing, something, spring, warning |
| Suffix -ed | yes | 119 | asked, bothered, bounced, brushed, carved, checked, clapped, clicked, climbed, closed, coughed, counted |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 4 glossary word(s) with a definition
- Tagged moments per objective: comprehension 16, inference 16, sequencing 9, vocabulary 6, detail 11, engagement 9

## Readability

- Words: 1681, average per passage 67.2
- Average sentence length: 7.1 words
- Longest passage: ending-lid (93 words)
- Words estimated at 4+ syllables: archaeologist, everything

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

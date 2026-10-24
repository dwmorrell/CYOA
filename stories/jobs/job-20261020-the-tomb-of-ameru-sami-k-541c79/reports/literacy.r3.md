# Literacy report: the-tomb-of-ameru v3

Story hash (sha256 of canonical JSON): `e8976c26953db7e8057a393830daad518602d47dc1fe0aa8baaeae1a68094907`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | r-controlled-words: 40/10; ed-endings: 27/8; ng-and-nk-words: 23/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | glued-ng-nk: 81; r-controlled: 365; suffix-ed: 164 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| r-controlled words | 40 / 10 | 18 | none | keeper-friend: 17, open-lid: 17, every-line: 18, door-sealed: 17, another-day: 8 |
| ed endings | 27 / 8 | 18 | none | keeper-friend: 11, open-lid: 12, every-line: 11, door-sealed: 9, another-day: 2 |
| ng and nk words | 23 / 8 | 15 | none | keeper-friend: 14, open-lid: 16, every-line: 15, door-sealed: 15, another-day: 3 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 840 | an, and, as, ask, at, back, bad, bank, bell, belt, bent, big |
| Digraph sh |  | 44 | brush, brushed, finish, fresh, push, pushed, shaky, shapes, shirt, shook, should, shove |
| Digraph ch |  | 48 | arch, archaeologist, chamber, chambers, check, checked, children, each, much, reach, reached, school |
| Digraph th |  | 373 | another, beneath, both, bothered, breath, cloth, everything, fourth, further, mouth, nothing, other |
| Digraph wh |  | 15 | what, when, where, while, whispered, who, whole, why |
| ck spelling |  | 43 | back, black, check, checked, clicked, crack, cracked, cracks, knock, lock, luck, lucky |
| FLOSS rule (ff, ll, ss, zz) |  | 55 | all, bell, call, cross, fell, hall, hill, less, off, puff, small, still |
| Beginning blend |  | 206 | black, blew, blow, blown, break, breath, bright, broken, bronze, brush, brushed, clapped |
| ng / nk units | yes | 81 | along, asking, bank, being, carving, carvings, copying, drank, everything, finger, fingers, going |
| tch spelling |  | 3 | scratched, snatched, watch |
| Vowel-consonant-e syllable |  | 215 | above, are, aside, ate, awake, before, beside, came, care, come, crate, decide |
| Vowel team syllable |  | 262 | again, agree, ahead, air, always, ancient, anyway, away, been, beneath, break, breath |
| R-controlled syllable | yes | 365 | after, afternoon, air, ameru, another, arch, archaeologist, are, bark, before, better, bigger |
| Suffix -ing |  | 34 | asking, carving, copying, everything, groaning, holding, leaving, listening, looking, missing, moving, nothing |
| Suffix -ed | yes | 164 | asked, bothered, bounced, brushed, carved, checked, circled, clapped, clicked, climbed, closed, copied |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 4 glossary word(s) with a definition
- Tagged moments per objective: comprehension 26, inference 25, sequencing 10, vocabulary 8, detail 22, engagement 21

## Readability

- Words: 2140, average per passage 61.1
- Average sentence length: 7.2 words
- Longest passage: ending-lid (93 words)
- Words estimated at 4+ syllables: archaeologist, carefully, everything, excitement

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

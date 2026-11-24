# Literacy report: nine-hours-below-snowline v1

Story hash (sha256 of canonical JSON): `ff6b4d1879b9b5a15aaf1163fa0fef7dec45d4a539b4e00e8b0bf433af21aa2f`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | floss-words: 37/10; initial-blend-words: 73/12 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | floss: 77; initial-blend: 247 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| floss words | 37 / 10 | 17 | none | ending-1: 13, ending-2: 13, ending-3: 11, ending-4: 13, ending-5: 11 |
| initial-blend words | 73 / 12 | 19 | none | ending-1: 33, ending-2: 35, ending-3: 33, ending-4: 36, ending-5: 29 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 609 | an, and, as, at, back, bad, bent, big, both, brush, but, calm |
| Digraph sh |  | 30 | brush, crushed, flashlight, fresh, makeshift, push, rush, shaking, shape, shared, shares, sharing |
| Digraph ch |  | 34 | charge, check, checking, checkpoint, chill, choice, choose, chose, each, much, reached, school |
| Digraph th |  | 256 | anything, both, breath, cloth, either, everything, other, others, something, strength, thank, that |
| Digraph wh |  | 13 | what, when, where, which, white, whole |
| ck spelling |  | 54 | back, blocked, check, checking, checkpoint, crack, pack, packed, packs, picked, pocket, rock |
| FLOSS rule (ff, ll, ss, zz) | yes | 77 | all, chill, class, cliff, cross, fall, full, grass, mess, off, pass, small |
| Beginning blend | yes | 247 | blocked, break, breath, bright, brush, class, clearly, cliff, climb, climbed, climbing, close |
| ng / nk units |  | 68 | along, ankle, anything, asking, checking, climbing, crossing, drifting, everything, fading, failing, fixing |
| tch spelling |  | 6 | matched, patch, watch |
| Vowel-consonant-e syllable |  | 174 | above, alone, anyone, are, base, before, beside, came, care, case, chose, close |
| Vowel team syllable |  | 201 | again, against, agreed, ahead, aid, air, already, always, away, between, break, breath |
| R-controlled syllable |  | 257 | after, air, are, arm, arms, around, before, better, buried, care, careful, carefully |
| Suffix -ing |  | 35 | anything, asking, checking, climbing, crossing, drifting, everything, fading, failing, fixing, knowing, looking |
| Suffix -ed |  | 97 | agreed, blocked, buried, climbed, covered, crossed, crushed, curved, dipped, dropped, faded, failed |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 12 glossary word(s) with a definition
- Tagged moments per objective: comprehension 6, inference 4, sequencing 6, vocabulary 3, detail 4, engagement 9

## Readability

- Words: 1513, average per passage 72
- Average sentence length: 11.4 words
- Longest passage: start (120 words)
- Words estimated at 4+ syllables: carefully, everything, remembered, somebody

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

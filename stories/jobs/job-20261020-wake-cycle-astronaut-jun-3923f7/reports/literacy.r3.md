# Literacy report: wake-cycle v3

Story hash (sha256 of canonical JSON): `7e76e392d8f721e2089a124c8ab77de12558075f1be58f38450a12ec55c99593`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | wh-words: 33/10; ck-words: 40/8; tch-words: 29/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-wh: 48; digraph-ck: 59; trigraph-tch: 36 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| wh words | 33 / 10 | 17 | none | clear-road: 13, steady-hands: 12, sensor-mast: 12, many-hands: 10, drifting-quiet: 10 |
| ck words | 40 / 8 | 15 | none | clear-road: 25, steady-hands: 22, sensor-mast: 24, many-hands: 21, drifting-quiet: 20 |
| tch words | 29 / 8 | 11 | none | clear-road: 13, steady-hands: 13, sensor-mast: 14, many-hands: 17, drifting-quiet: 13 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 657 | act, am, an, and, as, ask, at, back, backs, bench, bends, bent |
| Digraph sh |  | 32 | pushed, rush, rushed, shake, shapes, she, shield, shifted, ship, shook, shoulder, show |
| Digraph ch |  | 12 | bench, chalk, chart, checked, cheek, cheered, choose, which, wrench |
| Digraph th |  | 269 | another, breath, nothing, other, smooth, something, thank, thanks, that, the, their, them |
| Digraph wh | yes | 48 | what, whatever, wheel, when, where, which, whip, whisper, whispered, whistle, white, why |
| ck spelling | yes | 59 | back, backs, backup, checked, click, clicked, clicker, crackled, deck, decks, flickered, locker |
| FLOSS rule (ff, ll, ss, zz) |  | 35 | all, buzz, fell, glass, hall, hiss, hull, off, pass, press, roll, small |
| Beginning blend |  | 178 | blinked, breath, bridge, broke, clamp, clear, cleared, click, clicked, clicker, climb, climbed |
| ng / nk units |  | 33 | along, asking, blinked, drifting, finger, hissing, hung, laughing, long, nothing, orange, rubbing |
| tch spelling | yes | 36 | catch, hatch, latch, match, patched, stretched, switch, watch, watched |
| Vowel-consonant-e syllable |  | 133 | above, alone, are, awake, broke, came, care, close, engine, everyone, eye, face |
| Vowel team syllable |  | 199 | adair, again, against, ahead, away, beam, between, breath, captain, cheek, cheered, clear |
| R-controlled syllable |  | 188 | adair, amber, another, answer, answered, are, arm, care, chart, cheered, clear, cleared |
| Suffix -ing |  | 9 | asking, drifting, hissing, laughing, nothing, rubbing, something, thinking |
| Suffix -ed |  | 104 | answered, asked, blinked, called, checked, cheered, cleared, clicked, climbed, clipped, crackled, crawled |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 9 glossary word(s) with a definition
- Tagged moments per objective: comprehension 12, inference 9, sequencing 6, vocabulary 4, detail 11, engagement 8

## Readability

- Words: 1493, average per passage 67.9
- Average sentence length: 6 words
- Longest passage: captain-wakes (102 words)
- Words estimated at 4+ syllables: anomaly, navigator

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

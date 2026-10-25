# Literacy report: wake-cycle v6

Story hash (sha256 of canonical JSON): `948b0f2a98f206cbf3a00c4c81907b9c4602f44653a27a87e30fe3c954e00cf1`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | wh-words: 39/10; ck-words: 46/8; tch-words: 36/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-wh: 64; digraph-ck: 76; trigraph-tch: 44 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| wh words | 39 / 10 | 21 | none | clear-road: 13, steady-hands: 12, sensor-mast: 12, many-hands: 10, drifting-quiet: 10 |
| ck words | 46 / 8 | 18 | none | clear-road: 25, steady-hands: 22, sensor-mast: 24, many-hands: 21, drifting-quiet: 20 |
| tch words | 36 / 8 | 13 | none | clear-road: 13, steady-hands: 13, sensor-mast: 14, many-hands: 17, drifting-quiet: 13 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 812 | act, am, an, and, as, ask, at, back, backs, bench, bends, bent |
| Digraph sh |  | 33 | pushed, rushed, shake, shapes, she, shield, shifted, ship, shook, short, shoulder, show |
| Digraph ch |  | 24 | bench, chalk, chart, check, checked, checks, cheek, cheered, choose, each, stomach, which |
| Digraph th |  | 336 | another, breath, nothing, other, smooth, something, than, thank, thanks, that, the, their |
| Digraph wh | yes | 64 | what, whatever, wheel, when, where, which, while, whip, whisper, whispered, whistle, white |
| ck spelling | yes | 76 | back, backs, backup, check, checked, checks, click, clicked, clicker, crackled, deck, decks |
| FLOSS rule (ff, ll, ss, zz) |  | 50 | all, buzz, call, fell, glass, hall, hiss, hull, off, pass, press, roll |
| Beginning blend |  | 231 | blinked, break, breath, bridge, broke, clamp, clear, cleared, click, clicked, clicker, climb |
| ng / nk units |  | 37 | along, asking, blinked, drifting, finger, hissing, hung, laughing, long, nothing, orange, rubbing |
| tch spelling | yes | 44 | catch, hatch, latch, match, patched, stretched, switch, watch, watched |
| Vowel-consonant-e syllable |  | 170 | above, alone, are, awake, before, broke, came, care, close, come, engine, everyone |
| Vowel team syllable |  | 237 | adair, again, against, ahead, air, away, beam, between, break, breath, captain, cheek |
| R-controlled syllable |  | 248 | adair, air, amber, another, answer, answered, are, arm, around, before, better, care |
| Suffix -ing |  | 9 | asking, drifting, hissing, laughing, nothing, rubbing, something, thinking |
| Suffix -ed |  | 124 | answered, asked, blinked, called, checked, cheered, cleared, clicked, climbed, clipped, crackled, crawled |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 9 glossary word(s) with a definition
- Tagged moments per objective: comprehension 14, inference 12, sequencing 8, vocabulary 6, detail 16, engagement 14

## Readability

- Words: 1769, average per passage 63.2
- Average sentence length: 6.1 words
- Longest passage: captain-wakes (102 words)
- Words estimated at 4+ syllables: anomaly, navigator

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

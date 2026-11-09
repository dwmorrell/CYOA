# Literacy report: wake-cycle v8

Story hash (sha256 of canonical JSON): `f81f7be11ac3ba0bea8ab0a1fd9d6c1306eccbbc66e4234cfb22ce8a5cc20a45`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | wh-words: 42/10; ck-words: 46/8; tch-words: 33/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-wh: 67; digraph-ck: 79; trigraph-tch: 41 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| wh words | 42 / 10 | 22 | none | clear-road: 13, steady-hands: 12, sensor-mast: 12, many-hands: 10, drifting-quiet: 10 |
| ck words | 46 / 8 | 18 | none | clear-road: 25, steady-hands: 22, sensor-mast: 24, many-hands: 21, drifting-quiet: 20 |
| tch words | 33 / 8 | 13 | none | clear-road: 10, steady-hands: 10, sensor-mast: 11, many-hands: 14, drifting-quiet: 10 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 832 | act, am, an, and, as, ask, at, back, backs, bench, bends, bent |
| Digraph sh |  | 38 | pushed, rushed, shake, shapes, she, shield, shifted, ship, shook, short, should, shoulder |
| Digraph ch |  | 21 | bench, chalk, chart, check, checked, checks, cheek, cheered, choose, each, stomach, which |
| Digraph th |  | 341 | another, breath, nothing, other, smooth, something, than, thank, thanks, that, the, their |
| Digraph wh | yes | 67 | what, whatever, wheel, when, where, which, while, whip, whisper, whispered, whistle, white |
| ck spelling | yes | 79 | back, backs, backup, check, checked, checks, click, clicked, clicker, crackled, deck, decks |
| FLOSS rule (ff, ll, ss, zz) |  | 55 | all, buzz, call, fell, glass, hall, hiss, hull, off, pass, press, roll |
| Beginning blend |  | 237 | blinked, break, breaking, breath, bridge, broke, clamp, clear, cleared, clearly, click, clicked |
| ng / nk units |  | 41 | along, asking, blinked, breaking, drifting, finger, hissing, hung, laughing, long, nothing, orange |
| tch spelling | yes | 41 | catch, hatch, latch, match, patched, stretched, switch, watch, watched |
| Vowel-consonant-e syllable |  | 177 | above, alone, are, awake, before, broke, came, care, close, come, engine, everyone |
| Vowel team syllable |  | 249 | adair, again, against, ahead, air, away, beam, between, break, breaking, breath, captain |
| R-controlled syllable |  | 250 | adair, air, amber, another, answer, answered, are, arm, around, before, better, care |
| Suffix -ing |  | 13 | asking, breaking, drifting, hissing, laughing, nothing, rubbing, something, thinking, waiting |
| Suffix -ed |  | 127 | answered, asked, blinked, called, checked, cheered, cleared, clicked, climbed, clipped, crackled, crawled |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 9 glossary word(s) with a definition
- Tagged moments per objective: comprehension 14, inference 12, sequencing 8, vocabulary 6, detail 16, engagement 14

## Readability

- Words: 1820, average per passage 65
- Average sentence length: 6.2 words
- Longest passage: captain-wakes (106 words)
- Words estimated at 4+ syllables: anomaly, navigator

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

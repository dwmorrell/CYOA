# Literacy report: wake-cycle v1

Story hash (sha256 of canonical JSON): `20e8d2a74672f3cd737154846ae3e7b364d0dc2c8b4b6cdb36a1bf71271b2c36`
Terminology profile: structured-literacy
Human literacy review status: **pending**
Automated checks: **all passed**

## Automated checks

| Check | Result | Detail |
| --- | --- | --- |
| word-set-minimums | pass | wh-words: 35/10; ck-words: 35/8; tch-words: 30/8 |
| every-word-used | pass | all words appear |
| word-sets-on-every-route | pass | each word set appears on the shortest route to every ending |
| word-set-concepts-match-spelling | pass | no mismatches |
| target-concepts-known | pass | all known |
| target-concepts-present | pass | digraph-wh: 48; digraph-ck: 55; trigraph-tch: 37 |
| sentence-length | pass | 0 sentence(s) over 20 words |

## Word sets

| Set | Total / min | Passages | Missing | Per ending route |
| --- | --- | --- | --- | --- |
| wh words | 35 / 10 | 17 | none | clear-road: 14, steady-hands: 13, sensor-mast: 12, many-hands: 10, drifting-quiet: 11 |
| ck words | 35 / 8 | 15 | none | clear-road: 23, steady-hands: 20, sensor-mast: 21, many-hands: 19, drifting-quiet: 19 |
| tch words | 30 / 8 | 12 | none | clear-road: 13, steady-hands: 13, sensor-mast: 15, many-hands: 17, drifting-quiet: 13 |

## Concepts (spelling-pattern matches)

| Concept | Targeted | Matches | Examples |
| --- | --- | --- | --- |
| Closed syllable |  | 647 | act, am, an, and, as, ask, at, back, backs, bench, bends, bent |
| Digraph sh |  | 32 | pushed, rush, rushed, shake, shapes, she, shield, shifted, ship, shook, shoulder, show |
| Digraph ch |  | 13 | bench, chalk, chart, checked, cheek, cheered, choose, which, wrench |
| Digraph th |  | 271 | another, breath, nothing, other, smooth, something, thank, thanks, that, the, their, them |
| Digraph wh | yes | 48 | what, whatever, wheel, when, where, which, whip, whisper, whispered, whistle, white, why |
| ck spelling | yes | 55 | back, backs, backup, checked, click, clicked, clicker, crackled, deck, flickered, locker, neck |
| FLOSS rule (ff, ll, ss, zz) |  | 35 | all, buzz, fell, glass, hall, hiss, hull, off, pass, press, roll, small |
| Beginning blend |  | 175 | blinked, breath, bridge, broke, clamp, clear, cleared, click, clicked, clicker, climb, climbed |
| ng / nk units |  | 32 | along, asking, blinked, drifting, finger, hissing, hung, laughing, long, nothing, orange, rubbing |
| tch spelling | yes | 37 | catch, hatch, latch, match, patched, stretched, switch, watch, watched |
| Vowel-consonant-e syllable |  | 136 | above, alone, are, awake, broke, came, care, close, engine, everyone, eye, face |
| Vowel team syllable |  | 191 | adair, again, against, ahead, away, beam, between, breath, captain, cheek, cheered, clear |
| R-controlled syllable |  | 184 | adair, amber, another, answer, answered, are, arm, care, chart, cheered, clear, cleared |
| Suffix -ing |  | 9 | asking, drifting, hissing, laughing, nothing, rubbing, something, thinking |
| Suffix -ed |  | 102 | answered, asked, blinked, called, checked, cheered, cleared, clicked, climbed, clipped, crackled, crawled |

## Learning design (master spec; advisory, does not fail validation)

- ok learning-targets-tagged: every learning objective has tagged moments
- ok word-help-definitions: 9 glossary word(s) with a definition
- Tagged moments per objective: comprehension 12, inference 9, sequencing 6, vocabulary 4, detail 11, engagement 8

## Readability

- Words: 1477, average per passage 67.1
- Average sentence length: 6 words
- Longest passage: captain-wakes (94 words)
- Words estimated at 4+ syllables: navigator

## Method and limitations

Deterministic token counts over passage text and choice labels. Word-set words also match -s and -es forms. Concept detection is by spelling pattern.

- Concept detectors match spelling, not sound, so some matches are false positives (for example "ea" in "bread").
- Syllable counts are estimates from vowel groups.
- These checks do not judge decodability, vocabulary appropriateness or story quality. A qualified literacy reviewer must confirm the linguistic claims.

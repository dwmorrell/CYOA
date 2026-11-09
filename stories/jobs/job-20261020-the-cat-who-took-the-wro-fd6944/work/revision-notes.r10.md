# Revision 10 notes

This revision fixes the two carried-over literacy findings from
`reviews/review-13-literacy.r9.json` (passages `late-for-school` and
`tower-hall`, both explicitly noted as unresolved and out-of-scope for r9),
plus the matching instances on sibling passages `frog-helped`, `home-too-soon`
and `the-stairs`. No other passage, choice, target, item, clue or flag was
touched.

## 1. Sentence-length overages (brief maxSentenceWords = 16)

### `late-for-school`, 4th paragraph, 1st sentence

- Old (17 words): "Eli's library book had a map in it, and he was meant to show it in class."
- New (15 words): "Eli's library book had a map, and he was meant to show it in class."
- Change: dropped the redundant "in it". Meaning unchanged.

### `frog-helped`, 4th paragraph, 2nd sentence

- Old (17 words): "She was waiting at the start of the stairs, and she gave him a small, surprised smile."
- New (14 words): "She was waiting at the stairs, and she gave him a small, surprised smile."
- Change: dropped "the start of" (she was already waiting at the stairs; no information lost).

### `home-too-soon`, 5th paragraph

- Old (17 words): "He looked at his muddy shoes and thought of the marsh, the stairs and the dark hatch."
- New (16 words): "He looked at his muddy shoes and thought of the marsh, the stairs and the hatch."
- Change: dropped "dark" (the hatch was already described as dark earlier in the story, at `tower-hall`'s 2nd paragraph, so the detail is not lost to the reader).

All three sentences were re-counted by splitting on whitespace after the edit; all three are now at or under 16 words. I also re-counted every other sentence in these three paragraphs/passages to confirm none crept over the limit as a side effect (see the full per-sentence word counts captured during this revision; the highest in any touched paragraph is 16).

## 2. Fronted-subordinate-clause pattern

Following the model `lantern-room` used in r9 ("By one path or the other, Eli was here now." — no embedded subject+verb before the comma), the two remaining hub openings were reworded the same way.

### `tower-hall`, 1st paragraph, opening sentence

- Old: "However he had climbed those last steps, Eli reached the top at last."
- New: "By one path or another, Eli reached the top at last."
- The fronted phrase is now a short prepositional phrase with no embedded clause, while still signalling the hub is reached by more than one route (matches the 7 distinct incoming edges to this passage). Rest of the paragraph is unchanged.

### `the-stairs`, 1st paragraph, opening sentence

- Old: "Whatever Eli had just decided, he turned to climb the stairs."
- New: "Either way, Eli turned to climb the stairs."
- "Either way," is a two-word adverbial with no subject+verb before the comma, preserving the sense that this hub follows different preceding choices (13 distinct incoming edges). Rest of the paragraph is unchanged.

## Verification

- `npm run story -- submit-draft job-20261020-the-cat-who-took-the-wro-fd6944 --file stories/jobs/job-20261020-the-cat-who-took-the-wro-fd6944/work/draft.json --author narrative-designer --author-kind ai-agent --agent narrative-designer` produced revision 10 with schema: ok, graph: ok (5/5 endings reachable), literacy checks: ok, brief: ok.
- No word-set target word (blend-words, closed-syllable-words, ing-words) was removed or added by these edits; only connective/adjective words ("in it", "the start of", "dark") were trimmed, and target words such as "map" and "hatch" remain exactly where they were.
- No choices, targets, items, clues, flags or any other passage were changed.

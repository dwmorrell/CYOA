# Revision notes r5 (submitted, validation FAILED)

- Added "moon" back to `literacy.wordSets` `vowel-team-words` so it matches the brief exactly. Brief check is now ok.
- Bumped version to 5. Passages unchanged; "moon" is already used naturally (three passages).
- Result: schema ok, graph ok (5/5 endings), brief ok, but literacy check `word-set-concepts-match-spelling` fails. The vowel-team detector (src/literacy/taxonomy.ts) has no "oo", so "moon" is not accepted as a vowel-team word.
- The brief check and the literacy check contradict each other for this word, so no draft can pass both.
- ESCALATION: either change the brief (swap "moon" for e.g. "moan" or "peak") or file an app-engineer work item to add "oo" to the vowel-team detector. I did not change app code.

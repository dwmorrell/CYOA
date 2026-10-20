# Revision notes r6 (NOT submitted: blocked, escalated)

- The `literacy.wordSets` array in draft.json already lists all seven words exactly as in brief.json, including "moon". No draft change can fix this.
- The two validation checks contradict each other. The brief check requires "moon" in `vowel-team-words`. The literacy check `word-set-concepts-match-spelling` rejects "moon", because the vowel-team detector in `src/literacy/taxonomy.ts` (line 113) matches only ai ay ee ea oa oe ie igh ue, not "oo".
- Resubmitting would give a draft identical to r5 with the same failure, so I did not submit.
- Needs one of: (a) a brief change that swaps "moon" for a word the detector accepts, such as "moan" or "peak", or (b) an `app-engineer` work item to add "oo" to the vowel-team detector, with a test. I did not touch app code or the brief.

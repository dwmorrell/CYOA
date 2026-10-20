# Revision notes r5 (NOT submitted)

No qa-review or literacy-review files exist for r4. The only finding is automated validation.

- Finding: brief check says `vowel-team-words` dropped "moon". Literacy check `word-set-concepts-match-spelling` fails if "moon" is in the set, because the vowel-team detector (src/literacy/taxonomy.ts) has no "oo".
- Change: none. The two checks contradict each other, so no draft can pass both. Story text already uses "moon" and meets all word-set minimums (26/10, 42/8, 48/8). Graph is ok, 5/5 endings reachable.
- Not submitted: resubmitting would only repeat the r3 or r4 failure.
- ESCALATION: needs a brief change (swap "moon" for e.g. "moan" or "peak") or an app-engineer work item to add "oo" to the vowel-team detector.

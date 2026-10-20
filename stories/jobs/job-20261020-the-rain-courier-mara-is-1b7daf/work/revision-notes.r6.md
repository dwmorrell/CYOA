# Revision notes r6 (not submitted: escalation)

- No qa-review.r5.json or literacy-review.r5.json exist. The only open finding is the validation error on r5.
- Blocker: the brief lists "patch" in ch-words, but the literacy check (digraph-ch = "ch, not tch") rejects it. "patch" is spelled tch.
- Keeping "patch" fails word-set-concepts-match-spelling. Replacing it with "chest" (r5) fails brief conformance ("dropped words: patch"). No draft can pass both.
- I did not submit a new draft, because it would fail the same way as r5. Teaching "patch" as a ch word would also give learners a wrong spelling claim.
- Needed from orchestrator or parent: change the brief word (for example "patch" to "chest" or "chop") and re-run, or allow brief words that fail the concept check.
- Once the brief is fixed, r5 content can be resubmitted as v6. It has 5/5 endings reachable, word-set minimums met, and all other checks passing.

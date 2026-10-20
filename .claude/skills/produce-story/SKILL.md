---
name: produce-story
description: Run the story production workflow for one story request - create the job, have the narrative-designer draft it, get independent QA and literacy pre-reviews, and hand it to the parent. Never approves or publishes.
---

# Produce a story

1. `npm run story -- new --request stories/requests/<file>.json` and note the job id.
2. Delegate drafting to `narrative-designer` with the job id; it follows `stories/jobs/<jobId>/generation-prompt.md` and submits with the CLI.
3. Delegate `qa-engineer` and `literacy-specialist` reviews on the current revision. They record reviews with `npm run story -- review`.
4. If any review requests changes, send the review files back to `narrative-designer` for a new revision, then repeat step 3 (earlier reviews become stale automatically).
5. `npm run story -- preview <jobId>` so the parent can play it in the app.
6. Tell the parent what remains: a human literacy review, then `story decide` and `story publish` in their own terminal. You must not run those.

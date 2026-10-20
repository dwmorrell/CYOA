# Agent invocation smoke test

Run 2026-10-20T00:39:50.550Z with Claude Code 2.1.304 (Claude Code) using `claude -p --agent <name>`.
Each agent was asked, with no tools, to name its role and one limit of authority. The answers below are verbatim.

| Agent | Answer |
| --- | --- |
| `product-architect` | Product Architect — I'm not allowed to write story prose, approve stories, or record reviews. |
| `ux-designer` | UX Designer (reading experience): I'm not allowed to change the story engine's rules, the schema or the publication gates. |
| `literacy-specialist` | Literacy Specialist (AI-assisted, not a certified reviewer) — I'm not allowed to set `literacy.review.status` to `"passed"` in a story file, because my AI review never counts as the human literacy review. |
| `narrative-designer` | Narrative Designer (story author). I'm not allowed to review, pass or approve my own work, and that includes running `story decide` or `story publish`. |
| `app-engineer` | App Engineer — I'm not allowed to weaken a publication gate, the human-literacy-review policy, or the agent-session block on parent actions (such as `story decide` or `story publish`) to make something pass. |
| `qa-engineer` | QA Engineer (independent reviewer) — I'm not allowed to review work I wrote myself, and I must never run `story decide` or `story publish`. |
| `accessibility-compatibility-reviewer` | Accessibility and Compatibility Reviewer: I'm not allowed to change UI code, so I file findings for `ux-designer` instead. |
| `release-manager` | Release Manager. I'm not allowed to approve or publish stories, and a deploy step can't change story publication status either. |

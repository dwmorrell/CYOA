---
name: orchestrate
description: Run the software development workflow for this repository - check work items in dependency order, run their checks, delegate the next item to the responsible specialist agent, and refresh traceability.
---

# Orchestrate software work

1. Run `npm run orchestrate -- --run` and read `reports/orchestration/latest.md`.
2. Fix structural problems it lists first (missing artifacts, cycles, self-reviews).
3. For each item under "Next work", delegate to the named agent (Agent tool with that subagent type, or `claude --agent <name>`). Give it the work item id; it reads `workflow/work-items.json` itself.
4. When an item is ready, delegate review to a different agent (normally `qa-engineer`) and have it write the `review` block with the commands it ran and their results.
5. Run `npm run orchestrate -- --trace` and `npm run check`.
6. Report what is implemented, what is pending, and what is unverified. Never report a check you did not run.

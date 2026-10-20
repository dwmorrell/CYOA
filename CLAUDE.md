# CLAUDE.md

Guidance for Claude Code sessions in this repository.

## What this is

Story Quest: a dyslexia-informed choose-your-own-adventure reading RPG (web
app for Android and Chromebooks) plus a story production workflow with
specialist AI agents and human review gates. Start with `README.md`, then
`docs/PRODUCT_SPEC.md` and `docs/AGENTS_AND_WORKFLOW.md`.

## Commands

```bash
npm ci                     # install (Node 22.13+)
npm run dev                # local app at http://localhost:5173
npm run check              # lint, typecheck, tests, story validation, agent check, build
npm test                   # Vitest
npm run validate:stories   # every story and catalog entry
npm run story -- help      # story production CLI
npm run orchestrate        # work items, job status, reports/orchestration/latest.md
npm run orchestrate -- --trace   # regenerate docs/REQUIREMENTS_TRACEABILITY.md
npm run demo:e2e           # sandboxed end-to-end story workflow demo
npm run agents:smoke       # invoke each agent via `claude -p --agent` (needs sign-in)
```

## Rules that are not negotiable

1. **Never approve or publish a story.** `story decide` and `story publish`
   are parent actions. They refuse to run when `CLAUDECODE` is set, and
   `.claude/settings.json` denies them. Do not work around either.
2. **Never mark a literacy review as passed** in a story file, and never
   record an AI review with `"kind": "human"`.
3. **No self-review.** The agent or person who wrote a draft cannot review it.
4. **No runtime AI or server dependency** in the app (`src/`).
5. **Do not claim a check, device test or review passed unless you ran it
   and saw the output.** Say "not run" or "untested" instead.
6. Story production must never need application code changes. If the engine
   cannot express a story, file a work item for `app-engineer`.
7. Application deployment and story publication stay separate. No workflow
   may run `story decide` or `story publish`.

## Agents

Eight specialists in `.claude/agents/`: `product-architect`, `ux-designer`,
`literacy-specialist`, `narrative-designer`, `app-engineer`, `qa-engineer`,
`accessibility-compatibility-reviewer`, `release-manager`. Delegate to the
one that owns the files you are changing. Work passes between agents through
repository files (`workflow/work-items.json`, `stories/jobs/<jobId>/`), not
through conversation summaries.

## Code conventions

- TypeScript strict; no UI framework; pure logic in `src/`, filesystem code in `scripts/`.
- Keep `schemas/story.schema.json` and `src/engine/types.ts` in sync.
- Every behaviour change comes with a test under `tests/unit/`.
- Prettier-style formatting: 2 spaces, single quotes, semicolons, ~160 columns.

# Architecture

## Overview

```
                ┌──────────── offline / development machine ────────────┐
 story request ─► story CLI (scripts/story-cli.ts)                        │
                │   brief → continuity → outline + Word Weave Plan        │
                │   → generation prompt ─► narrative-designer agent       │
                │   draft ─► automated validation (schema, graph,         │
                │            literacy, brief)                             │
                │   ─► QA review ─► literacy review (human required)      │
                │   ─► parent decision (human, not in agent sessions)     │
                │   ─► publish: public/stories/published + catalog.json   │
                └──────────────────────────────┬──────────────────────────┘
                                               │ static files (git)
                ┌──────────── browser on Android / ChromeOS ────────────┐
                │ index.html + JS bundle (Vite)                         │
                │  library ◄─ catalog.json (published only, hash-checked)│
                │  reader  ─ story engine ─ localStorage saves          │
                │  parent studio (lazy-loaded) ─ validators in-browser  │
                └───────────────────────────────────────────────────────┘
```

Application deployment (shipping the code) and story publication (changing
`catalog.json`) are separate steps owned by different people and checked by
different CI jobs. See `docs/DEPLOYMENT.md`.

## Modules

| Path | Role | Runs in |
| --- | --- | --- |
| `src/engine/types.ts` | Story and game-state types (mirror of the schema) | both |
| `src/engine/story-engine.ts` | Pure engine: new game, choices, conditions, effects, endings | both |
| `src/engine/persistence.ts` | Guarded localStorage, save validation, reading preferences | browser |
| `src/validation/schema.ts` | Ajv validation against `schemas/story.schema.json` | both |
| `src/validation/graph.ts` | Link checks plus full state-space search for reachability, soft-locks and traps | both |
| `src/literacy/taxonomy.ts` | Program-neutral concepts with spelling detectors and teaching stage | both |
| `src/literacy/analyzer.ts` | Literacy report: word sets, routes, concepts, readability | both |
| `src/production/*` | Request, brief, continuity, plan, job state machine, gates, draft validation | both |
| `src/util/hash.ts` | Dependency-free SHA-256 and canonical JSON | both |
| `src/ui/*`, `src/main.ts` | Screens; `ui/parent.ts` is loaded on demand | browser |
| `scripts/lib/repo.ts`, `scripts/lib/production.ts` | Filesystem job store, job lock and production operations | Node |
| `scripts/lib/agents.ts`, `scripts/agents.ts` | Agent definition checks (`agents:check`) and live invocation smoke test (`agents:smoke`) | Node |
| `scripts/lib/workflow.ts` | Work-item ordering and checks used by the orchestrator | Node |
| `scripts/story-cli.ts` | Story production command line | Node |
| `scripts/validate-stories.ts` | CI check of every story and every published catalog entry | Node |
| `scripts/orchestrate.ts` | Software workflow orchestrator and traceability generator | Node |
| `scripts/demo-e2e.ts` | End-to-end story workflow demonstration in a sandbox | Node |

## Data and artifacts

- **Story file**: content only (`schemas/story.schema.json`). It has no
  publication status field; the schema rejects one.
- **Job folder** `stories/jobs/<jobId>/`: `request.json`, `brief.json`,
  `continuity.json`, `outline.json`, `word-weave-plan.json`,
  `generation-prompt.md`, `drafts/story.r<N>.json`, `reports/*.r<N>.*`,
  `reviews/*.json`, and `job.json` (state, revisions, reviews, parent
  decisions, failures, history). Every artifact reference stores a SHA-256.
- **Catalog** `public/stories/catalog.json`: `published` (child-facing) and
  `previews` (parent-only). The app re-hashes each story it loads and refuses
  one that does not match.

## Key rules enforced in code

| Rule | Where | Test |
| --- | --- | --- |
| Only listed state transitions; only `approved → published` | `src/production/job.ts` `TRANSITIONS` | `production.test.ts` "allows only listed transitions" |
| New revision invalidates earlier reviews and parent decisions | `addRevision` | "invalidates reviews and parent approval" |
| Author cannot review own draft | `checkReviewAdmissible`, `recordReview` | "does not let the narrative author review" |
| Review evidence must hash-match files on disk and the current draft | `recordReview`, `checkReviewAdmissible` | "requires evidence that matches" |
| Literacy review must include a human pass (policy) | `reviewGates` + `config/publication-policy.json` | "moves through validation, review…" |
| Parent decision must be human; parent and publish commands blocked in agent sessions | `recordParentDecision`, CLI `CLAUDECODE` check, `.claude/settings.json` deny rules | "only a human parent can approve" |
| Publishing re-hashes the draft | `currentStory` | "refuses to publish a draft whose file was edited" |
| Published catalog entries must have a published job whose gates pass | `scripts/validate-stories.ts` | CI |

## Platform choices

- Vanilla TypeScript and DOM, no UI framework, to keep the child bundle small.
- Build target `es2020` / Chrome 90 so older Chromebooks on extended updates
  still run it.
- System fonts only; no web fonts to download.
- `base: './'` so the build can be served from any static path.
- The parent studio and Ajv load on demand, so a child's first load does not
  download the validator.

## Known limits

- localStorage is per browser profile; clearing site data erases progress.
  There is no export of saves yet.
- No service worker yet, so the app needs the network for first load and for
  new stories. Offline caching is the next milestone (see README).
- The parent gate is a convenience, not security.
- The `CLAUDECODE` check blocks Claude Code sessions specifically. Other
  automation could still call the CLI; the human-only rules for parents rely
  on the person running the command.

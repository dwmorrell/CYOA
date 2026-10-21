# Agents and workflow

## The nine specialist agents

Agent definitions live in `.claude/agents/*.md` in the Claude Code subagent
format (YAML front matter with `name`, `description`, `tools`, `model`, then
the instructions). Each file states mission and scope, expertise and
responsibilities, exclusions and limits of authority, required inputs, output
artifacts, acceptance criteria, handoff and escalation conditions, and
relevant files.

| Agent | Owns | Produces | May not |
| --- | --- | --- | --- |
| `orchestrator` | Sequencing, handoffs, conflicts between requirements | `workflow/`, `reports/orchestration/`, handoff notes | Review, approve or publish anything; write prose or code |
| `product-architect` | Specs, schema, interfaces, traceability | `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, `schemas/`, `workflow/requirements.json` | Write stories, approve, add runtime AI |
| `ux-designer` | Reading UI and presentation | `docs/UI_SPEC.md`, `src/ui/`, `src/styles.css` | Claim accessibility conformance |
| `literacy-specialist` (the Dyslexic Reading specialist) | Comprehension design, age fit (10 to 13), OG-style patterns, taxonomy, word sets, analyzer, AI literacy review | `src/literacy/`, `config/literacy-profiles.json`, literacy review files | The AI literacy review is the literacy gate; write prose |
| `narrative-designer` (the CYOA author) | Story drafts, learning objectives | `stories/jobs/<id>/work/draft.json` via `story submit-draft` | Review or approve own work |
| `app-engineer` (the app developer) | Engine, storage, React UI, validators, CLI | `src/engine/`, `src/validation/`, `src/production/`, `scripts/`, tests | Weaken gates |
| `qa-engineer` | Independent QA of software, stories, saves and device behaviour | QA review files, tests, work-item reviews | Review own work; fix prose |
| `accessibility-compatibility-reviewer` | A11y and device audits | `reports/accessibility/`, `reports/compatibility/` | Claim untested devices pass |
| `release-manager` | CI, deployment preparation, releases | `.github/workflows/`, `docs/DEPLOYMENT.md`, `CHANGELOG.md` | Deploy to production without chosen hosting; publish stories |

## How to invoke an agent

Verified with Claude Code 2.1.304 on 2026-10-20 (see
`reports/agents/invocation-smoke.md`).

```bash
# Run a whole session as one agent (non-interactive):
claude -p --agent qa-engineer "QA-review the current draft of job <jobId>"

# Interactive session as an agent:
claude --agent narrative-designer

# From any Claude Code session in this repository, ask for the subagent by name:
#   "Use the literacy-specialist agent to pre-review job <jobId>."
# or open /agents to see and edit them.
```

Non-interactive runs need tool permission for the commands an agent uses, for
example:

```bash
claude -p --agent qa-engineer --permission-mode acceptEdits \
  --allowedTools "Read,Write,Edit,Glob,Grep,Bash(npm run story:*)" "..."
```

`npm run agents:check` validates every definition's front matter and required
sections (this also runs in `npm test`). `npm run agents:smoke` asks each
agent, through the real `claude --agent` mechanism, to state its role and
one limit of authority, and writes `reports/agents/invocation-smoke.md`. The
smoke test needs a signed-in Claude Code and is not run in CI.

### What "operational" means here, and what it does not

- **Executable today:** each agent loads through `claude --agent <name>` and
  follows its contract. In the bootstrap run, `narrative-designer` wrote and
  submitted the sample story, and `qa-engineer` and `literacy-specialist`
  reviewed it through the CLI. Their logs and outputs are in the job folder.
- **Enforced by code, not by trust:** an author cannot review their own draft;
  reviews must hash-match the current draft; the parent's approval needs the AI
  literacy and AI QA reviews of that draft; parent decisions and publishing refuse to run in a
  Claude Code session (`CLAUDECODE` is set there) and are also denied in
  `.claude/settings.json`.
- **Not automated yet:** nothing chains agents together on its own. A person
  or an orchestrating Claude session starts each agent. The orchestrator
  script (below) tells you which work item and which agent is next; it does
  not spawn agents.

## Software development workflow

Work items live in `workflow/work-items.json`. Each item names the
responsible agent, the required artifacts, dependencies, acceptance criteria
(with the command that checks them), review status, and unresolved defects.

```bash
npm run orchestrate            # check all work items in dependency order and write reports/orchestration/
npm run orchestrate -- --run   # also run each item's check commands
npm run orchestrate -- --trace # regenerate docs/REQUIREMENTS_TRACEABILITY.md
```

The orchestrator stages, in dependency order:

1. Inspect requirements and repository state (`product-architect`).
2. UI, architecture and literacy specifications (`ux-designer`, `product-architect`, `literacy-specialist`).
3. Schemas and interfaces (`product-architect`).
4. Application and story engine (`app-engineer`).
5. Original sample story and its Word Weave Plan (`narrative-designer`, story workflow).
6. Deterministic story validation (`app-engineer`).
7. Narrative, literacy, accessibility and compatibility reviews (`qa-engineer`, `literacy-specialist`, `accessibility-compatibility-reviewer`).
8. Automated tests and defect fixes (`qa-engineer`, `app-engineer`).
9. Requirements traceability report (`product-architect`).
10. Report implemented, pending and unverified (`release-manager`).

A work item may be marked `done` only when its artifacts exist, its
dependencies are `done`, and its review block names a reviewer other than the
responsible agent. The orchestrator reports any item that breaks these rules.

## Story production workflow

Separate from software work. Adding a story never changes application code.

```bash
npm run story -- new --request stories/requests/<name>.json     # job: request → brief → continuity → plan
claude --agent narrative-designer "Draft the story for job <jobId> following its generation-prompt.md"
npm run story -- status <jobId>
claude --agent qa-engineer "QA-review job <jobId>"
claude --agent literacy-specialist "Literacy pre-review job <jobId>"
# each AI reviewer records its review with its own kind (never "human"):
npm run story -- review <jobId> --file <review.json>
npm run story -- preview <jobId>        # parent-only shelf in the app
# parent, in their own terminal (blocked in agent sessions):
npm run story -- decide <jobId> --parent "Name" --decision approved
npm run story -- publish <jobId> --by "Name"
```

Job states: `requested → briefed → planned → in-review | validation-failed →
changes-requested ↔ in-review → awaiting-parent-approval → approved →
published`, plus `rejected`. Any new revision returns the job to `in-review`
or `validation-failed` and marks earlier reviews and parent decisions stale.

### Review file format

```json
{
  "role": "qa",
  "reviewer": { "name": "qa-engineer", "kind": "ai-agent", "agent": "qa-engineer" },
  "revision": 1,
  "draftSha256": "<sha256 shown by story status>",
  "verdict": "pass",
  "findings": [{ "severity": "minor", "message": "…", "passage": "threshold" }],
  "evidence": [{ "path": "stories/jobs/<jobId>/drafts/story.r1.json", "sha256": "…" }]
}
```

`npm run story -- evidence <paths…>` prints the evidence array. The CLI
re-hashes each evidence file when recording, so a reviewer must have the
actual current files.

A literacy review also carries a `shelfSummary`, the at-a-glance note a parent
or tutor sees on the story shelf:

```json
"shelfSummary": {
  "blurb": "One to three plain sentences, 400 characters at most.",
  "skills": ["inference", "sequencing"],
  "wordTypes": [{ "concept": "digraph-ch", "examples": ["chill", "chip"] }],
  "ogCategories": ["Phonics", "Spelling rules", "Comprehension"]
}
```

`skills` are learning targets the story tags. `wordTypes` use taxonomy concept
ids, must include every target concept, and give one to four example words
taken from the story that carry the pattern. `ogCategories` come from the fixed
list in `src/literacy/shelf-summary.ts`. The CLI checks the summary against the
story and refuses a mismatch; `story preview` copies the latest passing summary
onto the shelf in the `og-classic` profile's terms, and `validate:stories`
checks it again.

### Failure recovery

- Unparseable or invalid drafts are recorded in `job.failures` and the job
  stays where it was; resubmitting a fixed draft marks the failure recovered.
- A sequel whose prequel is missing records a `continuity` failure and leaves
  the job `briefed`; `npm run story -- plan <jobId>` retries.
- Concurrent CLI calls on one job are serialized with a lock folder.

## Master specification roles

`docs/MASTER_SPEC.md` names five roles. They map to the nine files above:

| Master spec role | Agent file |
| --- | --- |
| Orchestrator | `orchestrator` |
| Dyslexic Reading specialist | `literacy-specialist` |
| CYOA author | `narrative-designer` |
| App developer | `app-engineer` |
| QA engineer (story branches, saves, accessibility, device behaviour) | `qa-engineer` |

The other four files are supporting roles from the bootstrap. They are
definitions and workflow instructions. Running them is still a manual step
(`claude --agent <name>`); the orchestrator does not start agents itself.

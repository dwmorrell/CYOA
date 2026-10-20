# CYOA: Story Quest

A choose-your-own-adventure reading RPG for children with dyslexia, and the
workflow that produces its stories.

- **Reading app**: a small, local-first web app for Android phones and
  tablets (including Android 15) and Chromebooks. Branching stories with
  choices, clues, an inventory and several endings. Dyslexia-informed
  typography that the reader can adjust, plus optional supports (syllable
  reveal, paragraph focus, read-to-me). Progress is saved on the device. No
  account, no server, no runtime AI.
- **Parent studio**: preview drafts, see the story map, run every automated
  check in the browser, edit a story file and keep versions on the device.
- **Story production workflow**: a structured story request becomes a
  trackable job with a brief, continuity check, outline, Word Weave Plan,
  draft, automated validation, specialist reviews and parent approval.
  Stories never reach children on validation alone.
- **Nine specialist Claude Code agents** (orchestrator plus eight) with contracts in `.claude/agents/`.

## Quick start

```bash
npm ci
npm run dev        # open the printed URL; on a phone use the same Wi-Fi and the Network URL
npm run check      # everything CI runs
```

The child library starts empty, because no story has passed its human
literacy review and parent approval yet. To try the sample story, open
**For grown-ups**, answer the question, and choose **Play preview** on
*The Fog over Pebble Bay*. (Run `npm run story -- preview <jobId>` first if
the preview shelf is empty.)

## Status

| Area | State |
| --- | --- |
| Reading app, engine, local saves, typography controls | Working, unit tested |
| Parent preview and validation screen | Working; approval and publishing are CLI-only |
| Story schema, graph and literacy validation | Working, unit tested |
| Story production CLI, gates, versioning, recovery | Working, unit tested, demonstrated (`reports/demo/e2e-demo.md`) |
| Sample story *The Fog over Pebble Bay* | Drafted by the narrative-designer agent, revised through nine revisions; AI QA and AI literacy reviews passed on revision 9; **waiting for the parent's decision; not approved; not published** |
| Agents | Nine definitions; invocation verified (`reports/agents/invocation-smoke.md`); started by a person or Claude session, not chained automatically |
| Browser check | Headless Chromium at phone and Chromebook sizes: all 3 endings reached, no errors (`reports/compatibility/headless-browser-check-2026-10-20.md`) |
| Real-device and screen-reader testing | **Not done** |
| Hosting and production deployment | **Not selected; nothing deployed** |

See `docs/REQUIREMENTS_TRACEABILITY.md` for requirement-by-requirement status.

## Repository map

| Path | What |
| --- | --- |
| `src/` | App, engine, validators, literacy analyzer, production logic |
| `scripts/` | Story CLI, story validation, orchestrator, e2e demo, agent checks |
| `schemas/story.schema.json` | Story file contract |
| `prompts/new-story.md` | Reusable story generation request template |
| `config/` | Literacy terminology profiles, publication policy |
| `stories/requests/`, `stories/jobs/` | Story requests and production jobs (all artifacts) |
| `public/stories/catalog.json` | What the app can load: `published` (children) and `previews` (parents) |
| `workflow/` | Work items and requirements (machine-readable) |
| `reports/` | Orchestration, agent, accessibility, compatibility and demo reports |
| `docs/` | Specifications and guides |
| `.claude/agents/` | Specialist agent definitions |

## Next milestone

**Offline-ready pilot.** Add a service worker so the app and approved stories
work offline after first load; the parent approves the sample story in the app,
and it is published through the gates; test on a real
Android 15 phone, an Android tablet and a Chromebook with TalkBack and
ChromeVox; choose hosting and wire the protected deploy step.

# Deployment

## Policy

1. **Hosting: GitHub Pages**, behind a protected `production` environment
   with required reviewers. The deploy workflow is manual
   (`workflow_dispatch`), never automatic on push, so a human triggers it and
   a human approves the environment before anything goes live.
2. **Application deployment and story publication are separate.**
   - Story publication changes `public/stories/catalog.json` and adds a file
     under `public/stories/published/`. It happens only through
     `npm run story -- publish` after the AI QA and AI literacy reviews and
     parent approval, and lands through a reviewed pull request.
   - Application deployment ships whatever code and catalog are on the
     deployed branch. It never changes a story's status.
3. **No AI-generated story is published automatically.** No workflow runs
   `story decide` or `story publish`, and those commands refuse to run inside
   AI agent sessions.

## Workflows

| Workflow | Trigger | Does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | push, pull request | `npm ci`, lint, typecheck, tests, story validation (including catalog gate checks), production build, bundle size summary |
| `.github/workflows/deploy-prepare.yml` | manual (`workflow_dispatch`) | Same checks, builds, then deploys `dist/` to GitHub Pages behind the protected `production` environment. |

## Local build

```bash
npm ci
npm run check      # lint, typecheck, tests, validate stories, build
npm run preview    # serve dist/ locally
```

## One-time GitHub setup (repo owner only)

- [ ] Repo Settings → Pages → Source: "GitHub Actions".
- [ ] Repo Settings → Environments → create `production`, add required
      reviewers (at least the owner).
- [ ] Run the `Deploy to GitHub Pages` workflow from the Actions tab (or
      `workflow_dispatch`) and approve the `production` environment when
      prompted.

## Still worth doing before announcing it widely

- [ ] Serve `catalog.json` and `stories/**` with short cache lifetimes, and
      hashed JS and CSS assets with long ones (GitHub Pages' defaults are
      already reasonable here; revisit only if story updates look stale).
- [ ] Record the release in `CHANGELOG.md` and tag it.
- [ ] Test on an Android 15 device and a Chromebook before announcing.

Rollback: re-run the workflow against an earlier commit/tag. Story rollback:
publish a new version, or revert the catalog change in a pull request.

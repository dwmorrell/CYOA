# Deployment

## Policy

1. **No public production deployment yet.** Hosting has not been selected.
   Until it is, the deploy workflow only builds and uploads an artifact.
2. **Application deployment and story publication are separate.**
   - Story publication changes `public/stories/catalog.json` and adds a file
     under `public/stories/published/`. It happens only through
     `npm run story -- publish` after the AI QA and AI literacy reviews and
     parent approval, and lands through a reviewed pull request.
   - Application deployment ships whatever code and catalog are on `main`. It
     never changes a story's status.
3. **No AI-generated story is published automatically.** No workflow runs
   `story decide` or `story publish`, and those commands refuse to run inside
   AI agent sessions.

## Workflows

| Workflow | Trigger | Does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | push, pull request | `npm ci`, lint, typecheck, tests, story validation (including catalog gate checks), production build, bundle size summary |
| `.github/workflows/deploy-prepare.yml` | manual (`workflow_dispatch`) | Same checks, then uploads `dist/` as a build artifact. No hosting step. |

## Local build

```bash
npm ci
npm run check      # lint, typecheck, tests, validate stories, build
npm run preview    # serve dist/ locally
```

## When hosting is chosen

Any static host works (GitHub Pages, Cloudflare Pages, Netlify, Firebase
Hosting). Before enabling a deploy step:

- [ ] Owner picks the host and creates a protected GitHub environment
      (for example `production`) with required reviewers.
- [ ] Add the deploy step to `deploy-prepare.yml` behind that environment.
- [ ] Serve `catalog.json` and `stories/**` with short cache lifetimes, and
      hashed JS and CSS assets with long ones.
- [ ] Serve over HTTPS (required for installability and speech on some devices).
- [ ] Record the release in `CHANGELOG.md` and tag it.
- [ ] Test on an Android 15 device and a Chromebook before announcing.

Rollback: redeploy the previous artifact or tag. Story rollback: publish a
new version, or revert the catalog change in a pull request.

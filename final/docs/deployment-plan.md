# Autonomous Deployment Plan

## Objectives

- Provide a hands-free deployment workflow that validates every change, keeps production in a releasable state, and publishes updates automatically after approval.
- Guarantee that the Gemini-powered AI functionality keeps working across environments by managing credentials and configuration in the pipeline.
- Offer clear operational guidance so engineers, QA, and product stakeholders can understand the release cadence, rollback levers, and monitoring touchpoints.

## Environment Strategy

| Environment | Purpose | Trigger | Hosting | Notes |
|-------------|---------|---------|---------|-------|
| Local | Feature development, exploratory testing | `npm run dev` | Developer machine | Requires a personal `VITE_GEMINI_API_KEY` in `.env.local`. |
| Pull Request (CI) | Automated quality gate before merge | Pull requests to `main` | GitHub Actions `CI` workflow | Runs tests and build to catch regressions early. |
| Preview | QA validation, stakeholder demos | Pull requests | Vercel preview deployments via `Deploy to Vercel` workflow | Uses the same build artefact as CI and publishes a shareable preview URL. |
| Production | Customer-facing release | Merge/push to `main` or manual promotion | Vercel production environment via `Deploy to Vercel` workflow | Promotes the verified build; supports instant rollback from the Vercel dashboard. |
| Static fallback | Optional static export | Manual trigger | GitHub Pages via `Deploy to GitHub Pages` workflow | Retained for backup hosting or disaster recovery drills. |

## Branching & Release Management

1. **Feature branches**: developers branch from `main` and open pull requests when ready. Small, incremental changes are encouraged.
2. **Pull request checks**: the `CI` workflow installs dependencies, runs Vitest, and builds the application. Merges are blocked until this workflow succeeds.
3. **Production deployment**: merges to `main` automatically queue the **Deploy to Vercel** workflow, which promotes the tested artefact to the production environment. Vercel retains prior deployments, so rollbacks are a single click.
4. **Manual redeploy**: maintainers can rerun the workflow from the Actions tab or use Vercel’s **Promote to Production** button on a validated preview build. The GitHub Pages workflow remains available for static redeploys if required.

## Pipeline Implementation

### 1. Continuous Integration (`.github/workflows/ci.yml`)

- **Checkout & toolchain**: uses `actions/checkout@v4` and `actions/setup-node@v4` with Node.js 20 and npm caching for repeatable builds.
- **Dependency installation**: `npm ci` guarantees a clean install aligned with `package-lock.json`.
- **Quality gates**:
  - `npm run test -- --run` executes Vitest in run mode to surface failing suites.
  - `npm run build` ensures the static bundle compiles before merge.
- **Gemini credentials**: the build step reads `GEMINI_API_KEY`/`VITE_GEMINI_API_KEY` from repository secrets so tests that rely on the configuration can use fallbacks safely without exposing keys.

### 2. Continuous Deployment – Vercel (`.github/workflows/vercel-deploy.yml`)

- **Trigger**: runs on pull requests and pushes to `main`.
- **Quality gates**: repeats installation, tests, and the production build so the Vercel deploy only executes when artefacts are green.
- **Preview deploys**: pull requests publish prebuilt artefacts to the Vercel preview environment and expose the URL via workflow summary/environment metadata.
- **Production deploys**: pushes to `main` reuse the same artefact and promote it to the production environment with zero downtime. A fallback step mirrors `GEMINI_API_KEY` into `VITE_GEMINI_API_KEY` when only the server-side secret is configured.
- **Concurrency control**: cancels superseded runs per branch (`group: vercel-${{ github.ref }}`) so only the latest commit deploys.
- **Environment sync**: `npx vercel pull` keeps the `.vercel` directory in sync, ensuring local CLI usage matches CI.

### 3. Static export fallback (`.github/workflows/deploy.yml`)

- **Trigger**: manual or pushes to `main` when GitHub Pages hosting is required.
- **Purpose**: retain the previous Pages-based deployment mechanism for redundancy or migration windows.
- **Operation**: builds the Vite project and publishes to GitHub Pages via `actions/deploy-pages@v4`.

### 4. Automation flow at a glance

```
developer push/PR --> CI workflow (install → test → build)
                     │
                     └── success ──► Deploy to Vercel workflow (install → test → build → deploy)
                                           │
                                           ├── pull request ➜ Vercel preview URL
                                           └── main branch  ➜ Vercel production site
```

Every job emits workflow summary annotations. Configure branch protection to require the **CI** workflow before merging, ensuring only artefacts that pass automated checks can progress to production.

### 4. Quality gates & artefacts

- CI uploads Vitest results and the production build output (`dist/`) as ephemeral artefacts for debugging. Enable the "retention period" defaults (90 days) for traceability.
- Deployment exposes the live URL and commit SHA in the run summary, giving stakeholders a direct link for smoke testing.
- Timeout guards (15 minutes per job) fail fast if installations hang, notifying the team earlier.

## Configuration & Secrets

| Name | Type | Scope | Description |
|------|------|-------|-------------|
| `GEMINI_API_KEY` | Repository secret | Workflows | Gemini API key shared across build and runtime. Used as the fallback client key when `VITE_GEMINI_API_KEY` is absent. |
| `VITE_GEMINI_API_KEY` | Repository secret / local env var | Workflows & developer machines | Client-exposed Gemini key. Mirror the server key in secrets and set a personal value in `.env.local` for local runs. |
| `VERCEL_TOKEN` | Repository secret | Workflows | Token used by the GitHub Action to authenticate with Vercel. Generate from Vercel account settings. |
| `VERCEL_ORG_ID` | Repository secret | Workflows | Organization identifier from the Vercel project settings. |
| `VERCEL_PROJECT_ID` | Repository secret | Workflows | Project identifier from the Vercel project settings. |

**Setup checklist:**

1. Store `GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` in the repository secrets UI.
2. Connect the repository to a Vercel project and configure the environment variables described in [docs/vercel-deployment.md](vercel-deployment.md).
3. (Optional) Enable GitHub Pages with the "GitHub Actions" source to keep the static fallback workflow operational.
4. (Optional) Restrict the `production` environment with reviewers for controlled releases.

## Observability & Quality Signals

- **Workflow status**: monitor the `CI` and `Deploy to Vercel` workflows in the Actions tab. Failures block releases.
- **Deployment history**: Vercel exposes preview/production timelines and build logs for traceability. If you keep the Pages fallback, monitor its workflow as well.
- **Release dashboards**: pin the latest Vercel preview/production URLs (and fallback host, if used) to the team dashboard for at-a-glance health.
- **Synthetic checks**: configure an UptimeRobot/Checkly probe that hits the Vercel production URL after each deployment and alerts on non-200 responses. Mirror the check for the Pages fallback when active.
- **Runtime monitoring**: integrate browser analytics or error tracking (e.g., Google Analytics, Sentry) in future iterations to watch for regressions post-release.

## Rollback & Incident Response

1. **Immediate rollback**: revert or cherry-pick fixes onto `main`. The deployment workflow republishes automatically.
2. **Hotfix policy**: create a hotfix branch from `main`, land the fix with an expedited PR, and allow CI to validate before deployment.
3. **Secret rotation**: if the Gemini key is compromised, rotate it in the Google Cloud console and update the `GEMINI_API_KEY` secret. Redeploy using the manual trigger once updated.

## Operational Runbooks

### Pre-merge checklist (engineers)

1. Branch from `main` and keep commits focused and reviewable.
2. Run `npm run test` and `npm run build` locally before pushing to surface dependency issues earlier.
3. Ensure relevant UI changes include screenshots or Storybook references for design sign-off.
4. Verify any Gemini prompt or model updates against sandbox credentials before submitting the PR.

### Post-deploy verification (QA / product)

1. Inspect the Vercel deployment summary (preview or production) to confirm the correct commit SHA and environment URL.
2. Execute the smoke test checklist: application loads, Gemini-backed flows respond with expected latencies, and analytics beacons fire.
3. Record the verification outcome in the deployment log (GitHub issue or Notion page) for auditability. Include fallback host status if used.

### Incident playbook (on-call engineer)

1. Capture context: failed workflow logs, Vercel deployment status, and any user-facing impact. Include Pages fallback signals if the backup host is active.
2. Decide on rollback vs. hotfix within 15 minutes of detection.
3. Communicate status in the team channel and open an incident ticket containing root-cause hypotheses and mitigation steps.
4. Schedule a retro once the incident is resolved to catalogue preventive actions.

## Release Workflow & Responsibilities

| Role | Primary duties | Handoffs |
|------|----------------|----------|
| Feature engineer | Develop features, author tests, maintain documentation, respond to PR feedback. | Signals QA once PR is ready and CI passes. |
| Reviewer | Perform code review, confirm automated checks, ensure product/UX acceptance criteria are met. | Approves merge or requests changes. |
| QA/Product | Conduct targeted exploratory testing on the deployed Vercel preview/production environment (and fallback host when used). | Signs off in deployment log, alerts on regressions. |
| On-call engineer | Monitors workflows, owns incident response, coordinates rollback/hotfix. | Updates stakeholders post-resolution. |

## Maintenance Cadence

- **Weekly**: prune stale preview branches, review GitHub Actions runtime usage, and refresh the deployment log with notable releases.
- **Monthly**: rotate Gemini API keys, verify backup owners for the `production` environment, and update dependency snapshots via `npm audit fix --dry-run` for awareness.
- **Quarterly**: revisit pipeline configuration (Node.js version, caching strategy) and expand automated checks (Lighthouse, accessibility) as the product evolves.

## Future Enhancements

- Add visual regression or Lighthouse checks directly in the Vercel pipeline to protect UX quality gates.
- Automate notifications (Slack/Teams) on deployment completion and failures for better team awareness.
- Expand monitoring with uptime checks and error alerting to close the feedback loop after release.

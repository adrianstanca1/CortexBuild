# Vercel Deployment Guide

This document describes how to connect the project to Vercel for preview and production hosting.

## Prerequisites

- Vercel account with access to create projects and manage environment variables.
- Vercel CLI (`npm i -g vercel`) for local validation (optional but recommended).
- GitHub repository admin access to configure secrets for the automation workflow.

## 1. Create the Vercel project

1. Navigate to the Vercel dashboard and click **Add New… → Project**.
2. Import this GitHub repository and keep the default **Vite** framework detection.
3. When prompted for the build command and output directory, accept the defaults: `npm run build` and `dist`.
4. Finish the import; the first build will run once the required environment variables are provided (next section).

## 2. Configure environment variables

Set the following variables in the Vercel dashboard (`Settings → Environment Variables`):

| Name | Environment | Description |
| ---- | ----------- | ----------- |
| `GEMINI_API_KEY` | Preview & Production | Server-side Gemini key used by API routes and for parity with local builds. |
| `VITE_GEMINI_API_KEY` | Preview & Production | Client-exposed Gemini key injected at build time. Use the same value as `GEMINI_API_KEY` if you only manage one credential. |
| `VITE_API_BASE_URL` | Optional per environment | Set if you connect the UI to an external authentication service. Leave unset to use the encrypted in-browser mock API. |

The `vercel.json` file also declares named secrets (`@gemini_api_key`, `@api_base_url`). You can manage them with the CLI:

```bash
# Add/update shared Gemini secret
vercel secrets add gemini_api_key YOUR_KEY_VALUE

# Optional: API base URL shared across all environments
vercel secrets add api_base_url https://auth.example.com
```

 > **Note:** Secrets referenced in `vercel.json` apply to every environment. If you need different API base URLs per environment, define `VITE_API_BASE_URL` directly in the Vercel dashboard (or with `vercel env add`) for each environment; those values will override the shared secret.
 
> **Note:** Secrets referenced in `vercel.json` (like `@api_base_url`) apply to all environments. To use different API base URLs for preview and production, define `VITE_API_BASE_URL` as a separate environment variable for each specific environment in the Vercel project settings. These environment-specific variables will override the shared secret.
 
## 3. Connect GitHub Actions deployment

The workflow at [`.github/workflows/vercel-deploy.yml`](../.github/workflows/vercel-deploy.yml) handles previews (pull requests) and production deployments (pushes to `main`). Configure these repository secrets in GitHub (`Settings → Secrets and variables → Actions`):

| Secret | Purpose |
| ------ | ------- |
| `VERCEL_TOKEN` | Personal token from the Vercel dashboard (`Account Settings → Tokens`). |
| `VERCEL_ORG_ID` | Organization ID, available under the project’s **Settings → General** page. |
| `VERCEL_PROJECT_ID` | Project ID from the same settings page. |
| `GEMINI_API_KEY` | Shared Gemini credential; used during CI builds and as a fallback if `VITE_GEMINI_API_KEY` isn’t provided. |
| `VITE_GEMINI_API_KEY` | (Optional) Client-side Gemini key if you need a distinct credential. |

Once the secrets are in place, every pull request receives a preview URL and merges to `main` publish to the production environment. The workflow cancels superseded runs so only the latest commit deploys.

## 4. Local preview with Vercel CLI (optional)

Developers can validate the Vercel build locally:

```bash
# Pull environment variables defined in vercel.json / dashboard
vercel pull --yes --environment=preview

# Build using the same command as CI
npm run build

# Deploy a disposable preview (requires VERCEL_TOKEN)
vercel deploy --prebuilt
```

## 5. Monitoring & rollback

- Vercel retains build logs and deployment history in the project dashboard.
- Use the **Promote to Production** button on a successful preview deployment for controlled releases.
- Roll back by selecting a previous deployment and clicking **Rollback**; the GitHub workflow will pick up the new production URL automatically.

For more operational details (testing expectations, incident response, on-call flow), refer to [docs/deployment-plan.md](deployment-plan.md).

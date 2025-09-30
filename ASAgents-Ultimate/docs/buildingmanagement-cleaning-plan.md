# BuildingManagement Platform Cleaning & Rebuild Plan

This plan captures how we stabilise the existing AS Agents codebase while preparing a fresh, production-ready **BuildingManagement** platform. It is structured so backend, frontend, DevOps, and QA contributors can execute work in parallel.

## 1. Repository & Environment Strategy

1. **Create a dedicated `buildingmanagement/` workspace** inside the monorepo to host the new application shell while we continue supporting legacy modules. Keep shared utilities in `/utils` and `/services` but document ownership.
2. **Standardise environment configuration** via TypeScript helpers (see `config/environment.ts`) and a single `config/secrets.template.json` map. All sensitive values must be injected through environment variables or secret managers (e.g., Doppler, Vault, Vercel secrets). No plaintext keys in Git.
3. **Adopt Conventional Commits** and keep the `work` branch as the integration branch. Feature branches should be fast-forward merged after CI passes. Tag milestones once QA signs off.
4. **Tooling baseline**
   - Node 20 LTS, pnpm or npm 10.
   - Vitest + Testing Library for unit/integration tests.
   - Playwright smoke tests for UI once pages stabilise.
   - GitHub Actions (or GitLab CI) pipeline with lint ➜ test ➜ build ➜ deploy steps.

## 2. Backend & API Roadmap

1. **Authentication & tenancy**
   - Upgrade the auth gateway to consume Supabase (or another IDP) once credentials are populated. The environment helper already reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Maintain mock fallbacks for local/offline development.
   - Add tenancy guard middleware that resolves company context by subdomain or user claims.
2. **Core services**
   - Projects & work orders: move `mockApi.ts` routes into an Express/Fastify service backed by PostgreSQL (multitenant via schema or row-level security).
   - Financial ledger: persist invoices, expenses, KPIs; expose reporting endpoints powering the financial dashboards.
   - Operations: store safety incidents, inspections, resource assignments.
3. **Integrations**
   - Gemini API (content insights, summarisation) via the `services/ai.ts` module once `GEMINI_API_KEY` is provisioned.
   - Mapping (Mapbox/Leaflet) with key stored in secrets template.
4. **Testing & observability**
   - Contract tests for each endpoint (Vitest + supertest).
   - Add structured logging (Pino) and metrics (OpenTelemetry + exporter) for prod readiness.

## 3. Frontend Roadmap

1. **Application shell**
   - Scaffold a clean `buildingmanagement/App.tsx` that reuses authentication context but isolates new navigation, layout, and tenant switching UI.
   - Implement lazy-loaded routes for Dashboard, Financials, Operations, Settings.
2. **UI/UX improvements**
   - Adopt a consistent design system (Shadcn or Chakra) with tokens stored in `tailwind.config` / CSS variables.
   - Expand analytics instrumentation via `analyticsService` and ensure privacy controls (cookie consent, opt-out).
   - Add offline/queued mutation indicators using the backend gateway state.
3. **Feature parity**
   - Migrate registration, login, and dashboard flows from legacy components, ensuring accessibility (WCAG AA) and responsive design.
   - Provide admin tooling for tenant provisioning, invite management, and user role assignment.
4. **Quality gates**
   - Snapshot & interaction tests for critical forms.
   - Lighthouse budgets for performance (>= 90) and best practices.

## 4. Data & Infrastructure

1. **Schema consolidation**
   - Define Prisma or Drizzle schema for multi-tenant data with migrations tracked in Git.
   - Document data retention, backup, and restore processes. Hook `backupService` into scheduled jobs once backend is live.
2. **Secrets management**
   - Populate `config/secrets.template.json` with the required keys and maintain an internal runbook for rotation procedures.
   - Enforce environment validation at startup using the helpers in `config/environment.ts`.
3. **Deployment**
   - Stage ➜ production promotion using feature flags. Keep `buildingmanagement` behind an allow list until parity is achieved.
   - Deploy backend to managed Postgres + container runtime (Fly.io, Render, Railway) with automated migrations.
   - Deploy frontend to Vercel or Netlify with preview environments per PR.

## 5. Cleanup & Migration Checklist

- [ ] Stabilise auth flows with new environment config (in progress).
- [ ] Decommission redundant branches after verifying code merged into `work`.
- [ ] Remove duplicated dependencies and stale scripts (partially complete).
- [ ] Capture current analytics, AI, and mapping credentials in secrets manager and update deployment configs.
- [ ] Prepare migration playbook for legacy tenants to the new backend once live.

## 6. Next Steps

1. Wire `config/environment.ts` into remaining services (maps, analytics uploads, etc.).
2. Stand up backend scaffolding (Fastify + Prisma) under `buildingmanagement/server`.
3. Draft UI prototypes and component library tokens.
4. Schedule QA session to validate tenant switching, registration, and dashboard data integrity before go-live.

This document serves as the canonical cleaning and rebuilding plan. Update it as initiatives progress to keep the team aligned.

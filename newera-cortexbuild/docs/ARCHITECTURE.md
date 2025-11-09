# NewEra-CortexBuild — Solution Architecture

## 1. Frontend (`apps/web`)
- **Stack**: React 19, Vite, TanStack Query, Zustand, Tailwind.
- **Modules**: Core shell, Project Ops, Financials, Field Tools, AI Studio, Marketplace.
- **State/Data**: Multi-tenant context, offline cache via IndexedDB + Service Worker, background sync workers.
- **AI Integration**: Client SDK for bot prompts, embedded copilots per module, WebSocket streaming.

## 2. Backend (`apps/api`)
- **Framework**: Express + tRPC-like contracts, modular service layer, Zod validation.
- **Database**: Postgres (primary) with Prisma, pgvector; SQLite for local dev.
- **Services**:
  - Auth & Org (JWT, Magic links, OAuth)
  - Project Operations (RFIs, Submittals, Schedules, Tasks)
  - Financial Automation (Budgets, Invoices, Pay Apps, Stripe payouts)
  - Automation Engine (workflow graph + agent runtime)
  - AI Orchestration (LLM providers, MCP tooling, knowledge base)
  - Integrations (Procore, QuickBooks, BIM 360)
- **Infra**: Container-first, IaC (Pulumi), horizontal scaling via Kubernetes or Fly.io, event-driven tasks via BullMQ/Redis.

## 3. Shared Packages
- `packages/shared/types` — domain models, DTOs, API contracts.
- `packages/shared/ui` — headless components, theming, design tokens.
- `packages/shared/automation` — workflow DSL, agent templates.

## 4. Cross-Cutting Concerns
- **Observability**: OpenTelemetry traces, structured logging, SLO dashboards.
- **Security**: Row-level security per tenant, encrypted secrets, least-privilege service accounts.
- **Testing**: Vitest/Jest for unit, Playwright for e2e, Pact tests for contracts.
- **CI/CD**: GitHub Actions with monorepo matrix, preview envs, automated migrations.

## 5. Deployment Targets
- Frontend: Vercel/Netlify + static CDN.
- API: Fly.io/Kubernetes (GKE), fallback Railway for preview.
- Data: Managed Postgres (Neon/Supabase), vector store (Supabase pgvector or Pinecone), object storage (S3, R2).

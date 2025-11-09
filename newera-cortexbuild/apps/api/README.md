# API Service

## Planned Stack
- Node 20+, Express 5, Zod, Prisma, BullMQ, pgvector.

## Modules
1. Auth & Tenancy
2. Project Operations (projects, RFIs, submittals, tasks)
3. Financial Automation (budgets, invoices, pay apps)
4. Automation Engine (workflows, agents, schedules)
5. AI Orchestration (chat, document intelligence, copilots)

## Next Steps
- Initialize `package.json`, `tsconfig`, and service folders (`src/modules/*`).
- Define DB schema via Prisma and generate migrations.
- Set up integration tests + contract tests with `vitest`.

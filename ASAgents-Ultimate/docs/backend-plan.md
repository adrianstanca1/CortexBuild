# Backend Architecture and Expansion Plan

This document captures the current state of the persisted backend that now powers clients and invoices, and outlines the next engineering steps for taking it from a pilot service to a production-ready platform.

## Implemented foundation

- **Runtime & framework:** Node.js service built with Express, using SQLite for a lightweight embedded datastore. Requests accept/produce JSON and are CORS enabled so the Vite client can call the API during local development.
- **Schema coverage:** The initial schema provisions `companies`, `users`, `projects`, `clients`, `invoices`, `invoice_line_items`, and `invoice_payments`. Foreign keys are enforced and timestamps (`created_at`, `updated_at`) are automatically maintained.
- **Seed data:** `backend/seed.js` populates ConstructCo with projects, clients, and a small invoice portfolio so that the React UI immediately demonstrates the live data path.
- **REST surface:** The API exposes `/companies/:companyId/clients`, `/companies/:companyId/projects`, `/companies/:companyId/invoices`, `/invoices/:invoiceId`, and `/invoices/:invoiceId/payments` with create/update/read behaviour that mirrors the previous mock API signatures. A `/health` probe reports the connection status which the frontend now surfaces inside the dashboards.
- **Hybrid client behaviour:** The React application automatically switches to the persistent backend when `VITE_BACKEND_URL` is supplied, while maintaining the existing localStorage-backed mock data as an offline fallback.
- **Validation guard rails:** Server routes now enforce strict Zod schemas for create/update flows, date ordering rules for invoices, and safe payment handling that rejects overpayments while emitting structured error payloads.
- **Automated testing:** Vitest + Supertest integration suites cover the clients lifecycle and critical invoice edge cases against an ephemeral SQLite database, ensuring the Express surface stays regression-free.

## Near-term roadmap

| Priority | Item | Rationale |
| --- | --- | --- |
| P0 | Harden validation with shared DTO schemas | Reuse Zod contracts on both server and client to guarantee consistent payload shapes and richer error feedback. |
| P0 | Add migrations + seeding orchestration | Swap the ad-hoc schema creation for versioned migrations (e.g. using Drizzle Kit) and expose `npm run db:migrate` and `npm run db:seed` workflows. |
| P1 | Implement authentication + session middleware | Move beyond the current mock auth by adding a users table with hashed passwords, refresh token rotation, and route guards. |
| P1 | Extend schema to cover expenses, timesheets, and notifications | Unify the in-memory objects with persisted tables so that the entire workspace benefits from the backend rather than only clients/invoices. |
| P1 | Add optimistic concurrency tokens | Introduce `row_version` columns to avoid clobbering concurrent edits from multiple users. |
| P2 | Reporting endpoints | Pre-compute monthly AR/AP summaries, invoice ageing, and utilisation metrics with SQL views or materialised tables for the dashboards. |
| P2 | Background job processor | Schedule tasks (e.g. nightly overdue notifications, data clean-up) via BullMQ or Node timers. |

## Database normalisation targets

1. **Users & Roles:** Introduce `user_roles` join tables so that individuals can belong to multiple companies with different roles. This enables multi-tenant access and prepares the service for external invitations.
2. **Projects & Assignments:** Normalise assignments (`project_assignments`, `resource_assignments`) with proper foreign keys to tasks and users to support forecasting and utilisation reporting.
3. **Audit trail:** Promote the ad-hoc audit log array to a persisted `audit_logs` table capturing `actor_id`, `target`, `changes`, and `metadata` for compliance requirements.
4. **Documents & Media:** Store metadata for documents in SQL while offloading binary storage to S3-compatible object storage. Persist signed URLs and versions for traceability.

## Operational considerations

- **Configuration:** Document environment variables (`PORT`, `DATABASE_PATH`, `VITE_BACKEND_URL`) and default values. Consider shipping `.env.example` for developers.
- **Testing:** Introduce API contract tests (Vitest + supertest) and database integration tests with an ephemeral SQLite database. Seed fixtures per test to ensure isolation.
- **Deployment:** Package the backend as a separate Node process, containerise it with a multi-stage Dockerfile, and prepare a Railway/Render deployment workflow. SQLite can be swapped for PostgreSQL by replacing the driver while keeping the same schema definitions.
- **Observability:** Wire Morgan or Pino for structured logging, add basic request metrics, and pipe errors into a centralised logger.

By following this plan we maintain the fast iteration loop of the current hybrid client while steadily introducing the production hardening that the platform needs as usage scales.

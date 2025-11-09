# NewEra-CortexBuild

Greenfield implementation of the next-generation construction management SaaS derived from CortexBuild learnings.

## Repository Layout
- `apps/web` — Vite/React front-end workspace (modular, offline-ready).
- `apps/api` — TypeScript Node backend (Express + service modules).
- `packages/shared` — Cross-cutting libraries (types, UI kit, automation SDK).
- `docs` — Architecture decisions, deployment runbooks, product specs.
- `scripts` — Dev tooling, scaffolding, database migrations.

## Quick Start (planned)
1. `npm install` from repo root (workspaces).
2. `npm run dev:web` / `npm run dev:api` (to be defined).
3. Configure env vars via `/env/.example`.

## Roadmap Links
- High-level program plan: `../NEWERA_CORTEXBUILD_PLAN.md`
- Architecture detail: `docs/ARCHITECTURE.md`
- Integration bridge to legacy app: `docs/MIGRATION_STRATEGY.md`

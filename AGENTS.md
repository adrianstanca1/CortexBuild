# Repository Guidelines

## Project Structure & Module Organization
- This is a multi‑app workspace. Each app lives in a top‑level folder (e.g., `final/`, `final-1/`, `final-2/`, `main/`, `open-lovable/`, `ASAgents-Ultimate/`, `construction-manager/`, `test-vite/`).
- Typical app layout: `src/`, `public/`, `tsconfig.json`, `vite.config.ts`. Place shared utilities in `src/lib/` and UI in `src/components/`.
- Tests may be co‑located (`src/**/*.test.ts[x]`) or under `tests/` per app.

## Build, Test, and Development Commands
- Install dependencies (root): `pnpm install`
- Run dev server (Vite): `pnpm -C <app> dev` (or `pnpm -C <app> vite`)
- Build for production: `pnpm -C <app> build`
- Preview production build: `pnpm -C <app> preview`
- Run tests (Vitest): `pnpm -C <app> vitest`
- Lint/format (Biome): `pnpm biome check --apply .` (run at root or `-C <app>`)

## Coding Style & Naming Conventions
- Indentation: 2 spaces; TypeScript preferred with strict types.
- Names: PascalCase for components, camelCase for functions/vars, kebab-case for file names (`user-profile.ts`, `ChartCard.tsx`).
- Imports: order as std → external → internal; prefer Vite aliases/absolute imports over deep relatives.
- Styling: Tailwind where present; keep class lists readable and deduplicated.

## Testing Guidelines
- Framework: Vitest. Name tests `*.test.ts`/`*.test.tsx` (or `*.spec.*`).
- Co-locate tests with source or use `tests/` per app; keep units small and deterministic.
- Run full suite before PR: `pnpm -C <app> vitest run` (use `--coverage` if needed).

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise subject (<72 chars). Use short tags when helpful (e.g., `Fix:`, `Feat:`, `Docs:`). Explain the why in the body.
- PRs: include summary, linked issues, steps to test, and screenshots for UI. Ensure build and tests pass for changed apps.
- Avoid unrelated refactors in the same PR.

## Security & Configuration Tips
- Do not commit secrets. Use per‑app `.env.local`; client vars must be prefixed `VITE_`.
- Use Node LTS and PNPM. Update lockfiles intentionally and per app.

## Agent‑Specific Notes
- Scope changes to the affected app directory; keep patches minimal and focused.
- Follow these conventions for any files you touch; do not reformat untouched files.
- Prefer `pnpm -C <app>` commands. If you add scripts/config, document them here.

## App: final
- Env: add `GEMINI_API_KEY` to `final/.env.local`. Vite loads it via `loadEnv` and defines `process.env.*`, so no `VITE_` prefix needed here.
- Aliases: import using `@/` (alias to `final/src`). Example: `import { api } from '@/services/apiClient'`.
- Install: `pnpm -C final install` (runs lifecycle install + deps).
- Develop: `pnpm -C final dev`; Type‑check: `pnpm -C final type-check`.
- Tests (Vitest, jsdom with `tests/setup-simple.ts`):
  - Full run: `pnpm -C final test` or watch: `pnpm -C final test:watch`
  - Coverage: `pnpm -C final test:coverage`
  - Focused: `pnpm -C final test:api` | `test:auth` | `test:websocket` | `test:files`
- Build/Preview: `pnpm -C final build` / `pnpm -C final preview`.
- Backend integration checks: `pnpm -C final test:backend` and `pnpm -C final validate:backend`.
- Deploy: `pnpm -C final deploy:staging` | `deploy:production` (targets: `vercel`, `netlify`, `docker`, or `--dry-run`).

## App: asagents.co.uk-ready
- Location: `Desktop/asagents.co.uk-ready` (uses npm with `package-lock.json`).
- Env: create `.env.local` with `GEMINI_API_KEY` (and optional `VAPID_PUBLIC_KEY`). Deployment config also sets `API_BASE_URL`/`WEBSOCKET_URL` per environment.
- Aliases: `@` maps to project root `.`. Imports: `import { something } from '@/services/ai'`.
- Install/Dev: `npm ci` then `npm run dev` (inside the folder).
- Tests: `npm test` or `npm run test:watch`; coverage: `npm run test:coverage` (tests live in `services/__tests__` and `services/*.test.ts`).
- Build/Preview: `npm run build` / `npm run preview`.
- Deploy: `npm run deploy:staging` | `deploy:production` | target overrides (`deploy:vercel`, `deploy:netlify`, `deploy:docker`, `deploy:dry-run`).

## Root Convenience Scripts
- Examples (run at repo root):
  - `pnpm run final:dev` | `final:build` | `final:test`
  - `pnpm run asagents:dev` | `asagents:build` | `asagents:test`
  - Install: `pnpm run final:install` or `pnpm run asagents:install`

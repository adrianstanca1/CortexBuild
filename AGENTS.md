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
- Env: add `GEMINI_API_KEY` and `OPENAI_API_KEY` to `final/.env.local`. Multi-provider AI system with OpenAI as primary and Gemini as fallback. Also includes GitHub OAuth configuration with private key SHA256. Deployment credentials for IONOS webspace host (access-5018479682.webspace-host.com) configured for SFTP deployment.
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
- Env: create `.env.local` with `GEMINI_API_KEY` and `OPENAI_API_KEY` (and optional `VAPID_PUBLIC_KEY`). Multi-provider AI system for enhanced functionality. GitHub OAuth integration configured with private key SHA256. Production deployment configured for IONOS webspace-host.com SFTP server.
- Aliases: `@` maps to project root `.`. Imports: `import { something } from '@/services/ai'`.
- Install/Dev: `npm ci` then `npm run dev` (inside the folder).
- Tests: `npm test` or `npm run test:watch`; coverage: `npm run test:coverage` (tests live in `services/__tests__` and `services/*.test.ts`).
- Build/Preview: `npm run build` / `npm run preview`.
- Deploy: `npm run deploy:staging` | `deploy:production` | `deploy:ionos` | `deploy:sftp` | target overrides (`deploy:vercel`, `deploy:netlify`, `deploy:docker`, `deploy:dry-run`).

## App: construction-manager
- Framework: Next.js 15 with Turbopack, uses npm with `package-lock.json`.
- UI: Radix UI primitives, Tailwind CSS, shadcn/ui components.
- Install: `npm --prefix construction-manager install`
- Develop: `npm --prefix construction-manager run dev` (Next.js with Turbopack)
- Build/Start: `npm --prefix construction-manager run build` / `npm run start`
- Lint: `npm --prefix construction-manager run lint`

## App: main
- Framework: Vite-based construction management app, React 18.2.
- Features: Leaflet maps with react-leaflet, Google Generative AI integration.
- Install: `pnpm -C main install` or `npm --prefix main install`
- Develop: `pnpm -C main dev` (Vite dev server)
- Build/Preview: `pnpm -C main build` / `pnpm -C main preview`

## App: final-1
- Framework: Vite + React 18.2, TypeScript with Vitest testing.
- Features: Construction management with maps (Leaflet), Google Generative AI.
- Install: `pnpm -C final-1 install`
- Develop: `pnpm -C final-1 dev` (uses `npx vite`)
- Build/Preview: `pnpm -C final-1 build` / `pnpm -C final-1 preview`
- Test: `pnpm -C final-1 test` (Vitest)

## App: final-2
- Framework: Vite + React 18.2, enhanced version with lifecycle scripts.
- Features: Construction management, maps, testing with coverage.
- Install: `pnpm -C final-2 install` (runs custom `scripts/install-deps.mjs`)
- Develop: `pnpm -C final-2 dev`
- Build/Preview: `pnpm -C final-2 build` / `pnpm -C final-2 preview`
- Test: `pnpm -C final-2 test` | `test:watch` | `test:coverage`
- Type-check: `pnpm -C final-2 type-check`
- Deploy: `pnpm -C final-2 deploy` (builds for deployment)

## App: open-lovable
- Framework: Next.js 15 AI coding assistant with multiple AI providers.
- AI Providers: Anthropic, OpenAI, Google, Groq with Vercel AI SDK.
- Features: Code interpreter (@e2b), web scraping (Firecrawl), sandbox execution.
- UI: Radix UI, Framer Motion, Tailwind CSS, syntax highlighting.
- Install: `pnpm -C open-lovable install` or `npm --prefix open-lovable install`
- Develop: `pnpm -C open-lovable dev` (Next.js with Turbopack)
- Build/Start: `pnpm -C open-lovable build` / `pnpm -C open-lovable start`
- Test: `pnpm -C open-lovable run test:api` | `test:code` | `test:all`
- Lint: `pnpm -C open-lovable lint`

## App: test-vite
- Framework: Simple Vite + React 19 test/demo app.
- Purpose: Testing and experimentation with latest Vite/React.
- Install: `pnpm -C test-vite install`
- Develop: `pnpm -C test-vite dev`
- Build/Preview: `pnpm -C test-vite build` / `pnpm -C test-vite preview`
- Lint: `pnpm -C test-vite lint`

## Platform Services (@construction/*)
- Workspace: PNPM workspace defined in `pnpm-workspace.yaml` for `construction-ai-platform/`.
- Packages: `@construction/apps-web`, `@construction/service-api-gateway`, `@construction/service-finance`.
- Note: Platform packages are referenced in root scripts but not yet implemented.
- Root scripts available:
  - `pnpm run platform:install` - Install all platform dependencies
  - `pnpm run platform:dev` - Run web app (`@construction/apps-web`)
  - `pnpm run platform:dev:gateway` - Run API gateway service
  - `pnpm run platform:dev:finance` - Run finance service
  - `pnpm run platform:lint` | `platform:test` | `platform:build` - Run for all platform packages

## Root Convenience Scripts
- Examples (run at repo root):
  - `pnpm run final:dev` | `final:build` | `final:test` | `final:coverage` | `final:deploy:staging`
  - `pnpm run asagents:dev` | `asagents:build` | `asagents:test` | `asagents:deploy:production`
  - `pnpm run platform:dev` | `platform:build` | `platform:test`
  - Install: `pnpm run final:install` | `asagents:install` | `platform:install`

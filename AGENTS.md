# Repository Guidelines

## Project Structure & Module Organization
- Multi-app workspace; each app lives in its own top-level folder such as `final/`, `final-1/`, `final-2/`, `main/`, `open-lovable/`, `construction-manager/`, `test-vite/`, and `Desktop/asagents.co.uk-ready/`.
- Vite apps follow `src/`, `public/`, `tsconfig.json`, and `vite.config.ts`; shared utilities belong in `src/lib/` and UI in `src/components/`.
- Tests are co-located (`src/**/*.test.ts[x]`) or live under each app's `tests/` directory; Next.js app uses the standard `app/` routing in `construction-manager/`.

## Build, Test, and Development Commands
- Install all PNPM workspaces: `pnpm install`; app-specific installs use `pnpm -C <app> install` or `npm --prefix <app> install` as noted below.
- Common Vite workflow: `pnpm -C final dev`, `pnpm -C final build`, `pnpm -C final test`; mirror these for `final-1`, `final-2`, `main`, and `test-vite`.
- Next.js (`construction-manager`): `npm --prefix construction-manager run dev`, `run build`, `run lint`.
- Open AI assistants (`open-lovable`): `pnpm -C open-lovable dev`, `build`, `start`, `lint`.
- asagents.co.uk-ready (Desktop): `npm --prefix Desktop/asagents.co.uk-ready ci`, `run dev`, `run test`.
- Root conveniences: `pnpm run final:dev`, `asagents:test`, `platform:dev` keep multi-package workflows consistent.

## Coding Style & Naming Conventions
- Use TypeScript with 2-space indentation; avoid auto-formatting untouched files.
- Components in PascalCase (`SiteHeader.tsx`); variables/functions camelCase; filenames kebab-case (`user-profile.ts`).
- Imports ordered standard → external → internal; prefer alias imports (`@/services/apiClient`).
- Tailwind class lists should stay concise and deduplicated; document non-obvious UI logic with brief comments.

## Testing Guidelines
- Vitest powers all Vite apps; Next.js app follows npm test scripts.
- Name tests `*.test.ts` or `*.test.tsx`; keep them deterministic and co-locate near source when feasible.
- Full suites: `pnpm -C final test`, `pnpm -C final-2 test:coverage`, `npm --prefix construction-manager test` when added.
- Run `pnpm -C final validate:backend` before backend integrations; use coverage flags for release-ready features.

## Commit & Pull Request Guidelines
- Commits use imperative mood under 72 chars (e.g., `Fix: handle websocket reconnect`).
- PRs should summarize changes, link issues, list validation steps, and include screenshots for UI work.
- Ensure builds and relevant test suites pass before requesting review.

## Security & Configuration Tips
- No secrets in source control; use per-app `.env.local` with `GEMINI_API_KEY` and `OPENAI_API_KEY` (client keys prefixed `VITE_`).
- Respect deploy credentials for IONOS SFTP and OAuth keys; rotate via environment management, not commits.
- Use PNPM with Node LTS and update lockfiles only when intentional per app.

# Deployment Run Log

This log captures each run of the autonomous deployment plan in the local container environment.

## 2025-09-20 (Run 6)

| Step | Command | Result | Notes |
|------|---------|--------|-------|
| 1 | `npm ci` | ✅ Success | Clean reinstall finished in 10s; npm continued reporting 5 moderate advisories for monitoring. |
| 2 | `npm run test -- --run` | ✅ Success | All 24 Vitest tests passed; auth client logged the expected ECONNREFUSED fallback warning. |
| 3 | `GEMINI_API_KEY=test VITE_GEMINI_API_KEY=test npm run build` | ✅ Success | Production build completed in 5.3s with the known Rollup chunk-size advisory still noted. |

## 2025-09-20 (Run 5)

| Step | Command | Result | Notes |
|------|---------|--------|-------|
| 1 | `npm ci` | ✅ Success | Fresh install finished in 4s; npm flagged 5 moderate advisories for monitoring. |
| 2 | `npm run test -- --run` | ✅ Success | All 22 Vitest suites passed; expected mock fallback warning logged for offline auth client tests. |
| 3 | `GEMINI_API_KEY=test VITE_GEMINI_API_KEY=test npm run build` | ✅ Success | Production build completed in 4.1s; Rollup chunk-size warning remains under observation. |

## 2025-09-20 (Run 4)

| Step | Command | Result | Notes |
|------|---------|--------|-------|
| 1 | `npm ci` | ✅ Success | Clean reinstall completed in 4s; npm reported 5 moderate advisories to monitor. |
| 2 | `npx vitest run --reporter=basic` | ✅ Success | All 22 Vitest suites passed; auth client fallback emitted expected ECONNREFUSED warning. |
| 3 | `GEMINI_API_KEY=test VITE_GEMINI_API_KEY=test npm run build` | ✅ Success | Production bundle built in 3.8s; Rollup chunk-size warning persists and is tracked. |

## 2025-09-20 (Run 3)

| Step | Command | Result | Notes |
|------|---------|--------|-------|
| 1 | `npm ci` | ✅ Success | Clean reinstall completed in 4s; npm reported 5 moderate advisories to monitor. |
| 2 | `npx vitest run --reporter=basic` | ✅ Success | All 22 Vitest suites passed; auth client fallback emitted expected ECONNREFUSED warning. |
| 3 | `GEMINI_API_KEY=test VITE_GEMINI_API_KEY=test npm run build` | ✅ Success | Production bundle built in 3.6s; Rollup chunk-size warning persists and is tracked. |

## 2025-09-20 (Run 2)

| Step | Command | Result | Notes |
|------|---------|--------|-------|
| 1 | `npm ci` | ✅ Success | Reinstalled dependencies; npm reported 5 moderate advisories to monitor. |
| 2 | `npm run test -- --run` | ✅ Success | Vitest suites for auth client/API, finance helpers, and registration draft passed using fresh installs. |
| 3 | `GEMINI_API_KEY=test VITE_GEMINI_API_KEY=test npm run build` | ✅ Success | Production bundle generated; noted Rollup chunk size warning for main bundle. |

## 2025-09-20

| Step | Command | Result | Notes |
|------|---------|--------|-------|
| 1 | `npm ci` | ✅ Success | Fresh install with npm cache; reported 5 moderate advisories. |
| 2 | `npm run test -- --run` | ✅ Success | Vitest suites for auth client/API and utilities all passed. |
| 3 | `GEMINI_API_KEY=test VITE_GEMINI_API_KEY=test npm run build` | ✅ Success | Generated production bundle; noted large chunk warning from Rollup. |

All artefacts from the run are available in the local `node_modules/` cache and `dist/` build output. No manual intervention was required.

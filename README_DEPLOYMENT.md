# CortexBuild Deployment Quickstart

## Local

```bash
cp .env.example .env.local
npm install
npm run db:init:sqlite
npm run dev:all
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Vercel (Frontend)
- Framework: Vite
- Build: npm run build
- Output: dist
- Env vars:
  - VITE_DATABASE_MODE=supabase
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_GOOGLE_GEMINI_API_KEY (optional)
  - VITE_ENABLE_DESKTOP_MODE=true
  - VITE_ENABLE_MARKETPLACE=true

## Backend (Render or Any Node Host)
- Start: npm run server
- Env vars:
  - PORT=3001
  - SUPABASE_SERVICE_KEY
  - VITE_SUPABASE_URL
  - ALLOWED_ORIGIN=https://<your-vercel-app>
  - GEMINI_API_KEY or GOOGLE_AI_API_KEY (optional)

Smoke checks:
```bash
curl -sS http://localhost:3001/api/health | jq
curl -sS http://localhost:3001/api/workflows | head -n1
```


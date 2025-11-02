# 🚀 CortexBuild Ultimate - Deployment Guide

## Overview

This guide will help you deploy the most advanced version of CortexBuild with all features enabled:
- ✅ Dual database support (SQLite + Supabase)
- ✅ Base44Clone desktop environment
- ✅ 5 role-based dashboards
- ✅ Workflow automation (N8N + Zapier + Procore)
- ✅ 6 AI agents (OpenAI, Gemini, Claude)
- ✅ Full marketplace ecosystem
- ✅ Real-time collaboration
- ✅ 64+ API endpoints

---

## Prerequisites

### Required Accounts
1. **Vercel Account** (free tier works)
2. **Supabase Account** (paid plan recommended for production)
3. **GitHub Account** (for version control)

### Optional Services (for full functionality)
4. **OpenAI API Key** (for AI features)
5. **Google Gemini API Key** (for AI features)
6. **Anthropic Claude API Key** (for AI features)
7. **Procore Account** (for Procore integrations)

---

## Step 1: Environment Configuration

### 1.1 Create `.env.local` file

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### 1.2 Configure Environment Variables

```env
# Database Mode
VITE_DATABASE_MODE=supabase

# Supabase Configuration
VITE_SUPABASE_URL=<YOUR_SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
SUPABASE_SERVICE_KEY=your-service-key

# AI Services (all optional, enable what you have)
VITE_OPENAI_API_KEY=<YOUR_OPENAI_KEY>
VITE_GOOGLE_GEMINI_API_KEY=<YOUR_GEMINI_KEY>
VITE_ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_KEY>

# Feature Flags (all enabled by default)
VITE_ENABLE_DESKTOP_MODE=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_WORKFLOWS=true
VITE_ENABLE_MARKETPLACE=true
VITE_ENABLE_REALTIME=true
```

---

## Step 2: Supabase Database Setup

### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set a strong database password (save it!)
5. Wait for project to be created (~2 minutes)

### 2.2 Run Database Migrations

1. Go to SQL Editor in Supabase
2. Click "New Query"
3. Copy and paste from `supabase/COMPLETE_SCHEMA.sql`
4. Click "Run" to execute
5. Verify tables created in Table Editor

### 2.3 Update User Passwords

Run this SQL in Supabase to create test users:

```sql
-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update passwords for test users
UPDATE users
SET password_hash = crypt('parola123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@gmail.com';

UPDATE users
SET password_hash = crypt('lolozania1', gen_salt('bf', 10))
WHERE email = 'adrian@ascladdingltd.co.uk';

UPDATE users
SET password_hash = crypt('password123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@icloud.com';
```

### 2.4 Automate Setup (Optional)

You can bootstrap Supabase schema and seed data using the included tooling:

```bash
# Option A: Run the consolidated SQL schema manually (recommended for production)
#   Location: supabase/COMPLETE_SCHEMA.sql

# Option B: Use the helper script (local/dev convenience)
node setup-supabase.ts

# Or via npm script if available
npx tsx setup-supabase.ts
```

Verify connectivity from backend to Supabase (locally):

```bash
curl -sS http://localhost:3001/api/health | jq
```

---

## Step 3: Local Testing

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Run Development Server

```bash
npm run dev
```

### 3.3 Test Key Features

1. **Login** with test credentials
2. **Toggle Desktop Mode** - Click the grid icon
3. **Test Dashboards** - Navigate between different views
4. **Try Workflows** - Access workflow builder
5. **Test AI Agents** - Use AI features if keys configured
6. **Browse Marketplace** - View available apps

---

## Step 4: Vercel Deployment

### 4.1 Connect to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option B: Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Follow the setup wizard

### 4.2 Configure Build Settings

In Vercel project settings:

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`
**Node Version:** 18.x

### 4.3 Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
VITE_DATABASE_MODE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-...
VITE_GOOGLE_GEMINI_API_KEY=AI...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_ENABLE_DESKTOP_MODE=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_WORKFLOWS=true
VITE_ENABLE_MARKETPLACE=true
VITE_ENABLE_REALTIME=true
```

### 4.4.1 If Using a Separate Backend (Render/Other)

When deploying the backend separately, set `VITE_API_URL` in Vercel so the frontend calls the external API base:

```
VITE_API_URL=https://your-backend.onrender.com/api
```

Optionally add a `vercel.json` to proxy certain routes during preview or to provide fallbacks:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend.onrender.com/api/:path*" }
  ]
}
```

### 4.4 Deploy

**Via CLI:**
```bash
vercel --prod
```

**Via Dashboard:**
- Push to your repository's main branch
- Vercel will auto-deploy

---

## Step 4B: Backend Deployment (Render.com)

### 4B.1 Create a Web Service

1. Go to Render → New → Web Service
2. Connect to your GitHub repo (or deploy from Docker if preferred)
3. Environment: Node 18
4. Build Command: `npm install`
5. Start Command: `npm run server`

### 4B.2 Environment Variables (Backend)

Required for full functionality:

```
PORT=3001
NODE_ENV=production

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT
JWT_SECRET=your_secure_jwt_secret_min_32_chars

# CORS
ALLOWED_ORIGIN=https://your-frontend.vercel.app
```

Optional:

```
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ANTHROPIC_API_KEY=
```

After deploy, note your backend URL, e.g. `https://your-backend.onrender.com`. If the frontend is on Vercel, set `VITE_API_URL` to `https://your-backend.onrender.com/api`.

---

## Step 5: Post-Deployment Configuration

### 5.1 Custom Domain (Optional)

1. Go to Vercel → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for SSL certificate (~5 minutes)

### 5.2 Enable Analytics

1. Go to Vercel → Analytics tab
2. Enable Web Analytics
3. Enable Speed Insights

### 5.3 Configure Monitoring

**Vercel Monitoring:**
- Automatically tracks deployments
- Monitors function errors
- Shows real-time metrics

**Recommended: Add Sentry (Optional)**
```bash
npm install @sentry/react
```

Add to your main app file:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

---

## Step 6: Verification Checklist

After deployment, verify all features work:

- [ ] **Application Loads** - No errors in console
- [ ] **Login Works** - Can authenticate successfully
- [ ] **Database Connected** - Data loads from Supabase
- [ ] **Desktop Mode** - Can toggle between views
- [ ] **Dashboards** - All 5 role-based dashboards render
- [ ] **Workflows** - Workflow builder accessible
- [ ] **AI Features** - AI agents respond (if keys configured)
- [ ] **Marketplace** - Apps display and install
- [ ] **Real-time** - Notifications work
- [ ] **Mobile Responsive** - Works on mobile devices

### 6.1 Fast Verification Commands

```bash
# Backend health
curl -sS https://your-backend.onrender.com/api/health | jq

# Auth: login (returns token)
curl -sS -X POST \
  https://your-backend.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"adrian.stanca1@gmail.com","password":"parola123"}' | jq

# Example: projects (requires token)
TOKEN="$(curl -sS -X POST https://your-backend.onrender.com/api/auth/login -H 'Content-Type: application/json' -d '{"email":"adrian.stanca1@gmail.com","password":"parola123"}' | jq -r .token)"
curl -sS https://your-backend.onrender.com/api/projects \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Step 7: Performance Optimization

### 7.1 Enable Compression

Vercel automatically enables:
- Brotli compression
- Gzip fallback
- Edge caching

### 7.2 Monitor Bundle Size

View bundle analysis:
```bash
npm run build
# Check dist/stats.html
```

### 7.3 Optimize Images

For any images you add:
- Use WebP format
- Implement lazy loading
- Use responsive images

---

## Common Issues & Solutions

### Issue: "Supabase connection failed"
**Solution:**
- Verify environment variables in Vercel
- Check Supabase project is active
- Confirm anon key is correct

### Issue: "CORS blocked"
**Solution:**
- Ensure backend `ALLOWED_ORIGIN` includes your Vercel domain
- Confirm backend CORS middleware allows credentials and correct origin

### Issue: "AI features not working"
**Solution:**
- Verify API keys are set
- Check API key permissions
- Ensure sufficient credits/quota

### Issue: "Desktop mode not showing"
**Solution:**
- Check `VITE_ENABLE_DESKTOP_MODE=true`
- Clear browser cache
- Verify Base44Clone component loaded

### Issue: "Build fails"
**Solution:**
- Check Node version (18.x)
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npm run lint`

### Issue: "Login works locally but fails on Vercel"
**Solution:**
- If using separate backend, ensure `VITE_API_URL` is set in Vercel
- If using Vercel serverless only, do not set `VITE_API_URL` (frontend will use `/api`)
- Verify server URL and HTTPS

---

## Monitoring & Maintenance

### Daily Tasks
- Check error logs in Vercel
- Monitor database usage in Supabase
- Review user feedback

### Weekly Tasks
- Update dependencies: `npm update`
- Review analytics data
- Backup database

### Monthly Tasks
- Security updates
- Performance review
- Feature usage analysis

---

## CI/CD Examples

### GitHub Actions: Vercel Frontend Deploy

```yaml
name: Deploy Frontend
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - name: Vercel Deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .
          prod: true
```

### GitHub Actions: Render Backend Deploy (via Deploy Hook)

```yaml
name: Deploy Backend
on:
  push:
    paths:
      - 'server/**'
      - 'package.json'
      - 'package-lock.json'
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trigger Render Deploy Hook
        run: |
          curl -sS -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
```

---

## Environment Variable Matrix

| Scope      | Variable                   | Local Dev                        | Vercel (Frontend)                         | Render (Backend)                        |
|------------|----------------------------|----------------------------------|-------------------------------------------|-----------------------------------------|
| Frontend   | VITE_DATABASE_MODE         | supabase                         | supabase                                  | n/a                                     |
| Frontend   | VITE_SUPABASE_URL          | your Supabase URL                | your Supabase URL                         | n/a                                     |
| Frontend   | VITE_SUPABASE_ANON_KEY     | your Supabase anon key           | your Supabase anon key                    | n/a                                     |
| Frontend   | VITE_API_URL               | http://localhost:3001/api        | https://your-backend.onrender.com/api     | n/a                                     |
| Backend    | SUPABASE_SERVICE_KEY       | service role key (secure)        | n/a                                       | service role key (secure)               |
| Backend    | JWT_SECRET                 | dev secret (>=32 chars)          | n/a                                       | strong secret (>=32 chars)              |
| Backend    | PORT                       | 3001                             | n/a                                       | 3001                                    |
| Backend    | ALLOWED_ORIGIN             | http://localhost:3000            | n/a                                       | https://your-frontend.vercel.app        |
| Optional   | OPENAI_API_KEY             | key or empty                     | set if used                               | set if used                              |
| Optional   | GOOGLE_AI_API_KEY          | key or empty                     | set if used                               | set if used                              |
| Optional   | ANTHROPIC_API_KEY          | key or empty                     | set if used                               | set if used                              |

## Scaling for Production

### Database Scaling
- Upgrade Supabase plan for more connections
- Enable connection pooling
- Add read replicas if needed

### Frontend Scaling
- Vercel auto-scales
- Monitor bandwidth usage
- Consider CDN for assets

### Backend Scaling
- Use Vercel Serverless Functions
- Consider separate API server for heavy workloads
- Implement caching (Redis)

---

## Support & Resources

**Documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)

**Community:**
- GitHub Issues
- Discord (if you create one)

**Professional Support:**
- Vercel Support (Pro/Enterprise plans)
- Supabase Support (Pro/Enterprise plans)

---

## Security Best Practices

1. **Never commit** `.env.local` to git
2. **Rotate API keys** regularly
3. **Enable** Supabase RLS policies
4. **Use** HTTPS only (Vercel handles this)
5. **Monitor** for suspicious activity
6. **Keep** dependencies updated
7. **Implement** rate limiting on APIs

---

## Success! 🎉

Your CortexBuild Ultimate deployment is complete!

**Access your app at:** `https://your-project.vercel.app`

**Test Accounts:**
- Super Admin: `adrian.stanca1@gmail.com` / `parola123`
- Company Admin: `adrian@ascladdingltd.co.uk` / `lolozania1`
- Developer: `adrian.stanca1@icloud.com` / `password123`

---

**Next Steps:**
1. Create your own admin account
2. Import your company data
3. Invite team members
4. Configure workflows
5. Start building!

**Need Help?** Check the USER_GUIDE.md for detailed feature documentation.


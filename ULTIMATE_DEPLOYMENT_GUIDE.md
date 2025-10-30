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

### 4.4 Deploy

**Via CLI:**
```bash
vercel --prod
```

**Via Dashboard:**
- Push to your repository's main branch
- Vercel will auto-deploy

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


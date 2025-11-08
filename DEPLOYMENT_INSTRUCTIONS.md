# 🚀 CortexBuild Deployment Instructions
## Production Deployment Guide

**Date**: November 4, 2025  
**Status**: ✅ **READY FOR DEPLOYMENT**

---

## 📋 Pre-Deployment Checklist

### ✅ Completed Items
- [x] All TypeScript errors fixed
- [x] Build completes successfully
- [x] Bundle size optimized (82% reduction)
- [x] Error boundaries implemented
- [x] Lazy loading configured
- [x] Authentication flow tested

### 🔄 Required Before Deploy
- [ ] Set environment variables
- [ ] Apply database migrations
- [ ] Test on staging environment
- [ ] Run final build verification

---

## 🔐 Environment Variables

### Frontend (Vercel)

Required environment variables for the React frontend:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Endpoint
VITE_API_URL=https://api.cortexbuild.com/api

# Optional: Analytics
VITE_VERCEL_ANALYTICS_ID=your-analytics-id
```

#### Setting in Vercel:
1. Go to: https://vercel.com/your-username/cortexbuild/settings/environment-variables
2. Add each variable with values
3. Select environments: Production, Preview, Development
4. Click "Save"

### Backend (Render/Railway/Vercel Functions)

Required environment variables for the Express API:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-secure-random-secret-here

# Optional Services
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
STRIPE_SECRET_KEY=your-stripe-key

# CORS
ALLOWED_ORIGINS=https://cortexbuild.com,https://www.cortexbuild.com
```

#### Generating JWT Secret:
```bash
openssl rand -hex 64
```

---

## 🗄️ Database Setup

### 1. Supabase Project Setup

1. **Create Project**:
   - Go to: https://supabase.com/dashboard
   - Click "New Project"
   - Name: `cortexbuild-production`
   - Choose region close to users

2. **Get Credentials**:
   ```
   Settings → API → Project URL
   Settings → API → anon/public key
   Settings → API → service_role key (keep secret!)
   ```

### 2. Run Database Migrations

Check if migrations directory exists:
```bash
ls -la database/migrations/
```

If migrations exist, apply them:

#### Option A: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Verify
supabase db remote ls
```

#### Option B: Using Dashboard SQL Editor
1. Go to: https://supabase.com/dashboard/project/your-project/sql
2. Copy contents of each migration file
3. Execute in order (001, 002, 003...)
4. Verify tables exist in Table Editor

### 3. Seed Initial Data (Optional)

If you have seed data:
```bash
# Check for seed files
ls -la database/seeds/

# Run seeds via Supabase
supabase db seed
```

Or manually via SQL Editor:
```sql
-- Example: Create initial super admin
INSERT INTO users (id, email, name, role, password_hash)
VALUES (
  gen_random_uuid(),
  'admin@cortexbuild.com',
  'System Administrator',
  'super_admin',
  crypt('ChangeMe123!', gen_salt('bf'))
);
```

---

## 🏗️ Build & Deploy

### Local Build Verification

Before deploying, verify build locally:

```bash
# Clean previous builds
rm -rf dist/

# Install dependencies
npm install

# Run production build
npm run build

# Verify output
ls -lh dist/

# Test production build locally
npm run preview
# Then open: http://localhost:4173
```

Expected output:
```
✓ 2493 modules transformed
✓ built in ~20s
dist/index.html          1.15 kB
dist/assets/index.js   161.54 kB (39.58 kB gzipped)
... (more chunks)
```

### Deploy to Vercel (Frontend)

#### Option 1: Deploy via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Verify deployment
vercel ls
```

#### Option 2: Deploy via GitHub

1. **Connect Repository**:
   - Go to: https://vercel.com/new
   - Import Git Repository
   - Select `CortexBuild` repo
   - Click "Import"

2. **Configure Build**:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**:
   - Scroll to "Environment Variables"
   - Add all `VITE_*` variables
   - Check "Production", "Preview", "Development"

4. **Deploy**:
   - Click "Deploy"
   - Wait for build (~2 minutes)
   - Get deployment URL

### Deploy Backend API

#### Option 1: Vercel Serverless Functions

If using Vercel for backend:
```bash
# Create /api directory in root
mkdir -p api

# Move server files
cp -r server/* api/

# Deploy (will auto-detect API routes)
vercel --prod
```

#### Option 2: Render.com

1. **Create Web Service**:
   - Go to: https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your repo
   - Name: `cortexbuild-api`

2. **Configure Service**:
   ```
   Environment: Node
   Build Command: npm install
   Start Command: node server/index.js
   ```

3. **Add Environment Variables**:
   - Add all backend variables
   - Include `DATABASE_URL`, `JWT_SECRET`, etc.

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for build
   - Get API URL: `https://cortexbuild-api.onrender.com`

5. **Update Frontend**:
   - Update `VITE_API_URL` in Vercel to point to Render URL
   - Redeploy frontend

#### Option 3: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=...

# Deploy
railway up

# Get URL
railway status
```

---

## 🧪 Testing Deployment

### 1. Health Check

```bash
# API health check
curl https://api.cortexbuild.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-04T00:00:00.000Z",
  "uptime": 12345,
  "database": "connected"
}
```

### 2. Authentication Test

```bash
# Test login endpoint
curl -X POST https://api.cortexbuild.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "Test User", ... }
}
```

### 3. Frontend Test

Open in browser:
```
https://cortexbuild.vercel.app
```

Test checklist:
- [ ] Landing page loads
- [ ] Login form appears
- [ ] Can login with test credentials
- [ ] Dashboard loads after login
- [ ] Navigation works
- [ ] No console errors

---

## 🔍 Monitoring & Debugging

### Vercel Logs

```bash
# View deployment logs
vercel logs cortexbuild-prod

# Real-time logs
vercel logs --follow
```

### Supabase Logs

1. Go to: https://supabase.com/dashboard/project/your-project/logs
2. Select "Database" or "API" logs
3. Filter by error level
4. Check for authentication errors

### Performance Monitoring

Add Vercel Analytics:
```bash
npm install @vercel/analytics
```

```typescript
// In main.tsx
import { Analytics } from '@vercel/analytics/react';

<App />
<Analytics />
```

### Error Tracking

Add Sentry:
```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// In main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## 🔄 Post-Deployment

### 1. Domain Setup

#### Point Custom Domain to Vercel:
1. Go to: Project Settings → Domains
2. Add your domain: `cortexbuild.com`
3. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 2. SSL Certificate

Vercel automatically provisions SSL certificates.
- Check at: Settings → Domains
- Should show "Valid" with green checkmark
- HTTPS will work immediately

### 3. CDN & Caching

Vercel Edge Network automatically handles:
- Global CDN distribution
- Static asset caching
- Edge middleware

Verify caching:
```bash
curl -I https://cortexbuild.com/assets/index.js

# Check for:
cache-control: public, max-age=31536000, immutable
```

### 4. Performance Audit

Run Lighthouse:
```bash
npm install -g lighthouse
lighthouse https://cortexbuild.com --view
```

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found`
**Solution**: 
```bash
# Clear cache and rebuild
vercel --force

# Or via dashboard: Settings → General → Clear Build Cache
```

### API Connection Failed

**Error**: `Failed to fetch`
**Solution**:
1. Check CORS settings on backend:
   ```typescript
   app.use(cors({
     origin: ['https://cortexbuild.com', 'https://www.cortexbuild.com'],
     credentials: true
   }));
   ```

2. Verify `VITE_API_URL` in Vercel matches API domain

### Database Connection Errors

**Error**: `Connection refused`
**Solution**:
1. Check Supabase project status
2. Verify `DATABASE_URL` or `SUPABASE_URL`
3. Check IP allowlist (if restricted)
4. Test connection:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

### Authentication Not Working

**Error**: `Invalid token`
**Solution**:
1. Verify `JWT_SECRET` matches between deployments
2. Check token expiry (default 7 days)
3. Clear localStorage:
   ```javascript
   localStorage.clear();
   ```

---

## 📊 Deployment Status Dashboard

After deployment, monitor at:
- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://supabase.com/dashboard
- **Render**: https://dashboard.render.com/ (if using)

### Key Metrics to Watch:
1. **Response Time**: < 500ms
2. **Error Rate**: < 1%
3. **Uptime**: 99.9%+
4. **Build Time**: < 3 minutes
5. **Bundle Size**: As optimized

---

## 🎉 Success Checklist

- [ ] ✅ Build successful on Vercel
- [ ] ✅ API responding to health checks
- [ ] ✅ Database migrations applied
- [ ] ✅ Authentication working
- [ ] ✅ All environment variables set
- [ ] ✅ Custom domain configured
- [ ] ✅ SSL certificate active
- [ ] ✅ Performance scores > 85
- [ ] ✅ No critical errors in logs
- [ ] ✅ Real users can login and use app

---

## 📞 Support & Resources

### Documentation
- **Vite**: https://vitejs.dev/guide/
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **React**: https://react.dev/

### Community
- **GitHub Issues**: [Your repo]/issues
- **Discord**: [Your community]
- **Email**: support@cortexbuild.com

---

**Deployment Guide Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: ✅ **READY FOR PRODUCTION**

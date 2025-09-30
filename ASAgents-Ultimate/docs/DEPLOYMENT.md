# 🚀 Deployment Guide

## Prerequisites

### Required Accounts
- **Vercel Account** - https://vercel.com
- **GitHub Account** - Repository connected
- **Database** - PostgreSQL or Supabase

### Required Tools
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

## Environment Variables

### Production (.env.production)
```bash
# API Configuration
VITE_API_BASE_URL=https://api.asagents.com
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Database
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Services
VITE_GEMINI_API_KEY=your-gemini-key
VITE_OPENAI_API_KEY=your-openai-key

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_ANALYTICS=true

# App Info
VITE_APP_VERSION=1.0.0
```

### Staging (.env.staging)
```bash
# Same as production but with staging URLs
VITE_API_BASE_URL=https://staging-api.asagents.com
# ... other vars
```

## Deployment Methods

### Method 1: Vercel CLI (Recommended)

#### Deploy to Staging
```bash
# Run deployment script
./scripts/deploy-staging.sh

# Or manually
pnpm run build
vercel
```

#### Deploy to Production
```bash
# Run deployment script
./scripts/deploy-production.sh

# Or manually
pnpm run build
vercel --prod
```

### Method 2: GitHub Actions (Automatic)

#### Setup GitHub Secrets
1. Go to GitHub repository → Settings → Secrets
2. Add the following secrets:
   - `VERCEL_TOKEN` - From Vercel dashboard
   - `VERCEL_ORG_ID` - From Vercel project settings
   - `VERCEL_PROJECT_ID` - From Vercel project settings

#### Trigger Deployment
```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```

### Method 3: Vercel Dashboard

1. Connect GitHub repository
2. Configure build settings:
   - **Build Command:** `pnpm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
3. Add environment variables
4. Deploy

## Post-Deployment Checklist

### After Staging Deployment
- [ ] Verify application loads
- [ ] Test authentication flow
- [ ] Check API connectivity
- [ ] Test core features
- [ ] Review console for errors
- [ ] Check PWA installation

### After Production Deployment
- [ ] Verify DNS/domain configuration
- [ ] Test SSL certificate
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify analytics tracking
- [ ] Test from multiple devices
- [ ] Update documentation
- [ ] Announce to team

## Rollback Procedure

### Vercel Rollback
```bash
# List deployments
vercel ls

# Promote a previous deployment
vercel promote [deployment-url]
```

### Manual Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout specific commit
git checkout [commit-hash]
```

## Monitoring

### Check Deployment Status
```bash
# Vercel deployment status
vercel ls

# Check logs
vercel logs [deployment-url]
```

### Health Checks
```bash
# Check if app is running
curl https://asagents.com

# Check API health
curl https://api.asagents.com/health
```

## Troubleshooting

### Build Fails
```bash
# Check build locally
pnpm run build

# Check TypeScript errors
pnpm run type-check

# Check for missing dependencies
pnpm install
```

### Runtime Errors
1. Check Vercel logs
2. Review browser console
3. Verify environment variables
4. Check API connectivity

### Performance Issues
1. Check bundle size: `pnpm run build --report`
2. Review lighthouse score
3. Check CDN caching
4. Optimize images

## Continuous Deployment

### Branch Strategy
```
main (production)
  └── develop (staging)
       └── feature/* (development)
```

### Deployment Flow
```
1. Create feature branch
2. Develop and test locally
3. Push to feature branch
4. Create PR to develop
5. Auto-deploy to staging on merge
6. Test on staging
7. Create PR to main
8. Auto-deploy to production on merge
```

## Additional Resources

- **Vercel Documentation:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/actions
- **Vite Deployment:** https://vitejs.dev/guide/static-deploy

---

**Need Help?** Check the troubleshooting section or contact the dev team.

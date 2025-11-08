# CortexBuild Deployment Guide

Complete guide for deploying CortexBuild to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Option 1: Deploy to Vercel (Recommended)](#option-1-deploy-to-vercel-recommended)
- [Option 2: Deploy to IONOS via FTP](#option-2-deploy-to-ionos-via-ftp)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- Node.js 18+ installed
- npm or yarn package manager
- Built application (`npm run build`)

### Optional

- Git repository (for Vercel)
- Supabase account (for cloud features)
- Domain name

## Option 1: Deploy to Vercel (Recommended)

Vercel provides the easiest deployment experience with automatic builds and scaling.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Configure Project

The project is already configured with [vercel.json](vercel.json):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Step 4: Deploy

**Development Preview**:
```bash
npm run vercel:deploy
# or
vercel
```

**Production**:
```bash
npm run vercel:prod
# or
vercel --prod
```

### Step 5: Set Environment Variables in Vercel

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```bash
# Supabase Configuration (Optional)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=https://your-api-domain.com/api

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-secure-encryption-key

# AI Services (Optional)
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

### Step 6: Redeploy with Environment Variables

```bash
vercel --prod
```

### Vercel Configuration

**Automatic Deployments**:
- Push to `main` branch = Production deployment
- Push to other branches = Preview deployment

**Custom Domain**:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed

## Option 2: Deploy to IONOS via FTP

Deploy the built application to IONOS hosting via FTP.

### Step 1: Configure FTP Credentials

Create or update `.env.local`:

```bash
IONOS_FTP_HOST=your-ftp-host.ionos.com
IONOS_FTP_USER=your-username
IONOS_FTP_PASSWORD=your-password
IONOS_REMOTE_PATH=/htdocs  # or your web root
```

### Step 2: Build the Application

```bash
npm run build
```

This creates the `dist/` directory with production files.

### Step 3: Deploy via FTP

```bash
npm run deploy
```

This script ([deploy-ionos.cjs](deploy-ionos.cjs)):
1. Connects to IONOS FTP server
2. Cleans remote directory
3. Uploads all files from `dist/`

### Manual FTP Upload

If automated deployment fails:

1. Build: `npm run build`
2. Connect to FTP using FileZilla or similar
3. Upload contents of `dist/` to your web root
4. Ensure `.htaccess` is configured for SPA routing

### .htaccess Configuration

Create `.htaccess` in your web root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## Environment Variables

### Development (.env.local)

See [.env.local](.env.local) for local development configuration.

### Production

**Required for Full Features**:

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Optional* |
| `VITE_SUPABASE_ANON_KEY` | Supabase public key | Optional* |
| `VITE_API_URL` | Backend API URL | Optional** |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ENCRYPTION_KEY` | Data encryption key | Yes |

*Optional: App works with local auth if not provided
**Optional: Defaults to `/api` if not provided

**Optional AI Features**:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI GPT integration |
| `GEMINI_API_KEY` | Google Gemini integration |

### Generating Secure Keys

**JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Encryption Key**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Post-Deployment

### 1. Verify Deployment

Visit your deployed URL and check:

- ✅ Application loads without errors
- ✅ Authentication works
- ✅ Browser console shows no critical errors
- ✅ Network requests succeed

### 2. Configure Supabase (If Used)

1. Add production URL to Supabase Auth settings
2. Update OAuth redirect URLs
3. Test authentication flow

### 3. Set Up Custom Domain (Optional)

**Vercel**:
1. Go to project settings
2. Add domain
3. Configure DNS

**IONOS**:
1. Domain already configured via hosting
2. Ensure proper SSL certificate

### 4. Configure CORS

If using separate backend API:

```typescript
// In your API server
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-production-domain.com'
  ],
  credentials: true
}));
```

### 5. Enable Service Worker (Optional)

Service worker is included for PWA features:
- Offline support
- Push notifications
- Asset caching

Located at [public/sw.js](public/sw.js) and [public/service-worker.js](public/service-worker.js).

### 6. Monitor Performance

**Recommended Tools**:
- Vercel Analytics (built-in)
- Google Analytics
- Sentry for error tracking
- Supabase Dashboard for DB metrics

## CI/CD Setup

### GitHub Actions (Vercel)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Git Repository Setup

If not using git yet:

```bash
# Initialize git (if not done)
git init

# Add remote
git remote add origin https://github.com/your-username/cortexbuild.git

# Push to remote
git add .
git commit -m "Initial deployment"
git push -u origin main
```

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails
**Solutions**:
- Check for TypeScript errors: `npm run lint`
- Clear cache: `rm -rf node_modules dist && npm install`
- Check Node version: `node -v` (should be 18+)

### Environment Variables Not Working

**Issue**: Variables not loaded in production
**Solutions**:
- Ensure variables start with `VITE_` for client-side
- Redeploy after adding variables
- Check Vercel environment variable scope (Production/Preview/Development)

### 404 on Refresh

**Issue**: Page refresh returns 404
**Solutions**:
- **Vercel**: Should handle automatically
- **IONOS**: Add `.htaccess` configuration (see above)

### Supabase Connection Fails

**Issue**: Can't connect to Supabase in production
**Solutions**:
- Verify environment variables are set
- Check Supabase project is active
- Ensure production URL in Supabase Auth settings
- Verify CORS configuration

### API Requests Fail

**Issue**: Backend API not reachable
**Solutions**:
- Check `VITE_API_URL` is correct
- Verify CORS settings on backend
- Check backend is deployed and running
- Test API endpoint directly

### SSL Certificate Issues

**Issue**: HTTPS not working
**Solutions**:
- **Vercel**: Automatic SSL, wait a few minutes
- **IONOS**: Contact hosting support to enable SSL

## Performance Optimization

### Build Optimizations

Already configured in [vite.config.ts](vite.config.ts):
- Code splitting
- Tree shaking
- Minification
- Source maps for debugging

### Additional Optimizations

1. **Enable CDN** (Vercel automatically provides)
2. **Compress Assets**:
   ```bash
   # Already handled by Vite
   ```
3. **Lazy Load Routes**: Already implemented with React.lazy()
4. **Optimize Images**: Use WebP format when possible

### Monitoring

```bash
# Test build size
npm run build
ls -lh dist/

# Analyze bundle
npm run build -- --stats
```

## Security Checklist

Before deploying to production:

- ✅ Environment variables use production values
- ✅ Secure JWT secret (64+ characters)
- ✅ HTTPS enabled
- ✅ CORS properly configured
- ✅ Supabase RLS policies active
- ✅ API rate limiting enabled
- ✅ Error messages don't expose sensitive data
- ✅ Dependencies updated (`npm audit`)

## Rollback Procedure

### Vercel

1. Go to project deployments
2. Find previous working deployment
3. Click "Promote to Production"

### IONOS FTP

1. Keep backup of previous `dist/` folder
2. Re-upload backup files via FTP

## Next Steps After Deployment

1. ✅ Test all features in production
2. ✅ Set up monitoring and alerts
3. ✅ Configure backup strategy
4. ✅ Document custom domain setup
5. ✅ Train users on new system
6. Plan for scaling (if needed)

## Support

- **Vercel Issues**: [Vercel Support](https://vercel.com/support)
- **IONOS Issues**: [IONOS Support](https://www.ionos.com/help)
- **Supabase Issues**: [Supabase Support](https://supabase.com/support)

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run dev:all            # Start dev + backend

# Building
npm run build              # Production build
npm run preview            # Preview production build

# Deployment
npm run vercel:deploy      # Deploy to Vercel preview
npm run vercel:prod        # Deploy to Vercel production
npm run deploy             # Deploy to IONOS via FTP

# Testing
npm run lint               # Check code quality
npm test                   # Run tests (if configured)
```

---

**Ready to deploy!** Choose your platform and follow the steps above.

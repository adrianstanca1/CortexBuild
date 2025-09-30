# ASAgents.o.uk Domain Deployment Guide

## Overview
This document outlines the steps to deploy ASAgents Ultimate to the asagents.o.uk domain.

## Current Status
✅ Project builds successfully (7.16s build time)
✅ Bundle size optimized (169.70 kB, 55.18 kB gzipped)
✅ Vercel configuration ready
✅ Environment variables configured

## Domain Configuration Steps

### 1. Update Environment Variables for Production

Create production environment file:
```bash
# Production API endpoints
VITE_API_BASE_URL=https://asagents.o.uk/api
VITE_BACKEND_URL=https://asagents.o.uk/api
VITE_SERVER_URL=https://asagents.o.uk/api

# Update CORS origins
CORS_ORIGINS=https://asagents.o.uk,https://www.asagents.o.uk

# Production mode
NODE_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
```

### 2. Vercel Domain Configuration

```bash
# Link domain in Vercel
vercel domains add asagents.o.uk

# Deploy to production with domain
vercel --prod --prebuilt
```

### 3. DNS Configuration

Add these DNS records to your domain provider:

```
Type: CNAME
Name: asagents
Value: cname.vercel-dns.com

Type: CNAME  
Name: www.asagents
Value: cname.vercel-dns.com
```

### 4. SSL Certificate

Vercel automatically provides SSL certificates for custom domains.
The certificate will be issued once DNS propagation is complete.

### 5. Deployment Commands

```bash
# 1. Clean previous builds
rm -rf dist/
rm -rf node_modules/.vite

# 2. Fresh install
npm install --legacy-peer-deps

# 3. Build for production
npm run build

# 4. Deploy to Vercel
vercel --prod

# 5. Configure custom domain
vercel domains add asagents.o.uk
```

### 6. Post-Deployment Verification

Test these URLs after deployment:
- https://asagents.o.uk
- https://asagents.o.uk/api/health
- https://asagents.o.uk/api/projects
- https://asagents.o.uk/api/analytics/dashboard

### 7. Production Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Environment variables updated
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Performance optimized
- [ ] Error monitoring active

## Expected Performance
- Build time: ~7 seconds
- Bundle size: 55.18 kB gzipped
- First load: <2 seconds
- Lighthouse score: 90+

## Monitoring URLs
- Production: https://asagents.o.uk
- API Status: https://asagents.o.uk/api/health
- Vercel Dashboard: https://vercel.com/dashboard

## Support
Contact development team for deployment issues or domain configuration problems.
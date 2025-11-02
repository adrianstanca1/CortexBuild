# 🚀 CortexBuild Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying CortexBuild to production environments. CortexBuild is a modern construction management platform built with React, Node.js, and Supabase.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **Docker**: 20.x or higher (for Docker deployment)

### Required Services
- **Supabase**: Database and authentication
- **Gemini API**: AI features (Google Cloud)
- **Domain**: For production hosting
- **SSL Certificate**: For HTTPS

## 🔧 Environment Configuration

### 1. Production Environment Variables

Copy `.env.production` to your deployment environment and update the following variables:

```bash
# Application Settings
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# Database (Supabase)
SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
CORS_ORIGIN=https://your-domain.com

# Frontend Variables (VITE_)
VITE_API_URL=https://your-api-domain.com
VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 2. Security Configuration

**Important Security Steps:**
- Generate a strong JWT secret (minimum 32 characters)
- Set up proper CORS origins
- Configure rate limiting
- Enable HTTPS in production
- Set up proper firewall rules

## 🏗️ Build Process

### 1. Local Production Build

```bash
# Install dependencies
npm ci --only=production

# Run production build
npm run build:prod

# Test production build locally
npm run preview
```

### 2. Build Verification

The build process includes:
- ✅ TypeScript compilation
- ✅ ESLint checks
- ✅ Test execution
- ✅ Frontend optimization
- ✅ Asset compression
- ✅ Bundle analysis

## 🌐 Deployment Options

### Option 1: Vercel Deployment (Recommended)

**Quick Deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
./scripts/deploy-vercel.sh
```

**Manual Vercel Setup:**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

### Option 2: Docker Deployment

**Build and Run:**
```bash
# Build and deploy with Docker
./scripts/deploy-docker.sh
```

**Manual Docker Setup:**
```bash
# Build Docker image
docker build -t cortexbuild:latest .

# Run container
docker run -d \
  --name cortexbuild-app \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env.production \
  cortexbuild:latest
```

### Option 3: Traditional VPS/Server

**Server Setup:**
```bash
# Clone repository
git clone https://github.com/your-username/cortexbuild.git
cd cortexbuild

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start dist/server/index.js --name cortexbuild

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) provides:

- **Automated Testing**: Runs on every push/PR
- **Security Scanning**: Vulnerability detection
- **Performance Testing**: Lighthouse CI
- **Automated Deployment**: To Vercel/Docker

**Required Secrets:**
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

## 📊 Monitoring & Maintenance

### Health Checks

**API Health Endpoint:**
```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600
}
```

### Performance Monitoring

**Key Metrics to Monitor:**
- Response times (< 200ms for API)
- Memory usage (< 512MB)
- CPU usage (< 70%)
- Database connections
- Error rates (< 1%)

### Backup Strategy

**Database Backups:**
- Supabase provides automatic backups
- Set up additional backup schedule if needed
- Test restore procedures regularly

**Application Backups:**
- Source code in Git repository
- Environment configurations
- SSL certificates
- Custom configurations

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm ci
npm run build
```

**Database Connection Issues:**
```bash
# Verify Supabase connection
npm run verify:supabase
```

**Performance Issues:**
```bash
# Analyze bundle size
npm run build:analyze

# Check memory usage
docker stats cortexbuild-app
```

### Support Contacts

- **Technical Issues**: Check GitHub Issues
- **Deployment Help**: Review this documentation
- **Emergency**: Contact system administrator

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, Cloudflare)
- Deploy multiple instances
- Implement session storage (Redis)

### Database Scaling
- Supabase handles scaling automatically
- Monitor connection limits
- Implement connection pooling if needed

### CDN Setup
- Use Cloudflare or AWS CloudFront
- Cache static assets
- Optimize image delivery

---

## 🎉 Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] Documentation updated

## 🔧 Post-Deployment Tasks

### 1. Verify Deployment
```bash
# Test all critical endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 2. Set Up Monitoring
- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up error tracking (Sentry)
- Enable performance monitoring
- Configure alerts for critical issues

### 3. Security Hardening
- Enable firewall rules
- Set up DDoS protection
- Configure rate limiting
- Regular security updates

### 4. Performance Optimization
- Enable gzip compression
- Set up CDN
- Optimize database queries
- Monitor and tune performance

## 📱 Mobile & PWA Setup

CortexBuild includes PWA capabilities:

```json
// manifest.json is included
{
  "name": "CortexBuild",
  "short_name": "CortexBuild",
  "theme_color": "#667eea",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

## 🔄 Update Process

### Rolling Updates
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
npm ci --only=production

# 3. Run tests
npm run test:run

# 4. Build new version
npm run build

# 5. Deploy with zero downtime
pm2 reload cortexbuild
```

### Database Migrations
```bash
# Apply new migrations
npm run migrate:supabase

# Verify migration success
npm run verify:supabase
```

**Your CortexBuild application is now ready for production! 🚀**

---

*For additional support, refer to the GitHub repository or contact the development team.*

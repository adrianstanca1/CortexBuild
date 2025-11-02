# CortexBuild Deployment Guide

## Overview

This guide covers deploying CortexBuild to production on Vercel with Supabase as the backend.

---

## Prerequisites

- Node.js 18+ and npm/yarn
- Vercel account
- Supabase account
- GitHub repository
- Environment variables configured

---

## Environment Setup

### 1. Supabase Configuration

#### Create Supabase Project

1. Go to <https://supabase.com>
2. Create new project
3. Note the project URL and API keys

#### Database Setup

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user',
  company_id UUID,
  password VARCHAR,
  avatar VARCHAR,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  subscription_tier VARCHAR DEFAULT 'free',
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id),
  status VARCHAR DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  budget DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'todo',
  priority VARCHAR DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  file_path VARCHAR,
  file_type VARCHAR,
  file_size INTEGER,
  category VARCHAR,
  project_id UUID REFERENCES projects(id),
  uploaded_by UUID REFERENCES users(id),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  amount DECIMAL NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR,
  user_agent VARCHAR,
  status VARCHAR DEFAULT 'success',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Company admins can see company data
CREATE POLICY "Company admins can view company data"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.company_id = companies.id
      AND users.role IN ('company_admin', 'super_admin')
    )
  );
```

### 2. Environment Variables

Create `.env.local` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API
VITE_API_URL=http://localhost:3001/api

# OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_WEBHOOKS=true
```

### 3. Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "VITE_API_URL": "@api_url"
  },
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/.*\\.[a-f0-9]{8}\\.(js|css|woff2|png|jpg|jpeg|gif|svg|webp)$",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Deployment Steps

### 1. Local Build Testing

```bash
# Install dependencies
npm install

# Build locally
npm run build

# Test build
npm run preview
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to <https://vercel.com>
2. Import GitHub repository
3. Configure environment variables
4. Deploy

### 4. Post-Deployment

```bash
# Verify deployment
curl https://your-domain.vercel.app/

# Check Service Worker
curl https://your-domain.vercel.app/service-worker.js

# Test API
curl https://your-domain.vercel.app/api/health
```

---

## Production Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] RLS policies enabled
- [ ] Backup created

### Deployment

- [ ] Build successful
- [ ] Vercel deployment successful
- [ ] Service Worker registered
- [ ] Cache headers applied
- [ ] SSL certificate valid

### Post-Deployment

- [ ] Application loads
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Database queries work
- [ ] Real-time subscriptions work
- [ ] Service Worker active
- [ ] Offline mode works

### Monitoring

- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Logs accessible
- [ ] Alerts configured

---

## Troubleshooting

### Build Failures

**Issue:** Build fails with TypeScript errors

```bash
# Solution: Check for type errors
npm run build

# Fix errors and rebuild
npm run build
```

**Issue:** Missing environment variables

```bash
# Solution: Add to Vercel dashboard
# Settings > Environment Variables
```

### Runtime Issues

**Issue:** Service Worker not registering

```bash
# Check browser console
# Verify service-worker.js exists
# Check HTTPS is enabled
```

**Issue:** Database connection fails

```bash
# Verify Supabase URL and key
# Check RLS policies
# Verify network access
```

**Issue:** API requests fail

```bash
# Check CORS headers
# Verify API URL
# Check authentication token
```

### Performance Issues

**Issue:** Slow initial load

```bash
# Check bundle size
npm run build

# Verify code splitting
# Check lazy loading
```

**Issue:** High memory usage

```bash
# Check for memory leaks
# Verify subscriptions cleanup
# Check component unmounting
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl https://your-domain.vercel.app/api/health

# Check database connection
curl https://your-domain.vercel.app/api/db/health

# Check Service Worker
curl https://your-domain.vercel.app/service-worker.js
```

### Logs

**Vercel Logs:**

```bash
vercel logs --prod
```

**Supabase Logs:**

- Go to Supabase dashboard
- View logs in Logs section

**Browser Console:**

- Open DevTools
- Check Console tab for errors

### Updates

```bash
# Update dependencies
npm update

# Test updates
npm run build
npm run test

# Deploy updates
git push origin main
```

---

## Rollback Procedure

### If Deployment Fails

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel will automatically redeploy
```

### If Issues Found Post-Deployment

```bash
# Check Vercel deployments
vercel list

# Rollback to previous deployment
vercel rollback
```

---

## Performance Optimization

### Bundle Size

- Current: 88.44 KB (gzip: 24.28 KB)
- Target: < 100 KB (gzip)

### Load Time

- First visit: < 3 seconds
- Repeat visits: < 1 second (cached)

### Core Web Vitals

- LCP: < 2.5 seconds
- FID: < 100 milliseconds
- CLS: < 0.1

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] RLS policies enabled
- [ ] API authentication required
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens used

---

## Next Steps

- See [API Documentation](./API_DOCUMENTATION.md) for endpoint details
- See [Architecture Documentation](./ARCHITECTURE.md) for system design
- See [Component Documentation](./COMPONENT_DOCUMENTATION.md) for UI components

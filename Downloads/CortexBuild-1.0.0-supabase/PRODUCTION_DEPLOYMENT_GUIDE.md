# 🚀 CortexBuild Production Deployment Guide

**Complete guide for deploying CortexBuild to production with marketplace enhancements**

---

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure:

- [x] ✅ Code builds successfully (`npm run build`)
- [x] ✅ All changes committed to git
- [ ] ⚠️ Supabase project created (optional but recommended)
- [ ] ⚠️ Environment variables ready
- [ ] ⚠️ Vercel account ready

---

## 🎯 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

**Quick Deploy:**

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your repository (or import from local)
4. Configure environment variables (see below)
5. Click "Deploy"

---

## 🔐 Environment Variables

Set these in Vercel Dashboard or via CLI:

### Required for Production

```bash
# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Supabase Configuration (RECOMMENDED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Frontend URL (your Vercel domain)
VITE_APP_URL=https://your-app.vercel.app
```

### Optional (for advanced features)

```bash
# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Anthropic Claude (for AI features)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Google Gemini (for AI chatbot)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `cortexbuild-marketplace`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### Step 2: Run Database Schema

1. In Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy entire content from: `supabase/MARKETPLACE_COMPLETE_SCHEMA.sql`
4. Paste into SQL Editor
5. Click **"Run"** (Cmd/Ctrl + Enter)
6. Verify: "✅ Success. No rows returned"

This creates:
- 8 marketplace tables
- 10 categories with sample data
- 6 featured modules
- Automatic triggers
- Row Level Security (RLS)

### Step 3: Get Supabase Credentials

1. **Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `VITE_SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

---

## 🚀 Deploy to Vercel (Detailed Steps)

### Method 1: CLI Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login
# Follow prompts in browser

# 3. Deploy (first time)
vercel
# Answer prompts:
#   - Set up and deploy? Yes
#   - Which scope? Your account
#   - Link to existing project? No
#   - Project name? cortexbuild
#   - Directory? ./
#   - Override settings? No

# 4. Add environment variables
vercel env add VITE_SUPABASE_URL production
# Paste your Supabase URL and press Enter

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your anon key and press Enter

vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY production
# Paste your service role key and press Enter

vercel env add JWT_SECRET production
# Enter a strong secret (min 32 characters)

# 5. Deploy to production with env vars
vercel --prod

# 6. Save production URL
# Output will show: https://cortexbuild-xyz.vercel.app
```

### Method 2: Vercel Dashboard Deployment

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import" on your repository
   - Or upload project folder

3. **Configure Project**
   - **Project Name**: `cortexbuild`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   - Click "Environment Variables"
   - Add each variable:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = your-anon-key
     VITE_SUPABASE_SERVICE_ROLE_KEY = your-service-key
     JWT_SECRET = your-jwt-secret
     ```
   - Select "Production" for all

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your production URL

---

## ✅ Post-Deployment Verification

### 1. Check Build Status

```bash
# Vercel should show:
✓ Build succeeded
✓ Deployment ready
```

### 2. Test Application

Visit your Vercel URL:
```
https://your-app.vercel.app
```

**Test Checklist:**
- [ ] ✅ App loads without errors
- [ ] ✅ Can access login page
- [ ] ✅ Can login with test credentials
- [ ] ✅ Dashboard displays correctly
- [ ] ✅ Marketplace shows categories
- [ ] ✅ Can view modules
- [ ] ✅ Console shows no errors

### 3. Test Marketplace APIs

```bash
# Get your auth token first by logging in
# Then test endpoints:

# Test Categories
curl https://your-app.vercel.app/api/marketplace/categories \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return categories

# Test Modules
curl https://your-app.vercel.app/api/marketplace/modules?featured=true \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return featured modules

# Check source
# Response should include: "source": "supabase"
# If "source": "mock", Supabase isn't connected (but still works!)
```

### 4. Verify Database Connection

In browser console (F12):
```javascript
// Should see logs like:
✅ Supabase client initialized successfully!
✅ Fetched 10 categories from Supabase
✅ Fetched 6 modules from Supabase
```

If you see:
```
⚠️ Supabase not configured
📦 Using mock data
```
Then check environment variables in Vercel.

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:**
```bash
# Test build locally
npm run build

# If fails, check for TypeScript errors
npm run type-check
```

**Solution:**
- Fix any TypeScript errors
- Ensure all dependencies in `package.json`
- Commit and redeploy

### Issue: "Database not configured" error

**Check:**
1. Environment variables set in Vercel
2. Variables prefixed with `VITE_` for client-side
3. Supabase project is active

**Solution:**
```bash
# Re-add environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY production

# Redeploy
vercel --prod
```

### Issue: API returns "source": "mock"

**This is OK!** The app works with mock data, but to use Supabase:

1. Verify Supabase credentials are correct
2. Check Supabase project is active
3. Verify database schema was run successfully
4. Check Vercel function logs for errors

### Issue: "Authentication required" errors

**Check:**
1. JWT_SECRET is set in Vercel
2. User is logged in
3. Token is valid

**Solution:**
```bash
# Add/update JWT_SECRET
vercel env add JWT_SECRET production
# Use same secret as in development

# Redeploy
vercel --prod
```

### Issue: Slow API responses

**Optimization:**
1. Ensure Supabase region matches Vercel region
2. Check database indexes are created (auto-created in schema)
3. Monitor Vercel function logs for slow queries

---

## 📊 Monitoring & Logs

### Vercel Dashboard

Access at: `https://vercel.com/your-account/cortexbuild`

**Check:**
- **Deployments**: See all deployments
- **Functions**: Monitor API performance
- **Analytics**: View usage statistics
- **Logs**: Real-time function logs

### Supabase Dashboard

Access at: `https://supabase.com/dashboard/project/your-project`

**Check:**
- **Database**: View tables and data
- **Logs**: Query performance
- **API Logs**: Request tracking
- **Auth**: User sessions

### View Function Logs

```bash
# Via Vercel CLI
vercel logs

# Filter by function
vercel logs --filter="api/marketplace"

# Follow logs in real-time
vercel logs --follow
```

---

## 🔒 Security Checklist

Before going live:

- [ ] ✅ Strong JWT_SECRET (32+ chars, random)
- [ ] ✅ Service role key never exposed to client
- [ ] ✅ RLS enabled on all Supabase tables
- [ ] ✅ CORS configured correctly
- [ ] ✅ Rate limiting enabled
- [ ] ✅ HTTPS enforced (automatic with Vercel)
- [ ] ✅ Environment variables encrypted
- [ ] ✅ No secrets in git history

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to Project Settings → **Domains**
2. Click "Add Domain"
3. Enter your domain: `cortexbuild.com`
4. Follow DNS configuration steps
5. Wait for DNS propagation (5-60 mins)

### SSL Certificate

- ✅ Automatic with Vercel
- ✅ Free Let's Encrypt certificate
- ✅ Auto-renewal

---

## 📈 Performance Optimization

### After Deployment

1. **Enable Edge Caching**
   ```json
   // In vercel.json
   {
     "headers": [
       {
         "source": "/api/marketplace/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "s-maxage=60, stale-while-revalidate"
           }
         ]
       }
     ]
   }
   ```

2. **Monitor Performance**
   - Vercel Analytics dashboard
   - Check Core Web Vitals
   - Monitor function execution time

3. **Optimize if Needed**
   - Enable edge functions for API routes
   - Add database query caching
   - Optimize images with Vercel Image Optimization

---

## 🔄 Update Deployment

### For Code Changes

```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Build and verify
npm run build

# 4. Commit changes
git add .
git commit -m "Your changes"

# 5. Deploy
vercel --prod
```

### For Database Schema Changes

```bash
# 1. Update SQL file
# 2. Run in Supabase SQL Editor
# 3. Test in production
# 4. Verify data integrity
```

### For Environment Variables

```bash
# Update variable
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production

# Redeploy to apply
vercel --prod
```

---

## 📞 Support Resources

### Documentation
- [MARKETPLACE_DATABASE_SETUP.md](MARKETPLACE_DATABASE_SETUP.md) - Database setup
- [MARKETPLACE_IMPLEMENTATION_COMPLETE.md](MARKETPLACE_IMPLEMENTATION_COMPLETE.md) - Features
- [README.md](README.md) - General info

### Help
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Project Issues**: Check console and logs first

---

## ✅ Deployment Complete Checklist

Final checklist before announcing:

- [ ] ✅ Application deployed successfully
- [ ] ✅ Environment variables configured
- [ ] ✅ Supabase database set up (or using mock data)
- [ ] ✅ All APIs tested and working
- [ ] ✅ Authentication working
- [ ] ✅ Marketplace features functional
- [ ] ✅ No console errors
- [ ] ✅ Performance acceptable
- [ ] ✅ Security measures in place
- [ ] ✅ Custom domain configured (optional)
- [ ] ✅ Monitoring enabled
- [ ] ✅ Team has access credentials

---

## 🎉 Success!

Your CortexBuild application is now live!

**Production URL**: `https://your-app.vercel.app`

**Next Steps:**
1. Share URL with team
2. Monitor performance and errors
3. Gather user feedback
4. Plan future enhancements

---

**Deployed with ❤️ using Vercel and Supabase**

**Need help?** Check the troubleshooting section or review the implementation docs.

---

**Build Time**: ~5 seconds
**Deployment Time**: ~2-3 minutes
**Total Setup Time**: ~10-15 minutes (with database)

🚀 **Happy Building!**

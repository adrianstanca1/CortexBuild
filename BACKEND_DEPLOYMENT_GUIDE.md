# 🚀 Backend Deployment Guide - Railway (SQLite)

## Overview

This guide will help you deploy the CortexBuild backend server to **Railway** using **SQLite** (file-based database) for simpler deployment.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Environment Variables**: API keys and configuration ready

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Connect your GitHub account
5. Select your `CortexBuild` repository
6. Click **"Deploy"**

## Step 2: No Database Setup Needed

**SQLite Advantage**: No separate database setup required! Railway will automatically handle the file-based SQLite database.

## Step 3: Configure Environment Variables

In your Railway project dashboard:

1. Go to **"Variables"** tab
2. Add these environment variables:

### Required Variables
```
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-here
```

### API Keys (get from your providers)
```
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GEMINI_API_KEY=your-gemini-key
```

### Supabase (if using)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Application Settings
```
NEXT_PUBLIC_APP_URL=https://cortex-build-726dz1xxz-adrian-b7e84541.vercel.app
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_STORAGE_BUCKET=documents
```

### Feature Flags
```
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_COGNITIVE_CORE=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
ENABLE_MCP=true
ENABLE_SDK_DEVELOPER=true
```

## Step 4: Deploy the Application

1. Railway will automatically detect your `railway.json` configuration
2. The build will use **Nixpacks** builder
3. The start command will be: `npm run server:prod`
4. Wait for the deployment to complete (usually 2-5 minutes)

## Step 5: Verify Deployment

1. Once deployed, Railway will provide a **public URL** for your backend
2. Test the health endpoint: `https://your-app.railway.app/api/health`
3. You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-10-09T...",
  "environment": "production",
  "database": "sqlite"
}
```

## Step 6: Update Frontend API URLs

In your **Vercel dashboard**:

1. Go to your CortexBuild project
2. Add environment variable:
```
NEXT_PUBLIC_API_BASE_URL=https://your-app.railway.app
```

Or update your frontend code to use the Railway URL instead of `http://localhost:3001`.

## Step 7: Test Full Integration

1. Visit your Vercel frontend: `https://cortex-build-726dz1xxz-adrian-b7e84541.vercel.app`
2. Try logging in with existing credentials
3. Verify that API calls work (check browser network tab)
4. Test creating/reading data

## Troubleshooting

### Build Failures
- Check Railway build logs for errors
- Ensure all dependencies are in `package.json`
- Verify `railway.json` configuration

### Database Issues
- SQLite database is automatically created on first run
- Check Railway application logs for database initialization errors
- Ensure file permissions allow SQLite database creation

### API Errors
- Check Railway application logs
- Verify environment variables are set correctly
- Test individual endpoints with tools like Postman

## Alternative: Render Deployment

If you prefer Render over Railway:

1. Sign up at [render.com](https://render.com)
2. Create **"Web Service"** from GitHub
3. Choose your repository
4. Set build command: `npm install`
5. Set start command: `npm run server:prod`
6. Add PostgreSQL database in Render
7. Configure environment variables as above

## Cost Estimation

- **Railway**: ~$5/month (app only - SQLite included)
- **Render**: ~$7/month (app only - SQLite included)
- Both offer generous free tiers for development
- **SQLite Advantage**: No separate database costs!

## Security Notes

- ✅ Railway provides SSL certificates automatically
- ✅ SQLite database file is secured within Railway's infrastructure
- ✅ Environment variables are encrypted at rest
- ✅ Use strong JWT secrets in production
- ✅ Regularly rotate API keys
- ✅ SQLite is suitable for moderate concurrent usage

## Next Steps

After successful backend deployment:

1. ✅ Update frontend to use production API URLs
2. ✅ Test all features end-to-end
3. ✅ Set up monitoring and logging
4. ✅ Configure backup strategies
5. ✅ Plan for scaling and performance optimization

---

**🎉 Your CortexBuild backend is now live in production!**

**Railway URL**: `https://your-app.railway.app`
**Health Check**: `https://your-app.railway.app/api/health`
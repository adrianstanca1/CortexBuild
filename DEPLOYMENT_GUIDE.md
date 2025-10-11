# CortexBuild Deployment Guide

## 🚀 Quick Deployment Summary

**Frontend:** ✅ Deployed on Vercel  
**Backend:** ⚠️ Needs separate deployment  
**Database:** SQLite (included with backend)

---

## 📋 Current Status

### ✅ Frontend (Vercel)
- **URL:** https://cortex-build-cjru3aya5-adrian-b7e84541.vercel.app
- **Status:** Live and running
- **Build:** Successful (7.1 MB)
- **Environment:** Production

### ⚠️ Backend (Not Deployed)
- **Current:** Running on `localhost:3001`
- **Issue:** Login fails with 405 error because backend is not accessible
- **Solution:** Deploy backend separately (see options below)

---

## 🔧 Backend Deployment Options

### Option 1: Render.com (RECOMMENDED - FREE)

**Why Render?**
- ✅ Free tier available
- ✅ Supports Node.js + SQLite
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL certificates
- ✅ Easy environment variable management

**Steps:**

1. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `adrianstanca1/CortexBuild`
   - Configure:
     - **Name:** cortexbuild-api
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm run server`
     - **Plan:** Free

3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-key
   GEMINI_API_KEY=your-gemini-key
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (~2-3 minutes)
   - Copy your backend URL (e.g., `https://cortexbuild-api.onrender.com`)

5. **Update Frontend:**
   - Go to Vercel Dashboard
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://cortexbuild-api.onrender.com/api`
   - Redeploy frontend

---

### Option 2: Railway.app (EASY)

**Why Railway?**
- ✅ Very simple setup
- ✅ Supports SQLite
- ✅ $5 free credit monthly
- ✅ Automatic HTTPS

**Steps:**

1. Go to https://railway.app
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select `CortexBuild`
5. Add environment variables
6. Deploy
7. Copy backend URL and update Vercel

---

### Option 3: DigitalOcean App Platform

**Why DigitalOcean?**
- ✅ Reliable infrastructure
- ✅ $200 free credit for 60 days
- ✅ Full control

**Steps:**

1. Create DigitalOcean account
2. Apps → Create App
3. Connect GitHub repo
4. Configure build/start commands
5. Add environment variables
6. Deploy

---

## 🔄 Complete Deployment Flow

### Step 1: Deploy Backend

Choose one of the options above and deploy your backend. You'll get a URL like:
```
https://cortexbuild-api.onrender.com
```

### Step 2: Update Frontend Environment Variables

In Vercel Dashboard:

1. Go to your project: https://vercel.com/adrian-b7e84541/cortex-build
2. Settings → Environment Variables
3. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://cortexbuild-api.onrender.com/api`
   - **Environment:** Production
4. Save

### Step 3: Redeploy Frontend

```bash
# In your local project
git add .
git commit -m "Update API URL for production"
git push origin main

# Or trigger redeploy in Vercel Dashboard
```

### Step 4: Test

1. Open: https://cortex-build-cjru3aya5-adrian-b7e84541.vercel.app
2. Try to login with: `adrian.stanca1@gmail.com` / `parola123`
3. Should work! ✅

---

## 🗄️ Database Considerations

### Current Setup (SQLite)
- ✅ Simple and fast
- ✅ No external database needed
- ⚠️ Data resets on each deployment (Render free tier)
- ⚠️ Not suitable for production with persistent data

### For Production (Recommended)

**Option A: PostgreSQL on Render**
- Free tier: 90 days
- Persistent storage
- Automatic backups

**Option B: Supabase PostgreSQL**
- Already configured in project
- Free tier: 500 MB
- Real-time features
- Built-in auth

**Migration Steps:**
1. Update `server/database.ts` to use PostgreSQL instead of SQLite
2. Use Prisma or TypeORM for database management
3. Run migrations on production database

---

## 📝 Environment Variables Reference

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (Render/Railway)
```bash
NODE_ENV=production
PORT=3001
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🐛 Troubleshooting

### Login fails with 405 error
**Cause:** Backend not deployed or wrong API URL  
**Fix:** Deploy backend and update `VITE_API_URL` in Vercel

### CORS errors
**Cause:** Backend not configured for frontend domain  
**Fix:** Add Vercel URL to CORS whitelist in `server/index.ts`

### Database resets on deployment
**Cause:** SQLite file not persisted (Render free tier)  
**Fix:** Use PostgreSQL or upgrade to paid Render plan with persistent disk

### Environment variables not working
**Cause:** Variables not prefixed with `VITE_` for frontend  
**Fix:** All frontend env vars must start with `VITE_`

---

## 🎯 Next Steps

1. **Deploy Backend** on Render.com (recommended)
2. **Update Vercel** environment variables
3. **Test Login** on production URL
4. **Consider PostgreSQL** for persistent data
5. **Setup Custom Domain** (optional)
6. **Configure CI/CD** for automatic deployments

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)

---

**Need Help?** Check the logs in Render/Vercel dashboards for detailed error messages.


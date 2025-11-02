# CortexBuild - Supabase Migration Guide

## 🎯 Overview

This guide will help you migrate CortexBuild from SQLite to Supabase PostgreSQL for production deployment.

**Why Supabase?**
- ✅ Free tier with 500 MB database
- ✅ PostgreSQL (production-ready)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Automatic backups
- ✅ No server management needed

---

## 📋 Prerequisites

- Supabase account (already configured)
- Supabase project: `zpbuvuxpfemldsknerew`
- Environment variables in `.env` file

---

## 🚀 Step-by-Step Migration

### Step 1: Setup Supabase Database

#### 1.1 Open Supabase SQL Editor

```
https://supabase.com/dashboard/project/zpbuvuxpfemldsknerew/sql/new
```

#### 1.2 Run Schema SQL

1. Open `supabase/schema.sql` in your editor
2. Copy the entire content
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Wait for completion (~30 seconds)

**Expected Result:**
```
✅ 50+ tables created
✅ All indexes created
✅ Foreign keys configured
```

#### 1.3 Run Seed Data SQL

1. Open `supabase/seed.sql` in your editor
2. Copy the entire content
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Wait for completion (~10 seconds)

**Expected Result:**
```
✅ 2 companies inserted
✅ 5 users inserted
✅ 6 marketplace apps inserted
✅ Sample projects and tasks inserted
```

#### 1.4 Verify Setup

Go to Table Editor and check:
- `companies` table: 2 rows
- `users` table: 5 rows
- `sdk_apps` table: 6 rows
- `projects` table: 4 rows

---

### Step 2: Update Backend Configuration

The backend is already configured to use Supabase! Just verify environment variables:

#### 2.1 Check `.env` File

```bash
VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2.2 Backend Already Uses Supabase

The backend (`server/index.ts`) already uses Supabase client for authentication and data access. No code changes needed!

---

### Step 3: Deploy Backend to Render.com

#### 3.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### 3.2 Create Web Service

1. Click "New +" → "Web Service"
2. Connect repository: `adrianstanca1/CortexBuild`
3. Configure:
   - **Name:** `cortexbuild-api`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
   - **Plan:** Free

#### 3.3 Add Environment Variables

In Render dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=3001

# Supabase
VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini (optional)
GEMINI_API_KEY=your-gemini-api-key
```

#### 3.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (~2-3 minutes)
3. Copy your backend URL (e.g., `https://cortexbuild-api.onrender.com`)

---

### Step 4: Update Frontend Configuration

#### 4.1 Update Vercel Environment Variables

1. Go to https://vercel.com/adrian-b7e84541/cortex-build
2. Settings → Environment Variables
3. Add/Update:

```bash
VITE_API_URL=https://cortexbuild-api.onrender.com/api
VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Save changes

#### 4.2 Redeploy Frontend

```bash
git add .
git commit -m "Update API URL for Supabase backend"
git push origin main
```

Or trigger redeploy in Vercel Dashboard.

---

### Step 5: Test Production Deployment

#### 5.1 Test Backend

```bash
curl https://cortexbuild-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "supabase",
  "timestamp": "2024-10-11T..."
}
```

#### 5.2 Test Frontend Login

1. Open: https://cortex-build-cjru3aya5-adrian-b7e84541.vercel.app
2. Login with:
   - Email: `adrian.stanca1@gmail.com`
   - Password: `parola123`
3. Should successfully login! ✅

---

## 👤 Demo Users

All users have password: `parola123`

| Email | Role | Company |
|-------|------|---------|
| adrian.stanca1@gmail.com | Super Admin | ASC Cladding Ltd |
| adrian@ascladdingltd.co.uk | Company Admin | ASC Cladding Ltd |
| adrian.stanca1@icloud.com | Developer | ASC Cladding Ltd |
| john.smith@ascladdingltd.co.uk | User | ASC Cladding Ltd |
| sarah.johnson@buildright.com | Company Admin | BuildRight Construction |

---

## 📦 Marketplace Apps

6 pre-approved apps available:

1. 📊 **Project Dashboard** - Analytics
2. 💬 **Team Chat** - Communication
3. ⏱️ **Time Tracker** - Productivity
4. 📅 **Team Calendar** - Productivity
5. ✅ **Task Manager** - Productivity
6. 💰 **Expense Tracker** - Finance

---

## 🔧 Troubleshooting

### Login fails with 401/403

**Cause:** Backend not accessible or wrong API URL  
**Fix:** Check `VITE_API_URL` in Vercel environment variables

### Database connection error

**Cause:** Wrong Supabase credentials  
**Fix:** Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_ROLE_KEY`

### Tables not found

**Cause:** Schema not run in Supabase  
**Fix:** Run `supabase/schema.sql` in Supabase SQL Editor

### No demo users

**Cause:** Seed data not run  
**Fix:** Run `supabase/seed.sql` in Supabase SQL Editor

---

## 📊 Architecture

```
┌─────────────────┐
│  Vercel         │
│  (Frontend)     │
│  Port: 443      │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│  Render.com     │
│  (Backend API)  │
│  Port: 3001     │
└────────┬────────┘
         │
         │ PostgreSQL
         │
┌────────▼────────┐
│  Supabase       │
│  (Database)     │
│  PostgreSQL     │
└─────────────────┘
```

---

## ✅ Checklist

- [ ] Supabase schema created (`supabase/schema.sql`)
- [ ] Supabase seed data inserted (`supabase/seed.sql`)
- [ ] Backend deployed to Render.com
- [ ] Environment variables configured in Render
- [ ] Frontend environment variables updated in Vercel
- [ ] Frontend redeployed
- [ ] Login tested successfully
- [ ] Marketplace apps visible
- [ ] Projects and tasks loading

---

## 🎯 Next Steps

1. **Custom Domain** (optional)
   - Add custom domain in Vercel
   - Configure DNS records

2. **Monitoring**
   - Setup Render monitoring
   - Configure Supabase alerts

3. **Backups**
   - Supabase automatic backups enabled
   - Consider manual backups for critical data

4. **Performance**
   - Monitor Render logs
   - Optimize database queries
   - Add caching if needed

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**🎉 Migration Complete! Your CortexBuild platform is now running on Supabase!** 🚀


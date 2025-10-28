# 🚀 DEPLOY NOW - Quick Start

**Deploy CortexBuild to production in 5 minutes**

---

## Option 1: Deploy with Mock Data (Fastest - 2 minutes)

```bash
# Deploy immediately with mock data
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? cortexbuild
# - Override settings? No

# Done! Your app is live with mock marketplace data
```

**✅ Marketplace works immediately with pre-loaded sample data**

---

## Option 2: Deploy with Supabase (Recommended - 10 minutes)

### Step 1: Create Supabase Database (5 mins)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name: `cortexbuild-marketplace`
3. Password: (save it!)
4. Create project (wait 2-3 mins)

5. Go to **SQL Editor** → **New Query**
6. Copy/paste from: `supabase/MARKETPLACE_COMPLETE_SCHEMA.sql`
7. Click **Run**
8. Verify: "✅ Success"

9. Go to **Settings** → **API**
10. Copy these 3 values:
    - Project URL
    - anon public key
    - service_role key

### Step 2: Deploy to Vercel (5 mins)

```bash
# 1. Deploy
vercel --prod

# 2. Add environment variables
vercel env add VITE_SUPABASE_URL production
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your anon key

vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY production
# Paste your service role key

vercel env add JWT_SECRET production
# Type: cortexbuild-production-secret-2025

# 3. Redeploy with env vars
vercel --prod

# Done! Your app is live with full database
```

---

## ✅ Verify Deployment

Visit your Vercel URL (shown after deployment):
```
https://cortexbuild-xyz.vercel.app
```

**Check:**
- App loads ✅
- Login works ✅
- Marketplace shows modules ✅
- No console errors ✅

**Test Login:**
```
Email: adrian.stanca1@gmail.com
Password: parola123
```

---

## 🎯 What You Get

### With Mock Data:
- ✅ 10 marketplace categories
- ✅ 6 featured modules
- ✅ Full UI/UX
- ✅ All features work
- ⚠️ Data resets on restart

### With Supabase:
- ✅ Everything from mock data
- ✅ Persistent database
- ✅ User reviews & ratings
- ✅ Installation tracking
- ✅ Analytics
- ✅ Admin review workflow
- ✅ Scalable for production

---

## 🔧 Quick Commands

```bash
# View deployment
vercel

# View logs
vercel logs

# View in browser
vercel open

# Deploy again (after changes)
vercel --prod
```

---

## 📞 Need Help?

- **Full Guide**: See [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)
- **Database Setup**: See [MARKETPLACE_DATABASE_SETUP.md](MARKETPLACE_DATABASE_SETUP.md)
- **Features**: See [MARKETPLACE_IMPLEMENTATION_COMPLETE.md](MARKETPLACE_IMPLEMENTATION_COMPLETE.md)

---

**🚀 You're 2 minutes away from production!**

Run: `vercel --prod`

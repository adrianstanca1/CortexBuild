# ⚡ Quick Start Guide

## 🎯 Get Started in 30 Seconds

### Option 1: Test Immediately (No Setup)

```bash
# Server is already running!
# Just open: http://localhost:5173

# Demo Login:
Email: demo@example.com
Password: password
```

**That's it!** The app works with mock data. Test everything! ✨

---

## 🚀 Full Setup (10 Minutes)

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create new project
   - Name: AS Agents
   - Database Password: (choose strong password)
   - Region: (closest to you)
4. Wait ~2 minutes for setup

### Step 2: Set Up Database

1. Open Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy entire contents of `database/schema.sql`
5. Paste and click **Run** (or Cmd+Enter)
6. Should see: "Success. No rows returned" ✅

### Step 3: (Optional) Add Demo Data

1. Still in SQL Editor
2. Click **New Query**
3. Copy entire contents of `database/seed.sql`
4. Paste and click **Run**
5. Creates 6 demo users + projects! ✅

### Step 4: Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJ...` (long string)

### Step 5: Configure App

Create file: `final/.env.local`

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 4.

### Step 6: Restart Server

```bash
# Stop the current server (Ctrl+C in terminal)
npm run dev
```

### Step 7: Create Your Account

1. Open <http://localhost:5173>
2. Click **Register**
3. Fill in your details
4. Check email for verification link
5. Click link, then login!

**Done! You now have a production-ready app!** 🎉

---

## 📊 What You Get

### With Mock Data (Current)

- ✅ Works immediately
- ✅ All features available
- ✅ Perfect for testing
- ⚠️ Data cleared on refresh

### With Supabase (After setup)

- ✅ **Everything above PLUS:**
- ✅ Persistent data
- ✅ Multi-user collaboration
- ✅ Real-time sync
- ✅ File uploads
- ✅ Production ready
- ✅ Scales to millions

---

## 🎨 Features Available

### Project Management

- Create and manage projects
- Track budgets and spending
- Monitor progress with dashboards
- Geolocation on map

### Team Collaboration

- Assign tasks to team members
- Track time entries
- Team chat and messaging
- Real-time notifications

### Safety & Compliance

- Report safety incidents
- Track equipment maintenance
- Document management
- Complete audit trail

### Financial Management

- Create invoices
- Track expenses
- Budget monitoring
- Financial forecasting

### AI Features

- AI-powered project insights
- Chatbot assistance
- Predictive analytics
- Automated reporting

---

## 👥 Demo Users (If you ran seed.sql)

After running seed data, you can login with:

```
Admin (Full Access):
  Email: admin@democonstruction.com
  Password: DemoPass123!

Project Manager:
  Email: manager@democonstruction.com
  Password: DemoPass123!

Site Supervisor:
  Email: supervisor@democonstruction.com
  Password: DemoPass123!

Worker:
  Email: worker1@democonstruction.com
  Password: DemoPass123!
```

---

## 🆘 Troubleshooting

### App won't load

- Check browser console (F12)
- Refresh page (Cmd+R)
- Clear browser cache

### "Supabase not configured"

- This is normal! App uses mock data
- To use real database, follow Full Setup above

### Can't login

- Check credentials are correct
- For demo: `demo@example.com` / `password`
- For Supabase: Verify email first

### Changes not saving

- With mock data: This is expected
- With Supabase: Check `.env.local` is correct

---

## 📚 Documentation

- `README_DATABASE.md` - Complete database overview
- `database/SETUP.md` - Detailed Supabase setup
- `database/CREATE_USERS.md` - User creation guide
- `DATABASE_INTEGRATION.md` - API usage guide

---

## 🎯 Recommended Path

### Just Testing? (Now)

1. Open <http://localhost:5173>
2. Login with demo account
3. Click around and explore!

### Want Full Features? (10 min)

1. Follow "Full Setup" above
2. Create Supabase account
3. Run database scripts
4. Add credentials
5. Create your account
6. **Production ready!**

### Ready to Deploy?

1. Set up Supabase (production)
2. Configure environment variables
3. Build: `npm run build`
4. Deploy to Vercel/Netlify/IONOS
5. **Live!** 🚀

---

## ✨ Quick Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run type-check       # Check TypeScript

# Deployment
npm run deploy:production  # Deploy to production
```

---

## 🎉 Summary

**Right Now:**

- Server running: <http://localhost:5173>
- Demo login ready: `demo@example.com` / `password`
- All features working!

**Next Level:**

- 10 minutes: Full database setup
- Production ready!
- Scale to any size!

**Start here:** <http://localhost:5173>

**Happy Building!** 🏗️✨

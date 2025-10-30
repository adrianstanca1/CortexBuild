# ⚡ CortexBuild Ultimate - Quick Start

## 🚀 Get Started in 5 Minutes!

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Configure Environment (1 min)
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - VITE_SUPABASE_URL=your-supabase-url
# - VITE_SUPABASE_ANON_KEY=your-anon-key
# - Optional: AI API keys
```

### Step 3: Setup Database (2 min)
```bash
# Option A: Use Supabase (Recommended)
1. Go to https://app.supabase.com
2. Create new project
3. Run SQL from supabase/COMPLETE_SCHEMA.sql in SQL Editor
4. Update user passwords (see ULTIMATE_DEPLOYMENT_GUIDE.md)

# Option B: Use SQLite (Local only)
# Set VITE_DATABASE_MODE=sqlite in .env.local
# Database will auto-create on first run
```

### Step 4: Start Development Server (30 sec)
```bash
npm run dev
```

### Step 5: Login & Explore (30 sec)
```
Open: http://localhost:3000

Test Accounts:
- Super Admin: adrian.stanca1@gmail.com / parola123
- Company Admin: adrian@ascladdingltd.co.uk / lolozania1
- Developer: adrian.stanca1@icloud.com / password123
```

---

## 🎯 Key Features to Try

### 1. Desktop Mode
- Click the **Grid icon** (📱) in top nav
- Access all 22 Base44Clone pages
- Drag, resize, minimize windows
- Use taskbar for multi-tasking

### 2. AI Agents
- Go to **AI Tools**
- Try any of 6 specialized agents:
  - HSE Sentinel - Safety analysis
  - Commercial Guardian - Cost monitoring
  - Quality Inspector - Photo analysis
  - Project Assistant - General help
  - Financial Advisor - Budget forecasting
  - Document Processor - Data extraction

### 3. Workflow Automation
- Go to **Workflows**
- Choose a template or create new
- Add triggers and actions
- Test and activate

### 4. Marketplace
- Go to **Marketplace**
- Browse and search apps
- Install with one click
- Run in Desktop Mode

### 5. Database Toggle
- Go to **Settings → Database**
- Switch between SQLite and Supabase
- Export/import data
- Monitor connection health

---

## 📚 Documentation

**Deployment:** `ULTIMATE_DEPLOYMENT_GUIDE.md`
**User Guide:** `USER_GUIDE.md`
**Implementation:** `IMPLEMENTATION_COMPLETE.md`

---

## 🎉 You're Ready!

Your ultimate construction platform is now running locally. When ready to deploy:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

See `ULTIMATE_DEPLOYMENT_GUIDE.md` for complete deployment instructions.

---

**Need Help?** Check the documentation or review the code comments.

**Happy Building! 🏗️**


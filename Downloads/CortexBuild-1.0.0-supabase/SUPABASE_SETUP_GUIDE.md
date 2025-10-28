# 🚀 CortexBuild - Supabase Setup Guide

## ✅ **VERSIUNEA PRINCIPALĂ CU SUPABASE**

Aceasta este versiunea principală a CortexBuild care folosește Supabase (cont plătit) în loc de SQLite.

---

## 📋 **PREREQUISITE**

- ✅ Cont Supabase (plătit)
- ✅ Proiect Supabase creat
- ✅ Credențiale Supabase (URL + Anon Key)

---

## 🎯 **SETUP STEPS**

### **Step 1: Get Supabase Credentials**

1. **Login to Supabase:**
   ```
   https://app.supabase.com/
   ```

2. **Select your project** (sau creează unul nou)

3. **Get credentials:**
   - Go to: Settings → API
   - Copy:
     * **Project URL** (e.g., `https://xxxxx.supabase.co`)
     * **Anon/Public Key** (starts with `eyJ...`)

---

### **Step 2: Run Database Migration**

1. **Go to SQL Editor in Supabase:**
   ```
   https://app.supabase.com/project/YOUR_PROJECT/sql
   ```

2. **Create new query**

3. **Copy and paste** the entire content from:
   ```
   supabase/COMPLETE_SCHEMA.sql
   ```

4. **Run the query** (Click "Run" button)

5. **Verify tables created:**
   - Go to: Table Editor
   - You should see:
     * companies (3 rows)
     * users (3 rows)
     * projects
     * sdk_apps (6 rows)
     * user_app_installations
     * company_app_installations
     * app_review_history
     * app_analytics
     * activities

---

### **Step 3: Update Password Hashes**

The seed data includes placeholder password hashes. You need to update them with real bcrypt hashes.

**Option A: Use Supabase SQL Editor**

```sql
-- Update Super Admin password (parola123)
UPDATE users 
SET password_hash = crypt('parola123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@gmail.com';

-- Update Company Admin password (lolozania1)
UPDATE users 
SET password_hash = crypt('lolozania1', gen_salt('bf', 10))
WHERE email = 'adrian@ascladdingltd.co.uk';

-- Update Developer password (password123)
UPDATE users 
SET password_hash = crypt('password123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@icloud.com';
```

**Option B: Use Node.js script** (I can create this if needed)

---

### **Step 4: Configure Environment Variables**

#### **For Local Development:**

Create `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API (if using separate backend)
VITE_API_URL=http://localhost:5000
```

#### **For Vercel (Frontend):**

1. Go to: https://vercel.com/adrian-b7e84541/cortex-build/settings/environment-variables

2. Add:
   ```
   VITE_SUPABASE_URL = https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Redeploy

#### **For Render (Backend):**

1. Go to: https://dashboard.render.com/web/srv-d3n6jk6r433s73avk6k0

2. Add Environment Variables:
   ```
   SUPABASE_URL = https://YOUR_PROJECT.supabase.co
   SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from Settings → API → service_role key)
   ```

3. Redeploy

---

### **Step 5: Update Backend to Use Supabase**

The backend needs to be updated to use Supabase instead of SQLite.

**I will create:**
- ✅ Supabase service layer
- ✅ Authentication with Supabase
- ✅ Database queries with Supabase
- ✅ Migration from SQLite to Supabase

---

### **Step 6: Test the Application**

1. **Start local development:**
   ```bash
   npm run dev
   ```

2. **Login with test accounts:**

   #### 🔴 **Super Admin**
   ```
   Email: adrian.stanca1@gmail.com
   Password: parola123
   ```

   #### 🟠 **Company Admin**
   ```
   Email: adrian@ascladdingltd.co.uk
   Password: lolozania1
   ```

   #### 🟢 **Developer**
   ```
   Email: adrian.stanca1@icloud.com
   Password: password123
   ```

3. **Verify:**
   - ✅ Login works
   - ✅ Dashboard loads
   - ✅ Marketplace apps visible
   - ✅ Data persists in Supabase

---

## 🔧 **WHAT I NEED FROM YOU**

Please provide:

1. **Supabase Project URL:**
   ```
   https://xxxxx.supabase.co
   ```

2. **Supabase Anon Key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Supabase Service Role Key** (optional, for backend):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 📊 **MIGRATION BENEFITS**

### **From SQLite to Supabase:**

✅ **Scalability:** Cloud-hosted, auto-scaling database
✅ **Real-time:** Built-in real-time subscriptions
✅ **Security:** Row Level Security (RLS) policies
✅ **Backups:** Automatic daily backups
✅ **Performance:** Optimized PostgreSQL
✅ **Multi-region:** Global CDN
✅ **Auth:** Built-in authentication
✅ **Storage:** File storage included
✅ **APIs:** Auto-generated REST & GraphQL APIs

---

## 🎯 **NEXT STEPS**

1. ✅ Provide Supabase credentials
2. ⏳ I'll update backend to use Supabase
3. ⏳ I'll update authentication flow
4. ⏳ I'll test all features
5. ⏳ Deploy to production

---

## 📝 **FILES CREATED**

- ✅ `lib/supabase/client.ts` - Supabase client configuration
- ✅ `supabase/COMPLETE_SCHEMA.sql` - Complete database schema
- ✅ `SUPABASE_SETUP_GUIDE.md` - This guide

---

## 🎊 **READY TO MIGRATE!**

**Provide your Supabase credentials and I'll complete the migration!** 🚀

**This will be the main production version of CortexBuild!** ✅

---

**Last Updated:** 2025-10-14
**Version:** 1.0.0 (Supabase Migration)


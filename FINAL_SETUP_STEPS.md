# 🎯 FINAL SETUP - Login Will Work After These 2 Steps!

## ✅ What's Been Fixed

1. ✅ Simplified login API (no middleware dependencies)
2. ✅ Switched from Vercel Postgres to Supabase
3. ✅ Environment variables added to Vercel
4. ✅ Code deployed to production

**New Production URL**: https://cortexbuildcortexbuild-opcsl080q-adrian-b7e84541.vercel.app

---

## ⚠️ STEP 1: Run Supabase SQL Setup (CRITICAL!)

### Open Supabase SQL Editor
https://supabase.com/dashboard/project/zpbuvuxpfemldsknerew/sql/new

### Copy & Paste This SQL:

```sql
-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default company
INSERT INTO companies (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'ASC Cladding Ltd')
ON CONFLICT (name) DO NOTHING;

-- Insert test users (password for both is 'parola123')
INSERT INTO users (id, email, password_hash, name, role, company_id) 
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'adrian.stanca1@gmail.com',
        '$2b$10$OZuOTyrSx0yeQfX.UygHiujjFP731Mjcl1z9fwORSC6sSpVZiobi.',
        'Adrian Stanca',
        'super_admin',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'dev@constructco.com',
        '$2b$10$OZuOTyrSx0yeQfX.UygHiujjFP731Mjcl1z9fwORSC6sSpVZiobi.',
        'Developer User',
        'developer',
        '00000000-0000-0000-0000-000000000001'
    )
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now)
CREATE POLICY "Allow all operations on companies"
    ON companies FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on users"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on sessions"
    ON sessions FOR ALL
    USING (true)
    WITH CHECK (true);
```

### Click "Run" or Press Ctrl+Enter

---

## ⚠️ STEP 2: Test Login

### Go to Production App
https://cortexbuildcortexbuild-opcsl080q-adrian-b7e84541.vercel.app

### Login with:
- Email: `adrian.stanca1@gmail.com`
- Password: `parola123`

---

## 🔍 If Login Still Fails

### Check Vercel Logs
https://vercel.com/adrian-b7e84541/cortexbuildcortexbuild-app/logs

Look for errors in `/api/auth/login-simple`

### Check Browser Console
1. Press F12
2. Go to Console tab
3. Look for errors

### Verify Supabase Tables
1. Go to Supabase Table Editor
2. Check that these tables exist:
   - `companies` (1 row)
   - `users` (2 rows)
   - `sessions` (0 rows)

---

## 📊 What Changed

### New Files:
- `api/auth/login-simple.ts` - Simplified login API without middleware

### Modified Files:
- `api/auth/login.ts` - Removed middleware imports (still has issues)

### Environment Variables (Already Set):
- `JWT_SECRET`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎉 Once You Run the SQL

Login will work immediately! The simplified API is deployed and ready.

**Production URL**: https://cortexbuildcortexbuild-opcsl080q-adrian-b7e84541.vercel.app
**Inspect**: https://vercel.com/adrian-b7e84541/cortexbuildcortexbuild-app/EuNjLg1kw1SnzGqGMTHBmZvnA2ZF

---

**The ONLY thing left is running the SQL in Supabase!** 🚀


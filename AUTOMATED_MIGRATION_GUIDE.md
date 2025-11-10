# CortexBuild - Automated Migration Guide

**Date**: November 10, 2025
**Status**: Ready for migration
**Project**: zpbuvuxpfemldsknerew (Supabase)

---

## Overview

This guide provides multiple ways to apply the database migration automatically or semi-automatically.

### Current Status
- ✅ Migration SQL file created and fixed for PostgreSQL
- ✅ Supabase project identified: `zpbuvuxpfemldsknerew`
- ✅ Service credentials located
- ⏳ Migration pending application in Supabase

---

## Option 1: Supabase Dashboard (Web UI) - QUICKEST

**Time**: 2-3 minutes
**Difficulty**: Easy
**Requirements**: Web browser + Supabase login

### Steps

1. **Login to Supabase**
   - Go to: https://app.supabase.com
   - Sign in with your account

2. **Select Project**
   - Click on project: `zpbuvuxpfemldsknerew` (CortexBuild)

3. **Open SQL Editor**
   - Left sidebar → Click "SQL Editor"

4. **Create New Query**
   - Click "+ New query" button
   - Clear the default placeholder

5. **Paste Migration SQL**
   - Open file: `supabase/migrations/004_create_user_profiles_table.sql`
   - Copy entire contents
   - Paste into the SQL Editor

6. **Execute Migration**
   - Click "Run" button (or Cmd+Enter)
   - Wait for: "Query executed successfully"

7. **Verify Success**
   ```sql
   -- Run this to verify table was created
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'user_profiles';
   ```
   - You should see one row: `user_profiles`

---

## Option 2: Supabase CLI (Command Line) - RECOMMENDED FOR AUTOMATION

**Time**: 5 minutes
**Difficulty**: Medium
**Requirements**: Terminal + Node.js/npm

### Prerequisites

Check if Supabase CLI is installed:
```bash
supabase --version
```

If not installed:
```bash
npm install -g supabase
```

### Steps

1. **Navigate to Project**
```bash
cd /Users/admin/Projects/cortexbuild/CortexBuild-1
```

2. **Link Supabase Project** (first time only)
```bash
supabase link --project-ref zpbuvuxpfemldsknerew
```

This will:
- Prompt for Supabase access token
- Link local project to remote
- Create `.supabase/config.toml` file
- Set up migration tracking

**Get access token**:
- Go to: https://app.supabase.com/account/tokens
- Create a new token if needed
- Copy and paste when prompted

3. **Apply Migration**
```bash
supabase db push
```

This will:
- Detect pending migrations
- Show migration details
- Ask for confirmation
- Apply migration to remote database

4. **Verify Success**
```bash
supabase db pull
```

This pulls the remote schema and verifies it matches.

---

## Option 3: Automated Script (This Repository)

**Time**: 2 minutes
**Difficulty**: Easy
**Requirements**: Node.js

We've created helper scripts in this repository:

### Check Migration Status
```bash
node verify-migration.mjs
```

This script:
- Loads Supabase credentials automatically
- Checks if migration has been applied
- Provides step-by-step instructions
- Shows which project is being used

### Run Supabase CLI Setup
```bash
bash setup-supabase-cli.sh
```

This script:
- Checks if Supabase CLI is installed
- Installs it if needed
- Verifies project configuration
- Guides you through linking process
- Applies migration via CLI

---

## Option 4: Direct Vercel Integration (For Future)

**Time**: 5 minutes
**Difficulty**: Medium
**Requirements**: Vercel admin access

If you want Vercel to handle migrations automatically:

1. Go to: https://vercel.com/
2. Select: `cortexbuildcortexbuild-app`
3. Settings → Environment Variables
4. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Then on each deploy, you can:
1. Add `postbuild` script to run migrations
2. Use Supabase CLI in the build environment
3. Automatic migration on deployment

**Example package.json:**
```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "npm run migrate",
    "migrate": "supabase db push --linked"
  }
}
```

---

## Verification Steps

After applying migration via any method:

### 1. Check Table Exists
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
);
```
Expected: `true`

### 2. Check Columns
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
```
Expected: 13 rows (id, email, name, bio, avatar, role, company_id, theme, email_notifications, two_factor_enabled, created_at, updated_at, last_login)

### 3. Check Indexes
```sql
SELECT * FROM pg_indexes
WHERE tablename = 'user_profiles';
```
Expected: 6 indexes

### 4. Check RLS Policies
```sql
SELECT * FROM pg_policies
WHERE tablename = 'user_profiles';
```
Expected: 3 policies

### 5. Test API Endpoint

Get a JWT token (from browser after login):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile
```

Expected response: 200 OK with user profile JSON

---

## Troubleshooting

### Problem: "Table already exists" error
**Solution**: The migration may have already been applied. Run verification query above.

### Problem: "Permission denied" error
**Solution**: Check RLS policies or service role key permissions in Supabase.

### Problem: Supabase CLI won't link
**Solution**:
1. Generate new access token: https://app.supabase.com/account/tokens
2. Run: `supabase logout`
3. Run: `supabase login`
4. Run: `supabase link --project-ref zpbuvuxpfemldsknerew`

### Problem: API endpoint returns 500 error
**Solution**:
1. Check Vercel environment variables are set
2. Check Supabase project is accessible
3. Check table was created with all columns
4. Check RLS policies allow access

---

## Recommended Path

**For this project, we recommend**:

1. **Quick Path** (if in a hurry):
   - Use Option 1 (Dashboard)
   - Takes 2-3 minutes
   - No setup required

2. **Professional Path** (if doing ongoing development):
   - Use Option 2 (Supabase CLI)
   - Takes 5 minutes first time
   - Enables version control of migrations
   - Better for team development

3. **Automated Path** (for CI/CD):
   - Use Option 4 (Vercel Integration)
   - Set up once
   - Migrations run automatically

---

## Migration SQL Summary

The migration creates:

1. **user_profiles table** (13 columns)
   - Primary key: `id` (UUID from auth.users)
   - Unique email field
   - User metadata (name, bio, avatar, role, company_id)
   - Preferences (theme, email_notifications, two_factor_enabled)
   - Timestamps (created_at, updated_at, last_login)

2. **Timestamp trigger**
   - Auto-updates `updated_at` on every row update

3. **RLS Policies** (3 total)
   - Users can SELECT their own profile
   - Users can UPDATE their own profile
   - Admins can SELECT all profiles

4. **Indexes** (6 total)
   - Performance optimization for common queries
   - Email lookup
   - Company membership
   - Creation/update timestamps

5. **Helper Functions**
   - `get_user_profile()` - Fetch profile with preferences
   - `update_last_login()` - Automatic on profile access

---

## Timeline

```
NOW (Option 1 - Dashboard)
↓ 2-3 minutes
✅ Migration Complete

OR

NOW (Option 2 - CLI)
↓ Link project (1 min)
↓ Push migration (1 min)
↓ Verify (1 min)
✅ Migration Complete + CLI Setup

OR

NOW (Option 3 - Script)
↓ Run verification script (30 sec)
↓ Follow guided steps (2-3 min)
✅ Migration Complete
```

---

## Files Created

- `verify-migration.mjs` - Check migration status
- `setup-supabase-cli.sh` - CLI setup and migration
- `apply-migration-automated.js` - Automated approach (reference)
- `AUTOMATED_MIGRATION_GUIDE.md` - This file

---

## Next Steps After Migration

1. **Verify** using SQL queries above (5 minutes)
2. **Test API** endpoint with JWT token (5 minutes)
3. **Test UI** by logging in and checking Settings (5 minutes)
4. **Monitor** Vercel logs for errors (ongoing)
5. **Celebrate** 🎉 Migration complete!

---

## Support

**Need help?**

1. Check `MIGRATION_AND_TESTING_GUIDE.md` for testing procedures
2. See `QUICK_REFERENCE.md` for common issues
3. Review `DATABASE_SETUP.md` for API reference
4. Check Supabase docs: https://supabase.com/docs

**Estimated total time to completion**: 30-45 minutes (including verification and testing)

---

**Created**: November 10, 2025
**Status**: Ready to use
**Project**: CortexBuild Database Migration

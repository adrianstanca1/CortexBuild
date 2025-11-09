# Manual User Creation Required - Supabase Dashboard

## Problem Summary

All programmatic attempts to create users in Supabase have failed due to:
- **Auth Admin API Error**: "Database error creating new user" (status 500)
- **Root Cause**: Database triggers or RLS policies on `auth.users` table block the Auth Admin API
- **Foreign Key Constraint**: `public.users.id` REFERENCES `auth.users.id` requires auth users to exist first

## Solution: Manual SQL Execution

You **must** execute SQL directly in the Supabase Dashboard SQL Editor, which runs with superuser privileges.

---

## Step-by-Step Instructions

### Step 1: Login to Supabase Dashboard

1. Go to: **https://app.supabase.com/sign-in**
2. Login with your Supabase account credentials
3. Select the **CortexBuild** project

### Step 2: Open SQL Editor

1. Click **SQL Editor** in the left sidebar
2. Click **New Query** button
3. You should see a blank SQL editor

### Step 3: Copy and Execute the SQL Script

Copy the **entire contents** of the file `SUPABASE_CREATE_USERS.sql` and paste into the SQL editor.

**Quick copy command:**
```bash
cat SUPABASE_CREATE_USERS.sql | pbcopy
```

Or manually open `SUPABASE_CREATE_USERS.sql` and copy all 107 lines.

### Step 4: Run the SQL

1. After pasting the SQL, click the **RUN** button (or press Cmd/Ctrl + Enter)
2. Wait for execution (should complete in ~2 seconds)
3. Check the **Results** panel at the bottom

### Step 5: Verify Success

The output should show:
```
✅ Verification Results:
Row 1: dev@constructco.com | Dev User | developer
Row 2: adrian@ascladdingltd.co.uk | Adrian Stanca | company_admin
```

If you see **both users**, the creation was successful! ✅

---

## Alternative: Create Users via Supabase Auth UI

If the SQL approach fails, you can create users through the Supabase Dashboard UI:

### For Developer User (dev@constructco.com):

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create New User**
3. Fill in:
   - **Email**: `dev@constructco.com`
   - **Password**: `parola123`
   - **Auto Confirm Email**: ✅ YES
4. Click **Create User**
5. **Copy the generated User ID** (UUID)

6. Go to **SQL Editor** and run:
```sql
-- Replace USER_ID_FROM_STEP_5 with the actual UUID
INSERT INTO users (id, email, name, role, password_hash, company_id)
VALUES (
    'USER_ID_FROM_STEP_5',  -- Replace with UUID from step 5
    'dev@constructco.com',
    'Dev User',
    'developer',
    '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
    '00000000-0000-0000-0000-000000000001'
);
```

### For Company Admin User (adrian@ascladdingltd.co.uk):

Repeat the same process:

1. **Add User** in Supabase Auth:
   - **Email**: `adrian@ascladdingltd.co.uk`
   - **Password**: `Lolozania1`
   - **Auto Confirm Email**: ✅ YES

2. **Copy the User ID**, then run SQL:
```sql
-- Replace USER_ID with the actual UUID from Supabase Auth
INSERT INTO users (id, email, name, role, password_hash, company_id)
VALUES (
    'USER_ID',  -- Replace with UUID
    'adrian@ascladdingltd.co.uk',
    'Adrian Stanca',
    'company_admin',
    '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW.',
    'asc-cladding-ltd'
);
```

---

## Why Programmatic Creation Failed

### Attempted Solutions (All Failed):

1. **Supabase Auth Admin API** (`auth.admin.createUser()`)
   - Error: "Database error creating new user"
   - Likely cause: Database trigger on `auth.users` blocks programmatic creation
   - Service role key should bypass RLS, but triggers still run

2. **Direct SQL via Supabase Client**
   - Error: Foreign key constraint violation
   - Cause: `public.users.id` REFERENCES `auth.users.id`
   - Cannot insert into `public.users` without corresponding `auth.users` entry

3. **Migration Scripts**
   - Error: Same FK constraint violation
   - Cause: Scripts run without superuser privileges

### Why Dashboard SQL Editor Works:

- Runs with **PostgreSQL superuser privileges**
- Can execute `DO` blocks and `crypt()` functions
- Can directly insert into `auth.users` table
- Bypasses all RLS policies and application-level restrictions

---

## Test Credentials After Creation

Once users are created, test login at your production URL with:

**Developer Account:**
- Email: `dev@constructco.com`
- Password: `parola123`
- Expected: Developer Dashboard with SDK tools

**Company Admin Account:**
- Email: `adrian@ascladdingltd.co.uk`
- Password: `Lolozania1`
- Expected: Company Admin Dashboard for ASC Cladding Ltd

**Existing Super Admin (for reference):**
- Email: `adrian.stanca1@gmail.com`
- Password: (your existing password)
- Expected: Super Admin Dashboard with platform-wide access

---

## Verification Query

After creating users, run this in SQL Editor to verify:

```sql
SELECT 
    u.email, 
    u.name, 
    u.role, 
    u.company_id,
    au.email_confirmed_at
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.email IN ('dev@constructco.com', 'adrian@ascladdingltd.co.uk')
ORDER BY u.email;
```

Expected output:
- 2 rows
- Both should have `email_confirmed_at` timestamp
- Both should match their respective company IDs

---

## Next Steps After User Creation

1. ✅ **Test Production Login**
   - Try logging in with both test accounts
   - Verify dashboards load correctly
   - Check that logout works

2. ✅ **Commit Final Changes**
   ```bash
   git add .env.production.local
   git commit -m "chore: Add Supabase URL to production environment"
   ```

3. ✅ **Resolve Git Push Issue**
   ```bash
   git pull origin main --rebase
   git push origin main
   ```

4. ✅ **Deploy to Vercel**
   - Push triggers automatic deployment
   - Verify production site uses new login endpoint
   - Test with all three users

5. ✅ **Clean Up**
   - Remove temporary scripts: `execute-sql.js`, `create-users-direct.js`, `create-supabase-users.js`, `check-constraints.js`, `check-schema.js`
   - Keep: `SUPABASE_CREATE_USERS.sql` (for reference)
   - Keep: `PRODUCTION_LOGIN_FIX_GUIDE.md` (documentation)

---

## Troubleshooting

### If SQL Execution Fails:

**Error: "permission denied for table auth.users"**
- Solution: You're not logged in as the project owner
- Action: Login with the Supabase account that created the project

**Error: "function crypt() does not exist"**
- Solution: Install pgcrypto extension
- Run: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- Then re-run the user creation SQL

**Error: "duplicate key value violates unique constraint"**
- Solution: User already exists
- Action: Check existing users:
  ```sql
  SELECT id, email FROM auth.users WHERE email IN ('dev@constructco.com', 'adrian@ascladdingltd.co.uk');
  ```

### If Login Still Fails After User Creation:

**Check user exists in both tables:**
```sql
SELECT 
    (SELECT COUNT(*) FROM auth.users WHERE email = 'dev@constructco.com') as auth_count,
    (SELECT COUNT(*) FROM users WHERE email = 'dev@constructco.com') as public_count;
```

Both counts should be `1`.

**Check password hash:**
```sql
SELECT email, password_hash FROM users WHERE email = 'dev@constructco.com';
```

Should return: `$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.`

**Check Vercel deployment:**
- Ensure `api/auth/login.ts` is deployed
- Check Vercel logs for errors
- Verify environment variables are set in Vercel Dashboard

---

## Support

If you continue to have issues after following this guide:

1. Check the Supabase logs: **Database** → **Logs** → **Postgres Logs**
2. Check Vercel function logs: **Deployments** → **Functions** → **api/auth/login**
3. Review the browser console for frontend errors
4. Check the Network tab for API response details

The most common issue is forgetting to set `email_confirm: true` when creating auth users, which prevents login.

---

**Created:** 2025-01-09  
**Last Updated:** 2025-01-09  
**Status:** Ready for manual execution

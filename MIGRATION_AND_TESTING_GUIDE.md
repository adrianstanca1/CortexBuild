# Database Migration & Testing Guide

**Last Updated**: November 10, 2025
**Status**: Ready for Deployment
**Estimated Time**: 30-45 minutes

---

## Overview

This guide walks you through applying the database migration to your Supabase project and thoroughly testing that everything works correctly end-to-end.

### What We're Setting Up
- Creating the `user_profiles` table in PostgreSQL
- Configuring Row-Level Security (RLS) policies
- Setting up automatic timestamp management
- Testing the complete auth → profile → database flow

---

## Prerequisites Checklist

Before starting, verify you have:

- [ ] Supabase project created and accessible
- [ ] Admin access to Supabase dashboard
- [ ] Access to your project's SQL Editor
- [ ] The SQL migration file: `supabase/migrations/004_create_user_profiles_table.sql`
- [ ] Environment variables set in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] CortexBuild deployed to production (already done ✅)

---

## Phase 1: SQL Migration (10 minutes)

### Step 1.1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your CortexBuild project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** to create a new SQL editor tab

### Step 1.2: Copy the Migration

Open the migration file and copy all contents:

**File**: `supabase/migrations/004_create_user_profiles_table.sql`

The migration includes:
- Table creation with 13 columns
- Automatic timestamp trigger
- PostgreSQL helper function
- Row-level security (RLS) setup
- 5 performance indexes

### Step 1.3: Run the Migration

1. Paste the entire SQL migration into the Supabase SQL editor
2. Review the SQL (ensure all syntax is correct)
3. Click the **Run** button
4. Watch for the success message at the bottom

**Expected Output**:
```
Query successful (completed in Xms)
```

### Step 1.4: Verify Table Creation

Run this verification query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_profiles';
```

**Expected Result**:
```
| table_name     |
|----------------|
| user_profiles  |
```

---

## Phase 2: Schema Verification (10 minutes)

### Step 2.1: Verify Column Structure

Run this query to check all columns were created:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Expected Columns**:
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | - |
| email | character varying | NO | - |
| name | character varying | NO | - |
| bio | text | YES | - |
| avatar | text | YES | - |
| role | character varying | NO | 'developer' |
| company_id | uuid | YES | - |
| theme | character varying | NO | 'dark' |
| email_notifications | boolean | NO | true |
| two_factor_enabled | boolean | NO | false |
| created_at | timestamp with timezone | NO | NOW() |
| updated_at | timestamp with timezone | NO | NOW() |
| last_login | timestamp with timezone | YES | - |

### Step 2.2: Verify Row-Level Security

Run this query to check RLS is enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';
```

**Expected Result**:
```
| schemaname | tablename     | rowsecurity |
|------------|---------------|-------------|
| public     | user_profiles | t (true)    |
```

### Step 2.3: Verify RLS Policies

Run this query to check all policies are created:

```sql
SELECT polname, poldef
FROM pg_policy
WHERE relation::regclass::text = 'public.user_profiles'
ORDER BY polname;
```

**Expected Policies** (3 total):
1. "Admins can view all profiles"
2. "Users can update their own profile"
3. "Users can view their own profile"

### Step 2.4: Verify Indexes

Run this query to check all performance indexes exist:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'user_profiles'
ORDER BY indexname;
```

**Expected Indexes** (5 total):
- idx_created_at
- idx_email
- idx_company_id
- idx_role
- idx_user_profiles_company_role
- idx_user_profiles_updated_at
- user_profiles_pkey (automatic primary key)

### Step 2.5: Verify Trigger

Run this query to check the update timestamp trigger:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles'
ORDER BY trigger_name;
```

**Expected Result**:
```
| trigger_name                   | event_manipulation | event_object_table |
|--------------------------------|--------------------|--------------------|
| user_profiles_update_timestamp | UPDATE             | user_profiles      |
```

---

## Phase 3: API Endpoint Testing (10 minutes)

### Step 3.1: Get a JWT Token

First, log in to the application to get a valid JWT token:

1. Go to your production URL: `https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app`
2. Log in with your test credentials
3. Open **Developer Tools** (F12)
4. Go to **Application** → **Cookies**
5. Look for a `token` or `jwt` cookie, or check **Console** for logged auth data

Alternatively, if you have API access, you can use curl with Supabase credentials:

```bash
# Get an auth token via Supabase API
curl -X POST https://your-project.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "your-password",
    "grant_type": "password"
  }' | jq .access_token
```

### Step 3.2: Test GET /api/user/profile

This endpoint should retrieve your profile (and auto-create it if missing):

```bash
curl -X GET https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response** (201 or 200):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "User Name",
      "role": "developer",
      "companyId": null,
      "avatar": null,
      "bio": null,
      "createdAt": "2025-11-10T12:00:00.000Z",
      "updatedAt": "2025-11-10T12:00:00.000Z",
      "lastLogin": "2025-11-10T12:00:00.000Z",
      "preferences": {
        "theme": "dark",
        "emailNotifications": true,
        "twoFactorEnabled": false
      }
    }
  },
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

**What This Means**:
- ✅ Your profile was created in the database on first GET request
- ✅ All default preferences are set correctly
- ✅ Timestamps are automatically generated
- ✅ Token validation worked
- ✅ Database connection successful

### Step 3.3: Verify Profile in Database

After the GET request succeeds, verify it was created in Supabase:

```sql
SELECT id, email, name, role, theme, created_at, updated_at, last_login
FROM user_profiles
WHERE email = 'your-email@example.com';
```

**Expected Result**:
```
| id | email | name | role | theme | created_at | updated_at | last_login |
|----|-------|------|------|-------|------------|------------|------------|
| uuid | your-email@example.com | User Name | developer | dark | 2025-11-10... | 2025-11-10... | 2025-11-10... |
```

### Step 3.4: Test PUT /api/user/profile

Now update the profile with new information:

```bash
curl -X PUT https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "bio": "My awesome bio",
    "preferences": {
      "theme": "light",
      "emailNotifications": false,
      "twoFactorEnabled": true
    }
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid-string",
      "email": "user@example.com",
      "name": "Updated Name",
      "bio": "My awesome bio",
      "preferences": {
        "theme": "light",
        "emailNotifications": false,
        "twoFactorEnabled": true
      }
      // ... other fields
    },
    "message": "Profile updated successfully"
  },
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### Step 3.5: Verify Update in Database

Check that the update was saved:

```sql
SELECT name, bio, theme, email_notifications, two_factor_enabled, updated_at
FROM user_profiles
WHERE email = 'your-email@example.com';
```

**Expected Result**:
```
| name | bio | theme | email_notifications | two_factor_enabled | updated_at |
|------|-----|-------|---------------------|-------------------|------------|
| Updated Name | My awesome bio | light | false | true | 2025-11-10T12:XX:XX... |
```

**Key Points**:
- ✅ `name` and `bio` updated
- ✅ Preferences saved correctly
- ✅ `updated_at` timestamp changed automatically
- ✅ RLS policy allowed the update

---

## Phase 4: Security Testing (5 minutes)

### Step 4.1: Test RLS - User Can Only See Own Profile

User A's token should NOT see User B's profile:

```bash
# This should FAIL with 404 or 403 if trying to access someone else's profile
curl -X GET https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json"
```

Then try with User B's token - should only see User B's data.

### Step 4.2: Test Invalid Token

Try with an invalid/expired token:

```bash
curl -X GET https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile \
  -H "Authorization: Bearer invalid_token_xyz" \
  -H "Content-Type: application/json"
```

**Expected Response** (401):
```json
{
  "success": false,
  "error": "Your session has expired. Please log in again.",
  "code": "INVALID_TOKEN",
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### Step 4.3: Test Missing Token

Try without authorization header:

```bash
curl -X GET https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile \
  -H "Content-Type: application/json"
```

**Expected Response** (401):
```json
{
  "success": false,
  "error": "Missing or invalid authorization token",
  "code": "MISSING_TOKEN",
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

---

## Phase 5: UI Testing (5 minutes)

### Step 5.1: Login and View Profile

1. Go to production: `https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app`
2. Log in with your credentials
3. Navigate to **Settings** or **Profile** page
4. Verify your profile information loads:
   - [ ] Name displays correctly
   - [ ] Email displays correctly
   - [ ] Bio (if set) displays
   - [ ] Theme preference shows current setting
   - [ ] Notification preferences show
   - [ ] 2FA toggle shows current state

### Step 5.2: Update Profile in UI

1. In the Settings/Profile page:
   - [ ] Edit your name
   - [ ] Edit your bio
   - [ ] Toggle theme (light ↔ dark)
   - [ ] Toggle notification preferences
   - [ ] Toggle 2FA setting
2. Click **Save Profile**
3. Verify success message appears
4. Refresh the page
5. Verify all changes persisted (page reloads with updated values)

### Step 5.3: Test Error Scenarios

1. **Test Network Error**:
   - Open DevTools Network tab
   - Throttle to "Offline"
   - Try to update profile
   - Should see error: "No internet connection"

2. **Test Timeout**:
   - Set network throttle to "Slow 3G"
   - Try to update profile with large bio
   - Should show timeout message after ~30 seconds

3. **Test Session Expiry**:
   - Open DevTools → Application → Cookies
   - Delete the JWT/token cookie
   - Try to update profile
   - Should see error: "Your session has expired. Please log in again."

---

## Phase 6: Production Monitoring (5 minutes)

### Step 6.1: Check Vercel Logs

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your CortexBuild project
3. Click **Deployments**
4. Click the latest deployment
5. Go to **Logs** tab
6. Filter for error messages:
   - Search: `ERROR` or `DATABASE_ERROR`
   - Look for any "Failed to initialize Supabase" messages

**Expected**: No errors related to database connections

### Step 6.2: Monitor API Response Times

In Vercel logs, check request durations:

```
GET /api/user/profile - 145ms ✅
PUT /api/user/profile - 210ms ✅
```

**Expected**: < 500ms for both GET and PUT operations

### Step 6.3: Check Supabase Metrics

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **Analytics** (if available)
4. Check:
   - Database size (should be <100KB after first few users)
   - Query performance
   - No slow queries

---

## Troubleshooting

### Problem: "table user_profiles does not exist"

**Cause**: Migration wasn't applied to Supabase

**Solution**:
1. Return to Step 1 (SQL Migration)
2. Paste and run the migration again
3. Verify with Step 2.1

### Problem: "permission denied for schema public"

**Cause**: RLS policy issue or insufficient permissions

**Solution**:
1. Check you're logged in as admin in Supabase
2. Verify RLS policies are created (Step 2.3)
3. Check token has valid user ID

### Problem: "invalid input syntax for UUID"

**Cause**: Token doesn't contain valid `userId` field

**Solution**:
1. Regenerate JWT token
2. Verify token was issued by your auth system
3. Check JWT payload includes `userId` field

### Problem: "failed to initialize Supabase admin client"

**Cause**: Missing or invalid `SUPABASE_SERVICE_ROLE_KEY` in Vercel

**Solution**:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Settings → API
3. Copy "Service Role Key" (starts with `eyJ`)
4. Go to Vercel project settings → Environment Variables
5. Set `SUPABASE_SERVICE_ROLE_KEY` to the copied value
6. Redeploy: `npm run vercel:prod`

### Problem: Profile updates aren't saving

**Cause**: RLS policy blocking UPDATE operation

**Solution**:
1. Verify UPDATE policy exists (Step 2.3)
2. Ensure token's userId matches the profile id being updated
3. Check no input validation errors (review error logs)

### Problem: `last_login` not updating

**Cause**: Database trigger issue or non-critical error

**Solution**:
1. This is non-critical - still works without this field
2. Check Supabase logs for trigger errors
3. Can be safely ignored for now

---

## Rollback Procedure

If something goes wrong and you need to roll back:

### Option 1: Delete and Recreate

```sql
-- WARNING: This deletes all user profile data!
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS get_user_profile(UUID);
DROP FUNCTION IF EXISTS update_user_profiles_timestamp();
```

Then re-run the migration from Step 1.

### Option 2: Keep Old Code

```bash
# Revert to previous deployment without database calls
git checkout dcbe46d  # Before database integration
npm run vercel:prod
```

Then update environment variables to not require database.

---

## Success Checklist

You'll know the migration is complete when:

- [x] SQL migration runs without errors
- [x] All 13 columns exist in user_profiles table
- [x] RLS is enabled (rowsecurity = true)
- [x] All 3 RLS policies created
- [x] GET /api/user/profile returns 200
- [x] Profile auto-creates on first login
- [x] PUT /api/user/profile returns 200
- [x] Updates persist in database
- [x] Theme preference persists across sessions
- [x] Vercel logs show no DATABASE_ERROR messages
- [x] Settings page displays user profile data
- [x] Settings page can update profile data
- [x] Error messages appear for invalid tokens
- [x] Error messages appear for network issues

---

## Next Steps

Once migration is verified complete:

1. **Monitor for 24 hours**
   - Watch Vercel error logs
   - Monitor database performance
   - Check for any RLS policy issues

2. **Gather Feedback**
   - Ensure your users can see/update their profiles
   - Check that preferences persist
   - Verify theme changes apply globally

3. **Begin Performance Optimization** (See `PERFORMANCE_OPTIMIZATION.md`)
   - Phase 1: Code splitting (routes)
   - Phase 2: Icon library optimization
   - Phase 3: Dependency cleanup
   - Phase 4: Asset optimization
   - Phase 5: Build configuration tuning

---

## Support & References

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Error Handler Code**: `utils/errorHandler.ts`
- **Database Utility Code**: `utils/supabaseServer.ts`
- **API Endpoint Code**: `api/user/profile.ts`
- **Vercel Logs**: Check deployment logs for errors

---

**Status**: Ready to Deploy
**Estimated Completion**: November 10, 2025
**Next Review**: After first production test (same day)


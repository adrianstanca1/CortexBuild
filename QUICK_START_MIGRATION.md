# Quick Start Migration Checklist

**Status**: Ready to Execute
**Time Required**: 45 minutes
**Date**: November 10, 2025

---

## ⚡ Fast Track Execution

Copy and paste commands/SQL as you go. Each phase has everything you need.

---

## Phase 1️⃣: Apply SQL Migration (10 minutes)

### Step 1: Get the SQL Migration
The migration file is ready to use:
```
File: supabase/migrations/004_create_user_profiles_table.sql
```

### Step 2: Go to Supabase Dashboard
```
URL: https://app.supabase.com
1. Select your CortexBuild project
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
```

### Step 3: Copy and Paste the Migration
**Copy entire contents of**: `supabase/migrations/004_create_user_profiles_table.sql`

Then paste into Supabase SQL Editor and click **Run**

### Expected Result
```
✅ Query successful (completed in Xms)
```

---

## Phase 2️⃣: Verify Database Schema (10 minutes)

Run these SQL queries one by one in Supabase SQL Editor to verify everything was created:

### ✅ Check Table Exists
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_profiles';
```
**Expected**: One row with `user_profiles`

### ✅ Check All Columns
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```
**Expected**: 13 columns listed

### ✅ Check RLS is Enabled
```sql
SELECT rowsecurity FROM pg_tables WHERE tablename = 'user_profiles';
```
**Expected**: `t` (true)

### ✅ Check RLS Policies
```sql
SELECT polname FROM pg_policy
WHERE relation::regclass::text = 'public.user_profiles'
ORDER BY polname;
```
**Expected**: 3 policies listed

### ✅ Check Indexes
```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'user_profiles'
ORDER BY indexname;
```
**Expected**: 7 indexes (6 created + 1 primary key)

---

## Phase 3️⃣: Test API Endpoints (10 minutes)

### Step 1: Get Your JWT Token
Login to the app and get your JWT token from browser DevTools:
1. Go to: `https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app`
2. Log in with your credentials
3. Open DevTools (F12) → Console
4. Look for token or check Application → Cookies

**Or use this curl to get a token** (if you have Supabase credentials):
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "email":"your@email.com",
    "password":"password",
    "grant_type":"password"
  }' | jq .access_token
```

### Step 2: Test GET Profile (Auto-creates on first call)
```bash
# Copy and run this (replace $TOKEN with your actual token)
curl -X GET \
  https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response** (200 or 201):
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid-string",
      "email": "your@email.com",
      "name": "Your Name",
      "role": "developer",
      "theme": "dark",
      "preferences": {
        "emailNotifications": true,
        "twoFactorEnabled": false
      }
      // ... more fields
    }
  }
}
```

✅ **Success Indicator**: Profile was auto-created in database on first GET

### Step 3: Test PUT Profile (Update)
```bash
curl -X PUT \
  https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "bio": "Testing the database",
    "preferences": {
      "theme": "light",
      "emailNotifications": false
    }
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "Updated Name",
      "bio": "Testing the database",
      "theme": "light",
      // ... updated profile
    },
    "message": "Profile updated successfully"
  }
}
```

### Step 4: Verify Update in Database
```sql
SELECT name, bio, theme, email_notifications
FROM user_profiles
WHERE email = 'your@email.com';
```

**Expected**: Shows updated values (name, bio, theme changed)

---

## Phase 4️⃣: Test UI Functionality (5 minutes)

### Step 1: Login to App
```
URL: https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app
Login with your credentials
```

### Step 2: Navigate to Settings/Profile Page
- Look for Settings button or Profile link
- Click it

### Step 3: Verify Profile Data Loads
- [ ] Name displays correctly
- [ ] Email displays correctly
- [ ] Theme preference shows current setting
- [ ] Notification preferences show
- [ ] 2FA toggle shows state

### Step 4: Update Profile in UI
1. Change name to something new
2. Change theme (light ↔ dark)
3. Toggle a preference
4. Click "Save Profile"

### Step 5: Verify Changes Persist
1. Refresh the page (F5)
2. Go back to Settings
3. Verify all changes are still there ✅

---

## Phase 5️⃣: Production Monitoring (Ongoing)

### Check Vercel Error Logs
```
1. Go to: https://vercel.com
2. Select your CortexBuild project
3. Click "Deployments"
4. Click latest deployment
5. Go to "Logs" tab
6. Look for any error messages
```

**Should see**: No DATABASE_ERROR messages

### Monitor Database Performance
```
1. Go to: https://app.supabase.com
2. Select your project
3. Check "Analytics" (if available)
4. Monitor query performance
```

---

## ✅ Success Checklist

Mark these off as you complete:

### Database Setup
- [ ] SQL migration ran successfully
- [ ] 13 columns created
- [ ] 6 indexes created
- [ ] 3 RLS policies active
- [ ] Trigger created

### API Testing
- [ ] GET /api/user/profile returns 200
- [ ] Profile auto-created in database
- [ ] PUT /api/user/profile returns 200
- [ ] Updates persist in database
- [ ] updated_at timestamp changed

### UI Testing
- [ ] Settings page loads profile data
- [ ] All fields display correctly
- [ ] Can update profile
- [ ] Changes persist after refresh
- [ ] No error messages appear

### Error Scenarios
- [ ] Invalid token shows error
- [ ] Missing token shows error
- [ ] Database is accessible
- [ ] No 500 errors in logs

### Security
- [ ] RLS policies prevent unauthorized access
- [ ] Token validation works
- [ ] Input validation rejects bad data

---

## 🚨 Troubleshooting Quick Fixes

### If SQL migration fails:
```
1. Check error message in Supabase
2. Verify syntax: file path is supabase/migrations/004_create_user_profiles_table.sql
3. Try running one section at a time
4. Check Supabase status: https://app.supabase.com/status
```

### If API returns 404:
```
1. This is expected on first login
2. GET endpoint auto-creates profile
3. Try GET request again - should return 200
```

### If API returns 401:
```
1. Token may be expired
2. Get fresh token from app login
3. Try curl command again
```

### If database connection fails:
```
1. Check SUPABASE_SERVICE_ROLE_KEY in Vercel
2. Go to Vercel Settings → Environment Variables
3. Verify key matches Supabase → Settings → API
4. Redeploy if changed: npm run vercel:prod
```

---

## ⏱️ Timeline

```
Phase 1 (SQL migration):     10 minutes
Phase 2 (Verify schema):     10 minutes
Phase 3 (Test endpoints):    10 minutes
Phase 4 (Test UI):           5 minutes
Phase 5 (Monitor):           Ongoing

Total Active Time: 35-45 minutes
```

---

## 🎯 When Complete

You'll have:
- ✅ Database fully configured and tested
- ✅ User profiles persisting in database
- ✅ User preferences saved across sessions
- ✅ Error handling working for all cases
- ✅ Production monitoring in place
- ✅ Ready for feature expansion

---

## 📞 Need Help?

- **Detailed instructions**: See `MIGRATION_AND_TESTING_GUIDE.md`
- **Quick reference**: See `QUICK_REFERENCE.md`
- **API specs**: See `DATABASE_SETUP.md`
- **Troubleshooting**: Each guide has a troubleshooting section

---

## 🚀 Ready to Start?

1. Open this checklist
2. Go to Supabase dashboard
3. Follow Phase 1-5 in order
4. Check off items as you complete them
5. You're done! 🎉

**Estimated completion**: 45 minutes from now


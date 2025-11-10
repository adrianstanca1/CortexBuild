# Implementation Checklist - CortexBuild Next Steps

**Last Updated**: November 10, 2025
**Status**: Ready for deployment

---

## ✅ Immediate Actions (Do First)

### 1. Apply Database Migration
- [ ] Login to Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy entire SQL from `supabase/migrations/004_create_user_profiles_table.sql`
- [ ] Paste into SQL editor
- [ ] Click "Run"
- [ ] Verify no errors in output
- [ ] Check table created: `SELECT * FROM user_profiles LIMIT 1;`

**Expected Output**:
```
No rows returned (table is empty but exists)
```

### 2. Verify Environment Variables
- [ ] Check Vercel project settings
- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Values should match your Supabase project

**How to Check**:
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Look for SUPABASE variables

### 3. Test User Login
- [ ] Go to production URL: https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app
- [ ] Log in with test credentials
- [ ] Check Supabase → user_profiles table
- [ ] Verify user profile was created
- [ ] Check profile has correct data (email, name, role)

**What to Expect**:
- User logs in
- `/api/user/profile` GET is called
- New row appears in `user_profiles` table
- Profile shows in UI with correct info

### 4. Test Profile Update
- [ ] In dashboard, click Settings button
- [ ] Update profile (name, bio, theme)
- [ ] Click "Save Profile"
- [ ] Check database for updated values
- [ ] Verify `updated_at` timestamp changed

**Supabase Check**:
```sql
SELECT id, name, bio, theme, updated_at FROM user_profiles
WHERE email = 'your@email.com';
```

### 5. Monitor Error Logs
- [ ] Go to Vercel Deployment → Logs
- [ ] Watch for any error messages
- [ ] Check for "DATABASE_ERROR" messages
- [ ] Verify no 500 errors

---

## ⚠️ Common Issues & Quick Fixes

### Issue: "Database error occurred"

**Possible Causes**:
1. SQL migration not applied
   - **Fix**: Run migration in Supabase SQL Editor

2. Missing SUPABASE_SERVICE_ROLE_KEY
   - **Fix**: Set in Vercel environment variables

3. Wrong service role key
   - **Fix**: Copy from Supabase → Settings → API → Service Role Key

### Issue: "Failed to retrieve user profile"

**Possible Causes**:
1. User table doesn't exist
   - **Fix**: Run SQL migration

2. RLS policy blocking access
   - **Fix**: Check policies allow authenticated users

3. JWT token invalid
   - **Fix**: Clear browser cache and login again

### Issue: Profile updates not saving

**Possible Causes**:
1. PUT endpoint not working
   - **Fix**: Check Vercel logs for errors

2. Database connection issue
   - **Fix**: Verify SUPABASE_SERVICE_ROLE_KEY

3. RLS policy preventing updates
   - **Fix**: Check RLS allows user to update own profile

### Issue: "Can't find service role key"

**How to Get It**:
1. Go to Supabase Dashboard
2. Select your project
3. Settings (bottom left)
4. API section
5. Copy "Service Role Key" (starts with `eyJ`)
6. Add to Vercel environment variables as `SUPABASE_SERVICE_ROLE_KEY`

---

## 📋 Database Verification Checklist

### Table Structure Check
```bash
# Run in Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

Expected columns:
- [ ] id (UUID)
- [ ] email (varchar)
- [ ] name (varchar)
- [ ] bio (text)
- [ ] avatar (text)
- [ ] role (varchar)
- [ ] company_id (UUID)
- [ ] theme (varchar)
- [ ] email_notifications (boolean)
- [ ] two_factor_enabled (boolean)
- [ ] created_at (timestamp)
- [ ] updated_at (timestamp)
- [ ] last_login (timestamp)

### Indexes Check
```bash
# Run in Supabase SQL Editor
SELECT indexname FROM pg_indexes
WHERE tablename = 'user_profiles'
ORDER BY indexname;
```

Expected indexes:
- [ ] idx_email
- [ ] idx_company_id
- [ ] idx_created_at
- [ ] idx_role
- [ ] idx_user_profiles_company_role
- [ ] idx_user_profiles_updated_at

### RLS Check
```bash
# Run in Supabase SQL Editor
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';
```

Expected:
- [ ] rowsecurity = true

### RLS Policies Check
```bash
# Run in Supabase SQL Editor
SELECT polname, poldef
FROM pg_policy
WHERE relation::regclass::text = 'public.user_profiles';
```

Expected policies:
- [ ] "Users can view their own profile"
- [ ] "Users can update their own profile"
- [ ] "Admins can view all profiles"

---

## 🧪 Manual Testing Checklist

### Test 1: First Login Creates Profile
- [ ] Clear browser cookies
- [ ] Log in with new test email
- [ ] Check database: new row created?
- [ ] Profile has auto-generated avatar?
- [ ] Theme defaults to 'dark'?
- [ ] email_notifications defaults to true?

### Test 2: Profile Read Works
- [ ] Go to Settings page
- [ ] Profile data loads?
- [ ] Preferences show correctly?
- [ ] No errors in console?

### Test 3: Profile Update Works
- [ ] Change name in Settings
- [ ] Click Save
- [ ] Success message appears?
- [ ] Database reflects change?
- [ ] updated_at timestamp changed?

### Test 4: Last Login Updates
- [ ] Log out
- [ ] Log back in
- [ ] Check last_login in database
- [ ] Is it recent (within last minute)?

### Test 5: Error Handling
- [ ] Logout and delete JWT from storage
- [ ] Try accessing profile endpoint
- [ ] Get error message "Your session has expired"?
- [ ] Can recover by logging in again?

### Test 6: Preferences Work
- [ ] Change theme to light
- [ ] Save
- [ ] Reload page
- [ ] Theme still light?
- [ ] Database shows theme='light'?

---

## 📊 Production Monitoring Checklist

### Daily Checks
- [ ] Check Vercel error logs
- [ ] Look for DATABASE_ERROR messages
- [ ] Monitor error rate
- [ ] Check response times

### Weekly Checks
- [ ] Review user count in database
- [ ] Check table size: `SELECT COUNT(*) FROM user_profiles;`
- [ ] Monitor slow queries
- [ ] Review RLS policy effectiveness

### Database Health
```bash
# Run in Supabase SQL Editor
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🚀 Phase 2: Performance Optimization (When Ready)

Once database is stable, start optimization:

### Week 1-2
- [ ] Set up bundle analyzer
- [ ] Create performance dashboard
- [ ] Document current metrics

### Week 2-3
- [ ] Implement code splitting
- [ ] Add loading skeletons
- [ ] Test each change

### Week 3-5
- [ ] Continue phases 2-5
- [ ] Monitor metrics
- [ ] Deploy incremental updates

---

## 📞 Quick Reference

### File Locations
- SQL Migration: `supabase/migrations/004_create_user_profiles_table.sql`
- Server Utils: `utils/supabaseServer.ts`
- Profile API: `api/user/profile.ts`
- Error Handler: `utils/errorHandler.ts`

### Important URLs
- Production: https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app
- Vercel Dashboard: https://vercel.com
- Supabase Dashboard: https://app.supabase.com

### Key Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (secret)
- `JWT_SECRET` - JWT signing key

---

## ✨ Success Indicators

You'll know everything is working when:

✅ Database
- [ ] user_profiles table exists
- [ ] All 13 columns present
- [ ] All 6 indexes created
- [ ] RLS policies active

✅ API
- [ ] GET /api/user/profile returns 200
- [ ] PUT /api/user/profile returns 200
- [ ] Profile data persists across logins
- [ ] last_login updates on each login

✅ User Experience
- [ ] Settings page loads profile data
- [ ] Profile updates save correctly
- [ ] Theme preference persists
- [ ] No error messages

✅ Error Handling
- [ ] Expired tokens show error message
- [ ] Missing token shows error
- [ ] Database errors handled gracefully
- [ ] Errors logged in console

---

## 📝 Notes

### First Time Setup
The first user to login after migration will:
1. Successfully authenticate with JWT
2. Query the (now-empty) user_profiles table
3. Not find their profile
4. Auto-create a new profile
5. Return profile data to frontend
6. See their profile in Settings

### Subsequent Logins
- Profile already exists
- Just return existing data
- Update last_login timestamp
- No new rows created

### Important
- Each user can only see/update their own profile (RLS)
- Admins can see all profiles
- Service role key used on backend only (never in frontend)
- User can't elevate their own role

---

## 🎯 Success Criteria

When you've completed this checklist, you'll have:
✅ Database fully configured and tested
✅ User profiles persisting in database
✅ User preferences saved across sessions
✅ Error handling working for all cases
✅ Production monitoring in place
✅ Ready for feature expansion

**Total Time**: ~30 minutes to 1 hour

---

**Status**: Ready to implement
**Date**: November 10, 2025
**Next Review**: After 1 week of production monitoring

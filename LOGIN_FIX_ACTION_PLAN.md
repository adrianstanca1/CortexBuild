# CortexBuild Login Fix - Complete Action Plan

## Current Status

✅ **Completed:**
- Fixed accessibility issues in SettingsPage.tsx
- Updated vercel.json with API functions configuration
- Added CORS headers to all API auth endpoints
- Retrieved Supabase credentials
- Identified Vercel Deployment Protection issue

⏳ **Pending:**
- Configure environment variables in Vercel
- Disable/bypass Vercel Deployment Protection
- Test API endpoints
- Test login through frontend UI

---

## Step-by-Step Action Plan

### STEP 1: Configure Vercel Environment Variables

**Time Required:** 5 minutes

1. Go to https://vercel.com/dashboard
2. Click on your **CortexBuild** project
3. Click **Settings** tab
4. In left sidebar, click **Environment Variables**
5. Add three variables:

   **Variable 1: SUPABASE_URL**
   - Name: `SUPABASE_URL`
   - Value: `<YOUR_SUPABASE_URL>`
   - Environments: Production, Preview, Development
   - Click **Save**

   **Variable 2: SUPABASE_SERVICE_KEY**
   - Name: `SUPABASE_SERVICE_KEY`
   - Value: `<YOUR_SUPABASE_SERVICE_KEY>`
   - Environments: Production, Preview, Development
   - Click **Save**

   **Variable 3: JWT_SECRET**
   - Name: `JWT_SECRET`
   - Value: `cortexbuild-prod-secret-key-2025`
   - Environments: Production, Preview, Development
   - Click **Save**

6. Verify all three variables appear in the list

---

### STEP 2: Disable Vercel Deployment Protection

**Time Required:** 2 minutes

1. In Vercel dashboard, go to **Settings**
2. In left sidebar, find **Deployment Protection** (or **Security**)
3. Click on it
4. Look for the protection setting
5. Click **Disable** or set to **None**
6. Confirm the change
7. Wait for changes to apply (usually 10-30 seconds)

**Why?** Vercel Protection is blocking API access. We need to disable it temporarily for testing.

---

### STEP 3: Trigger Redeployment

**Time Required:** 3-5 minutes

1. Go to **Deployments** tab in Vercel
2. Find the latest deployment (should show commit hash)
3. Click the **...** (three dots) menu
4. Select **Redeploy**
5. Confirm redeployment
6. Wait for deployment to complete (status should show "Ready")

**What happens:** Vercel rebuilds your project with the new environment variables.

---

### STEP 4: Test API Endpoint

**Time Required:** 2 minutes

Run the test script:
```bash
node test-login-api.js
```

**Expected output:**
```
Response Status: 200
Response Body:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ...",
  "user": {
    "id": "...",
    "email": "adrian.stanca1@gmail.com",
    "name": "Adrian Stanca",
    "role": "admin",
    "company_id": "...",
    "status": "active"
  }
}
✅ Login successful!
```

**If you get 405 error:** Deployment Protection is still enabled. Go back to Step 2.

**If you get 401 error:** Credentials are wrong or Supabase RPC function failed. Check:
- Email and password are correct
- Supabase database has the user
- RPC function `authenticate_user` exists

---

### STEP 5: Test Login Through Frontend UI

**Time Required:** 5 minutes

1. Open https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app
2. You should see the login page
3. Enter credentials:
   - Email: `adrian.stanca1@gmail.com`
   - Password: `password123`
4. Click **Login**
5. Monitor browser console (F12 → Console tab) for errors
6. You should be redirected to the dashboard

**Expected behavior:**
- ✅ Login form submits
- ✅ No console errors
- ✅ Redirected to dashboard
- ✅ User info displayed
- ✅ Can navigate dashboard

---

### STEP 6: Re-enable Deployment Protection (Optional)

**Time Required:** 2 minutes

Once testing is complete and login works:

1. Go to Vercel Settings → Deployment Protection
2. Re-enable protection
3. Set to your preferred protection level
4. Save changes

**Why?** Protects your deployment from unauthorized access in production.

---

## Troubleshooting

### Issue: 405 Method Not Allowed
**Cause:** Vercel Deployment Protection is enabled
**Solution:** Disable protection (Step 2)

### Issue: 401 Unauthorized
**Cause:** Invalid credentials or Supabase issue
**Solution:**
- Verify email/password are correct
- Check Supabase database for user
- Check RPC function exists

### Issue: CORS Error in Browser Console
**Cause:** CORS headers not set
**Solution:** Already fixed in code. Redeploy to apply.

### Issue: Environment Variables Not Working
**Cause:** Variables not set in Vercel or redeployment not triggered
**Solution:**
- Verify variables in Vercel Settings
- Trigger redeployment
- Wait for deployment to complete

### Issue: Blank Page or 500 Error
**Cause:** Build failed or runtime error
**Solution:**
- Check Vercel deployment logs
- Look for build errors
- Check function logs for runtime errors

---

## Files Created for Testing

- `test-login-api.js` - Node.js test script for API endpoint
- `test-login-api.sh` - Bash test script for API endpoint
- `VERCEL_DEPLOYMENT_PROTECTION_ISSUE.md` - Detailed explanation of protection issue
- `LOGIN_FIX_ACTION_PLAN.md` - This file

---

## Summary

**Total Time Required:** ~20 minutes

1. ✅ Set environment variables (5 min)
2. ✅ Disable Deployment Protection (2 min)
3. ✅ Trigger redeployment (5 min)
4. ✅ Test API endpoint (2 min)
5. ✅ Test login UI (5 min)
6. ✅ Re-enable protection (2 min)

**Expected Result:** Login works end-to-end, users can authenticate and access dashboard.

---

## Next Steps After Login Works

1. Test all dashboard features
2. Verify user roles and permissions
3. Test logout functionality
4. Test password reset flow
5. Test registration (if enabled)
6. Monitor error logs for issues
7. Deploy to production with protection enabled


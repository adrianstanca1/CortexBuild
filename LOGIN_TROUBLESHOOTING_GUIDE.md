# CortexBuild Login Troubleshooting Guide

## Issue Summary
Login was failing with **405 Method Not Allowed** error on `/api/auth/login` endpoint.

## Root Cause Analysis
The frontend was attempting to call `/api/auth/login` as a relative URL, which resolved to the Vercel frontend domain instead of the backend API. The Vercel deployment wasn't configured to deploy serverless functions in the `/api` directory.

## Fixes Applied

### 1. ✅ Vercel Configuration (Commit: 1ac8362)
**File:** `vercel.json`
**Change:** Added API functions configuration
```json
"functions": {
  "api/**/*.ts": {
    "runtime": "nodejs18.x"
  }
}
```
**Impact:** Tells Vercel to deploy TypeScript files in `/api` directory as serverless functions

### 2. ✅ CORS Headers (Commit: 4231ddc)
**Files:**
- `api/auth/login.ts`
- `api/auth/register.ts`
- `api/auth/verify.ts`
- `api/auth/refresh.ts`

**Change:** Added CORS headers to all API endpoints
```typescript
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
res.setHeader('Access-Control-Allow-Headers', '...');

// Handle preflight requests
if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}
```
**Impact:** Allows frontend to communicate with API endpoints across domains

## Verification Checklist

### ✅ Completed Verifications
- [x] Build completes successfully (`npm run build`)
- [x] API files exist in `/api/auth/` directory
- [x] Supabase RPC functions exist:
  - `authenticate_user` ✅
  - `register_user` ✅
- [x] Supabase project is active and healthy
- [x] CORS headers added to all API endpoints

### ⚠️ Required Manual Configuration in Vercel Dashboard

You must set these environment variables in Vercel:

1. **SUPABASE_URL**
   - Value: `<YOUR_SUPABASE_URL>`
   - Source: Supabase project settings

2. **SUPABASE_SERVICE_KEY**
   - Value: Get from Supabase dashboard → Settings → API → Service Role Key
   - ⚠️ CRITICAL: This is sensitive - keep it secure

3. **JWT_SECRET**
   - Value: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Or use: `cortexbuild-prod-secret-key-2025` (change in production)

## Steps to Complete Setup

### Step 1: Get Supabase Service Key
1. Go to https://supabase.com/dashboard
2. Select project: `supabase-indigo-umbrella`
3. Navigate to Settings → API
4. Copy the **Service Role Key** (starts with `eyJ...`)

### Step 2: Configure Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select project: `cortex-build-...`
3. Go to Settings → Environment Variables
4. Add the three variables above
5. Redeploy the project

### Step 3: Verify Deployment
1. Wait for Vercel to redeploy (check deployment status)
2. Test login at your deployed Vercel URL
3. Use credentials:
   - Email: `adrian.stanca1@gmail.com`
   - Password: `password123`

## Testing the API Endpoint

### Using cURL
```bash
curl -X POST https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adrian.stanca1@gmail.com",
    "password": "password123"
  }'
```

### Expected Response (Success)
```json
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
```

### Expected Response (Failure - 401)
```json
{
  "error": "Invalid credentials",
  "details": "Email not found"
}
```

## Troubleshooting Common Issues

### Issue: Still getting 405 error
**Solution:**
- Verify Vercel deployment completed
- Check that `vercel.json` includes the `functions` configuration
- Clear browser cache and try again

### Issue: 500 error with "Missing Supabase credentials"
**Solution:**
- Verify environment variables are set in Vercel dashboard
   - Check that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correctly set (no secrets in repo)
- Redeploy after setting environment variables

### Issue: 401 "Invalid credentials"
**Solution:**
- Verify user exists in Supabase database
- Check password is correct
- Ensure user status is "active" in database

### Issue: CORS error in browser console
**Solution:**
- CORS headers have been added to all endpoints
- Clear browser cache
- Try in incognito/private mode
- Check browser console for specific error

## Architecture Overview

```
Frontend (Vercel)
    ↓
/api/auth/login (Vercel Serverless Function)
    ↓
Supabase Database
    ↓
RPC: authenticate_user()
    ↓
Returns JWT Token
```

## Recent Commits

1. **9e7868f** - Accessibility fixes for SettingsPage.tsx
2. **1ac8362** - Add API functions configuration to vercel.json
3. **4231ddc** - Add CORS headers to all API auth endpoints

## Next Steps

1. ✅ Set environment variables in Vercel dashboard
2. ✅ Verify Vercel deployment completes
3. ✅ Test login functionality
4. ✅ Monitor browser console for errors
5. ✅ Check Vercel function logs if issues persist

## Support Resources

- Vercel Docs: https://vercel.com/docs/functions/serverless-functions
- Supabase Docs: https://supabase.com/docs
- CORS Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS


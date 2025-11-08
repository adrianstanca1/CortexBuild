# Vercel Deployment Protection Issue

## Problem Identified

The Vercel deployment is **protected with Vercel Authentication (SSO)**, which prevents direct API access. When attempting to call `/api/auth/login`, the request is intercepted by Vercel's protection layer and returns an authentication page instead of the API response.

### Error Response
```
Status: 401
Content-Type: text/html
Response: Vercel Authentication Page (requires SSO login)
```

## Root Cause

Vercel has **Deployment Protection** enabled on your project. This is a security feature that requires authentication before accessing any endpoint on the deployment.

## Solution

You have two options:

### Option 1: Disable Deployment Protection (Recommended for Development)

1. Go to https://vercel.com/dashboard
2. Select your CortexBuild project
3. Go to **Settings → Deployment Protection**
4. Click **Disable** or set to "None"
5. Confirm the change

**Pros:**
- Simple and quick
- Allows direct API access
- Good for development/testing

**Cons:**
- Deployment becomes publicly accessible
- Less secure for production

### Option 2: Use Vercel Protection Bypass Token (Recommended for Production)

1. Go to https://vercel.com/dashboard
2. Select your CortexBuild project
3. Go to **Settings → Deployment Protection**
4. Copy the **Protection Bypass Token**
5. Use the token in API requests:

```bash
curl -X POST "https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app/api/auth/login?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "adrian.stanca1@gmail.com", "password": "password123"}'
```

**Pros:**
- Keeps deployment protected
- Allows programmatic access with token
- Secure for production

**Cons:**
- Requires token management
- More complex setup

### Option 3: Use Vercel MCP Tools (Recommended for Automation)

The Vercel MCP server provides tools to bypass authentication:

```typescript
// Use get_access_to_vercel_url or web_fetch_vercel_url
const response = await web_fetch_vercel_url({
  url: 'https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app/api/auth/login'
});
```

## Recommended Action

**For immediate testing and development:**
1. Disable Deployment Protection temporarily
2. Test the API endpoints
3. Verify login works end-to-end
4. Re-enable protection for production

**For production:**
1. Keep Deployment Protection enabled
2. Use Protection Bypass Token for API access
3. Or use Vercel MCP tools for automation

## Steps to Disable Deployment Protection

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard

2. **Select CortexBuild Project**
   - Click on your project

3. **Go to Settings**
   - Click **Settings** tab

4. **Find Deployment Protection**
   - In left sidebar, look for **Deployment Protection** or **Security**
   - Or search for "protection" in settings

5. **Disable Protection**
   - Click **Disable** or set to "None"
   - Confirm the change

6. **Wait for Changes to Apply**
   - Usually takes a few seconds

7. **Test the API**
   - Run: `node test-login-api.js`
   - Should now get proper API response

## Testing After Disabling Protection

```bash
# Test the login endpoint
node test-login-api.js

# Or use curl
curl -X POST "https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "adrian.stanca1@gmail.com", "password": "password123"}'
```

## Expected Response After Fix

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

## Next Steps

1. ✅ Disable Deployment Protection in Vercel
2. ✅ Set environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET)
3. ✅ Trigger redeployment
4. ✅ Test API endpoint
5. ✅ Test login through frontend UI
6. ✅ Re-enable protection for production

## Important Notes

- **Deployment Protection is a security feature** - Only disable temporarily for testing
- **Environment variables must still be set** - Protection bypass doesn't help if env vars are missing
- **Test thoroughly** - Verify all authentication flows work before re-enabling protection
- **Monitor logs** - Check Vercel function logs for any errors


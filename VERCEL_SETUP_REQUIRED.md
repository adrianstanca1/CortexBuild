# Vercel Setup Required

## Current Status

✅ **Users Created in Supabase**
- dev@constructco.com / parola123 (developer)
- adrian@ascladdingltd.co.uk / Lolozania1 (company_admin)
- adrian.stanca1@gmail.com / parola123 (super_admin - existing)

✅ **Code Fixed and Deployed**
- Fixed api/auth/login.ts to use NEXT_PUBLIC_SUPABASE_URL
- Deployed to: https://cortexbuildcortexbuild-qnics2a72-adrian-b7e84541.vercel.app
- Commit: 96c6df9

❌ **Vercel Configuration Missing**
The deployment is blocked by Vercel authentication protection and missing environment variables.

## Required Actions in Vercel Dashboard

### 1. Disable Deployment Protection
1. Go to [Vercel Dashboard](https://vercel.com/adrian-b7e84541/cortexbuildcortexbuild-app)
2. Click "Settings"
3. Go to "Deployment Protection"
4. **Disable** protection for production (or add bypass for testing)

### 2. Configure Environment Variables
Go to Settings → Environment Variables and add:

```bash
# Required for Vercel serverless functions
NEXT_PUBLIC_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co

# Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYnV2dXhwZmVtbGRza25lcmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExNDMxNywiZXhwIjoyMDcxNjkwMzE3fQ.gY8kq22SiOxULPdpdhf-sz-C7V9hC2ZtPy5003UYsik

# JWT secret for token generation
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Important**: Set these for **Production** environment

### 3. Redeploy (if needed)
After adding environment variables, Vercel should automatically redeploy. If not:
```bash
vercel --prod
```

## Testing After Setup

### Test Login API Directly
```bash
curl -X POST https://cortexbuildcortexbuild-qnics2a72-adrian-b7e84541.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@constructco.com", "password": "parola123"}'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "25eaf3de-45f4-4a45-a005-41737983db72",
    "email": "dev@constructco.com",
    "name": "Dev User",
    "role": "developer",
    "companyId": "00000000-0000-0000-0000-000000000001"
  }
}
```

### Test All Users
1. **Developer**: dev@constructco.com / parola123
2. **Company Admin**: adrian@ascladdingltd.co.uk / Lolozania1
3. **Super Admin**: adrian.stanca1@gmail.com / parola123

## Troubleshooting

### If login still fails after setup:
1. Check Vercel function logs:
   - Go to Deployments → Latest → Function Logs
   - Look for errors from `/api/auth/login`

2. Verify environment variables are set:
   ```bash
   vercel env pull
   ```

3. Check if Supabase is accessible:
   - Test connection from Vercel edge network
   - Verify service role key is correct

### If users can't access dashboards:
- Check that JWT token includes correct role and companyId
- Verify frontend routing logic in App.tsx
- Check browser console for errors

## Database Status

### auth.users (Supabase Auth)
```sql
SELECT id, email, email_confirmed_at FROM auth.users;
```
- adrian.stanca1@gmail.com (confirmed: 2025-11-09)
- dev@constructco.com (confirmed: 2025-11-09 20:51:58)
- adrian@ascladdingltd.co.uk (confirmed: 2025-11-09 20:53:50)

### public.users (App Profiles)
```sql
SELECT id, email, role, company_id FROM users;
```
- All three users have matching profiles
- Password hashes are bcrypt encrypted
- Company assignments are correct

## Summary

**What's Working:**
- ✅ Users created in Supabase
- ✅ Database triggers fixed
- ✅ Code deployed to Vercel
- ✅ Environment variable bug fixed in code

**What Needs Configuration:**
- ❌ Disable Vercel deployment protection
- ❌ Add environment variables to Vercel
- ❌ Test production login

**Next Step:**
Access Vercel dashboard and complete the configuration steps above.

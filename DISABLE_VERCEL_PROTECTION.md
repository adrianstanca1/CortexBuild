# Disable Vercel Deployment Protection

## Current Status

✅ **Environment Variable Added**: `NEXT_PUBLIC_SUPABASE_URL` has been added to Vercel
✅ **Latest Deployment**: <https://cortexbuildcortexbuild-6i9di9556-adrian-b7e84541.vercel.app>
❌ **Deployment Protection Blocking**: All API requests return 401 Unauthorized

## Required Action: Disable Deployment Protection

### Option 1: Disable Protection (Recommended for Testing)

1. Go to your Vercel dashboard:
   <https://vercel.com/adrian-b7e84541/cortexbuildcortexbuild-app>

2. Click **Settings** in the top navigation

3. Scroll down to **Deployment Protection** section

4. Click **Edit** or **Configure**

5. **Disable** the protection for Production deployments

6. Save changes

7. Wait a few seconds for the change to propagate

### Option 2: Get Bypass Token (Alternative)

If you want to keep protection enabled but test the API:

1. Go to Vercel dashboard → Settings → Deployment Protection

2. Generate a **Protection Bypass** token

3. Use this token in API requests:

   ```bash
   curl -X POST "https://cortexbuildcortexbuild-6i9di9556-adrian-b7e84541.vercel.app/api/auth/login?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_BYPASS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "dev@constructco.com", "password": "parola123"}'
   ```

## After Disabling Protection

Test the login endpoint:

```bash
# Test developer user
curl -X POST https://cortexbuildcortexbuild-6i9di9556-adrian-b7e84541.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@constructco.com", "password": "parola123"}'

# Test company admin user
curl -X POST https://cortexbuildcortexbuild-6i9di9556-adrian-b7e84541.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "adrian@ascladdingltd.co.uk", "password": "Lolozania1"}'

# Test super admin user
curl -X POST https://cortexbuildcortexbuild-6i9di9556-adrian-b7e84541.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "adrian.stanca1@gmail.com", "password": "parola123"}'
```

## Expected Response

After disabling protection, you should get:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "25eaf3de-45f4-4a45-a005-41737983db72",
    "email": "dev@constructco.com",
    "name": "Dev User",
    "role": "developer",
    "companyId": "00000000-0000-0000-0000-000000000001"
  }
}
```

## Test in Browser

1. Open your production site: <https://cortexbuildcortexbuild-6i9di9556-adrian-b7e84541.vercel.app>

2. Try logging in with:
   - **Developer**: <dev@constructco.com> / parola123
   - **Company Admin**: <adrian@ascladdingltd.co.uk> / Lolozania1
   - **Super Admin**: <adrian.stanca1@gmail.com> / parola123

3. You should be redirected to the appropriate dashboard based on your role

## What's Been Done

✅ Created both test users in Supabase:

- <dev@constructco.com> (developer role)
- <adrian@ascladdingltd.co.uk> (company_admin role)

✅ Fixed environment variable bug in api/auth/login.ts

✅ Added NEXT_PUBLIC_SUPABASE_URL to Vercel environment variables

✅ Deployed latest code to production

## Only Remaining Step

**Disable Deployment Protection in Vercel Dashboard**

This is a one-time manual configuration that cannot be done via CLI.

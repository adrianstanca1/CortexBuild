# 🔐 Environment Variables Setup Guide

## Step 1: Add Environment Variables to Vercel

### 1.1 Open Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project: **constructai-5**
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

---

### 1.2 Add JWT_SECRET

**Variable Name**: `JWT_SECRET`

**Value** (copy this):
```
a34438833eb8377c5f2fd615ed2edddbfeb5d5a57ebe5823936f0cee84105ca63d8973cf72424f2d4ec2c97eef2fc272fff67ad393f97da4066c1e344824a930
```

**Environments**: Select all three:
- ✅ Production
- ✅ Preview
- ✅ Development

**Click**: Add

---

### 1.3 Add SUPABASE_SERVICE_KEY

**Variable Name**: `SUPABASE_SERVICE_KEY`

**How to get the value**:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Settings** (gear icon in sidebar)
4. Click on **API** in the left menu
5. Scroll down to **Project API keys**
6. Copy the **service_role** key (NOT the anon key!)
   - It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - This is a long string (200+ characters)

**Environments**: Select all three:
- ✅ Production
- ✅ Preview
- ✅ Development

**Click**: Add

---

### 1.4 Verify Existing Variables

Make sure these are already set (they should be from earlier setup):

**Variable Name**: `VITE_SUPABASE_URL`
**Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

**Variable Name**: `VITE_SUPABASE_ANON_KEY`
**Value**: Your Supabase anon/public key

---

### 1.5 Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Check **Use existing Build Cache**
6. Click **Redeploy**

**OR** run from terminal:
```bash
vercel --prod
```

---

## Step 2: Apply Database Migration

### 2.1 Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/migrations/20250122_fix_rls_policies_for_inserts.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for "Success. No rows returned" message

---

### 2.2 Using Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push the migration
supabase db push
```

---

## Step 3: Test the Complete Flow

### 3.1 Test Registration

1. Open the app: https://constructai-5-rlpytw56s-adrian-b7e84541.vercel.app
2. Click **Sign Up**
3. Fill in the form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: TestPass123
4. Click **Create Account**
5. Should see success message
6. You'll need to login with these credentials

---

### 3.2 Test Login

1. Click **Sign In** (if not already there)
2. Enter credentials:
   - **Email**: test@example.com
   - **Password**: TestPass123
3. Click **Sign In**
4. Should redirect to dashboard
5. Should see your name in the header

---

### 3.3 Test Auto-Login (Token Verification)

1. While logged in, refresh the page (F5 or Cmd/Ctrl + R)
2. Should stay logged in (not redirected to login page)
3. Should see dashboard immediately
4. This confirms token verification is working

---

### 3.4 Test Super Admin Login

Use the pre-configured super admin account:

**Email**: `adrian.stanca1@gmail.com`
**Password**: `parola123`

This should:
- ✅ Login successfully
- ✅ Show Super Admin Dashboard
- ✅ Allow creating companies
- ✅ Allow creating users
- ✅ Show all management features

---

### 3.5 Test Company Admin Login

Use the pre-configured company admin account:

**Email**: `adrian@ascladdingltd.co.uk`
**Password**: `lolozania1`

This should:
- ✅ Login successfully
- ✅ Show Company Dashboard
- ✅ Allow creating projects
- ✅ Allow creating team members
- ✅ Show company-specific data only

---

## Step 4: Test CRUD Operations

### 4.1 Create a Company (as Super Admin)

1. Login as super admin
2. Go to **Company Management**
3. Click **Add New Company**
4. Fill in:
   - **Company Name**: Test Construction Co
   - **Email**: test@construction.com
   - **Phone**: +1 555 123 4567
   - **Industry**: Construction
5. Click **Create Company**
6. Should see success toast
7. Company should appear in the list

---

### 4.2 Create a User (as Super Admin or Company Admin)

1. Go to **User Management**
2. Click **Add New User**
3. Fill in:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: SecurePass123
   - **Role**: User
   - **Company**: Select a company
4. Click **Create User**
5. Should see success toast
6. User should appear in the list

---

### 4.3 Create a Project (as Company Admin)

1. Login as company admin
2. Go to **Projects Management**
3. Click **Create New Project**
4. Fill in:
   - **Project Name**: New Office Building
   - **Description**: 5-story office complex
   - **Status**: Planning
   - **Priority**: High
   - **Budget**: 1000000
5. Click **Create Project**
6. Should see success toast
7. Project should appear in the list

---

## ✅ Success Criteria

Your setup is complete when:

- ✅ Environment variables are set in Vercel
- ✅ Database migration is applied
- ✅ Registration creates new users
- ✅ Login works with email/password
- ✅ Token verification keeps users logged in on refresh
- ✅ Super admin can create companies
- ✅ Admins can create users
- ✅ Company admins can create projects
- ✅ No console errors
- ✅ All CRUD operations work

---

## 🐛 Troubleshooting

### Issue: "Invalid token" error

**Solution**: 
- Make sure `JWT_SECRET` is set in Vercel
- Redeploy after adding the variable
- Clear browser localStorage and login again

---

### Issue: "Failed to create company/user/project"

**Solution**:
- Make sure database migration is applied
- Check Supabase logs for RLS policy errors
- Verify user has correct role (super_admin or company_admin)

---

### Issue: "Supabase service key not found"

**Solution**:
- Make sure `SUPABASE_SERVICE_KEY` is set in Vercel
- Use the **service_role** key, not the anon key
- Redeploy after adding the variable

---

### Issue: Registration doesn't auto-login

**Expected Behavior**: 
- Registration creates the account but doesn't auto-login
- User must manually login after registration
- This is by design for security

---

## 📞 Need Help?

If you encounter any issues:

1. Check browser console for errors (F12 → Console)
2. Check Vercel deployment logs
3. Check Supabase logs (Dashboard → Logs)
4. Verify all environment variables are set
5. Verify database migration was applied successfully

---

**🎉 Once all steps are complete, your authentication system is fully operational!**


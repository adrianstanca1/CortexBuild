# 🗄️ Apply Database Migration - Quick Guide

## Option 1: Supabase Dashboard (Easiest - Recommended)

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query** button

3. **Copy Migration SQL**
   - Open the file: `supabase/migrations/20250122_fix_rls_policies_for_inserts.sql`
   - Select all (Cmd/Ctrl + A)
   - Copy (Cmd/Ctrl + C)

4. **Paste and Run**
   - Paste into the SQL editor (Cmd/Ctrl + V)
   - Click **Run** button (or press Cmd/Ctrl + Enter)
   - Wait for "Success. No rows returned" message

5. **Verify**
   - Go to **Database** → **Policies** in the left sidebar
   - You should see new policies for:
     - `users_select_policy`
     - `users_insert_policy`
     - `users_update_policy`
     - `users_delete_policy`
     - `companies_select_policy`
     - `companies_insert_policy`
     - `companies_update_policy`
     - `companies_delete_policy`
     - `projects_select_policy`
     - `projects_insert_policy`
     - `projects_update_policy`
     - `projects_delete_policy`

---

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project root
cd /Users/admin/Desktop/proiecte\ web/CortexBuild

# Login to Supabase (if not already logged in)
supabase login

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

---

## What This Migration Does

### 1. **Fixes Users Table RLS**
- ✅ Allows super admins and company admins to create users
- ✅ Users can see users in their company
- ✅ Super admins can see all users
- ✅ Users can update their own profile
- ✅ Admins can update users in their company

### 2. **Fixes Companies Table RLS**
- ✅ Allows super admins to create companies
- ✅ Users can see their own company
- ✅ Super admins can see all companies
- ✅ Super admins can update any company
- ✅ Company admins can update their own company

### 3. **Fixes Projects Table RLS**
- ✅ Allows company admins to create projects in their company
- ✅ Super admins can create projects in any company
- ✅ Users can see projects in their company
- ✅ Super admins can see all projects
- ✅ Company admins can update projects in their company

### 4. **Removes Restrictive Constraints**
- ✅ Removes NOT NULL constraint on `users.company_id`
- ✅ Allows creating users without a company (for super admins)

---

## After Migration - Test These:

### Test 1: Create Company (as Super Admin)
```
Login: adrian.stanca1@gmail.com
Password: parola123

Go to: Company Management → Add New Company
Expected: ✅ Success
```

### Test 2: Create User (as Super Admin)
```
Login: adrian.stanca1@gmail.com
Password: parola123

Go to: User Management → Add New User
Expected: ✅ Success
```

### Test 3: Create User (as Company Admin)
```
Login: adrian@ascladdingltd.co.uk
Password: lolozania1

Go to: User Management → Add New User
Expected: ✅ Success
```

### Test 4: Create Project (as Company Admin)
```
Login: adrian@ascladdingltd.co.uk
Password: lolozania1

Go to: Projects Management → Create New Project
Expected: ✅ Success
```

---

## Troubleshooting

### Error: "permission denied for table users"

**Cause**: Migration not applied or RLS policies not created

**Solution**:
1. Re-run the migration SQL in Supabase Dashboard
2. Check for any SQL errors in the output
3. Verify policies exist in Database → Policies

---

### Error: "new row violates row-level security policy"

**Cause**: User doesn't have permission to insert

**Solution**:
1. Verify user role is `super_admin` or `company_admin`
2. Check that the user is logged in (has valid auth.uid())
3. For company admins, verify they have a company_id

---

### Error: "column company_id cannot be null"

**Cause**: Migration didn't remove the NOT NULL constraint

**Solution**:
1. Run this SQL in Supabase Dashboard:
```sql
ALTER TABLE users ALTER COLUMN company_id DROP NOT NULL;
```

---

## ✅ Success Indicators

Migration is successful when:

- ✅ No SQL errors in Supabase SQL Editor
- ✅ All policies visible in Database → Policies
- ✅ Super admin can create companies
- ✅ Super admin can create users
- ✅ Company admin can create users in their company
- ✅ Company admin can create projects in their company
- ✅ No "permission denied" errors

---

**🎉 Once migration is applied, all CRUD operations will work!**


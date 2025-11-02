# Migration 001: Create Departments Table - Execution Guide

## 📋 Migration Overview

**File:** `database/migrations/001_create_departments_table.sql`

**What This Migration Creates:**
1. **departments table** - Stores company departments/teams
2. **3 indexes** - For performance optimization
3. **4 RLS policies** - For security and access control
4. **1 trigger** - For automatic timestamp updates

---

## 📊 Table Structure

```sql
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    budget NUMERIC NOT NULL DEFAULT 0 CHECK (budget >= 0),
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    member_count INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
    spent NUMERIC NOT NULL DEFAULT 0 CHECK (spent >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);
```

**Key Features:**
- ✅ UUID primary key (auto-generated)
- ✅ Foreign key to companies table (cascading delete)
- ✅ Foreign key to users table (manager_id)
- ✅ Budget tracking with validation (>= 0)
- ✅ Member count tracking
- ✅ Spending tracking
- ✅ Timestamps (created_at, updated_at)
- ✅ Unique constraint on (company_id, name)

---

## 🔐 Security Features

**4 RLS Policies Created:**
1. **company_admins_view_departments** - SELECT access
2. **company_admins_insert_departments** - INSERT access
3. **company_admins_update_departments** - UPDATE access
4. **company_admins_delete_departments** - DELETE access

**Access Rules:**
- Company admins can manage their company's departments
- Super admins can manage all departments
- Regular users cannot access this table

---

## ⚡ Performance Features

**3 Indexes Created:**
1. `idx_departments_company_id` - For filtering by company
2. `idx_departments_manager_id` - For filtering by manager
3. `idx_departments_created_at` - For sorting by creation date

---

## 🚀 Execution Steps

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Copy Migration SQL
Copy the entire contents of `database/migrations/001_create_departments_table.sql`

### Step 3: Paste into SQL Editor
1. Paste the SQL into the editor
2. Review the code
3. Click **"Run"** button (or press Ctrl+Enter)

### Step 4: Verify Success
You should see:
- ✅ "Query executed successfully"
- ✅ No error messages
- ✅ Execution time displayed

---

## ✅ Verification Queries

### Query 1: Verify Table Exists
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'departments';
```
**Expected Result:** 1 row with `departments`

### Query 2: Verify Table Structure
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'departments'
ORDER BY ordinal_position;
```
**Expected Result:** 10 columns with correct data types

### Query 3: Verify Indexes
```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'departments';
```
**Expected Result:** 3 indexes
- `idx_departments_company_id`
- `idx_departments_manager_id`
- `idx_departments_created_at`

### Query 4: Verify RLS is Enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'departments';
```
**Expected Result:** 1 row with `rowsecurity = true`

### Query 5: Verify RLS Policies
```sql
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'departments'
ORDER BY policyname;
```
**Expected Result:** 4 policies
- `company_admins_delete_departments` (DELETE)
- `company_admins_insert_departments` (INSERT)
- `company_admins_update_departments` (UPDATE)
- `company_admins_view_departments` (SELECT)

### Query 6: Verify Trigger
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table = 'departments';
```
**Expected Result:** 1 trigger
- `departments_updated_at_trigger`

---

## 🔍 What to Look For

### ✅ Success Indicators
- Query executes without errors
- All verification queries return expected results
- No warning messages
- Table appears in Supabase Table Editor

### ❌ Common Errors & Solutions

**Error: "relation 'public.companies' does not exist"**
- **Cause:** companies table not created yet
- **Solution:** Ensure companies table exists before running this migration

**Error: "relation 'public.users' does not exist"**
- **Cause:** users table not created yet
- **Solution:** Ensure users table exists before running this migration

**Error: "duplicate key value violates unique constraint"**
- **Cause:** Table already exists
- **Solution:** This is OK - the migration uses `CREATE TABLE IF NOT EXISTS`

**Error: "permission denied for schema public"**
- **Cause:** Insufficient permissions
- **Solution:** Use a role with schema creation permissions

---

## 📝 Migration Details

| Aspect | Details |
|--------|---------|
| **File** | `database/migrations/001_create_departments_table.sql` |
| **Lines** | 99 |
| **Tables Created** | 1 (departments) |
| **Indexes Created** | 3 |
| **RLS Policies** | 4 |
| **Triggers** | 1 |
| **Estimated Time** | < 1 second |

---

## ✅ Execution Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied migration SQL
- [ ] Pasted into editor
- [ ] Clicked "Run"
- [ ] Saw "Query executed successfully"
- [ ] Ran Query 1 - Table exists
- [ ] Ran Query 2 - Table structure correct
- [ ] Ran Query 3 - Indexes created
- [ ] Ran Query 4 - RLS enabled
- [ ] Ran Query 5 - RLS policies created
- [ ] Ran Query 6 - Trigger created
- [ ] All verification queries passed

---

## 🎯 Next Steps

Once this migration is successful:
1. Confirm all verification queries passed
2. Proceed to Migration 002 (custom_roles table)
3. Continue with remaining migrations (003-009)

---

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Verify prerequisites (companies, users tables exist)
3. Check Supabase status page
4. Review the SQL syntax
5. Try running verification queries individually

---

## Sign-Off

**Migration 001 Status:** Ready for Execution

**Executed:** _______________
**Verified:** _______________
**Date:** _______________


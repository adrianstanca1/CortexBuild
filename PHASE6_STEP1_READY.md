# Phase 6 - Step 1: Database Migration Execution - READY

## 🎯 Current Status: READY FOR FIRST MIGRATION

---

## 📋 Migration 001: Create Departments Table

### What This Migration Does

Creates the **departments** table with:
- ✅ UUID primary key
- ✅ Foreign key to companies table
- ✅ Budget tracking (with validation)
- ✅ Manager assignment
- ✅ Member count tracking
- ✅ Spending tracking
- ✅ Timestamps (created_at, updated_at)
- ✅ 3 performance indexes
- ✅ 4 RLS security policies
- ✅ 1 auto-update trigger

### Table Columns

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, auto-generated |
| company_id | UUID | Foreign key to companies |
| name | TEXT | Department name (unique per company) |
| description | TEXT | Optional description |
| budget | NUMERIC | Budget amount (>= 0) |
| manager_id | UUID | Foreign key to users |
| member_count | INTEGER | Number of members (>= 0) |
| spent | NUMERIC | Amount spent (>= 0) |
| created_at | TIMESTAMP | Auto-set on creation |
| updated_at | TIMESTAMP | Auto-updated on changes |

### Security Features

**4 RLS Policies:**
1. **SELECT** - Company admins can view their departments
2. **INSERT** - Company admins can create departments
3. **UPDATE** - Company admins can update departments
4. **DELETE** - Company admins can delete departments

**Access Control:**
- ✅ Company admins: Full access to their company's departments
- ✅ Super admins: Full access to all departments
- ❌ Regular users: No access

### Performance Features

**3 Indexes:**
1. `idx_departments_company_id` - For company filtering
2. `idx_departments_manager_id` - For manager filtering
3. `idx_departments_created_at` - For date sorting

---

## 🚀 How to Execute This Migration

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your CortexBuild project
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"** button

### Step 2: Copy the Migration SQL
The migration file is located at:
```
database/migrations/001_create_departments_table.sql
```

**File Contents:** 99 lines of SQL code

Copy the entire file contents.

### Step 3: Paste into SQL Editor
1. Paste the SQL into the Supabase SQL Editor
2. Review the code
3. Click **"Run"** button (or press Ctrl+Enter)

### Step 4: Verify Success
You should see:
- ✅ "Query executed successfully" message
- ✅ No error messages
- ✅ Execution time displayed (usually < 1 second)

---

## ✅ Verification Queries

After running the migration, execute these queries to verify:

### Query 1: Verify Table Exists
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'departments';
```
**Expected:** 1 row with `departments`

### Query 2: Verify Table Structure
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'departments'
ORDER BY ordinal_position;
```
**Expected:** 10 columns with correct types

### Query 3: Verify Indexes
```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'departments';
```
**Expected:** 3 indexes created

### Query 4: Verify RLS Enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'departments';
```
**Expected:** `rowsecurity = true`

### Query 5: Verify RLS Policies
```sql
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'departments'
ORDER BY policyname;
```
**Expected:** 4 policies (DELETE, INSERT, UPDATE, SELECT)

### Query 6: Verify Trigger
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' AND event_object_table = 'departments';
```
**Expected:** 1 trigger (`departments_updated_at_trigger`)

---

## 📊 Migration Summary

| Item | Count |
|------|-------|
| **Tables Created** | 1 |
| **Columns** | 10 |
| **Indexes** | 3 |
| **RLS Policies** | 4 |
| **Triggers** | 1 |
| **Foreign Keys** | 2 |
| **Check Constraints** | 3 |
| **Unique Constraints** | 1 |

---

## ⚠️ Prerequisites

Before executing this migration, ensure:
- ✅ Supabase project is created
- ✅ `companies` table exists
- ✅ `users` table exists
- ✅ You have SQL Editor access
- ✅ You have schema creation permissions

---

## 🔍 Troubleshooting

### Error: "relation 'public.companies' does not exist"
**Solution:** Ensure companies table exists first

### Error: "relation 'public.users' does not exist"
**Solution:** Ensure users table exists first

### Error: "permission denied for schema public"
**Solution:** Use a role with schema creation permissions

### Error: "duplicate key value violates unique constraint"
**Solution:** This is OK - migration uses `CREATE TABLE IF NOT EXISTS`

---

## 📁 Related Files

- **Migration File:** `database/migrations/001_create_departments_table.sql`
- **Execution Guide:** `MIGRATION_001_EXECUTION_GUIDE.md`
- **Schema Reference:** `database/SCHEMA_DOCUMENTATION.md`
- **Setup Guide:** `database/SETUP_GUIDE.md`

---

## 🎯 Next Steps After Success

1. ✅ Confirm all 6 verification queries pass
2. ✅ Proceed to Migration 002 (custom_roles table)
3. ✅ Continue with remaining migrations (003-009)
4. ✅ Execute TEST_SCRIPT.sql to validate all tables

---

## ✅ Execution Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied migration SQL from 001_create_departments_table.sql
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Saw "Query executed successfully"
- [ ] Ran all 6 verification queries
- [ ] All verification queries passed
- [ ] Ready to proceed to Migration 002

---

## 📞 Support

For detailed information:
- **Execution Guide:** `MIGRATION_001_EXECUTION_GUIDE.md`
- **Schema Details:** `database/SCHEMA_DOCUMENTATION.md`
- **Setup Help:** `database/SETUP_GUIDE.md`

---

## 🚀 Ready to Begin?

**Status:** ✅ READY FOR EXECUTION

**Next Action:** 
1. Open Supabase SQL Editor
2. Copy `database/migrations/001_create_departments_table.sql`
3. Paste and run in SQL Editor
4. Run verification queries
5. Confirm success
6. Reply with confirmation to proceed to Migration 002

**Estimated Time:** 2-3 minutes

Good luck! 🎯


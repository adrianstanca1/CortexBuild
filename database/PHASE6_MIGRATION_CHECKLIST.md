# Phase 6: Testing & Deployment - Migration Checklist

## Step 1: Database Migration Execution

### Pre-Migration Checklist
- [ ] Backup existing Supabase database
- [ ] Verify Supabase project is accessible
- [ ] Confirm you have super admin access
- [ ] Have all 9 migration files ready
- [ ] Review SCHEMA_DOCUMENTATION.md

### Migration Execution Order

#### Migration 001: Create Departments Table
**File:** `database/migrations/001_create_departments_table.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Table `departments` created
- [ ] 3 indexes created
- [ ] 4 RLS policies created
- [ ] 1 trigger created
- [ ] No errors

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'departments';
```

---

#### Migration 002: Create Custom Roles Table
**File:** `database/migrations/002_create_custom_roles_table.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Table `custom_roles` created
- [ ] 2 indexes created
- [ ] 4 RLS policies created
- [ ] 1 trigger created
- [ ] No errors

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'custom_roles';
```

---

#### Migration 003: Create Department Members Table
**File:** `database/migrations/003_create_department_members_table.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Table `department_members` created
- [ ] 3 indexes created
- [ ] 4 RLS policies created
- [ ] No errors

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'department_members';
```

---

#### Migration 004: Create Company Analytics Table
**File:** `database/migrations/004_create_company_analytics_table.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Table `company_analytics` created
- [ ] 3 indexes created
- [ ] 4 RLS policies created
- [ ] No errors

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'company_analytics';
```

---

#### Migration 005: Create Company Settings Table
**File:** `database/migrations/005_create_company_settings_table.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Table `company_settings` created
- [ ] 1 index created
- [ ] 4 RLS policies created
- [ ] 1 trigger created
- [ ] No errors

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'company_settings';
```

---

#### Migration 006: Create API Keys Table
**File:** `database/migrations/006_create_api_keys_table.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Table `api_keys` created
- [ ] 3 indexes created
- [ ] 4 RLS policies created
- [ ] No errors

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'api_keys';
```

---

#### Migration 007: Create Webhooks Table
**File:** `database/migrations/007_create_webhooks_table.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Table `webhooks` created
- [ ] 3 indexes created
- [ ] 4 RLS policies created
- [ ] 1 trigger created
- [ ] No errors

**Verification Query:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'webhooks';
```

---

#### Migration 008: Create RPC Functions (Part 1)
**File:** `database/migrations/008_create_rpc_functions.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Function `invite_team_member()` created
- [ ] Function `update_team_member_role()` created
- [ ] Function `create_department()` created
- [ ] Function `assign_user_to_department()` created
- [ ] No errors

**Verification Query:**
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('invite_team_member', 'update_team_member_role', 
                     'create_department', 'assign_user_to_department');
```

---

#### Migration 009: Create RPC Functions (Part 2)
**File:** `database/migrations/009_create_rpc_functions_part2.sql`
**Status:** ⏳ TODO
**Expected Results:**
- [ ] Function `get_company_analytics()` created
- [ ] Function `create_api_key()` created
- [ ] Function `update_department_budget()` created
- [ ] Function `get_department_members()` created
- [ ] Function `get_department_budget_summary()` created
- [ ] No errors

**Verification Query:**
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_company_analytics', 'create_api_key',
                     'update_department_budget', 'get_department_members',
                     'get_department_budget_summary');
```

---

### Post-Migration Verification

#### Verify All Tables Created
```sql
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('departments', 'custom_roles', 'department_members', 
                   'company_analytics', 'company_settings', 'api_keys', 'webhooks');
```
**Expected:** 7 tables

#### Verify All RLS Policies
```sql
SELECT COUNT(*) as policy_count FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'custom_roles', 'department_members', 
                  'company_analytics', 'company_settings', 'api_keys', 'webhooks');
```
**Expected:** 28 policies

#### Verify All Indexes
```sql
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'custom_roles', 'department_members', 
                  'company_analytics', 'company_settings', 'api_keys', 'webhooks');
```
**Expected:** 23 indexes

#### Verify All RPC Functions
```sql
SELECT COUNT(*) as function_count FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('invite_team_member', 'update_team_member_role', 
                     'create_department', 'assign_user_to_department',
                     'get_company_analytics', 'create_api_key',
                     'update_department_budget', 'get_department_members',
                     'get_department_budget_summary');
```
**Expected:** 9 functions

---

### Test Script Execution

**File:** `database/TEST_SCRIPT.sql`

1. [ ] Replace all `YOUR_COMPANY_ID_HERE` with actual company ID
2. [ ] Replace all `YOUR_USER_ID_HERE` with actual user ID
3. [ ] Replace all `YOUR_MANAGER_USER_ID_HERE` with actual manager user ID
4. [ ] Execute TEST 1-20 in order
5. [ ] Verify all tests pass without errors

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "relation does not exist" | Ensure all migrations ran in order |
| "permission denied" | Use super admin account |
| "duplicate key value" | Check for existing data conflicts |
| "foreign key violation" | Ensure parent records exist |
| "RLS policy blocks access" | Verify user role and company_id |

---

### Sign-Off

- [ ] All 9 migrations executed successfully
- [ ] All 7 tables created and verified
- [ ] All 28 RLS policies active
- [ ] All 9 RPC functions available
- [ ] TEST_SCRIPT.sql executed successfully
- [ ] No errors or warnings
- [ ] Ready for React component integration

**Migration Completed:** _______________
**Completed By:** _______________
**Date:** _______________


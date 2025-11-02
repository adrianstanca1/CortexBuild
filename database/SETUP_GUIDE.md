# Phase 5 Database Setup Guide

## Prerequisites

- Supabase project created and configured
- Access to Supabase SQL Editor
- Existing `companies` and `users` tables
- Super admin user account for testing

## Step-by-Step Setup

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run Migration Scripts in Order

Copy and paste each migration script into the SQL Editor and execute them in this order:

#### 2.1 Create Departments Table
```
File: database/migrations/001_create_departments_table.sql
```
- Creates `departments` table
- Sets up indexes and RLS policies
- Creates update trigger

#### 2.2 Create Custom Roles Table
```
File: database/migrations/002_create_custom_roles_table.sql
```
- Creates `custom_roles` table
- Sets up indexes and RLS policies
- Creates update trigger

#### 2.3 Create Department Members Table
```
File: database/migrations/003_create_department_members_table.sql
```
- Creates `department_members` junction table
- Sets up indexes and RLS policies

#### 2.4 Create Company Analytics Table
```
File: database/migrations/004_create_company_analytics_table.sql
```
- Creates `company_analytics` table
- Sets up indexes and RLS policies

#### 2.5 Create Company Settings Table
```
File: database/migrations/005_create_company_settings_table.sql
```
- Creates `company_settings` table
- Sets up indexes and RLS policies
- Creates update trigger

#### 2.6 Create API Keys Table
```
File: database/migrations/006_create_api_keys_table.sql
```
- Creates `api_keys` table
- Sets up indexes and RLS policies

#### 2.7 Create Webhooks Table
```
File: database/migrations/007_create_webhooks_table.sql
```
- Creates `webhooks` table
- Sets up indexes and RLS policies
- Creates update trigger

#### 2.8 Create RPC Functions (Part 1)
```
File: database/migrations/008_create_rpc_functions.sql
```
- Creates `invite_team_member()` function
- Creates `update_team_member_role()` function
- Creates `create_department()` function
- Creates `assign_user_to_department()` function

#### 2.9 Create RPC Functions (Part 2)
```
File: database/migrations/009_create_rpc_functions_part2.sql
```
- Creates `get_company_analytics()` function
- Creates `create_api_key()` function
- Creates `update_department_budget()` function
- Creates `get_department_members()` function
- Creates `get_department_budget_summary()` function

### Step 3: Verify Installation

Run these queries to verify all tables were created:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('departments', 'custom_roles', 'department_members', 
                   'company_analytics', 'company_settings', 'api_keys', 'webhooks')
ORDER BY table_name;
```

Expected output: 7 rows (all tables)

### Step 4: Verify RLS Policies

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'custom_roles', 'department_members', 
                  'company_analytics', 'company_settings', 'api_keys', 'webhooks')
ORDER BY tablename, policyname;
```

Expected output: Multiple policies per table

### Step 5: Verify RPC Functions

```sql
-- Check RPC functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('invite_team_member', 'update_team_member_role', 
                     'create_department', 'assign_user_to_department',
                     'get_company_analytics', 'create_api_key',
                     'update_department_budget', 'get_department_members',
                     'get_department_budget_summary')
ORDER BY routine_name;
```

Expected output: 9 rows (all functions)

### Step 6: Test with Sample Data

1. Get your company ID and user ID from the `companies` and `users` tables
2. Open `database/TEST_SCRIPT.sql`
3. Replace all `YOUR_COMPANY_ID_HERE` with your actual company ID
4. Replace all `YOUR_USER_ID_HERE` with your actual user ID
5. Replace all `YOUR_MANAGER_USER_ID_HERE` with your actual manager user ID
6. Replace all `YOUR_DEPARTMENT_ID_HERE` with the department ID created in TEST 1
7. Run each test query one by one

### Step 7: Verify RLS Policies Work

Test that RLS policies prevent unauthorized access:

```sql
-- As company admin, should see their company's departments
SELECT id, name FROM public.departments WHERE company_id = 'YOUR_COMPANY_ID';

-- As regular user, should not see other companies' departments
-- (This requires switching to a different user's session)
```

## Troubleshooting

### Issue: "relation does not exist"
**Solution:** Ensure all migration scripts were run in order. Check that tables exist using the verification query above.

### Issue: "permission denied for schema public"
**Solution:** Ensure your Supabase user has sufficient permissions. Use a super admin account.

### Issue: RLS policies blocking access
**Solution:** Verify the user's role and company_id match the RLS policy conditions. Check the `users` table.

### Issue: RPC function not found
**Solution:** Ensure all migration scripts were executed. Check function names are spelled correctly.

### Issue: Foreign key constraint violation
**Solution:** Ensure referenced records exist in parent tables before inserting child records.

## Maintenance

### Backup Database

1. Go to Supabase Dashboard
2. Click "Backups" in the left sidebar
3. Click "Create backup"

### Monitor Performance

```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Update Statistics

```sql
-- Analyze tables for query optimization
ANALYZE public.departments;
ANALYZE public.custom_roles;
ANALYZE public.department_members;
ANALYZE public.company_analytics;
ANALYZE public.company_settings;
ANALYZE public.api_keys;
ANALYZE public.webhooks;
```

## Next Steps

1. Update React components to use new tables and RPC functions
2. Test all CRUD operations in the application
3. Monitor performance and adjust indexes if needed
4. Set up automated backups
5. Document any custom modifications

## Support

For issues or questions:
1. Check the SCHEMA_DOCUMENTATION.md for detailed table information
2. Review the TEST_SCRIPT.sql for usage examples
3. Check Supabase documentation: https://supabase.com/docs


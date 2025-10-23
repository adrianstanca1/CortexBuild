-- ============================================================================
-- FIX RLS POLICIES TO ALLOW INSERTS
-- ============================================================================
-- This migration fixes RLS policies to allow proper CRUD operations
-- for users, companies, and projects
-- ============================================================================

-- ============================================================================
-- PART 1: FIX USERS TABLE RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS users_isolation_policy ON users;
DROP POLICY IF EXISTS users_read_policy ON users;
DROP POLICY IF EXISTS users_write_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see users in their company OR super admins see all
CREATE POLICY users_select_policy ON users
    FOR SELECT
    USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- INSERT: Super admins and company admins can create users
CREATE POLICY users_insert_policy ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'company_admin')
        )
    );

-- UPDATE: Users can update themselves, admins can update their company users
CREATE POLICY users_update_policy ON users
    FOR UPDATE
    USING (
        id = auth.uid()
        OR
        (
            company_id = (SELECT company_id FROM users WHERE id = auth.uid())
            AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'company_admin'))
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- DELETE: Only super admins and company admins can delete users
CREATE POLICY users_delete_policy ON users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'company_admin')
        )
    );

-- ============================================================================
-- PART 2: FIX COMPANIES TABLE RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS companies_isolation_policy ON companies;
DROP POLICY IF EXISTS companies_write_policy ON companies;
DROP POLICY IF EXISTS companies_select_policy ON companies;
DROP POLICY IF EXISTS companies_insert_policy ON companies;
DROP POLICY IF EXISTS companies_update_policy ON companies;
DROP POLICY IF EXISTS companies_delete_policy ON companies;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see their own company OR super admins see all
CREATE POLICY companies_select_policy ON companies
    FOR SELECT
    USING (
        id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- INSERT: Super admins can create companies
CREATE POLICY companies_insert_policy ON companies
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- UPDATE: Super admins and company admins can update their company
CREATE POLICY companies_update_policy ON companies
    FOR UPDATE
    USING (
        (
            id = (SELECT company_id FROM users WHERE id = auth.uid())
            AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'company_admin')
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- DELETE: Only super admins can delete companies
CREATE POLICY companies_delete_policy ON companies
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- ============================================================================
-- PART 3: FIX PROJECTS TABLE RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS projects_isolation_policy ON projects;
DROP POLICY IF EXISTS projects_read_policy ON projects;
DROP POLICY IF EXISTS projects_write_policy ON projects;
DROP POLICY IF EXISTS projects_select_policy ON projects;
DROP POLICY IF EXISTS projects_insert_policy ON projects;
DROP POLICY IF EXISTS projects_update_policy ON projects;
DROP POLICY IF EXISTS projects_delete_policy ON projects;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see projects in their company OR super admins see all
CREATE POLICY projects_select_policy ON projects
    FOR SELECT
    USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- INSERT: Company admins and super admins can create projects
CREATE POLICY projects_insert_policy ON projects
    FOR INSERT
    WITH CHECK (
        (
            company_id = (SELECT company_id FROM users WHERE id = auth.uid())
            AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin'))
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- UPDATE: Company admins can update their company projects
CREATE POLICY projects_update_policy ON projects
    FOR UPDATE
    USING (
        (
            company_id = (SELECT company_id FROM users WHERE id = auth.uid())
            AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin'))
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- DELETE: Company admins can delete their company projects
CREATE POLICY projects_delete_policy ON projects
    FOR DELETE
    USING (
        (
            company_id = (SELECT company_id FROM users WHERE id = auth.uid())
            AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin'))
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- ============================================================================
-- PART 4: FIX TASKS TABLE RLS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS tasks_isolation_policy ON tasks;
DROP POLICY IF EXISTS tasks_select_policy ON tasks;
DROP POLICY IF EXISTS tasks_insert_policy ON tasks;
DROP POLICY IF EXISTS tasks_update_policy ON tasks;
DROP POLICY IF EXISTS tasks_delete_policy ON tasks;

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see tasks in their company
CREATE POLICY tasks_select_policy ON tasks
    FOR SELECT
    USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- INSERT: Company users can create tasks
CREATE POLICY tasks_insert_policy ON tasks
    FOR INSERT
    WITH CHECK (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- UPDATE: Users can update tasks in their company
CREATE POLICY tasks_update_policy ON tasks
    FOR UPDATE
    USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- DELETE: Company admins can delete tasks
CREATE POLICY tasks_delete_policy ON tasks
    FOR DELETE
    USING (
        (
            company_id = (SELECT company_id FROM users WHERE id = auth.uid())
            AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin'))
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- ============================================================================
-- PART 5: REMOVE NOT NULL CONSTRAINTS THAT CAUSE ISSUES
-- ============================================================================

-- Make company_id nullable for users table (super admin might not have company)
ALTER TABLE users ALTER COLUMN company_id DROP NOT NULL;

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Multi-tenant schema - RLS policies fixed for proper CRUD operations';


-- ============================================================================
-- CREATE SUPER ADMIN USER
-- ============================================================================
-- This migration creates the principal super admin user for ConstructAI
--
-- Email: adrian.stanca1@gmail.com
-- Password: Cumparavinde1
-- Role: super_admin
--
-- Author: ConstructAI Team
-- Date: 2025-10-07
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Super Admin Company
-- ============================================================================

-- Insert ConstructAI Platform company (for super admins)
INSERT INTO companies (id, name, slug, plan, status, settings)
VALUES (
    'comp_platform_admin',
    'ConstructAI Platform',
    'constructai-platform',
    'enterprise',
    'active',
    '{
        "timezone": "Europe/Bucharest",
        "currency": "RON",
        "features": [
            "ml_analytics",
            "ai_agents",
            "advanced_reporting",
            "custom_integrations",
            "dedicated_support",
            "sso",
            "platform_admin"
        ]
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Create Super Admin User Profile
-- ============================================================================

-- Note: The actual auth user must be created through Supabase Auth
-- This creates the profile that will be linked to the auth user

-- First, we need to create a function to handle user creation
CREATE OR REPLACE FUNCTION create_super_admin_profile(
    p_user_id UUID,
    p_email VARCHAR(255),
    p_name VARCHAR(255)
)
RETURNS VOID AS $$
BEGIN
    -- Insert user profile
    INSERT INTO users (id, company_id, email, name, role, avatar, settings)
    VALUES (
        p_user_id,
        'comp_platform_admin',
        p_email,
        p_name,
        'super_admin',
        'https://ui-avatars.com/api/?name=Adrian+Stanca&background=4F46E5&color=fff&size=200',
        '{
            "notifications": true,
            "language": "ro",
            "theme": "light"
        }'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        role = EXCLUDED.role,
        settings = EXCLUDED.settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Update RLS Policies for Super Admin
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS super_admin_all_companies ON companies;
DROP POLICY IF EXISTS super_admin_all_projects ON projects;
DROP POLICY IF EXISTS super_admin_all_tasks ON tasks;
DROP POLICY IF EXISTS super_admin_all_subscriptions ON subscriptions;

-- Super admin can see ALL companies
CREATE POLICY super_admin_all_companies ON companies
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Super admin can see ALL projects (already exists, but ensure it's correct)
CREATE POLICY super_admin_all_projects ON projects
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
        OR
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Super admin can see ALL tasks
CREATE POLICY super_admin_all_tasks ON tasks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
        OR
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Super admin can see ALL subscriptions
CREATE POLICY super_admin_all_subscriptions ON subscriptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
        OR
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- STEP 4: Create Platform Statistics Views
-- ============================================================================

-- View: Platform-wide statistics
CREATE OR REPLACE VIEW platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM companies WHERE status = 'active') as active_companies,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM projects) as total_projects,
    (SELECT COUNT(*) FROM tasks) as total_tasks,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT SUM(a.price_monthly) 
     FROM subscriptions s 
     JOIN agents a ON s.agent_id = a.id 
     WHERE s.status = 'active') as monthly_revenue;

-- View: Company details with statistics
CREATE OR REPLACE VIEW company_details AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.plan,
    c.status,
    c.created_at,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT p.id) as project_count,
    COUNT(DISTINCT t.id) as task_count,
    COUNT(DISTINCT s.id) as subscription_count,
    COALESCE(SUM(a.price_monthly), 0) as monthly_spend
FROM companies c
LEFT JOIN users u ON u.company_id = c.id
LEFT JOIN projects p ON p.company_id = c.id
LEFT JOIN tasks t ON t.company_id = c.id
LEFT JOIN subscriptions s ON s.company_id = c.id AND s.status = 'active'
LEFT JOIN agents a ON s.agent_id = a.id
GROUP BY c.id, c.name, c.slug, c.plan, c.status, c.created_at;

-- View: Agent subscription statistics
CREATE OR REPLACE VIEW agent_stats AS
SELECT 
    a.id,
    a.name,
    a.slug,
    a.category,
    a.price_monthly,
    COUNT(s.id) as subscription_count,
    COUNT(s.id) * a.price_monthly as monthly_revenue
FROM agents a
LEFT JOIN subscriptions s ON s.agent_id = a.id AND s.status = 'active'
GROUP BY a.id, a.name, a.slug, a.category, a.price_monthly;

-- ============================================================================
-- STEP 5: Grant Permissions
-- ============================================================================

-- Grant access to views for authenticated users
GRANT SELECT ON platform_stats TO authenticated;
GRANT SELECT ON company_details TO authenticated;
GRANT SELECT ON agent_stats TO authenticated;

-- ============================================================================
-- STEP 6: Create Audit Log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can see all audit logs
CREATE POLICY audit_logs_super_admin ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Company admins can see their company's audit logs
CREATE POLICY audit_logs_company_admin ON audit_logs
    FOR SELECT
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'company_admin')
        )
    );

-- ============================================================================
-- STEP 7: Instructions for Manual Setup
-- ============================================================================

-- IMPORTANT: After running this migration, you need to:
--
-- 1. Create the auth user in Supabase Dashboard or via API:
--    - Email: adrian.stanca1@gmail.com
--    - Password: Cumparavinde1
--    - Or enable Google OAuth for this email
--
-- 2. Get the user ID from auth.users table
--
-- 3. Run this function to create the profile:
--    SELECT create_super_admin_profile(
--        '<user_id_from_auth>',
--        'adrian.stanca1@gmail.com',
--        'Adrian Stanca'
--    );
--
-- 4. Verify the user was created:
--    SELECT * FROM users WHERE email = 'adrian.stanca1@gmail.com';
--
-- ============================================================================

COMMENT ON SCHEMA public IS 'Multi-tenant schema with super admin - Version 1.1.0';


-- ============================================================================
-- CORTEXBUILD - COMPLETE SUPABASE SCHEMA
-- ============================================================================
-- This is the complete database schema for CortexBuild platform
-- Version: 1.0.0 (6 Marketplace Apps + 3 Dashboards V1)
-- Date: 2025-10-14
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- COMPANIES (Multi-tenant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY DEFAULT ('company-' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    industry TEXT,
    email TEXT,
    subscription_plan TEXT DEFAULT 'free',
    max_users INTEGER DEFAULT 10,
    max_projects INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT ('user-' || gen_random_uuid()::text),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operative',
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT ('project-' || gen_random_uuid()::text),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    status TEXT DEFAULT 'planning',
    budget DECIMAL(15, 2),
    spent DECIMAL(15, 2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================================================
-- MARKETPLACE APPS (6 Pre-approved Apps)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sdk_apps (
    id TEXT PRIMARY KEY DEFAULT ('app-' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    version TEXT DEFAULT '1.0.0',
    developer_id TEXT REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    review_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sdk_apps_developer_id ON sdk_apps(developer_id);
CREATE INDEX IF NOT EXISTS idx_sdk_apps_is_public ON sdk_apps(is_public);
CREATE INDEX IF NOT EXISTS idx_sdk_apps_review_status ON sdk_apps(review_status);

-- ============================================================================
-- USER APP INSTALLATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_app_installations (
    id TEXT PRIMARY KEY DEFAULT ('install-' || gen_random_uuid()::text),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    app_id TEXT REFERENCES sdk_apps(id) ON DELETE CASCADE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_user_app_installations_user_id ON user_app_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_installations_app_id ON user_app_installations(app_id);

-- ============================================================================
-- COMPANY APP INSTALLATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_app_installations (
    id TEXT PRIMARY KEY DEFAULT ('company-install-' || gen_random_uuid()::text),
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    app_id TEXT REFERENCES sdk_apps(id) ON DELETE CASCADE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_company_app_installations_company_id ON company_app_installations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_app_installations_app_id ON company_app_installations(app_id);

-- ============================================================================
-- APP REVIEW HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_review_history (
    id TEXT PRIMARY KEY DEFAULT ('review-' || gen_random_uuid()::text),
    app_id TEXT REFERENCES sdk_apps(id) ON DELETE CASCADE,
    reviewer_id TEXT REFERENCES users(id),
    status TEXT NOT NULL,
    comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_review_history_app_id ON app_review_history(app_id);

-- ============================================================================
-- APP ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_analytics (
    id TEXT PRIMARY KEY DEFAULT ('analytics-' || gen_random_uuid()::text),
    app_id TEXT REFERENCES sdk_apps(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_analytics_app_id ON app_analytics(app_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_created_at ON app_analytics(created_at);

-- ============================================================================
-- ACTIVITIES (Audit Log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY DEFAULT ('activity-' || gen_random_uuid()::text),
    user_id TEXT REFERENCES users(id),
    company_id TEXT REFERENCES companies(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- ============================================================================
-- SEED DATA - 3 Companies
-- ============================================================================

INSERT INTO companies (id, name, industry, email, subscription_plan, max_users, max_projects)
VALUES 
    ('company-1', 'ConstructCo', 'Construction', 'info@constructco.com', 'enterprise', 100, 50),
    ('company-2', 'ASC Cladding Ltd', 'Construction', 'info@ascladdingltd.co.uk', 'professional', 50, 25),
    ('company-3', 'BuildTech Solutions', 'Construction', 'info@buildtech.com', 'free', 10, 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA - 3 Users (with bcrypt hashed passwords)
-- ============================================================================

-- Note: Passwords are hashed with bcrypt (10 rounds)
-- Super Admin: parola123
-- Company Admin: lolozania1
-- Developer: password123

    phone TEXT,
INSERT INTO users (id, email, password_hash, name, role, company_id, phone) VALUES
    ('user-1', 'adrian.stanca1@gmail.com', '$2a$10$YourHashedPasswordHere1', 'Adrian Stanca', 'super_admin', 'company-1', NULL),
    ('user-2', 'adrian@ascladdingltd.co.uk', '$2a$10$YourHashedPasswordHere2', 'Adrian ASC', 'company_admin', 'company-2', '+447700000001'),
    ('user-3', 'adrian.stanca1@icloud.com', '$2a$10$YourHashedPasswordHere3', 'Adrian Dev', 'developer', 'company-1', NULL)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- SEED DATA - 6 Marketplace Apps (Pre-approved)
-- ============================================================================

INSERT INTO sdk_apps (id, name, description, icon, category, version, is_public, review_status)
VALUES 
    ('app-1', 'Project Dashboard', 'Comprehensive project overview and analytics', '📊', 'analytics', '1.0.0', true, 'approved'),
    ('app-2', 'Team Chat', 'Real-time team communication', '💬', 'communication', '1.0.0', true, 'approved'),
    ('app-3', 'Time Tracker', 'Track time spent on tasks and projects', '⏱️', 'productivity', '1.0.0', true, 'approved'),
    ('app-4', 'Team Calendar', 'Shared team calendar and scheduling', '📅', 'productivity', '1.0.0', true, 'approved'),
    ('app-5', 'Task Manager', 'Manage tasks and assignments', '✅', 'productivity', '1.0.0', true, 'approved'),
    ('app-6', 'Expense Tracker', 'Track project expenses and budgets', '💰', 'finance', '1.0.0', true, 'approved')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Users can only see users from their company
CREATE POLICY users_company_isolation ON users
    FOR ALL
    USING (company_id = current_setting('app.current_company_id', true)::text);

-- Super admins can see all users
CREATE POLICY users_super_admin_access ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('app.current_user_id', true)::text
            AND role = 'super_admin'
        )
    );

-- Projects are isolated by company
CREATE POLICY projects_company_isolation ON projects
    FOR ALL
    USING (company_id = current_setting('app.current_company_id', true)::text);

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Schema created successfully!
-- Next steps:
-- 1. Update password hashes with real bcrypt hashes
-- 2. Configure Supabase environment variables
-- 3. Test authentication and RLS policies


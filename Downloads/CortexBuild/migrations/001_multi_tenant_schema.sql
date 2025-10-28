-- ============================================================================
-- MULTI-TENANT SCHEMA MIGRATION
-- ============================================================================
-- This migration creates the complete multi-tenant architecture for ConstructAI
-- including companies, users, projects, tasks, agents, and subscriptions.
--
-- Author: ConstructAI Team
-- Date: 2025-10-07
-- Version: 1.0.0
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: companies (Tenants)
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'professional', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_plan ON companies(plan);

-- Comments
COMMENT ON TABLE companies IS 'Multi-tenant companies (tenants)';
COMMENT ON COLUMN companies.slug IS 'URL-friendly company identifier';
COMMENT ON COLUMN companies.settings IS 'JSON settings: timezone, currency, features, etc.';

-- ============================================================================
-- TABLE: users (Extended from Supabase Auth)
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operative',
    avatar TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see users from their company
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy: Super admins can see all users
CREATE POLICY users_super_admin_policy ON users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Comments
COMMENT ON TABLE users IS 'User profiles linked to companies';
COMMENT ON COLUMN users.company_id IS 'Foreign key to companies table - defines tenant';

-- ============================================================================
-- TABLE: projects
-- ============================================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
    budget DECIMAL(15, 2),
    spent DECIMAL(15, 2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_isolation_policy ON projects
    FOR ALL
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Comments
COMMENT ON TABLE projects IS 'Construction projects - tenant isolated';

-- ============================================================================
-- TABLE: tasks
-- ============================================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done', 'blocked')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_isolation_policy ON tasks
    FOR ALL
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Comments
COMMENT ON TABLE tasks IS 'Project tasks - tenant isolated';

-- ============================================================================
-- TABLE: agents (AI Agent Marketplace)
-- ============================================================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price_monthly DECIMAL(10, 2),
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_is_active ON agents(is_active);

-- RLS (Agents are public - everyone can read)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY agents_read_policy ON agents
    FOR SELECT
    USING (is_active = true);

-- Only super admins can modify agents
CREATE POLICY agents_write_policy ON agents
    FOR INSERT, UPDATE, DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Comments
COMMENT ON TABLE agents IS 'AI Agent marketplace - available to all tenants';

-- ============================================================================
-- TABLE: subscriptions (Company Agent Subscriptions)
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, agent_id)
);

-- Indexes
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_agent_id ON subscriptions(agent_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_isolation_policy ON subscriptions
    FOR ALL
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Comments
COMMENT ON TABLE subscriptions IS 'Company subscriptions to AI agents';

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert demo company
INSERT INTO companies (id, name, slug, plan, status, settings) VALUES
('comp_constructco', 'ConstructCo', 'constructco', 'professional', 'active', 
 '{"timezone": "America/New_York", "currency": "USD", "features": ["ml_analytics", "ai_agents", "advanced_reporting"]}');

-- Insert demo agents
INSERT INTO agents (id, name, slug, description, category, price_monthly, features, is_active) VALUES
('agent_hse_sentinel', 'HSE Sentinel AI', 'hse-sentinel-ai', 
 'AI-powered safety monitoring and compliance', 'safety', 49.99,
 '["Real-time safety monitoring", "Automated incident reporting", "Compliance tracking"]', true),
 
('agent_budget_optimizer', 'Budget Optimizer AI', 'budget-optimizer-ai',
 'ML-powered budget forecasting and optimization', 'finance', 79.99,
 '["Budget forecasting", "Cost optimization", "Variance analysis"]', true),
 
('agent_quality_inspector', 'Quality Inspector AI', 'quality-inspector-ai',
 'Automated quality control and defect detection', 'quality', 59.99,
 '["Defect detection", "Quality scoring", "Automated reports"]', true);

-- Insert demo subscriptions
INSERT INTO subscriptions (company_id, agent_id, status) VALUES
('comp_constructco', 'agent_hse_sentinel', 'active'),
('comp_constructco', 'agent_budget_optimizer', 'active');

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Company statistics
CREATE OR REPLACE VIEW company_stats AS
SELECT 
    c.id,
    c.name,
    c.plan,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT s.id) as active_subscriptions
FROM companies c
LEFT JOIN projects p ON p.company_id = c.id
LEFT JOIN tasks t ON t.company_id = c.id
LEFT JOIN users u ON u.company_id = c.id
LEFT JOIN subscriptions s ON s.company_id = c.id AND s.status = 'active'
GROUP BY c.id, c.name, c.plan;

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Multi-tenant schema for ConstructAI - Version 1.0.0';


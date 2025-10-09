-- ============================================================================
-- ENHANCED RLS SECURITY & MULTI-TENANT IMPROVEMENTS
-- ============================================================================
-- This migration enhances Row Level Security policies, adds missing tables,
-- improves performance with indexes, and strengthens data isolation.
--
-- Author: ConstructAI Team
-- Date: 2025-10-07
-- Version: 2.0.0
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING TABLES WITH RLS
-- ============================================================================

-- Table: audit_logs (for tracking all tenant actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_isolation_policy ON audit_logs
    FOR SELECT
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

-- Only system can insert audit logs
CREATE POLICY audit_logs_insert_policy ON audit_logs
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'company_admin')
        )
    );

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_user_policy ON notifications
    FOR ALL
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Table: invitations
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for invitations
CREATE INDEX idx_invitations_company_id ON invitations(company_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

-- RLS for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_isolation_policy ON invitations
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

-- ============================================================================
-- PART 2: ENHANCE EXISTING RLS POLICIES
-- ============================================================================

-- Drop and recreate companies RLS for better security
DROP POLICY IF EXISTS companies_read_policy ON companies;
DROP POLICY IF EXISTS companies_write_policy ON companies;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Users can only see their own company
CREATE POLICY companies_isolation_policy ON companies
    FOR SELECT
    USING (
        id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Only super admins can modify companies
CREATE POLICY companies_write_policy ON companies
    FOR INSERT, UPDATE, DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- ============================================================================
-- PART 3: ADD PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_company_status ON projects(company_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_company_dates ON projects(company_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_company_status ON tasks(company_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_company_assigned ON tasks(company_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_status ON subscriptions(company_id, status);

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(company_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(company_id) WHERE status IN ('todo', 'in-progress');
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(company_id) WHERE status = 'active';

-- ============================================================================
-- PART 4: ADD HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate tenant access
CREATE OR REPLACE FUNCTION validate_tenant_access(resource_company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Super admins can access everything
    IF is_super_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Regular users can only access their company's data
    RETURN resource_company_id = get_user_company_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: ADD AUDIT LOGGING TRIGGER
-- ============================================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log for non-super-admin users
    IF NOT is_super_admin() THEN
        INSERT INTO audit_logs (
            company_id,
            user_id,
            action,
            resource_type,
            resource_id,
            metadata
        ) VALUES (
            COALESCE(NEW.company_id, OLD.company_id),
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            jsonb_build_object(
                'old', to_jsonb(OLD),
                'new', to_jsonb(NEW)
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_projects_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_tasks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_subscriptions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================================================
-- PART 6: ADD VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: User's company projects with stats
CREATE OR REPLACE VIEW user_company_projects AS
SELECT 
    p.*,
    COUNT(DISTINCT t.id) as task_count,
    COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status IN ('todo', 'in-progress') THEN t.id END) as active_tasks
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
WHERE p.company_id = get_user_company_id() OR is_super_admin()
GROUP BY p.id;

-- View: User's assigned tasks
CREATE OR REPLACE VIEW user_assigned_tasks AS
SELECT 
    t.*,
    p.name as project_name,
    p.status as project_status
FROM tasks t
JOIN projects p ON p.id = t.project_id
WHERE (
    t.assigned_to = auth.uid()
    OR t.company_id = get_user_company_id()
    OR is_super_admin()
);

-- ============================================================================
-- PART 7: ADD CONSTRAINTS FOR DATA INTEGRITY
-- ============================================================================

-- Ensure users belong to a company
ALTER TABLE users 
    ALTER COLUMN company_id SET NOT NULL;

-- Ensure projects belong to a company
ALTER TABLE projects 
    ALTER COLUMN company_id SET NOT NULL;

-- Ensure tasks belong to a company
ALTER TABLE tasks 
    ALTER COLUMN company_id SET NOT NULL;

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON SCHEMA public IS 'Multi-tenant schema for ConstructAI - Version 2.0.0 - Enhanced Security';


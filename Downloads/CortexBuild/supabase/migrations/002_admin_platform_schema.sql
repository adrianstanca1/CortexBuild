-- ============================================================================
-- ADMIN PLATFORM SCHEMA MIGRATION
-- ============================================================================
-- This migration creates tables for the admin platform features:
-- - User permissions
-- - Teams and team members
-- - Apps and app reviews
-- - System metrics and analytics
--
-- Author: CortexBuild Team
-- Date: 2025-10-10
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- TABLE: user_permissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, permission)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission);

COMMENT ON TABLE user_permissions IS 'User-specific permissions for fine-grained access control';

-- ============================================================================
-- TABLE: teams
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_company_id ON teams(company_id);
CREATE INDEX idx_teams_created_by ON teams(created_by);

COMMENT ON TABLE teams IS 'Teams for collaboration within a company';

-- ============================================================================
-- TABLE: team_members
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

COMMENT ON TABLE team_members IS 'Team membership and roles';

-- ============================================================================
-- TABLE: apps
-- ============================================================================
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    version TEXT DEFAULT '1.0.0',
    author_id UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'team')),
    icon_url TEXT,
    screenshots JSONB DEFAULT '[]',
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_apps_company_id ON apps(company_id);
CREATE INDEX idx_apps_author_id ON apps(author_id);
CREATE INDEX idx_apps_category ON apps(category);
CREATE INDEX idx_apps_visibility ON apps(visibility);
CREATE INDEX idx_apps_slug ON apps(slug);

COMMENT ON TABLE apps IS 'Published applications in the marketplace';

-- ============================================================================
-- TABLE: app_reviews
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(app_id, user_id)
);

CREATE INDEX idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX idx_app_reviews_user_id ON app_reviews(user_id);
CREATE INDEX idx_app_reviews_rating ON app_reviews(rating);

COMMENT ON TABLE app_reviews IS 'User reviews and ratings for apps';

-- ============================================================================
-- TABLE: app_installations
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    UNIQUE(app_id, user_id, company_id)
);

CREATE INDEX idx_app_installations_app_id ON app_installations(app_id);
CREATE INDEX idx_app_installations_user_id ON app_installations(user_id);
CREATE INDEX idx_app_installations_company_id ON app_installations(company_id);

COMMENT ON TABLE app_installations IS 'Track app installations per user/company';

-- ============================================================================
-- TABLE: system_metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_system_metrics_company_id ON system_metrics(company_id);
CREATE INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at);

COMMENT ON TABLE system_metrics IS 'System-wide metrics and analytics';

-- ============================================================================
-- TABLE: activity_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_description TEXT,
    resource_type TEXT,
    resource_id UUID,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'warning', 'error')),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_company_id ON activity_log(company_id);
CREATE INDEX idx_activity_log_action_type ON activity_log(action_type);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

COMMENT ON TABLE activity_log IS 'System-wide activity and audit log';

-- ============================================================================
-- TABLE: subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    billing_interval TEXT DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

COMMENT ON TABLE subscriptions IS 'Company subscription plans and billing';

-- ============================================================================
-- TABLE: invoices
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    stripe_invoice_id TEXT,
    pdf_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

COMMENT ON TABLE invoices IS 'Billing invoices for subscriptions';

-- ============================================================================
-- FUNCTIONS: Update timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_reviews_updated_at BEFORE UPDATE ON app_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams (users can only see teams in their company)
CREATE POLICY teams_company_isolation ON teams
    FOR ALL USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for apps (public apps visible to all, private only to company)
CREATE POLICY apps_visibility ON apps
    FOR SELECT USING (
        visibility = 'public' OR
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- RLS Policies for subscriptions (only company members can see)
CREATE POLICY subscriptions_company_isolation ON subscriptions
    FOR ALL USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default permissions
INSERT INTO user_permissions (user_id, permission, granted_at)
SELECT id, 'apps.create', NOW()
FROM users
WHERE role IN ('super_admin', 'company_admin', 'developer')
ON CONFLICT (user_id, permission) DO NOTHING;

COMMENT ON SCHEMA public IS 'CortexBuild Admin Platform Schema - Version 1.0.0';


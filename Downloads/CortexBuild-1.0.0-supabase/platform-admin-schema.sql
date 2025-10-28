-- =====================================================
-- PLATFORM ADMINISTRATION SCHEMA
-- Central Management System for Multi-Tenant Platform
-- =====================================================

-- =====================================================
-- PLATFORM INVITATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invitation_type TEXT DEFAULT 'company_admin' CHECK (invitation_type IN (
    'company_admin', 'super_admin', 'platform_partner'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'expired'
  )),
  invitation_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLATFORM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'general', 'billing', 'security', 'features', 'integrations'
  )),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMPANY PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS company_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_users INTEGER DEFAULT -1, -- -1 means unlimited
  max_projects INTEGER DEFAULT -1,
  features JSONB NOT NULL DEFAULT '[]',
  ai_agents_included JSONB DEFAULT '[]',
  ai_agents_limit INTEGER DEFAULT -1,
  storage_gb INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMPANY PLAN ASSIGNMENTS
-- =====================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES company_plans(id) ON DELETE SET NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'active' CHECK (billing_status IN (
  'active', 'past_due', 'cancelled', 'suspended'
));

-- =====================================================
-- PLATFORM AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE platform_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PLATFORM INVITATIONS
-- =====================================================
CREATE POLICY "Super admins can manage all invitations" ON platform_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Company admins can view their invitations" ON platform_invitations
  FOR SELECT USING (
    email IN (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - PLATFORM SETTINGS
-- =====================================================
CREATE POLICY "Super admins can manage platform settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view public settings" ON platform_settings
  FOR SELECT USING (is_public = true);

-- =====================================================
-- RLS POLICIES - COMPANY PLANS
-- =====================================================
CREATE POLICY "Everyone can view active plans" ON company_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage plans" ON company_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- RLS POLICIES - PLATFORM AUDIT LOG
-- =====================================================
CREATE POLICY "Super admins can view all audit logs" ON platform_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own audit logs" ON platform_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_platform_invitations_email ON platform_invitations(email);
CREATE INDEX IF NOT EXISTS idx_platform_invitations_status ON platform_invitations(status);
CREATE INDEX IF NOT EXISTS idx_platform_invitations_token ON platform_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);
CREATE INDEX IF NOT EXISTS idx_company_plans_active ON company_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_plan_id ON companies(plan_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON platform_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_company_id ON platform_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON platform_audit_log(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_platform_invitations_updated_at BEFORE UPDATE ON platform_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_plans_updated_at BEFORE UPDATE ON company_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - DEFAULT PLANS
-- =====================================================
INSERT INTO company_plans (id, name, description, price_monthly, price_yearly, max_users, max_projects, features, ai_agents_included, storage_gb, is_featured, sort_order) VALUES
('plan-basic', 'Basic Plan', 'Perfect for small construction teams getting started', 29.99, 299.99, 5, 3, 
 '["Project Management", "Task Tracking", "Basic Reporting", "Mobile Access", "Email Support"]',
 '["agent-hse-sentinel"]', 10, false, 1),

('plan-professional', 'Professional Plan', 'Ideal for growing construction companies', 79.99, 799.99, 25, 15,
 '["Everything in Basic", "Advanced Reporting", "Custom Fields", "API Access", "Priority Support", "Document Management"]',
 '["agent-hse-sentinel", "agent-quality-inspector", "agent-doc-assistant"]', 100, true, 2),

('plan-enterprise', 'Enterprise Plan', 'Complete solution for large construction organizations', 199.99, 1999.99, -1, -1,
 '["Everything in Professional", "White Label", "SSO Integration", "Advanced Security", "Dedicated Support", "Custom Integrations"]',
 '["agent-hse-sentinel", "agent-quality-inspector", "agent-productivity-optimizer", "agent-compliance-checker", "agent-doc-assistant"]', 1000, true, 3)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED DATA - PLATFORM SETTINGS
-- =====================================================
INSERT INTO platform_settings (setting_key, setting_value, category, description, is_public) VALUES
('platform_name', '"ConstructAI Platform"', 'general', 'Platform display name', true),
('maintenance_mode', 'false', 'general', 'Enable maintenance mode', false),
('max_companies', '1000', 'general', 'Maximum number of companies allowed', false),
('default_plan_id', '"plan-basic"', 'billing', 'Default plan for new companies', false),
('trial_period_days', '14', 'billing', 'Trial period in days', true),
('support_email', '"support@constructai.com"', 'general', 'Support contact email', true),
('features_enabled', '{"ai_agents": true, "advanced_reporting": true, "api_access": true}', 'features', 'Platform-wide feature flags', false)

ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- CREATE SUPER ADMIN USER
-- =====================================================
-- Note: This will be handled by the application registration flow
-- The super admin user will be created when adrian.stanca1@gmail.com registers

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Platform Administration schema created successfully! Tables: %, %, %, %',
    'platform_invitations', 'platform_settings', 'company_plans', 'platform_audit_log';
END $$;

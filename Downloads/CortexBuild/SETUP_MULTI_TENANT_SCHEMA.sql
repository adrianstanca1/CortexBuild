-- =====================================================
-- CONSTRUCTAI MULTI-TENANT SCHEMA SETUP
-- Complete setup for multi-tenant platform with AI agents marketplace
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 2: MAIN MULTI-TENANT SCHEMA
-- =====================================================

-- Companies table (tenants)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  plan_id UUID,
  plan_started_at TIMESTAMPTZ DEFAULT NOW(),
  plan_expires_at TIMESTAMPTZ,
  billing_status TEXT DEFAULT 'active' CHECK (billing_status IN ('active', 'past_due', 'cancelled', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (users linked to companies)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin',
    'company_admin',
    'project_manager',
    'supervisor',
    'operative',
    'accountant',
    'foreman',
    'contractor'
  )),
  avatar TEXT,
  phone TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15, 2),
  spent NUMERIC(15, 2) DEFAULT 0,
  location TEXT,
  project_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFIs table
CREATE TABLE IF NOT EXISTS rfis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'answered', 'closed')),
  priority TEXT DEFAULT 'medium',
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Punch list items table
CREATE TABLE IF NOT EXISTS punch_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'verified')),
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weather TEXT,
  temperature TEXT,
  summary TEXT,
  workers_on_site INTEGER,
  equipment_used TEXT,
  safety_incidents TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  location TEXT,
  taken_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 3: AI AGENTS MARKETPLACE SCHEMA
-- =====================================================

-- AI agents table (global marketplace)
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'safety', 'quality', 'productivity', 'compliance',
    'analytics', 'documentation', 'communication', 'planning'
  )),
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]',
  capabilities JSONB NOT NULL DEFAULT '[]',
  icon_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  min_plan TEXT DEFAULT 'basic' CHECK (min_plan IN ('basic', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company subscriptions table (per-tenant subscriptions)
CREATE TABLE IF NOT EXISTS company_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  price_paid NUMERIC(10, 2) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, agent_id)
);

-- Agent usage logs table (track usage per company)
CREATE TABLE IF NOT EXISTS agent_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 4: PLATFORM ADMINISTRATION SCHEMA
-- =====================================================

-- Platform invitations table
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

-- Platform settings table
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

-- Company plans table
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

-- Platform audit log
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
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: RLS POLICIES - PROFILES
-- =====================================================
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their company" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- STEP 7: RLS POLICIES - COMPANIES
-- =====================================================
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- STEP 8: RLS POLICIES - PROJECTS
-- =====================================================
CREATE POLICY "Users can view projects in their company" ON projects
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Project managers can update their projects" ON projects
  FOR UPDATE USING (
    project_manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'super_admin', 'project_manager')
    )
  );

-- =====================================================
-- STEP 9: RLS POLICIES - TASKS
-- =====================================================
CREATE POLICY "Users can view tasks in their company projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their assigned tasks" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'super_admin', 'project_manager', 'supervisor')
    )
  );

CREATE POLICY "Users can create tasks in accessible projects" ON tasks
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

-- =====================================================
-- STEP 10: RLS POLICIES - RFIs
-- =====================================================
CREATE POLICY "Users can view RFIs in their projects" ON rfis
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

CREATE POLICY "Users can create RFIs" ON rfis
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

-- =====================================================
-- STEP 11: RLS POLICIES - PUNCH LIST ITEMS
-- =====================================================
CREATE POLICY "Users can view punch list items in their projects" ON punch_list_items
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

CREATE POLICY "Users can create punch list items" ON punch_list_items
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

-- =====================================================
-- STEP 12: RLS POLICIES - DAILY LOGS
-- =====================================================
CREATE POLICY "Users can view daily logs in their projects" ON daily_logs
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

CREATE POLICY "Users can create daily logs" ON daily_logs
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

-- =====================================================
-- STEP 13: RLS POLICIES - DOCUMENTS
-- =====================================================
CREATE POLICY "Users can view documents in their projects" ON documents
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents" ON documents
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

-- =====================================================
-- STEP 14: RLS POLICIES - PHOTOS
-- =====================================================
CREATE POLICY "Users can view photos in their projects" ON photos
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

CREATE POLICY "Users can upload photos" ON photos
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN profiles pr ON pr.company_id = p.company_id
      WHERE pr.id = auth.uid()
    )
  );

-- =====================================================
-- STEP 15: RLS POLICIES - AI AGENTS (Global marketplace)
-- =====================================================
CREATE POLICY "Anyone can view active agents" ON ai_agents
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only super admins can manage agents" ON ai_agents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- STEP 16: RLS POLICIES - COMPANY SUBSCRIPTIONS
-- =====================================================
CREATE POLICY "Companies can view their own subscriptions" ON company_subscriptions
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Company admins can manage subscriptions" ON company_subscriptions
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('company_admin', 'super_admin')
    )
  );

-- =====================================================
-- STEP 17: RLS POLICIES - AGENT USAGE LOGS
-- =====================================================
CREATE POLICY "Companies can view their own usage logs" ON agent_usage_logs
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create usage logs for their company" ON agent_usage_logs
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- STEP 18: RLS POLICIES - PLATFORM ADMIN
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
-- STEP 19: INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_rfis_project_id ON rfis(project_id);
CREATE INDEX IF NOT EXISTS idx_punch_list_items_project_id ON punch_list_items(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_id ON daily_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON photos(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_category ON ai_agents(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_active ON ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agents_featured ON ai_agents(is_featured);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_agent_id ON company_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_status ON company_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_company_id ON agent_usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_agent_id ON agent_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_created_at ON agent_usage_logs(created_at);
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
-- STEP 20: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfis_updated_at BEFORE UPDATE ON rfis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_punch_list_items_updated_at BEFORE UPDATE ON punch_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at BEFORE UPDATE ON company_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_invitations_updated_at BEFORE UPDATE ON platform_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_plans_updated_at BEFORE UPDATE ON company_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 21: SEED DATA
-- =====================================================

-- Demo company
INSERT INTO companies (id, name, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Construction Company', 'demo@constructai.com')
ON CONFLICT (id) DO NOTHING;

-- AI Agents
INSERT INTO ai_agents (id, name, description, category, price_monthly, price_yearly, features, capabilities, is_featured) VALUES
('agent-hse-sentinel', 'HSE Sentinel AI', 'Advanced health, safety, and environmental monitoring agent that analyzes site conditions and provides real-time safety recommendations.', 'safety', 49.99, 499.99,
 '["Real-time safety monitoring", "Incident prediction", "Compliance checking", "Safety report generation"]',
 '["Image analysis for PPE compliance", "Risk assessment automation", "Safety training recommendations", "Incident documentation"]', true),

('agent-quality-inspector', 'Quality Inspector AI', 'Automated quality control agent that inspects work progress and identifies potential issues before they become problems.', 'quality', 39.99, 399.99,
 '["Automated quality checks", "Progress monitoring", "Defect detection", "Quality reports"]',
 '["Photo analysis for quality issues", "Progress tracking", "Compliance verification", "Quality metrics dashboard"]', true),

('agent-productivity-optimizer', 'Productivity Optimizer AI', 'Analyzes project data to identify bottlenecks and suggest optimizations for improved efficiency.', 'productivity', 59.99, 599.99,
 '["Performance analytics", "Bottleneck identification", "Resource optimization", "Productivity insights"]',
 '["Data analysis and reporting", "Predictive scheduling", "Resource allocation", "Performance benchmarking"]', false),

('agent-compliance-checker', 'Compliance Checker AI', 'Ensures all project activities meet regulatory requirements and industry standards.', 'compliance', 44.99, 449.99,
 '["Regulatory compliance monitoring", "Standards verification", "Documentation review", "Compliance reporting"]',
 '["Regulation database access", "Document analysis", "Compliance scoring", "Audit preparation"]', false),

('agent-doc-assistant', 'Documentation Assistant AI', 'Automatically generates and organizes project documentation, reports, and communications.', 'documentation', 29.99, 299.99,
 '["Automated report generation", "Document organization", "Template creation", "Content optimization"]',
 '["Natural language processing", "Document templates", "Auto-formatting", "Multi-format export"]', false)

ON CONFLICT (id) DO NOTHING;

-- Company Plans
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

-- Platform Settings
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
-- STEP 22: COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🎉 MULTI-TENANT SCHEMA SETUP COMPLETE!';
  RAISE NOTICE 'Tables created: companies, profiles, projects, tasks, rfis, punch_list_items, daily_logs, documents, photos, ai_agents, company_subscriptions, agent_usage_logs, platform_invitations, platform_settings, company_plans, platform_audit_log';
  RAISE NOTICE '✅ Row Level Security enabled on all tables';
  RAISE NOTICE '✅ Multi-tenant policies implemented';
  RAISE NOTICE '✅ AI agents marketplace ready';
  RAISE NOTICE '✅ Platform administration features ready';
  RAISE NOTICE '✅ Sample data seeded';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update .env.local with real Supabase credentials';
  RAISE NOTICE '2. Enable Email authentication in Supabase';
  RAISE NOTICE '3. Test user registration and login';
  RAISE NOTICE '4. Verify multi-tenant data isolation';
END $$;
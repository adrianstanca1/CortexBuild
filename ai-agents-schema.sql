-- =====================================================
-- AI AGENTS MARKETPLACE SCHEMA
-- Multi-Tenant AI Agents System for ConstructAI
-- =====================================================

-- =====================================================
-- AI AGENTS TABLE (Global marketplace)
-- =====================================================
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

-- =====================================================
-- COMPANY SUBSCRIPTIONS TABLE (Per-tenant subscriptions)
-- =====================================================
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

-- =====================================================
-- AGENT USAGE LOGS (Track usage per company)
-- =====================================================
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
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - AI AGENTS (Global marketplace - everyone can view)
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
-- RLS POLICIES - COMPANY SUBSCRIPTIONS
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
-- RLS POLICIES - AGENT USAGE LOGS
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
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ai_agents_category ON ai_agents(category);
CREATE INDEX IF NOT EXISTS idx_ai_agents_active ON ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agents_featured ON ai_agents(is_featured);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_agent_id ON company_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_status ON company_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_company_id ON agent_usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_agent_id ON agent_usage_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_usage_logs_created_at ON agent_usage_logs(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at BEFORE UPDATE ON company_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - Sample AI Agents
-- =====================================================
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

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'AI Agents schema created successfully! Tables: %, %, %',
    'ai_agents', 'company_subscriptions', 'agent_usage_logs';
END $$;

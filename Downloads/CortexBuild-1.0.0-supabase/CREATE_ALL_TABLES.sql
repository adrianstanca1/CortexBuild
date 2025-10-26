-- =====================================================
-- CREATE ALL TABLES FOR CONSTRUCTAI
-- This script creates all necessary tables and data
-- =====================================================

-- =====================================================
-- PART 1: CREATE COMPANIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
    END LOOP;
END $$;

-- Create simple policies for companies
CREATE POLICY "enable_read_companies" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "enable_insert_companies" ON companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enable_update_companies" ON companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- PART 2: CREATE DEFAULT COMPANY
-- =====================================================

INSERT INTO companies (id, name, industry, size)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ASC Ladding Ltd',
    'Construction',
    'SMB'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 3: UPDATE PROFILES TABLE
-- =====================================================

-- Add company_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Update existing profiles to have the default company
UPDATE profiles 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- =====================================================
-- PART 4: CREATE PROJECTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15, 2),
    spent DECIMAL(15, 2) DEFAULT 0,
    location TEXT,
    company_id UUID REFERENCES companies(id),
    project_manager_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON projects', r.policyname);
    END LOOP;
END $$;

-- Create policies for projects
CREATE POLICY "enable_read_projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "enable_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enable_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "enable_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- =====================================================
-- PART 5: CREATE TASKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date DATE,
    assigned_to UUID REFERENCES profiles(id),
    project_id UUID REFERENCES projects(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'tasks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tasks', r.policyname);
    END LOOP;
END $$;

-- Create policies for tasks
CREATE POLICY "enable_read_tasks" ON tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "enable_insert_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enable_update_tasks" ON tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "enable_delete_tasks" ON tasks FOR DELETE TO authenticated USING (true);

-- =====================================================
-- PART 6: CREATE AI AGENTS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    pricing_model TEXT DEFAULT 'subscription',
    base_price DECIMAL(10, 2),
    features JSONB,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_ai_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    ai_agent_id UUID REFERENCES ai_agents(id),
    status TEXT DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, ai_agent_id)
);

-- Enable RLS
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_ai_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_agents
CREATE POLICY "enable_read_ai_agents" ON ai_agents FOR SELECT TO authenticated USING (true);

-- Create policies for company_ai_subscriptions
CREATE POLICY "enable_read_subscriptions" ON company_ai_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "enable_insert_subscriptions" ON company_ai_subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enable_update_subscriptions" ON company_ai_subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- PART 7: INSERT SAMPLE AI AGENTS
-- =====================================================

INSERT INTO ai_agents (name, description, category, base_price, features, icon) VALUES
('Project Timeline Optimizer', 'AI-powered project scheduling and timeline optimization', 'Project Management', 99.00, '["Smart scheduling", "Resource optimization", "Risk prediction"]', '📅'),
('Cost Estimator Pro', 'Accurate cost estimation using historical data and AI', 'Financial', 149.00, '["Historical analysis", "Material cost tracking", "Labor estimation"]', '💰'),
('Safety Compliance Assistant', 'Automated safety compliance monitoring and reporting', 'Safety', 79.00, '["Compliance tracking", "Incident reporting", "Safety alerts"]', '🦺'),
('Document Intelligence', 'AI-powered document analysis and management', 'Documentation', 89.00, '["OCR processing", "Smart search", "Auto-categorization"]', '📄'),
('Resource Allocator', 'Optimize resource allocation across projects', 'Resource Management', 119.00, '["Resource tracking", "Allocation optimization", "Utilization reports"]', '👥')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 8: CREATE/UPDATE PROFILES FOR BOTH USERS
-- =====================================================

-- Profile for adrian@ascladdingltd.co.uk
INSERT INTO profiles (id, email, name, role, company_id, created_at, updated_at)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Adrian Stanca'),
    'project_manager',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'adrian@ascladdingltd.co.uk'
ON CONFLICT (id) DO UPDATE SET
    company_id = '00000000-0000-0000-0000-000000000001',
    updated_at = NOW();

-- Profile for adrian.stanca1@gmail.com
INSERT INTO profiles (id, email, name, role, company_id, created_at, updated_at)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Adrian Stanca'),
    'project_manager',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'adrian.stanca1@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    company_id = '00000000-0000-0000-0000-000000000001',
    updated_at = NOW();

-- =====================================================
-- PART 9: VERIFICATION
-- =====================================================

-- Check companies
SELECT '✅ Companies' as check_type, COUNT(*) as count FROM companies;

-- Check profiles
SELECT '✅ Profiles' as check_type, id, email, name, role, company_id FROM profiles ORDER BY created_at DESC;

-- Check projects table
SELECT '✅ Projects Table' as check_type, COUNT(*) as count FROM projects;

-- Check tasks table
SELECT '✅ Tasks Table' as check_type, COUNT(*) as count FROM tasks;

-- Check AI agents
SELECT '✅ AI Agents' as check_type, COUNT(*) as count FROM ai_agents;

-- Check subscriptions
SELECT '✅ Subscriptions' as check_type, COUNT(*) as count FROM company_ai_subscriptions;

SELECT '🎉 ALL TABLES CREATED SUCCESSFULLY!' as status;

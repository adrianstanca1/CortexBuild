-- ConstructAI Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROFILES TABLE (linked to auth.users)
-- =====================================================
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

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
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

-- =====================================================
-- TASKS TABLE
-- =====================================================
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

-- =====================================================
-- RFIs (Requests for Information) TABLE
-- =====================================================
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

-- =====================================================
-- PUNCH LIST ITEMS TABLE
-- =====================================================
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

-- =====================================================
-- DAILY LOGS TABLE
-- =====================================================
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

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
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

-- =====================================================
-- PHOTOS TABLE
-- =====================================================
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
-- ENABLE ROW LEVEL SECURITY
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

-- =====================================================
-- RLS POLICIES - PROFILES
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
-- RLS POLICIES - COMPANIES
-- =====================================================
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES - PROJECTS
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
-- RLS POLICIES - TASKS
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
-- RLS POLICIES - RFIs
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
-- RLS POLICIES - PUNCH LIST ITEMS
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
-- RLS POLICIES - DAILY LOGS
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
-- RLS POLICIES - DOCUMENTS
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
-- RLS POLICIES - PHOTOS
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
-- INDEXES FOR PERFORMANCE
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

-- =====================================================
-- FUNCTIONS AND TRIGGERS
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

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert demo company
INSERT INTO companies (id, name, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Construction Company', 'demo@constructai.com')
ON CONFLICT (id) DO NOTHING;

-- Note: Profiles will be created automatically when users register
-- The app will handle user registration and profile creation

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Schema created successfully! Tables: %, %, %, %, %, %, %, %, %',
    'companies', 'profiles', 'projects', 'tasks', 'rfis',
    'punch_list_items', 'daily_logs', 'documents', 'photos';
END $$;

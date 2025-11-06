-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    budget NUMERIC(15, 2),
    spent NUMERIC(15, 2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    company_id TEXT NOT NULL,
    project_manager TEXT,
    team_size INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create index on company_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects(company_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Add RLS policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view projects from their company
CREATE POLICY "Users can view their company projects"
    ON public.projects
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Policy: Company admins can insert projects
CREATE POLICY "Company admins can create projects"
    ON public.projects
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('company_admin', 'super_admin')
        )
    );

-- Policy: Company admins can update their company projects
CREATE POLICY "Company admins can update their projects"
    ON public.projects
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid()
            AND role IN ('company_admin', 'super_admin')
        )
    );

-- Policy: Company admins can delete their company projects
CREATE POLICY "Company admins can delete their projects"
    ON public.projects
    FOR DELETE
    USING (
        company_id IN (
            SELECT company_id FROM public.users
            WHERE id = auth.uid()
            AND role IN ('company_admin', 'super_admin')
        )
    );


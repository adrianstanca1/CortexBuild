-- Create company_analytics table
CREATE TABLE IF NOT EXISTS public.company_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    total_projects INTEGER NOT NULL DEFAULT 0 CHECK (total_projects >= 0),
    active_projects INTEGER NOT NULL DEFAULT 0 CHECK (active_projects >= 0),
    completed_projects INTEGER NOT NULL DEFAULT 0 CHECK (completed_projects >= 0),
    total_revenue NUMERIC NOT NULL DEFAULT 0 CHECK (total_revenue >= 0),
    monthly_revenue NUMERIC NOT NULL DEFAULT 0 CHECK (monthly_revenue >= 0),
    team_productivity NUMERIC NOT NULL DEFAULT 0 CHECK (team_productivity >= 0 AND team_productivity <= 100),
    completion_rate NUMERIC NOT NULL DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    budget_utilization NUMERIC NOT NULL DEFAULT 0 CHECK (budget_utilization >= 0 AND budget_utilization <= 100),
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, month, year)
);

-- Create indexes for better query performance
CREATE INDEX idx_company_analytics_company_id ON public.company_analytics(company_id);
CREATE INDEX idx_company_analytics_year_month ON public.company_analytics(year DESC, month DESC);
CREATE INDEX idx_company_analytics_created_at ON public.company_analytics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company admins can view their company's analytics
CREATE POLICY "company_admins_view_analytics" ON public.company_analytics
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin')
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- RLS Policy: Company admins can insert analytics
CREATE POLICY "company_admins_insert_analytics" ON public.company_analytics
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid() AND role = 'company_admin'
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- RLS Policy: Company admins can update their company's analytics
CREATE POLICY "company_admins_update_analytics" ON public.company_analytics
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid() AND role = 'company_admin'
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid() AND role = 'company_admin'
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- RLS Policy: Company admins can delete their company's analytics
CREATE POLICY "company_admins_delete_analytics" ON public.company_analytics
    FOR DELETE
    USING (
        company_id IN (
            SELECT company_id FROM public.users 
            WHERE id = auth.uid() AND role = 'company_admin'
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );


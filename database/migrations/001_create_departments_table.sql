-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    budget NUMERIC NOT NULL DEFAULT 0 CHECK (budget >= 0),
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    member_count INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
    spent NUMERIC NOT NULL DEFAULT 0 CHECK (spent >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

-- Create indexes for better query performance
CREATE INDEX idx_departments_company_id ON public.departments(company_id);
CREATE INDEX idx_departments_manager_id ON public.departments(manager_id);
CREATE INDEX idx_departments_created_at ON public.departments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company admins can view their company's departments
CREATE POLICY "company_admins_view_departments" ON public.departments
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

-- RLS Policy: Company admins can insert departments
CREATE POLICY "company_admins_insert_departments" ON public.departments
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

-- RLS Policy: Company admins can update their company's departments
CREATE POLICY "company_admins_update_departments" ON public.departments
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

-- RLS Policy: Company admins can delete their company's departments
CREATE POLICY "company_admins_delete_departments" ON public.departments
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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER departments_updated_at_trigger
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_departments_updated_at();


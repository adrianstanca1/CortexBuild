-- Create custom_roles table
CREATE TABLE IF NOT EXISTS public.custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    user_count INTEGER NOT NULL DEFAULT 0 CHECK (user_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

-- Create indexes for better query performance
CREATE INDEX idx_custom_roles_company_id ON public.custom_roles(company_id);
CREATE INDEX idx_custom_roles_created_at ON public.custom_roles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company admins can view their company's roles
CREATE POLICY "company_admins_view_roles" ON public.custom_roles
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

-- RLS Policy: Company admins can insert roles
CREATE POLICY "company_admins_insert_roles" ON public.custom_roles
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

-- RLS Policy: Company admins can update their company's roles
CREATE POLICY "company_admins_update_roles" ON public.custom_roles
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

-- RLS Policy: Company admins can delete their company's roles
CREATE POLICY "company_admins_delete_roles" ON public.custom_roles
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
CREATE OR REPLACE FUNCTION public.update_custom_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_roles_updated_at_trigger
BEFORE UPDATE ON public.custom_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_custom_roles_updated_at();


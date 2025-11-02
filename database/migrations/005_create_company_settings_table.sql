-- Create company_settings table
CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
    theme_color TEXT NOT NULL DEFAULT '#3B82F6',
    logo_url TEXT,
    email_template TEXT,
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    two_factor_required BOOLEAN NOT NULL DEFAULT false,
    ip_whitelist TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_company_settings_company_id ON public.company_settings(company_id);

-- Enable Row Level Security
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company admins can view their company's settings
CREATE POLICY "company_admins_view_settings" ON public.company_settings
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

-- RLS Policy: Company admins can insert settings
CREATE POLICY "company_admins_insert_settings" ON public.company_settings
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

-- RLS Policy: Company admins can update their company's settings
CREATE POLICY "company_admins_update_settings" ON public.company_settings
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

-- RLS Policy: Company admins can delete their company's settings
CREATE POLICY "company_admins_delete_settings" ON public.company_settings
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
CREATE OR REPLACE FUNCTION public.update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_settings_updated_at_trigger
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_company_settings_updated_at();


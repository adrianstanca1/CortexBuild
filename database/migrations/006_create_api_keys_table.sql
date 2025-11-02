-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_value TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(company_id, name)
);

-- Create indexes for better query performance
CREATE INDEX idx_api_keys_company_id ON public.api_keys(company_id);
CREATE INDEX idx_api_keys_key_value ON public.api_keys(key_value);
CREATE INDEX idx_api_keys_created_at ON public.api_keys(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Company admins can view their company's API keys
CREATE POLICY "company_admins_view_api_keys" ON public.api_keys
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

-- RLS Policy: Company admins can insert API keys
CREATE POLICY "company_admins_insert_api_keys" ON public.api_keys
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

-- RLS Policy: Company admins can update their company's API keys
CREATE POLICY "company_admins_update_api_keys" ON public.api_keys
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

-- RLS Policy: Company admins can delete their company's API keys
CREATE POLICY "company_admins_delete_api_keys" ON public.api_keys
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


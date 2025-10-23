-- Create department_members table
CREATE TABLE IF NOT EXISTS public.department_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_department_members_department_id ON public.department_members(department_id);
CREATE INDEX idx_department_members_user_id ON public.department_members(user_id);
CREATE INDEX idx_department_members_joined_at ON public.department_members(joined_at DESC);

-- Enable Row Level Security
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view department members of their company
CREATE POLICY "users_view_department_members" ON public.department_members
    FOR SELECT
    USING (
        department_id IN (
            SELECT d.id FROM public.departments d
            WHERE d.company_id IN (
                SELECT company_id FROM public.users 
                WHERE id = auth.uid()
            )
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- RLS Policy: Company admins can insert department members
CREATE POLICY "company_admins_insert_department_members" ON public.department_members
    FOR INSERT
    WITH CHECK (
        department_id IN (
            SELECT d.id FROM public.departments d
            WHERE d.company_id IN (
                SELECT company_id FROM public.users 
                WHERE id = auth.uid() AND role = 'company_admin'
            )
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- RLS Policy: Company admins can update department members
CREATE POLICY "company_admins_update_department_members" ON public.department_members
    FOR UPDATE
    USING (
        department_id IN (
            SELECT d.id FROM public.departments d
            WHERE d.company_id IN (
                SELECT company_id FROM public.users 
                WHERE id = auth.uid() AND role = 'company_admin'
            )
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    )
    WITH CHECK (
        department_id IN (
            SELECT d.id FROM public.departments d
            WHERE d.company_id IN (
                SELECT company_id FROM public.users 
                WHERE id = auth.uid() AND role = 'company_admin'
            )
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );

-- RLS Policy: Company admins can delete department members
CREATE POLICY "company_admins_delete_department_members" ON public.department_members
    FOR DELETE
    USING (
        department_id IN (
            SELECT d.id FROM public.departments d
            WHERE d.company_id IN (
                SELECT company_id FROM public.users 
                WHERE id = auth.uid() AND role = 'company_admin'
            )
        )
        OR auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'super_admin'
        )
    );


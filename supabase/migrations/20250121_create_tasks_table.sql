-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    start_date DATE,
    completed_date TIMESTAMP WITH TIME ZONE,
    estimated_hours NUMERIC(10, 2),
    actual_hours NUMERIC(10, 2),
    tags TEXT[],
    created_by TEXT NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Add RLS policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tasks from their company's projects
CREATE POLICY "Users can view their company tasks"
    ON public.tasks
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM public.projects p
            INNER JOIN public.users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Policy: Users can create tasks in their company's projects
CREATE POLICY "Users can create tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id FROM public.projects p
            INNER JOIN public.users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Policy: Users can update tasks in their company's projects
CREATE POLICY "Users can update tasks"
    ON public.tasks
    FOR UPDATE
    USING (
        project_id IN (
            SELECT p.id FROM public.projects p
            INNER JOIN public.users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Policy: Users can delete tasks they created
CREATE POLICY "Users can delete their tasks"
    ON public.tasks
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR
        project_id IN (
            SELECT p.id FROM public.projects p
            INNER JOIN public.users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid() AND u.role IN ('company_admin', 'super_admin')
        )
    );


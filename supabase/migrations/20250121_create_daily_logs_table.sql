-- Create daily_logs table
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL,
    date DATE NOT NULL,
    weather TEXT,
    temperature NUMERIC(5, 2),
    workers_count INTEGER DEFAULT 0,
    hours_worked NUMERIC(5, 2) DEFAULT 0,
    work_completed TEXT NOT NULL,
    materials_used TEXT,
    equipment_used TEXT,
    safety_incidents TEXT,
    delays TEXT,
    notes TEXT,
    photos TEXT[],
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_id ON public.daily_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_created_by ON public.daily_logs(created_by);


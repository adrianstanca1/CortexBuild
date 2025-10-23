-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    category TEXT DEFAULT 'other' CHECK (category IN ('contract', 'drawing', 'photo', 'report', 'invoice', 'permit', 'other')),
    project_id TEXT,
    uploaded_by TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view documents from their company"
    ON public.documents FOR SELECT
    USING (true);

CREATE POLICY "Users can upload documents"
    ON public.documents FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own documents"
    ON public.documents FOR UPDATE
    USING (uploaded_by = auth.uid()::text);

CREATE POLICY "Users can delete their own documents"
    ON public.documents FOR DELETE
    USING (uploaded_by = auth.uid()::text);

-- Storage policies
CREATE POLICY "Users can view files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'project-files');

CREATE POLICY "Users can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'project-files');


-- Create demo_requests table for storing demo form submissions
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "Allow anonymous demo requests" ON demo_requests
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy to allow authenticated users to view (optional)
CREATE POLICY "Allow authenticated users to view demo requests" ON demo_requests
    FOR SELECT
    TO authenticated
    USING (true);
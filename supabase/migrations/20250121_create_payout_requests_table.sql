-- Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id TEXT PRIMARY KEY,
    developer_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_developer_id ON public.payout_requests(developer_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Developers can view their own payout requests"
    ON public.payout_requests FOR SELECT
    USING (developer_id = auth.uid()::text);

CREATE POLICY "Developers can create payout requests"
    ON public.payout_requests FOR INSERT
    WITH CHECK (developer_id = auth.uid()::text);

CREATE POLICY "Admins can manage all payout requests"
    ON public.payout_requests FOR ALL
    USING (true);


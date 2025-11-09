-- Step 3: Enable RLS and Create Policies

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now)
CREATE POLICY "Allow all operations on companies"
    ON companies FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on users"
    ON users FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on sessions"
    ON sessions FOR ALL
    USING (true)
    WITH CHECK (true);


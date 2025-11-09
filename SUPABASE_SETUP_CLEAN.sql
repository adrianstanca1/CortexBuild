-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on companies" ON companies;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on sessions" ON sessions;

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default company
INSERT INTO companies (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'ASC Cladding Ltd');

-- Insert test users (password for both is 'parola123')
INSERT INTO users (id, email, password_hash, name, role, company_id) 
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'adrian.stanca1@gmail.com',
        '$2b$10$OZuOTyrSx0yeQfX.UygHiujjFP731Mjcl1z9fwORSC6sSpVZiobi.',
        'Adrian Stanca',
        'super_admin',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'dev@constructco.com',
        '$2b$10$OZuOTyrSx0yeQfX.UygHiujjFP731Mjcl1z9fwORSC6sSpVZiobi.',
        'Developer User',
        'developer',
        '00000000-0000-0000-0000-000000000001'
    );

-- Enable Row Level Security (RLS)
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


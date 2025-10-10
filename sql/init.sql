-- ConstructAI Database Schema for Vercel Postgres
-- Run this in Vercel Postgres dashboard after creating the database

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    company_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Insert initial company
INSERT INTO companies (id, name) 
VALUES ('company-1', 'ConstructCo')
ON CONFLICT (id) DO NOTHING;

-- Insert initial users
-- Password for adrian.stanca1@gmail.com: Cumparavinde1
-- Password for others: password123

INSERT INTO users (id, email, password_hash, name, role, company_id)
VALUES
    (
        'user-1',
        'adrian.stanca1@gmail.com',
        '$2b$10$p7jaaXZGYNdCWghK1RFr4uaA3C29RjxHxdk2L/X8jQd4zO7BRqJr2',
        'Adrian Stanca',
        'super_admin',
        'company-1'
    ),
    (
        'user-2',
        'casey@constructco.com',
        '$2b$10$zKbSLPUYgaRKGkczoxAMReK0Ib1yyiDIX8Tm4ylH7gN2vbodwIrpe',
        'Casey Johnson',
        'company_admin',
        'company-1'
    ),
    (
        'user-3',
        'mike@constructco.com',
        '$2b$10$76OPC0lGuhnxltEEt75Q5OvpinXs0LafoKc2vgDE5dqRiUZFdlrfi',
        'Mike Wilson',
        'supervisor',
        'company-1'
    )
ON CONFLICT (id) DO NOTHING;


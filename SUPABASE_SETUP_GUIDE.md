# 🚀 Supabase Setup Guide for CortexBuild

## Overview
This guide will help you set up Supabase as the database for your CortexBuild application, replacing the local SQLite database.

## Step 1: Create Supabase Project

### 1.1 Go to Supabase
- **Open**: https://supabase.com
- **Sign up/Login** with your GitHub account
- **Click** "New Project"

### 1.2 Create New Project
```
Organization: (select or create)
Project Name: cortexbuild
Database Password: (generate strong password - save this!)
Region: (choose closest to your users)
Pricing Plan: Free
```

### 1.3 Wait for Setup
- Wait 2-3 minutes for the project to be created
- **Save your credentials** (you'll need them later)

## Step 2: Get Supabase Credentials

### 2.1 Go to Project Settings
- In your Supabase dashboard, click **"Settings"** (gear icon)
- Click **"API"** in the sidebar

### 2.2 Copy Credentials
```
Project URL: https://your-project-id.supabase.co
anon/public key: (starts with eyJ...)
service_role key: (starts with eyJ...)
```

## Step 3: Set Up Database Schema

### 3.1 Go to SQL Editor
- In your Supabase dashboard, click **"SQL Editor"**
- Click **"New Query"**

### 3.2 Run Schema Migration
Copy and paste the following SQL:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'company_admin',
    avatar TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RFIs table
CREATE TABLE rfis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create punch_list_items table
CREATE TABLE punch_list_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_logs table
CREATE TABLE daily_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    log_date DATE NOT NULL,
    weather TEXT,
    work_performed TEXT,
    materials_used TEXT,
    equipment_used TEXT,
    issues_encountered TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (for Supabase auth integration)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'company_admin',
    avatar TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE punch_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Companies: Users can only see their own company
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Users: Users can view users in their company
CREATE POLICY "Users can view company users" ON users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Projects: Users can view projects in their company
CREATE POLICY "Users can view company projects" ON projects
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Tasks: Users can view tasks in their company projects
CREATE POLICY "Users can view company tasks" ON tasks
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid()
        )
    );

-- RFIs: Users can view RFIs in their company projects
CREATE POLICY "Users can view company RFIs" ON rfis
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Punch list items: Users can view punch list items in their company projects
CREATE POLICY "Users can view company punch list items" ON punch_list_items
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Daily logs: Users can view daily logs in their company projects
CREATE POLICY "Users can view company daily logs" ON daily_logs
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid()
        )
    );

-- Profiles: Users can view their own profile and company profiles
CREATE POLICY "Users can view company profiles" ON profiles
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_rfis_project_id ON rfis(project_id);
CREATE INDEX idx_rfis_assigned_to ON rfis(assigned_to);
CREATE INDEX idx_punch_list_items_project_id ON punch_list_items(project_id);
CREATE INDEX idx_punch_list_items_assigned_to ON punch_list_items(assigned_to);
CREATE INDEX idx_daily_logs_project_id ON daily_logs(project_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX idx_profiles_company_id ON profiles(company_id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, role, avatar, company_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'company_admin'),
        NEW.raw_user_meta_data->>'avatar_url',
        NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3.3 Run the Query
- Click **"Run"** to execute the SQL
- Wait for completion (should take 30-60 seconds)

## Step 4: Create Initial Data

### 4.1 Create a Company
Run this SQL in the SQL Editor:

```sql
-- Create a demo company
INSERT INTO companies (name) VALUES ('CortexBuild Demo Company');
```

### 4.2 Create a Super Admin User
Run this SQL in the SQL Editor:

```sql
-- Create a super admin user (replace with your email)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    uuid_generate_v4(),
    'adrian.stanca1@gmail.com',
    crypt('parola123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Adrian Stanca", "role": "super_admin"}'
);

-- Update the profile to be super admin
UPDATE profiles 
SET role = 'super_admin', 
    company_id = (SELECT id FROM companies WHERE name = 'CortexBuild Demo Company')
WHERE email = 'adrian.stanca1@gmail.com';
```

## Step 5: Configure Environment Variables

### 5.1 Frontend (Vercel)
Go to: https://vercel.com/adrian-b7e84541/cortex-build
Add these environment variables:

```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
VITE_API_URL = https://your-backend-url.onrender.com/api
```

### 5.2 Backend (Render.com)
When deploying to Render.com, add these environment variables:

```
NODE_ENV = production
PORT = 3001
JWT_SECRET = b354d0024ca7a870e88bb22ea3b07b00342db66f2b1dfdfb93efa157381f878cc05766f58c639cbe8b07b5d2539d59dd180d02f1d3f798ff62f41980e6e1bb2f
ENCRYPTION_KEY = c3f14de008245943a7be7d186f9d418f24dd10538e92930926636936c97dc5e8
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
```

## Step 6: Test the Setup

### 6.1 Test Database Connection
- Go to your Supabase dashboard
- Click **"Table Editor"**
- Verify tables are created
- Check that data is inserted

### 6.2 Test Authentication
- Go to **"Authentication"** → **"Users"**
- Verify your super admin user is created
- Test login with: `adrian.stanca1@gmail.com` / `parola123`

## Step 7: Deploy and Test

### 7.1 Deploy Backend
- Follow the Render.com deployment guide
- Make sure to include Supabase environment variables

### 7.2 Deploy Frontend
- Update Vercel environment variables
- Redeploy frontend

### 7.3 Test Complete Application
- Open your frontend URL
- Login with super admin credentials
- Verify all features work with Supabase

## 🎉 Success!

Once complete, you'll have:
- ✅ **Supabase PostgreSQL database** with full schema
- ✅ **Row Level Security** for data protection
- ✅ **Authentication** working with Supabase
- ✅ **Full-stack application** running in production

## 🆘 Troubleshooting

### Common Issues:
1. **Schema errors**: Check SQL syntax and run queries one by one
2. **RLS blocking queries**: Check policies and user permissions
3. **Authentication not working**: Verify user creation and email confirmation
4. **Environment variables**: Make sure all are set correctly

### Need Help?
- **Supabase Docs**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions

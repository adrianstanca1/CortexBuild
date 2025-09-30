# 🗄️ Database Setup Guide

This guide will help you set up a real Supabase database for the AS Agents platform.

## 🚀 Quick Start

### Option 1: Use Mock Data (Default)
The application works out of the box with mock data - no setup required!

### Option 2: Connect to Supabase Database
Follow the steps below to connect to a real database.

## 📋 Prerequisites

- Supabase account (free tier available)
- Basic understanding of SQL

## 🔧 Setup Steps

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `as-agents-platform`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

### 2. Get Your Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Copy and paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  storage_usage_gb DECIMAL DEFAULT 0,
  max_users INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_address TEXT NOT NULL,
  location_lat DECIMAL NOT NULL,
  location_lng DECIMAL NOT NULL,
  budget DECIMAL NOT NULL,
  spent DECIMAL DEFAULT 0,
  actual_cost DECIMAL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'PLANNING',
  image_url TEXT,
  project_type TEXT NOT NULL,
  work_classification TEXT NOT NULL,
  geofence_radius INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO',
  priority TEXT DEFAULT 'MEDIUM',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create basic policies (customize as needed)
CREATE POLICY "Enable read access for all users" ON companies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON expenses FOR SELECT USING (true);

-- Insert sample data
INSERT INTO companies (id, name, storage_usage_gb, max_users, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Construction Co.', 2.5, 50, 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'BuildRight Ltd.', 1.8, 25, 'active');

INSERT INTO users (id, company_id, email, first_name, last_name, role) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', 'John', 'Admin', 'ADMIN'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'manager@demo.com', 'Jane', 'Manager', 'PROJECT_MANAGER');

INSERT INTO projects (company_id, name, location_address, location_lat, location_lng, budget, project_type, work_classification) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Office Building Renovation', '123 Business District, London', 51.5074, -0.1278, 250000, 'Commercial', 'Renovation'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Residential Complex Phase 1', '456 Residential Ave, Manchester', 53.4808, -2.2426, 500000, 'Residential', 'New Build');
```

4. Click **Run** to execute the SQL
5. Verify tables were created in the **Table Editor**

### 4. Configure Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Enable Supabase
VITE_USE_SUPABASE=true
VITE_ALLOW_MOCK_FALLBACK=true

# Other variables
VITE_GEMINI_API_KEY=your-gemini-key
```

### 5. Test the Connection

1. Restart your development server: `npm run dev`
2. Open the application in your browser
3. Check the browser console for any connection messages
4. Try creating a new project to test database operations

## 🔒 Security Considerations

### Row Level Security (RLS)
The setup includes basic RLS policies. For production, customize these policies:

```sql
-- Example: Users can only see their company's data
CREATE POLICY "Users can only see own company projects" ON projects
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
```

### Authentication
For production, set up Supabase Auth:

1. Go to **Authentication** → **Settings**
2. Configure your authentication providers
3. Update the application to use Supabase Auth instead of mock authentication

## 🚨 Troubleshooting

### Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that your project is not paused (free tier limitation)
- Ensure your internet connection is stable

### Permission Errors
- Check that RLS policies allow your operations
- Verify the anon key has the necessary permissions
- Review the Supabase logs in the dashboard

### Data Not Appearing
- Check the browser console for error messages
- Verify the database service is being used (not falling back to mock data)
- Ensure your tables have the correct data

## 📚 Next Steps

1. **Set up Authentication**: Integrate Supabase Auth for user management
2. **Add Real-time Features**: Use Supabase subscriptions for live updates
3. **File Storage**: Set up Supabase Storage for project images and documents
4. **Backup Strategy**: Configure automated backups for production data

## 🆘 Support

If you encounter issues:
1. Check the Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. Review the application logs in the browser console
3. Check the Supabase dashboard logs for database errors

---

**Note**: The application will automatically fall back to mock data if the database connection fails, ensuring uninterrupted development.

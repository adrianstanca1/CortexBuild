# CortexBuild Supabase Setup Guide

## Overview

CortexBuild uses Supabase for:
- **Authentication** - OAuth, email/password, social logins
- **Database** - PostgreSQL with Row Level Security (RLS)
- **Real-time** - Live updates and notifications
- **Storage** - File and document management
- **Edge Functions** - Serverless backend logic

## Current Implementation Status

✅ **Fully Implemented**:
- Supabase client configuration ([lib/supabase/client.ts](lib/supabase/client.ts))
- Safe client with fallbacks ([supabaseClient.ts](supabaseClient.ts))
- OAuth callback handling in [App.tsx](App.tsx#L244)
- API authentication with Supabase tokens ([src/services/apiClient.ts](src/services/apiClient.ts))
- Environment variable utilities ([src/utils/env.ts](src/utils/env.ts))
- Comprehensive database schemas

✅ **Optional Configuration**:
- The application works WITHOUT Supabase (uses local SQLite)
- Supabase integration is **optional** for enhanced features
- OAuth and cloud features require Supabase

## Quick Start

### Option 1: Without Supabase (Local Mode)

The application works out-of-the-box with local SQLite authentication:

```bash
npm install
npm run dev
```

Default credentials: `admin@constructai.com` / `admin123`

### Option 2: With Supabase (Cloud Mode)

#### Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Name**: CortexBuild
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project initialization (~2 minutes)

#### Step 2: Get API Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy the following:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: Under "Project API keys"
   - **service_role key**: (optional, for admin operations)

#### Step 3: Update Environment Variables

Edit [.env.local](.env.local):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### Step 4: Set Up Database Schema

Apply the database schema to your Supabase project:

**Option A: Using Supabase SQL Editor**

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy and paste the contents of [supabase/schema.sql](supabase/schema.sql)
4. Click "Run" or press Cmd/Ctrl + Enter
5. Repeat for [PRIORITY_4_DATABASE_SCHEMA.sql](PRIORITY_4_DATABASE_SCHEMA.sql) for advanced features

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Apply migrations
supabase db push
```

#### Step 5: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable providers you want:
   - **Email/Password**: Already enabled by default
   - **Google**: Requires OAuth credentials
   - **GitHub**: Requires OAuth credentials
   - **Other providers**: Follow Supabase docs

For OAuth providers:

1. Get OAuth credentials from provider (Google/GitHub/etc)
2. Add to Supabase Auth settings
3. Add authorized redirect URLs:
   - `http://localhost:5173` (development)
   - `https://your-production-domain.com` (production)

#### Step 6: Verify Setup

Run the setup verification script:

```bash
chmod +x setup-supabase-react.sh
./setup-supabase-react.sh
```

Or manually test:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) and check browser console for:
- ✅ Supabase client initialized successfully!
- ✅ Supabase connected successfully

## Database Schema Overview

### Core Tables (50+ tables)

**Multi-tenant Structure**:
- `companies` - Multi-tenant company records
- `users` - User accounts with company association
- `company_members` - Company membership and roles

**Project Management**:
- `projects` - Construction projects
- `tasks` - Project tasks and assignments
- `daily_logs` - Daily activity logs
- `rfis` - Requests for Information
- `documents` - Document management

**Advanced Features** (Priority 4 Schema):
- `notifications` - Real-time notification system
- `analytics_events` - Event tracking
- `marketplace_apps` - Global marketplace
- `ai_suggestions` - AI-powered insights
- `sdk_applications` - Developer SDK apps

### Row Level Security (RLS)

All tables have RLS policies for security:
- Users can only see their company's data
- Role-based access control (RBAC)
- Super admins have cross-company access

## Architecture

### Client Configuration

**Primary Client** ([lib/supabase/client.ts](lib/supabase/client.ts)):
- Strict configuration, throws errors if not configured
- Used in production builds
- Supports both Vite and Next.js environments

**Safe Client** ([supabaseClient.ts](supabaseClient.ts)):
- Graceful fallback when Supabase not configured
- Returns mock responses to prevent crashes
- Used during development

### Authentication Flow

1. User initiates login (OAuth or email/password)
2. Supabase handles authentication
3. OAuth callback redirected to App.tsx
4. Session stored in local storage
5. API client includes session token in requests
6. Server validates token with Supabase

### Real-time Integration

The application uses Supabase real-time for:
- Live notifications
- Collaborative editing
- Task status updates
- Chat messages

## Configuration Files

| File | Purpose |
|------|---------|
| [.env.local](.env.local) | Local environment variables |
| [.env.example](.env.example) | Environment template |
| [lib/supabase/client.ts](lib/supabase/client.ts) | Primary Supabase client |
| [supabaseClient.ts](supabaseClient.ts) | Safe client with fallbacks |
| [lib/supabase/server.ts](lib/supabase/server.ts) | Server-side client |
| [lib/supabase/realtime.ts](lib/supabase/realtime.ts) | Real-time subscriptions |

## Deployment Considerations

### Environment Variables for Production

When deploying to Vercel/IONOS, set these environment variables:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### OAuth Redirect URLs

Add your production URLs to Supabase Auth settings:

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - Production URL: `https://your-domain.com`
   - Development: `http://localhost:5173`

### CORS Configuration

Supabase automatically handles CORS for your domain. If issues arise:

1. Check **Settings** → **API** → **API Settings**
2. Ensure your domain is in allowed origins

## Troubleshooting

### "Missing Supabase URL" Error

**Cause**: Environment variables not loaded
**Fix**:
- Verify `.env.local` exists and has correct values
- Restart development server: `npm run dev`
- Check that keys start with `VITE_` for Vite

### OAuth Callback Fails

**Cause**: Redirect URLs not configured
**Fix**:
- Add your URLs to Supabase Auth settings
- Ensure URL exactly matches (including http/https)

### Database Connection Fails

**Cause**: Wrong credentials or RLS policies
**Fix**:
- Verify API keys in Supabase dashboard
- Check browser console for specific errors
- Ensure user has proper role/permissions

### "Supabase not configured" Warnings

**Cause**: Running in local mode (this is normal)
**Fix**: This is expected if Supabase is not set up. App works with local SQLite.

## Features Without Supabase

When running without Supabase, you still get:

✅ Full authentication (local SQLite)
✅ Project and task management
✅ Team management
✅ Document handling
✅ Analytics and reports
✅ AI features (if API keys configured)

❌ OAuth social logins
❌ Real-time collaboration
❌ Cloud storage
❌ Cross-device sync

## Next Steps

1. ✅ Follow Quick Start above
2. ✅ Test authentication flow
3. ✅ Verify database queries work
4. Configure OAuth providers (optional)
5. Set up real-time features (optional)
6. Deploy to production

## Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **CortexBuild Issues**: Report in your project repository
- **Supabase Support**: [https://supabase.com/support](https://supabase.com/support)

## Additional Resources

- [Database Schema](supabase/schema.sql)
- [Priority 4 Features](PRIORITY_4_DATABASE_SCHEMA.sql)
- [Setup Script](setup-supabase-react.sh)
- [Verification Script](verify-complete.sh)

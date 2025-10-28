# 🗄️ Database Setup Guide

This guide will walk you through setting up a real Supabase database for your AS Agents Construction Management Platform.

## 📋 Prerequisites

- A Supabase account (free tier works great!)
- Node.js and npm installed

## 🚀 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Name**: AS Agents Construction
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you
5. Wait for the project to be created (~2 minutes)

## 🔧 Step 2: Run Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `database/schema.sql`
4. Click **Run** or press `Cmd+Enter`
5. You should see "Success. No rows returned" - this is normal!

This creates all the tables, indexes, Row Level Security policies, and triggers.

## 🔑 Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Find these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## 📝 Step 4: Configure Environment Variables

1. In your project root (`final/` folder), create a file named `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: AI Keys (if using AI features)
VITE_GEMINI_API_KEY=your-gemini-key
VITE_OPENAI_API_KEY=your-openai-key
```

2. Replace the values with your actual Supabase URL and key

## ✅ Step 5: Verify Setup

1. Restart your dev server:

```bash
npm run dev
```

2. Open the browser console (F12)
3. You should see: `"Supabase configured and ready"`

## 🎯 Step 6: Create Your First User

1. Go to <http://localhost:5173>
2. Click "Register" or "Sign Up"
3. Enter:
   - **Email**: <your-email@example.com>
   - **Password**: (at least 6 characters)
   - **Name**: Your Name
   - **Company Name**: Your Company

4. Check your email for verification link (check spam folder)
5. Click the verification link
6. Go back to the app and log in!

## 📊 Optional: Add Storage Buckets

If you want to upload files (documents, images):

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Create these buckets:
   - `documents` (for project documents)
   - `avatars` (for user profile pictures)
   - `attachments` (for general files)

4. For each bucket, set the policy:
   - Go to bucket → **Policies**
   - Click **New Policy**
   - Use template: "Allow authenticated users to upload"

## 🔒 Security Configuration (Production)

Before deploying to production:

1. **Enable Email Confirmation**:
   - Go to **Authentication** → **Settings**
   - Enable "Confirm email"

2. **Set up Email Templates**:
   - Go to **Authentication** → **Email Templates**
   - Customize welcome, confirmation, and reset emails

3. **Configure Auth Providers** (Optional):
   - Go to **Authentication** → **Providers**
   - Enable Google, GitHub, etc. if desired

4. **Review RLS Policies**:
   - Go to **Authentication** → **Policies**
   - Review and test all Row Level Security policies

## 🧪 Testing

To verify everything works:

1. **Create a Project**:
   - Log in to the app
   - Navigate to Projects
   - Click "New Project"
   - Fill in details and save

2. **Check Database**:
   - Go to Supabase Dashboard → **Table Editor**
   - Select `projects` table
   - You should see your new project!

3. **Create a Todo**:
   - In the app, go to Todos
   - Create a new todo
   - Verify it appears in the `todos` table

## 🆘 Troubleshooting

### "Failed to fetch" errors

- Check that `.env.local` has correct values
- Restart the dev server after changing `.env.local`
- Check browser console for detailed error messages

### "JWT expired" or auth errors

- Go to Supabase Dashboard → **Authentication** → **Users**
- Check if user exists
- Try signing out and signing in again

### "Permission denied" or RLS errors

- Check Row Level Security policies in schema.sql
- Verify user has correct `company_id`
- Check browser console for specific policy that failed

### "Column does not exist" errors

- Verify schema.sql ran successfully
- Go to **Table Editor** and check table structure
- Re-run schema.sql if needed

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

## 🎉 You're All Set

Your app now has:

- ✅ Real PostgreSQL database
- ✅ User authentication with Supabase Auth
- ✅ Row Level Security for data protection
- ✅ Real-time subscriptions for live updates
- ✅ Scalable cloud infrastructure

Start building your construction management empire! 🏗️

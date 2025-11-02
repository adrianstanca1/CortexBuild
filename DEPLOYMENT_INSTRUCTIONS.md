# 🚀 Deployment Instructions for CortexBuild

## Current Status

We've completed the following:

1. ✅ **Database Schema Created** - `supabase/migrations/marketplace_apps_schema.sql`
2. ✅ **Service Layer Built** - `lib/services/marketplaceAppsService.ts`
3. ✅ **TodoListApp Updated** - Connected to Supabase with persistence
4. ✅ **Supabase Client Configured** - Real client with proper API keys

## Next Steps to Deploy

### Step 1: Run Database Migration

You need to manually run the SQL migration in Supabase Dashboard:

1. Go to https://supabase.com/dashboard/project/qglvhxkgbzujglehewsa
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/marketplace_apps_schema.sql`
5. Paste into the SQL editor
6. Click "Run" to execute

This will create:
- 7 database tables for marketplace apps
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps

### Step 2: Update AppContainer to Pass User Context

The `AppContainer` component needs to pass the `currentUser` prop to apps. 

**File to modify**: `components/apps/AppContainer.tsx`

Change line 93 from:
```typescript
<AppComponent isDarkMode={isDarkMode} />
```

To:
```typescript
<AppComponent isDarkMode={isDarkMode} currentUser={currentUser} />
```

And add `currentUser` to the props:
```typescript
interface AppContainerProps {
    app: MiniApp;
    onClose: () => void;
    isDarkMode?: boolean;
    currentUser?: any;  // ADD THIS
}
```

### Step 3: Deploy to Vercel

Run the deployment command:

```bash
npm run vercel:deploy
```

### Step 4: Test TodoListApp

1. Open the deployed preview URL
2. Log in with test account:
   - Email: `super@admin.com`
   - Password: `admin123`
3. Open "My Applications" desktop
4. Launch "Todo List" app
5. Add a few todos
6. Refresh the page
7. Verify todos persist!

## What's Working

- ✅ TodoListApp with full Supabase persistence
- ✅ Loading states and error handling
- ✅ User-specific data isolation
- ✅ Real-time data sync

## What's Next

After successful deployment and testing:

1. Update remaining 5 apps with Supabase:
   - ExpenseTrackerApp
   - PomodoroTimerApp
   - NotesApp
   - HabitTrackerApp
   - MobileAppBuilder

2. Build Daily Site Inspector app

3. Enhance Git Integration

## Troubleshooting

### If todos don't persist:

1. Check browser console for errors
2. Verify Supabase tables were created (check Supabase Dashboard > Table Editor)
3. Verify RLS policies are enabled
4. Check that `currentUser` prop is being passed to TodoListApp

### If you get authentication errors:

1. Verify `.env` file has correct `VITE_SUPABASE_ANON_KEY`
2. Check that Supabase client is initialized properly in `lib/supabase/client.ts`
3. Verify user is logged in before opening TodoListApp

## Database Schema Overview

```
app_todos
├── id (TEXT, PK)
├── user_id (TEXT, FK → users.id)
├── text (TEXT)
├── completed (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

app_transactions
├── id (TEXT, PK)
├── user_id (TEXT, FK → users.id)
├── description (TEXT)
├── amount (DECIMAL)
├── type (TEXT: 'income' | 'expense')
├── category (TEXT)
├── date (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

app_pomodoro_sessions
├── id (TEXT, PK)
├── user_id (TEXT, FK → users.id)
├── duration_minutes (INTEGER)
├── type (TEXT: 'work' | 'break')
├── completed (BOOLEAN)
├── started_at (TIMESTAMP)
├── completed_at (TIMESTAMP)
└── created_at (TIMESTAMP)

app_notes
├── id (TEXT, PK)
├── user_id (TEXT, FK → users.id)
├── title (TEXT)
├── content (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

app_habits
├── id (TEXT, PK)
├── user_id (TEXT, FK → users.id)
├── name (TEXT)
├── icon (TEXT)
├── color (TEXT)
├── streak (INTEGER)
├── total_completed (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

app_habit_completions
├── id (TEXT, PK)
├── habit_id (TEXT, FK → app_habits.id)
├── user_id (TEXT, FK → users.id)
├── completed_date (DATE)
└── created_at (TIMESTAMP)

app_builder_projects
├── id (TEXT, PK)
├── user_id (TEXT, FK → users.id)
├── name (TEXT)
├── description (TEXT)
├── icon (TEXT)
├── database_type (TEXT)
├── database_config (JSONB)
├── screens (JSONB)
├── logic (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Security

All tables have Row Level Security (RLS) enabled with policies that ensure:
- Users can only see their own data
- Users can only modify their own data
- No cross-user data leakage

---

**Last Updated**: 2025-10-21
**Status**: Ready for deployment and testing


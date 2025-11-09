# Production Login Fix - Complete Guide

## Problem Summary
The developer and company admin users could not login to the production deployment because:
1. Local development uses SQLite database with test users
2. Production (Vercel) uses Supabase PostgreSQL database
3. Test users exist in SQLite but not in Supabase
4. The `api/auth/login.ts` serverless function queries Supabase, not SQLite

## What Was Fixed

### 1. Simplified Login Endpoint (`api/auth/login.ts`)
- Removed references to undefined utility functions
- Added better error handling and logging
- Simplified CORS handling
- Now returns proper 401 errors (not 500) when user not found

### 2. Created Supabase Migration Scripts
- `supabase/migrations/004_create_test_users.sql` - Migration file for documentation
- `SUPABASE_CREATE_USERS.sql` - Ready-to-execute SQL for Supabase SQL Editor

## How to Complete the Fix

### Option 1: Use Supabase SQL Editor (RECOMMENDED)

1. Open Supabase SQL Editor:
   ```
   https://app.supabase.com/project/zpbuvuxpfemldsknerew/sql/new
   ```

2. Copy and paste the entire contents of `SUPABASE_CREATE_USERS.sql`

3. Click "Run" to execute the SQL

4. Verify the users were created by checking the output

### Option 2: Use Supabase CLI (if you have access)

```bash
# Link to your Supabase project
supabase link --project-ref zpbuvuxpfemldsknerew

# Apply migration
supabase db push

# Or run the SQL file directly
psql $DATABASE_URL < SUPABASE_CREATE_USERS.sql
```

## Test Accounts Created

After running the SQL script, these accounts will be available:

### Developer Account
- **Email**: dev@constructco.com
- **Password**: parola123
- **Role**: developer
- **Dashboard**: DeveloperDashboardScreen with SDK tools, AI agents, sandbox
- **Company**: Platform Admin (00000000-0000-0000-0000-000000000001)

### Company Admin Account
- **Email**: adrian@ascladdingltd.co.uk
- **Password**: Lolozania1
- **Role**: company_admin
- **Dashboard**: UnifiedDashboardScreen → EnhancedDashboard with project stats
- **Company**: ASC Cladding Ltd (asc-cladding-ltd)

## Testing After Migration

1. Navigate to production URL:
   ```
   https://cortexbuildcortexbuild-i7ok8e0bs-adrian-b7e84541.vercel.app
   ```

2. Try logging in with developer account:
   - Email: dev@constructco.com
   - Password: parola123
   - Expected: Login successful, redirected to Developer Dashboard

3. Logout and try company admin account:
   - Email: adrian@ascladdingltd.co.uk
   - Password: Lolozania1
   - Expected: Login successful, redirected to Enhanced Dashboard

4. Verify logout works:
   - Click logout button
   - Expected: Redirected to login screen, token cleared

## Architecture Notes

### Local Development
- Database: SQLite (`cortexbuild.db`)
- Server: Express (`server/index.ts`)
- Port: http://localhost:3001
- Auth: `server/auth.ts` with SQLite queries

### Production (Vercel)
- Database: Supabase PostgreSQL
- Server: Vercel Serverless Functions
- Auth: `api/auth/login.ts` with Supabase queries
- URL: https://zpbuvuxpfemldsknerew.supabase.co

### Database Schema Differences
**Supabase**:
- `users.id`: UUID (foreign key to auth.users)
- `users.password_hash`: TEXT (bcrypt hash)
- `users.company_id`: UUID (foreign key to companies)

**SQLite**:
- `users.id`: INTEGER AUTO INCREMENT
- `users.password`: TEXT (bcrypt hash)
- `users.company_id`: INTEGER or TEXT

## Common Issues & Solutions

### Issue: "Could not find user"
**Cause**: User doesn't exist in Supabase
**Solution**: Run the `SUPABASE_CREATE_USERS.sql` script

### Issue: "Invalid password"
**Cause**: Password hash doesn't match
**Solution**: Use the exact passwords specified (case-sensitive)

### Issue: "Foreign key constraint violation"
**Cause**: User must exist in both `auth.users` and `public.users`
**Solution**: The SQL script creates users in both tables

### Issue: "Company not found"
**Cause**: Company doesn't exist in Supabase
**Solution**: The SQL script creates the company first

## Files Modified

1. **api/auth/login.ts** - Simplified serverless login function
2. **supabase/migrations/004_create_test_users.sql** - Migration documentation
3. **SUPABASE_CREATE_USERS.sql** - Ready-to-execute SQL script
4. **apply-migration.js** - JavaScript migration helper (doesn't work due to FK constraints)
5. **check-schema.js** - Schema inspection utility

## Next Steps

1. Execute `SUPABASE_CREATE_USERS.sql` in Supabase SQL Editor
2. Test login for both accounts
3. Verify dashboards load correctly
4. Test logout functionality
5. If everything works, commit the changes:
   ```bash
   git add api/auth/login.ts SUPABASE_CREATE_USERS.sql
   git commit -m "fix: Add test users to Supabase and simplify login endpoint"
   git push origin main
   ```

## Deployment Status

✅ Frontend: Deployed to Vercel
✅ Backend API: Fixed and deployed
⏳ Database: Awaiting SQL script execution
⏳ Testing: Awaiting user creation

Once the SQL script is executed, the production login should work perfectly for both developer and company admin users.

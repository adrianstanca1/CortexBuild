# Database Setup Guide - CortexBuild

**Last Updated**: November 10, 2025
**Status**: ✅ Database Integration Complete
**Database**: Supabase (PostgreSQL)

---

## Overview

CortexBuild now uses **Supabase** as its persistent database for user profiles and preferences. The application automatically creates user profiles on first login and persists all user data in PostgreSQL.

---

## Quick Start

### Prerequisites
- Supabase project created
- Environment variables configured in Vercel
- Service role key available

### 1. Apply Database Migration

Run the SQL migration in your Supabase dashboard:

```sql
-- File: supabase/migrations/004_create_user_profiles_table.sql
-- Copy and paste the entire migration into Supabase SQL editor
```

This creates:
- `user_profiles` table
- RLS (Row Level Security) policies
- Automatic timestamp triggers
- Performance indexes

### 2. Configure Environment Variables

Ensure these are set in your Vercel environment:

```env
# .env.production (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Deploy

```bash
npm run vercel:prod
```

---

## Database Schema

### user_profiles Table

```typescript
interface UserProfile {
  // Identity
  id: UUID (Primary Key, Foreign Key to auth.users)
  email: VARCHAR(255) UNIQUE
  name: VARCHAR(255)

  // Profile Information
  bio: TEXT (optional)
  avatar: URL (optional)
  role: VARCHAR(50) [developer, admin, super_admin]
  company_id: UUID (optional)

  // Preferences
  theme: VARCHAR(10) [light, dark]
  email_notifications: BOOLEAN
  two_factor_enabled: BOOLEAN

  // Timestamps
  created_at: TIMESTAMP
  updated_at: TIMESTAMP (auto-updated)
  last_login: TIMESTAMP (updated on each GET)

  // Indexes
  - idx_email (email)
  - idx_company_id (company_id)
  - idx_created_at (created_at)
  - idx_role (role)
  - idx_user_profiles_company_role (company_id, role)
  - idx_user_profiles_updated_at (updated_at DESC)
}
```

---

## API Endpoints

### GET /api/user/profile

Retrieves current user's profile from database.

**Request**:
```bash
curl -H "Authorization: Bearer {jwt_token}" \
  https://cortexbuild.vercel.app/api/user/profile
```

**Response**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "developer",
      "companyId": "uuid",
      "avatar": "https://...",
      "bio": "User bio",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-10T12:00:00Z",
      "lastLogin": "2025-01-10T12:00:00Z",
      "preferences": {
        "theme": "dark",
        "emailNotifications": true,
        "twoFactorEnabled": false
      }
    }
  },
  "timestamp": "2025-01-10T12:00:00Z"
}
```

**Behavior**:
- Fetches profile from database
- Creates profile automatically if it doesn't exist
- Updates `last_login` timestamp
- Returns consistent camelCase response

### PUT /api/user/profile

Updates user profile in database.

**Request**:
```bash
curl -X PUT \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "bio": "New bio",
    "avatar": "https://...",
    "preferences": {
      "theme": "light",
      "emailNotifications": false,
      "twoFactorEnabled": true
    }
  }' \
  https://cortexbuild.vercel.app/api/user/profile
```

**Response**:
```json
{
  "success": true,
  "data": {
    "profile": { ... },
    "message": "Profile updated successfully"
  },
  "timestamp": "2025-01-10T12:00:00Z"
}
```

**Validation**:
- `name` must be string
- `bio` must be string
- `avatar` must be valid URL
- `theme` must be 'light' or 'dark'
- `emailNotifications` must be boolean
- `twoFactorEnabled` must be boolean

---

## Server-Side Functions

Located in `utils/supabaseServer.ts`

### getUserProfile(userId: string)
```typescript
// Get profile from database
const profile = await getUserProfile('user-id');
// Returns: UserProfile | null
```

### createUserProfile(userId, email, name, role)
```typescript
// Create new profile
const profile = await createUserProfile(
  'user-id',
  'user@example.com',
  'User Name',
  'developer'
);
// Returns: UserProfile
```

### updateUserProfile(userId, updates)
```typescript
// Update existing profile
const profile = await updateUserProfile('user-id', {
  name: 'New Name',
  theme: 'light'
});
// Returns: UserProfile
```

### updateLastLogin(userId)
```typescript
// Update last login timestamp
await updateLastLogin('user-id');
// Non-critical, doesn't throw on error
```

### getCompanyUsers(companyId)
```typescript
// Get all users in a company
const users = await getCompanyUsers('company-id');
// Returns: UserProfile[]
```

### searchUsers(query, limit)
```typescript
// Search users by name or email
const users = await searchUsers('john', 10);
// Returns: UserProfile[]
```

---

## Security Features

### Row Level Security (RLS)

The database implements RLS policies:

1. **Users can view their own profile**
   ```sql
   CREATE POLICY "Users can view their own profile"
       ON user_profiles FOR SELECT
       USING (auth.uid() = id);
   ```

2. **Users can update their own profile**
   ```sql
   CREATE POLICY "Users can update their own profile"
       ON user_profiles FOR UPDATE
       USING (auth.uid() = id);
   ```

3. **Admins can view all profiles**
   ```sql
   CREATE POLICY "Admins can view all profiles"
       ON user_profiles FOR SELECT
       USING (EXISTS (
           SELECT 1 FROM user_profiles
           WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
       ));
   ```

### Best Practices

✅ **DO**:
- Always verify JWT tokens before database operations
- Use service role key only on server-side
- Log all profile updates for audit trail
- Validate input types before database calls
- Use RLS policies for security

❌ **DON'T**:
- Expose service role key to frontend
- Skip input validation
- Store sensitive data in bio/avatar
- Allow direct SQL queries from client
- Update user roles from client

---

## Migration Steps

### Step 1: Create the Table

Login to Supabase dashboard → SQL Editor → Run the migration:

```bash
# Go to Supabase > Your Project > SQL Editor
# Paste: supabase/migrations/004_create_user_profiles_table.sql
# Click "Run"
```

### Step 2: Verify the Table

```sql
-- Check table creation
SELECT * FROM user_profiles LIMIT 1;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_profiles';

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'user_profiles';
```

### Step 3: Deploy Code

```bash
git add .
git commit -m "Database integration deployment"
npm run vercel:prod
```

### Step 4: Test

```bash
# Get profile (will auto-create if missing)
curl -H "Authorization: Bearer {token}" \
  https://cortexbuild.vercel.app/api/user/profile

# Update profile
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name"}' \
  https://cortexbuild.vercel.app/api/user/profile
```

---

## Troubleshooting

### Profile Not Found (404)

**Issue**: User profile returns 404

**Solution**:
1. Check user exists in `auth.users`
2. Call GET endpoint to auto-create profile
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Permission Denied Error

**Issue**: RLS policy prevents access

**Solution**:
1. Ensure token is valid
2. Check user ID matches in token
3. For admins, verify role is 'admin' or 'super_admin'

### Database Connection Error

**Issue**: "Failed to initialize Supabase admin client"

**Solution**:
1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check key hasn't been rotated

### Last Login Not Updating

**Issue**: last_login field stays null

**Solution**:
1. This is non-critical and doesn't throw errors
2. Check server logs for warnings
3. This is expected behavior if profile was just created

---

## Querying the Database

### Get all users

```sql
SELECT id, email, name, role, created_at
FROM user_profiles
ORDER BY created_at DESC;
```

### Get users by company

```sql
SELECT * FROM user_profiles
WHERE company_id = 'uuid'
ORDER BY created_at DESC;
```

### Get recently active users

```sql
SELECT id, email, name, last_login
FROM user_profiles
WHERE last_login > NOW() - INTERVAL '7 days'
ORDER BY last_login DESC;
```

### Get users by theme preference

```sql
SELECT id, email, theme FROM user_profiles
WHERE theme = 'dark'
ORDER BY email;
```

### Backup profiles

```sql
-- Export as JSON
SELECT json_agg(row_to_json(t))
FROM user_profiles t;
```

---

## Performance Tips

1. **Indexes**: All common queries have indexes
2. **Updated Timestamps**: Auto-updated, don't query frequently
3. **Company Queries**: Use compound index `(company_id, role)`
4. **Search**: Uses `ILIKE` - keep query length reasonable

---

## Next Steps

1. ✅ Apply SQL migration in Supabase
2. ✅ Verify environment variables
3. ✅ Deploy code to Vercel
4. ✅ Test endpoints with valid JWT token
5. ⏭️ Monitor database performance in Supabase dashboard
6. ⏭️ Set up automated backups in Supabase
7. ⏭️ Configure alerts for errors

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Error Handling**: See `utils/errorHandler.ts`
- **API Logs**: Check Vercel deployment logs
- **Database Logs**: Check Supabase dashboard

---

**Database Integration Status**: ✅ COMPLETE & DEPLOYED

Last applied migration: `004_create_user_profiles_table.sql`
Deployed to: https://cortexbuild.vercel.app

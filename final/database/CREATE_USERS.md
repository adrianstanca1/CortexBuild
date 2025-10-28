# 👥 Create Demo Users

## 3 Ways to Create Users

### 🚀 Option 1: Use the UI (Easiest)

**For Mock Data Mode (No Supabase):**

1. Open <http://localhost:5173>
2. The app auto-creates a demo user:
   - **Email:** `demo@example.com`
   - **Password:** `password`
3. Just click "Login" and you're in!

**For Real Database (Supabase Configured):**

1. Open <http://localhost:5173>
2. Click "Register"
3. Fill in:
   - Email: <your-email@example.com>
   - Password: (at least 6 characters)
   - Name: Your Name
   - Company: Your Company Name
4. Check email for verification
5. Click verification link
6. Login!

---

### 📊 Option 2: Run Seed Script (Recommended for Testing)

**This creates 6 demo users with a complete company!**

#### Step 1: Set Up Supabase

Make sure you have:

- ✅ Created Supabase project
- ✅ Run `database/schema.sql`
- ✅ Added credentials to `.env.local`

#### Step 2: Run Seed Data

In Supabase Dashboard → SQL Editor:

```sql
-- Copy and paste the entire contents of database/seed.sql
-- This creates:
-- - Demo company
-- - 6 users with different roles
-- - 4 projects
-- - Tasks, time entries, equipment, etc.
```

#### Step 3: Create Auth Users

For each user in the seed data, you need to create them in Supabase Auth:

**In Supabase Dashboard → Authentication → Users → Add User:**

1. **Admin User**
   - Email: `admin@democonstruction.com`
   - Password: `DemoPass123!`
   - User UID: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`

2. **Project Manager**
   - Email: `manager@democonstruction.com`
   - Password: `DemoPass123!`
   - User UID: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`

3. **Site Supervisor**
   - Email: `supervisor@democonstruction.com`
   - Password: `DemoPass123!`
   - User UID: `cccccccc-cccc-cccc-cccc-cccccccccccc`

4. **Worker 1**
   - Email: `worker1@democonstruction.com`
   - Password: `DemoPass123!`
   - User UID: `dddddddd-dddd-dddd-dddd-dddddddddddd`

5. **Worker 2**
   - Email: `worker2@democonstruction.com`
   - Password: `DemoPass123!`
   - User UID: `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee`

6. **Accountant**
   - Email: `finance@democonstruction.com`
   - Password: `DemoPass123!`
   - User UID: `ffffffff-ffff-ffff-ffff-ffffffffffff`

#### Step 4: Login

Now you can login with any of these users!

---

### 🔧 Option 3: Programmatic Creation (Advanced)

Use the TypeScript script for automated user creation.

#### Step 1: Configure Supabase

Ensure `.env.local` has your credentials.

#### Step 2: Run Script

```bash
cd final
npm run dev
# Open browser console and run:
```

```typescript
import { createDemoUsers } from './scripts/createUsers';
createDemoUsers();
```

This creates all 6 users automatically!

---

## 📋 Demo User Credentials

Once created, you can login with any of these:

### Admin Access

```
Email: admin@democonstruction.com
Password: DemoPass123!
Role: Admin (Full Access)
```

### Project Manager

```
Email: manager@democonstruction.com
Password: DemoPass123!
Role: Manager (Projects & Tasks)
```

### Site Supervisor

```
Email: supervisor@democonstruction.com
Password: DemoPass123!
Role: Supervisor (Site Management)
```

### Construction Worker

```
Email: worker1@democonstruction.com
Password: DemoPass123!
Role: Worker (Time Tracking)
```

### Construction Worker #2

```
Email: worker2@democonstruction.com
Password: DemoPass123!
Role: Worker (Time Tracking)
```

### Accountant

```
Email: finance@democonstruction.com
Password: DemoPass123!
Role: Accountant (Finance Access)
```

---

## 🎯 What You Get with Seed Data

### Users

- ✅ 6 users with different roles
- ✅ Complete profiles
- ✅ Proper permissions

### Company

- ✅ Demo Construction Co
- ✅ Fully configured
- ✅ Ready for testing

### Projects

- ✅ 4 construction projects
- ✅ Different statuses
- ✅ With budgets and locations

### Data

- ✅ Tasks assigned to users
- ✅ Time entries logged
- ✅ Equipment allocated
- ✅ Safety incidents
- ✅ Notifications

---

## 🚦 Quick Start

### For Testing Now (No Setup)

```bash
# App is already running at:
http://localhost:5173

# Login with demo account:
Email: demo@example.com
Password: password
```

### For Production Setup (10 minutes)

1. Create Supabase project
2. Run `database/schema.sql`
3. Run `database/seed.sql`
4. Create auth users (see Option 2 above)
5. Add `.env.local` credentials
6. Login with any demo account!

---

## 🎨 User Roles & Permissions

| Role | Permissions | Can Do |
|------|-------------|---------|
| **Admin** | Full Access (*) | Everything |
| **Manager** | Projects, Tasks, Team | Manage projects, assign tasks |
| **Supervisor** | Projects (read), Tasks, Time | Supervise site, track time |
| **Worker** | Projects (read), Time | Log time, view tasks |
| **Accountant** | Finance, Projects (read) | Manage finances, view budgets |

---

## 🔐 Security Notes

**These are DEMO credentials!**

For production:

- ✅ Use strong, unique passwords
- ✅ Enable email verification
- ✅ Set up MFA
- ✅ Use proper role-based access
- ✅ Rotate credentials regularly

---

## 🆘 Troubleshooting

### "Email already registered"

The user already exists! Just login.

### "User not found"

Create the user through the UI or Supabase Dashboard.

### "Invalid credentials"

Check the password - it's case-sensitive!

### "Email not verified"

Check your email for the verification link.

---

## ✨ Quick Summary

**Fastest Way:**

1. Open <http://localhost:5173>
2. Login: `demo@example.com` / `password`
3. Start testing!

**Best Way for Testing:**

1. Run seed.sql in Supabase
2. Create auth users in Supabase Dashboard
3. Login with any demo account
4. Explore full features!

**Your Choice:**

- **Option 1** - Works right now ✅
- **Option 2** - Complete demo environment 🎯
- **Option 3** - Automated setup 🚀

---

**Happy Testing!** 🏗️✨

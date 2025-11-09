# Database Connection & Management

## ✅ Database Successfully Connected

**Database Type**: SQLite (better-sqlite3)  
**Database File**: `cortexbuild.db`  
**Status**: ✅ Operational with seed data

---

## 📊 Current Database State

### Summary
- **5 Users** (1 super_admin, 2 company_admin, 1 developer, 1 supervisor)
- **2 Companies** (ConstructCo, AS CLADDING AND ROOFING LTD)
- **3 Projects** (2 active, 1 planning)
- **3 Clients** 
- **4 Tasks** (1 completed, 2 in-progress, 1 todo)
- **6 AI Agents** (3 global, 3 company-specific)
- **3 Subscription Plans** (Free, Pro, Enterprise)
- **54 Tables** (Core + Financial + SDK + AI + Automation)

### Full Details
See [DATABASE_STATUS.md](./DATABASE_STATUS.md) for complete database report.

---

## 🔐 Login Credentials

All passwords are hashed with bcrypt (10 rounds).

### Super Admin
```
Email: adrian.stanca1@gmail.com
Password: parola123
```

### Company Admin
```
Email: adrian@ascladdingltd.co.uk
Password: Lolozania1
```

### Developer
```
Email: dev@constructco.com
Password: parola123
```

See [CREDENTIALS.md](./CREDENTIALS.md) for all user accounts.

---

## 🛠️ Database Admin Script

A convenient shell script for database management:

```bash
./db-admin.sh [command]
```

### Available Commands

| Command | Description |
|---------|-------------|
| `status` | Show database statistics |
| `users` | List all users |
| `projects` | List all projects |
| `tasks` | Show tasks summary |
| `agents` | List AI agents |
| `plans` | Show subscription plans |
| `tables` | List all tables |
| `schema <table>` | Show table schema |
| `query '<sql>'` | Run custom SQL query |
| `backup` | Create timestamped backup |
| `reset` | Delete and reset database |

### Examples

```bash
# View database statistics
./db-admin.sh status

# List all users
./db-admin.sh users

# Show table schema
./db-admin.sh schema users

# Run custom query
./db-admin.sh query 'SELECT * FROM users WHERE role = "super_admin";'

# Create backup
./db-admin.sh backup

# Reset database (WARNING: deletes all data)
./db-admin.sh reset
```

---

## 🔍 Manual SQLite Queries

### Connect to Database
```bash
sqlite3 cortexbuild.db
```

### Useful Queries

#### Get all users with company names
```sql
SELECT u.email, u.name, u.role, c.name as company 
FROM users u 
JOIN companies c ON u.company_id = c.id;
```

#### Count projects by company
```sql
SELECT c.name as company, COUNT(p.id) as projects 
FROM companies c 
LEFT JOIN projects p ON p.company_id = c.id 
GROUP BY c.id;
```

#### Get all active tasks
```sql
SELECT t.id, t.title, t.status, p.name as project 
FROM tasks t 
JOIN projects p ON t.project_id = p.id 
WHERE t.status IN ('todo', 'in-progress');
```

#### View subscription plans with limits
```sql
SELECT 
  name, 
  tier, 
  price, 
  json_extract(features, '$.maxFlows') as max_flows,
  json_extract(features, '$.maxRuns') as max_runs
FROM subscription_plans;
```

#### Check AI agent usage
```sql
SELECT 
  slug, 
  name, 
  status, 
  CASE WHEN company_id IS NULL THEN 'Global' ELSE company_id END as scope
FROM ai_agents;
```

---

## 🔄 Database Operations

### Reset Database
```bash
# Delete database files
rm -f cortexbuild.db cortexbuild.db-shm cortexbuild.db-wal

# Restart server (recreates with seed data)
npm run server
```

### Backup Database
```bash
# Manual backup
cp cortexbuild.db cortexbuild.db.backup

# Using admin script (creates timestamped backup)
./db-admin.sh backup
```

### Export Data
```bash
# Export to SQL
sqlite3 cortexbuild.db .dump > backup.sql

# Export table to CSV
sqlite3 cortexbuild.db << EOF
.mode csv
.headers on
.output users.csv
SELECT * FROM users;
EOF
```

### Import Data
```bash
# Import from SQL dump
sqlite3 cortexbuild.db < backup.sql
```

---

## 📋 Database Schema

### Location
- Main initialization: `server/database.ts` (initDatabase function)
- SQL schema: `server/schema.sql`
- Migrations: `server/migrations/`

### Key Features
- ✅ Foreign key constraints enabled
- ✅ WAL (Write-Ahead Logging) mode
- ✅ Multi-tenant isolation (company_id filtering)
- ✅ Indexes on frequently queried columns
- ✅ Cascade deletes for tenant data
- ✅ Password hashing with bcrypt

---

## 🔧 Troubleshooting

### Database locked error
```bash
# Close all connections
pkill -f "node.*server"

# Remove write-ahead log files
rm -f cortexbuild.db-shm cortexbuild.db-wal

# Restart server
npm run server
```

### Missing data
```bash
# Check if database exists
ls -lh cortexbuild.db

# Check table count
sqlite3 cortexbuild.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"

# Verify seed data
./db-admin.sh status
```

### Corrupted database
```bash
# Check integrity
sqlite3 cortexbuild.db "PRAGMA integrity_check;"

# If corrupted, reset
./db-admin.sh reset
npm run server
```

---

## 📚 Related Documentation

- [DATABASE_STATUS.md](./DATABASE_STATUS.md) - Complete database report
- [CREDENTIALS.md](./CREDENTIALS.md) - All login credentials
- [server/database.ts](./server/database.ts) - Database initialization code
- [server/schema.sql](./server/schema.sql) - SQL schema definitions

---

## 🚀 Next Steps

1. ✅ Database connected and operational
2. ✅ Test users created with correct passwords
3. ✅ Multi-tenant architecture validated
4. ⏳ Access application at http://localhost:3000
5. ⏳ Test subscription flows
6. ⏳ Populate SDK data through Developer Dashboard
7. ⏳ Test automation workflows and AI agents

---

**Last Updated**: October 9, 2025  
**Status**: ✅ **Database Healthy and Ready**

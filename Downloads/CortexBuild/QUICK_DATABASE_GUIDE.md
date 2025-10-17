# 🎯 Quick Database Connection Guide

## ✅ Your Database is Ready!

**File:** `cortexbuild.db` (0.59 MB)
**Tables:** 51 tables
**Users:** 3 users (1 super_admin, 1 company_admin, 1 supervisor)
**Company:** ConstructCo

---

## 🚀 3 Ways to Connect

### Method 1: SQLTools (Already Installed!) ⭐

1. **Open SQLTools:** Click the database icon in the left sidebar (or `Cmd + Shift + P` → "SQLTools: Focus")
2. **Connect:** You'll see "CortexBuild Database" listed
3. **Click** the connection to connect
4. **Explore:** Browse tables, run queries, view data

**Quick Actions:**
- Right-click table → "Show Table Records" to view data
- Right-click table → "Describe Table" to see schema
- Right-click connection → "New SQL File" to run custom queries

---

### Method 2: Interactive Terminal (NEW!)

```bash
# Run interactive SQL prompt
npm run db:connect

# You'll see:
# SQL> SELECT * FROM users;
# (results displayed in table format)

# Special commands:
# .tables - list all tables
# .schema users - show table structure
# exit - quit
```

---

### Method 3: View Statistics

```bash
# See database overview
npm run db:stats

# Shows:
# - All 51 tables with row counts
# - Users by role
# - Companies
# - Active sessions
```

---

## 📋 Common Queries

### View All Users
```sql
SELECT
    u.id,
    u.email,
    u.name,
    u.role,
    c.name as company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id;
```

### View Database Schema
```sql
SELECT
    name,
    sql
FROM sqlite_master
WHERE type='table'
ORDER BY name;
```

### Count Records in All Tables
```sql
SELECT
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'companies', COUNT(*) FROM companies;
```

---

## 🛠️ Quick Commands

| Command | Description |
|---------|-------------|
| `npm run db:connect` | Interactive SQL terminal |
| `npm run db:stats` | Database statistics |
| `npm run db:backup` | Backup database |
| `sqlite3 cortexbuild.db` | Native SQLite CLI |

---

## 📊 Your Current Data

### Tables with Data:
- ✅ `users` - 3 users
- ✅ `companies` - 1 company (ConstructCo)
- ✅ `module_categories` - 8 categories
- ✅ `widget_templates` - 4 templates

### Empty Tables Ready to Use:
- Projects, Clients, Invoices, Documents
- Time Entries, Tasks, Milestones, RFIs
- AI Agents, SDK Apps, Workflows
- And 37 more...

---

## 🎯 Next Steps

1. **Connect Now:** Open SQLTools sidebar and click "CortexBuild Database"
2. **Explore:** Browse the 51 tables
3. **Query:** Run custom SQL queries
4. **Build:** Start adding data through your app

---

**Need Help?** See `DATABASE_CONNECTION_GUIDE.md` for detailed documentation.

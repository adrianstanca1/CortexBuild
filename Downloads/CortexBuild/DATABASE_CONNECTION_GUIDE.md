# 🗄️ Database Connection Guide - CortexBuild

## Current Database

**Type:** SQLite (better-sqlite3)  
**File:** `cortexbuild.db`  
**Location:** `/Users/admin/Downloads/constructai (5)/cortexbuild.db`  
**Size:** ~604KB  

---

## 🔌 Connecting to the Database

### Method 1: VS Code SQLite Extension (Recommended)

#### Install Extension
1. Open VS Code Extensions (`Cmd + Shift + X`)
2. Search for "SQLite" by **alexcvzz**
3. Install "SQLite" or "SQLite Viewer"

#### Connect to Database
1. Open Command Palette (`Cmd + Shift + P`)
2. Type: "SQLite: Open Database"
3. Select: `cortexbuild.db`
4. Database will appear in "SQLite Explorer" sidebar

#### Query Database
1. Right-click on database in SQLite Explorer
2. Select "New Query"
3. Write your SQL queries
4. Press `Cmd + Shift + Q` to execute

---

### Method 2: Terminal SQLite CLI

```bash
# Open database in terminal
sqlite3 cortexbuild.db

# List all tables
.tables

# Show table schema
.schema users

# Query data
SELECT * FROM users;

# Exit
.quit
```

---

### Method 3: Node.js Script (Programmatic)

Create a file `scripts/db-explorer.ts`:

```typescript
import Database from 'better-sqlite3';

const db = new Database('./cortexbuild.db', { readonly: true });

// List all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  ORDER BY name
`).all();

console.log('📊 Tables:', tables);

// Query users
const users = db.prepare('SELECT * FROM users').all();
console.log('👥 Users:', users);

db.close();
```

Run with:
```bash
npx tsx scripts/db-explorer.ts
```

---

## 📊 Database Schema

### Core Tables

#### 1. **users**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,  -- 'super_admin', 'admin', 'user'
    avatar TEXT,
    company_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Roles:**
- `super_admin` - Full platform access
- `admin` - Company administrator
- `user` - Regular user

#### 2. **companies**
```sql
CREATE TABLE companies (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **sessions**
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4. **projects**
```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planning',
    company_id TEXT NOT NULL,
    client_id TEXT,
    start_date TEXT,
    end_date TEXT,
    budget REAL,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 5. **clients**
```sql
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

---

## 🔍 Common Queries

### View All Users
```sql
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    c.name as company_name,
    u.created_at
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
ORDER BY u.created_at DESC;
```

### View All Companies
```sql
SELECT 
    c.id,
    c.name,
    COUNT(u.id) as user_count,
    c.created_at
FROM companies c
LEFT JOIN users u ON u.company_id = c.id
GROUP BY c.id
ORDER BY user_count DESC;
```

### View Active Sessions
```sql
SELECT 
    s.id,
    u.email,
    u.name,
    s.expires_at,
    s.created_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > datetime('now')
ORDER BY s.created_at DESC;
```

### View Projects by Company
```sql
SELECT 
    p.id,
    p.name,
    p.status,
    c.name as company_name,
    cl.name as client_name,
    u.name as created_by_name,
    p.budget,
    p.start_date,
    p.end_date
FROM projects p
JOIN companies c ON p.company_id = c.id
LEFT JOIN clients cl ON p.client_id = cl.id
JOIN users u ON p.created_by = u.id
ORDER BY p.created_at DESC;
```

### Database Statistics
```sql
SELECT 
    'Users' as entity,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 'Companies', COUNT(*) FROM companies
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Active Sessions', COUNT(*) 
FROM sessions 
WHERE expires_at > datetime('now');
```

---

## 🛠️ Database Management

### Backup Database
```bash
# Create backup with timestamp
cp cortexbuild.db "cortexbuild-backup-$(date +%Y%m%d-%H%M%S).db"

# Or use SQLite dump
sqlite3 cortexbuild.db .dump > cortexbuild-backup.sql
```

### Restore from Backup
```bash
# From .db file
cp cortexbuild-backup-20251009-120000.db cortexbuild.db

# From .sql dump
sqlite3 cortexbuild.db < cortexbuild-backup.sql
```

### Check Database Integrity
```bash
sqlite3 cortexbuild.db "PRAGMA integrity_check;"
```

### View Database Size
```bash
ls -lh cortexbuild.db
```

### Optimize Database
```bash
sqlite3 cortexbuild.db "VACUUM;"
```

---

## 🚀 Quick Start Script

Create `scripts/db-connect.ts`:

```typescript
#!/usr/bin/env tsx
import Database from 'better-sqlite3';
import * as readline from 'readline';

const db = new Database('./cortexbuild.db');

console.log('🗄️  Connected to CortexBuild Database\n');

// Show statistics
const stats = {
  users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
  companies: db.prepare('SELECT COUNT(*) as count FROM companies').get(),
  projects: db.prepare('SELECT COUNT(*) as count FROM projects').get(),
  sessions: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now")').get(),
};

console.log('📊 Database Statistics:');
console.log(`   Users: ${stats.users.count}`);
console.log(`   Companies: ${stats.companies.count}`);
console.log(`   Projects: ${stats.projects.count}`);
console.log(`   Active Sessions: ${stats.sessions.count}\n`);

// Interactive SQL prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'SQL> '
});

console.log('Type SQL queries (or "exit" to quit):\n');
rl.prompt();

rl.on('line', (line) => {
  const query = line.trim();
  
  if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
    console.log('👋 Goodbye!');
    db.close();
    rl.close();
    process.exit(0);
  }
  
  if (!query) {
    rl.prompt();
    return;
  }
  
  try {
    if (query.toLowerCase().startsWith('select')) {
      const results = db.prepare(query).all();
      console.table(results);
    } else {
      const result = db.prepare(query).run();
      console.log('✅ Query executed:', result);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
  
  rl.prompt();
});

rl.on('close', () => {
  db.close();
  process.exit(0);
});
```

Make it executable and add to package.json:
```json
{
  "scripts": {
    "db:connect": "tsx scripts/db-connect.ts",
    "db:backup": "cp cortexbuild.db \"cortexbuild-backup-$(date +%Y%m%d-%H%M%S).db\"",
    "db:stats": "tsx scripts/db-stats.ts"
  }
}
```

Run:
```bash
npm run db:connect
```

---

## 🔐 Security Notes

1. **Never commit** `cortexbuild.db` to Git
2. Add to `.gitignore`:
   ```
   *.db
   *.db-shm
   *.db-wal
   ```
3. Use environment variables for sensitive data
4. Regular backups before schema changes
5. Use prepared statements (already implemented)

---

## 📱 API Endpoints Using Database

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Companies
- `GET /api/admin/companies` - List companies
- `POST /api/admin/companies` - Create company
- `PUT /api/admin/companies/:id` - Update company
- `DELETE /api/admin/companies/:id` - Delete company

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

---

## 🧪 Testing Database

Create `scripts/db-seed.ts` for test data:

```typescript
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('./cortexbuild.db');

async function seed() {
  console.log('🌱 Seeding database...');
  
  // Create test company
  const companyId = uuidv4();
  db.prepare('INSERT OR IGNORE INTO companies (id, name) VALUES (?, ?)')
    .run(companyId, 'Test Company');
  
  // Create test user
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash('password123', 10);
  
  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password_hash, name, role, company_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, 'test@example.com', passwordHash, 'Test User', 'admin', companyId);
  
  console.log('✅ Seed data created');
  console.log('📧 Email: test@example.com');
  console.log('🔑 Password: password123');
  
  db.close();
}

seed();
```

---

## 📖 Learn More

- [Better SQLite3 Docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [SQLite SQL Syntax](https://www.sqlite.org/lang.html)
- [VS Code SQLite Extension](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite)

---

*Database initialized and ready to use!* 🚀

import Database from 'better-sqlite3';

const DB_PATH = process.env.SQLITE_PATH || './cortexbuild.db';

function run(db: Database.Database, sql: string) {
  db.exec(sql);
}

function main() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Core entities for local parity
  run(db, `CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  );`);

  run(db, `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
    is_active INTEGER DEFAULT 1,
    avatar TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  );`);

  run(db, `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    budget REAL,
    spent REAL,
    project_manager_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  );`);

  run(db, `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT,
    priority TEXT,
    assigned_to TEXT,
    due_date TEXT,
    completed_at TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  );`);

  run(db, `CREATE TABLE IF NOT EXISTS rfis (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    rfi_number TEXT,
    version INTEGER,
    subject TEXT,
    question TEXT,
    status TEXT,
    assignee TEXT,
    due_date TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  );`);

  run(db, `CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    uploaded_at TEXT DEFAULT (datetime('now'))
  );`);

  console.log('✅ SQLite core schema ensured at', DB_PATH);
}

main();



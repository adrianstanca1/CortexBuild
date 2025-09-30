import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolveDatabaseFile = () => {
  const custom = process.env.DATABASE_FILE;
  if (custom && custom.trim().length > 0) {
    return path.resolve(custom);
  }
  return path.join(__dirname, 'data', 'app.db');
};

export const PLATFORM_COMPANY_ID = 'platform-root';

const databaseFile = resolveDatabaseFile();
const databaseDirectory = path.dirname(databaseFile);

let dbPromise;

const getDb = async () => {
  if (!dbPromise) {
    await fs.mkdir(databaseDirectory, { recursive: true });
    dbPromise = open({
      filename: databaseFile,
      driver: sqlite3.Database,
    }).then(async (db) => {
      await db.exec('PRAGMA foreign_keys = ON;');
      return db;
    });
  }
  return dbPromise;
};

const ensureColumn = async (db, tableName, columnName, columnDefinition) => {
  const existingColumns = await db.all(`PRAGMA table_info(${tableName})`);
  if (!existingColumns.some((column) => column.name === columnName)) {
    await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
  }
};

export const initialiseSchema = async () => {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      email TEXT,
      phone TEXT,
      industry TEXT,
      status TEXT DEFAULT 'ACTIVE',
      subscription_plan TEXT DEFAULT 'PROFESSIONAL',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      budget REAL DEFAULT 0,
      spent REAL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      lat REAL,
      lng REAL,
      address TEXT,
      client_id TEXT,
      manager_id TEXT,
      progress REAL DEFAULT 0,
      actual_cost REAL DEFAULT 0,
      project_type TEXT,
      work_classification TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      contact_person TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      billing_address TEXT,
      payment_terms TEXT DEFAULT 'Net 30',
      is_active INTEGER DEFAULT 1,
      street TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      country TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      project_id TEXT,
      invoice_number TEXT NOT NULL,
      issue_date TEXT,
      due_date TEXT,
      status TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      retention_rate REAL DEFAULT 0,
      retention_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS invoice_line_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      description TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invoice_payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      reference TEXT,
      notes TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      refresh_token TEXT NOT NULL UNIQUE,
      provider TEXT DEFAULT 'local',
      expires_at TEXT NOT NULL,
      refresh_expires_at TEXT NOT NULL,
      active_company_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (active_company_id) REFERENCES companies(id) ON DELETE SET NULL
    );
  `);

  await ensureColumn(db, 'users', 'username', 'username TEXT');
  await ensureColumn(db, 'users', 'auth_provider', "auth_provider TEXT DEFAULT 'local'");
  await ensureColumn(db, 'users', 'is_platform_owner', 'is_platform_owner INTEGER DEFAULT 0');
  await ensureColumn(db, 'companies', 'industry', 'industry TEXT');
  await ensureColumn(db, 'companies', 'status', "status TEXT DEFAULT 'ACTIVE'");
  await ensureColumn(db, 'companies', 'subscription_plan', "subscription_plan TEXT DEFAULT 'PROFESSIONAL'");
  await ensureColumn(db, 'auth_sessions', 'active_company_id', 'active_company_id TEXT');
  await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id)');
  await db.exec('CREATE INDEX IF NOT EXISTS idx_auth_sessions_active_company ON auth_sessions(active_company_id)');
};

export const getDatabase = getDb;
export const databaseFilePath = databaseFile;

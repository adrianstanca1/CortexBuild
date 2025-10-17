/**
 * Initialize ALL database tables for CortexBuild Platform
 * This script runs all migrations to create the complete database schema
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'cortexbuild.db');

console.log('🚀 Initializing CortexBuild Database with ALL tables...');
console.log(`📁 Database path: ${DB_PATH}`);

// Delete old database to start fresh
if (fs.existsSync(DB_PATH)) {
  console.log('🗑️  Removing old database...');
  fs.unlinkSync(DB_PATH);
}

// Create database connection
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

try {
  // 1. Run main schema
  console.log('\n📋 Step 1: Creating main schema...');
  const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schemaSQL);
  console.log('✅ Main schema created');

  // 2. Run modular system migration
  console.log('\n📋 Step 2: Adding modular system tables...');
  const modularSQL = fs.readFileSync(path.join(__dirname, 'migrations', 'add-modular-system.sql'), 'utf-8');
  db.exec(modularSQL);
  console.log('✅ Modular system tables created');

  // 3. Run SDK developer environment migration
  console.log('\n📋 Step 3: Adding SDK developer environment tables...');
  const sdkSQL = fs.readFileSync(path.join(__dirname, 'migrations', 'add-sdk-developer-environment.sql'), 'utf-8');
  db.exec(sdkSQL);
  console.log('✅ SDK developer environment tables created');

  // 4. Seed initial data
  console.log('\n📋 Step 4: Seeding initial data...');

  // Create company
  db.prepare('INSERT INTO companies (id, name) VALUES (?, ?)').run('company-1', 'ConstructCo');

  // Create users with hashed passwords
  const users = [
    {
      id: 'user-1',
      email: 'adrian.stanca1@gmail.com',
      password: 'password123',
      name: 'Adrian Stanca',
      role: 'super_admin',
      companyId: 'company-1'
    },
    {
      id: 'user-2',
      email: 'casey@constructco.com',
      password: 'password123',
      name: 'Casey Johnson',
      role: 'company_admin',
      companyId: 'company-1'
    },
    {
      id: 'user-3',
      email: 'mike@constructco.com',
      password: 'password123',
      name: 'Mike Wilson',
      role: 'supervisor',
      companyId: 'company-1'
    }
  ];

  for (const user of users) {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(user.id, user.email, passwordHash, user.name, user.role, user.companyId);
  }

  console.log('✅ Initial users seeded');

  // Get table count
  const tables = db.prepare(`
    SELECT COUNT(*) as count
    FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).get() as { count: number };

  // List all tables
  const tableList = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all() as { name: string }[];

  console.log(`\n✨ Database initialization complete!`);
  console.log(`📊 Total tables created: ${tables.count}`);
  console.log(`\n📋 Tables created:`);
  tableList.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table.name}`);
  });
  console.log(`\n🎯 Your CortexBuild database is ready with:`);
  console.log(`   - Core tables (users, companies, sessions)`);
  console.log(`   - Project management tables`);
  console.log(`   - Financial tables`);
  console.log(`   - Developer platform tables`);
  console.log(`   - Modular system tables`);
  console.log(`   - SDK developer environment tables`);
  console.log(`   - AI agents & workflows tables`);
  console.log(`\n🚀 Ready to start the server!`);

} catch (error) {
  console.error('❌ Error initializing database:', error);
  process.exit(1);
} finally {
  db.close();
}


/**
 * Check database state
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'cortexbuild.db');
const db = new Database(dbPath);

console.log('📊 Checking database state...\n');

// Check companies
console.log('Companies:');
const companies = db.prepare('SELECT * FROM companies').all();
console.log(companies);
console.log('');

// Check users
console.log('Users:');
const users = db.prepare('SELECT id, email, name, role, company_id FROM users').all();
console.log(users);
console.log('');

db.close();


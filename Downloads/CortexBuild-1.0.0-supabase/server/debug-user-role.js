import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'cortexbuild.db');
const db = new Database(dbPath);
console.log('📂 Database path:', dbPath);
console.log('');

console.log('🔍 Debugging user roles...\n');

// First, check what tables exist
console.log('📋 Available tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => console.log(`  - ${table.name}`));
console.log('');

// Get all users
const users = db.prepare('SELECT id, email, name, role, company_id FROM users').all();

console.log('📊 All users in database:\n');
users.forEach(user => {
    console.log(`User: ${user.email}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Company ID: ${user.company_id}`);
    console.log('');
});

// Specifically check dev@constructco.com
console.log('🎯 Checking dev@constructco.com specifically:\n');
const devUser = db.prepare('SELECT * FROM users WHERE email = ?').get('dev@constructco.com');

if (devUser) {
    console.log('✅ User found!');
    console.log(JSON.stringify(devUser, null, 2));
} else {
    console.log('❌ User NOT found!');
}

db.close();


/**
 * Update user passwords in database
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'cortexbuild.db');
const db = new Database(dbPath);

console.log('🔐 Updating user passwords...\n');

// Users to update
const users = [
    {
        email: 'adrian.stanca1@gmail.com',
        password: 'parola123',
        role: 'super_admin',
        name: 'Adrian Stanca'
    },
    {
        email: 'adrian@ascladdingltd.co.uk',
        password: 'lolozania1',
        role: 'company_admin',
        name: 'Adrian ASC'
    },
    {
        email: 'adrian.stanca1@icloud.com',
        password: 'password123',
        role: 'developer',
        name: 'Adrian Stanca Dev'
    }
];

// Update each user
for (const user of users) {
    try {
        // Generate bcrypt hash
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password, salt);
        
        // Update in database
        const result = db.prepare(`
            UPDATE users 
            SET password_hash = ?
            WHERE email = ?
        `).run(hash, user.email);
        
        if (result.changes > 0) {
            console.log(`✅ Updated: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password: ${user.password}`);
            console.log(`   Hash: ${hash.substring(0, 30)}...`);
            console.log('');
        } else {
            console.log(`❌ User not found: ${user.email}`);
            console.log('');
        }
    } catch (error) {
        console.error(`❌ Error updating ${user.email}:`, error.message);
        console.log('');
    }
}

// Verify updates
console.log('📊 Verifying all users:\n');
const allUsers = db.prepare(`
    SELECT id, email, role, name 
    FROM users 
    ORDER BY role DESC
`).all();

for (const user of allUsers) {
    console.log(`${user.role.padEnd(15)} | ${user.email.padEnd(35)} | ${user.name}`);
}

db.close();

console.log('\n✅ Password update complete!\n');
console.log('🔐 Login credentials:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Super Admin:');
console.log('  Email:    adrian.stanca1@gmail.com');
console.log('  Password: parola123');
console.log('');
console.log('Company Admin:');
console.log('  Email:    adrian@ascladdingltd.co.uk');
console.log('  Password: lolozania1');
console.log('');
console.log('Developer:');
console.log('  Email:    adrian.stanca1@icloud.com');
console.log('  Password: password123');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');


/**
 * Update test users with correct passwords
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open database
const dbPath = join(__dirname, '..', 'cortexbuild.db');
const db = new Database(dbPath);

console.log('📊 Updating test users...\n');

async function updateUsers() {
    try {
        // Generate hashes
        const hash1 = await bcrypt.hash('parola123', 10);
        const hash2 = await bcrypt.hash('lolozania1', 10);
        const hash3 = await bcrypt.hash('password123', 10);
        
        // Update User 1: adrian.stanca1@gmail.com
        console.log('Updating adrian.stanca1@gmail.com...');
        db.prepare(`
            UPDATE users 
            SET password_hash = ?, 
                role = 'super_admin',
                name = 'Adrian Stanca'
            WHERE email = 'adrian.stanca1@gmail.com'
        `).run(hash1);
        console.log('✅ Updated adrian.stanca1@gmail.com (password: parola123)\n');
        
        // Update User 2: adrian@ascladdingltd.co.uk
        console.log('Updating adrian@ascladdingltd.co.uk...');
        db.prepare(`
            UPDATE users 
            SET password_hash = ?,
                role = 'admin',
                name = 'Adrian ASC'
            WHERE email = 'adrian@ascladdingltd.co.uk'
        `).run(hash2);
        console.log('✅ Updated adrian@ascladdingltd.co.uk (password: lolozania1)\n');
        
        // Update or Insert User 3: dev@constructco.com
        console.log('Updating dev@constructco.com...');
        const existingDev = db.prepare('SELECT * FROM users WHERE email = ?').get('dev@constructco.com');
        
        if (existingDev) {
            db.prepare(`
                UPDATE users 
                SET password_hash = ?,
                    role = 'developer',
                    name = 'Developer User'
                WHERE email = 'dev@constructco.com'
            `).run(hash3);
            console.log('✅ Updated dev@constructco.com (password: password123)\n');
        } else {
            db.prepare(`
                INSERT INTO users (id, email, password_hash, name, role, company_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run('user-dev', 'dev@constructco.com', hash3, 'Developer User', 'developer', 'company-1');
            console.log('✅ Created dev@constructco.com (password: password123)\n');
        }
        
        // Verify users
        console.log('📋 Verifying users:\n');
        const users = db.prepare(`
            SELECT email, name, role, company_id 
            FROM users 
            WHERE email IN ('adrian.stanca1@gmail.com', 'adrian@ascladdingltd.co.uk', 'dev@constructco.com')
        `).all();
        
        users.forEach(user => {
            console.log(`✅ ${user.email}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Company: ${user.company_id}`);
            console.log('');
        });
        
        console.log('\n🎉 All test users updated successfully!\n');
        console.log('You can now login with:');
        console.log('1. adrian.stanca1@gmail.com / parola123 (Super Admin)');
        console.log('2. adrian@ascladdingltd.co.uk / lolozania1 (Admin)');
        console.log('3. dev@constructco.com / password123 (Developer)');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

updateUsers();


/**
 * Add test users to the database
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open database
const dbPath = join(__dirname, '..', 'cortexbuild.db');
const db = new Database(dbPath);

console.log('📊 Adding test users to database...\n');

try {
    // Read SQL file
    const sqlPath = join(__dirname, 'add-test-users.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed.length > 0 && !trimmed.startsWith('--')) {
            try {
                db.exec(trimmed);
                console.log('✅ Executed:', trimmed.substring(0, 50) + '...');
            } catch (err) {
                console.error('❌ Error executing statement:', err.message);
                console.error('Statement:', trimmed.substring(0, 100));
            }
        }
    }
    
    console.log('\n✅ Test users added successfully!\n');
    
    // Verify users
    console.log('📋 Verifying users in database:\n');
    const users = db.prepare('SELECT id, email, name, role, company_id FROM users').all();
    
    console.log('Total users:', users.length);
    console.log('');
    
    users.forEach(user => {
        console.log(`- ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Company: ${user.company_id}`);
        console.log('');
    });
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}


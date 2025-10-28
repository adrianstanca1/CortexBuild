/**
 * Setup users with their specific dashboard types
 * Each user represents their class and has the appropriate dashboard
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

console.log('📊 Setting up dashboard users...\n');

async function setupUsers() {
    try {
        // Generate password hashes
        const hash1 = await bcrypt.hash('password123', 10);  // adrian.stanca1@gmail.com - super_admin
        const hash2 = await bcrypt.hash('lolozania1', 10);   // adrian@ascladdingltd.co.uk - company_admin
        const hash3 = await bcrypt.hash('parola123', 10);    // dev@constructco.com - developer
        
        // Ensure companies exist
        db.prepare(`INSERT OR IGNORE INTO companies (id, name) VALUES (?, ?)`).run('company-1', 'ConstructCo');
        db.prepare(`INSERT OR IGNORE INTO companies (id, name) VALUES (?, ?)`).run('company-asc', 'ASC Cladding Ltd');
        
        console.log('✅ Companies created\n');
        
        // User 1: Super Admin with Developer Dashboard access
        // This user has super_admin role but will use Developer Dashboard
        console.log('Setting up User 1: Super Admin (Developer Dashboard)');
        db.prepare(`
            UPDATE users
            SET password_hash = ?, name = ?, role = ?, company_id = ?
            WHERE email = ?
        `).run(
            hash1,
            'Adrian Stanca',
            'super_admin',
            'company-1',
            'adrian.stanca1@gmail.com'
        );
        console.log('✅ adrian.stanca1@gmail.com');
        console.log('   Password: password123');
        console.log('   Role: super_admin');
        console.log('   Dashboard: Developer Dashboard (with all features)');
        console.log('   Company: ConstructCo\n');

        // User 2: Company Admin with Company Admin Dashboard
        console.log('Setting up User 2: Company Admin (Company Admin Dashboard)');
        db.prepare(`
            UPDATE users
            SET password_hash = ?, name = ?, role = ?, company_id = ?
            WHERE email = ?
        `).run(
            hash2,
            'Adrian ASC',
            'company_admin',
            'company-2',
            'adrian@ascladdingltd.co.uk'
        );
        console.log('✅ adrian@ascladdingltd.co.uk');
        console.log('   Password: lolozania1');
        console.log('   Role: company_admin');
        console.log('   Dashboard: Company Admin Dashboard');
        console.log('   Company: AS CLADDING AND ROOFING LTD\n');

        // User 3: Developer with Developer Dashboard
        console.log('Setting up User 3: Developer (Developer Dashboard)');
        db.prepare(`
            UPDATE users
            SET password_hash = ?, name = ?, role = ?, company_id = ?
            WHERE email = ?
        `).run(
            hash3,
            'Developer User',
            'developer',
            'company-1',
            'dev@constructco.com'
        );
        console.log('✅ dev@constructco.com');
        console.log('   Password: parola123');
        console.log('   Role: developer');
        console.log('   Dashboard: Developer Console');
        console.log('   Company: ConstructCo\n');
        
        // Verify setup
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📋 Dashboard User Classes:\n');
        
        const users = db.prepare(`
            SELECT u.email, u.name, u.role, c.name as company_name
            FROM users u
            JOIN companies c ON u.company_id = c.id
            WHERE u.email IN (?, ?, ?)
            ORDER BY 
                CASE u.role
                    WHEN 'super_admin' THEN 1
                    WHEN 'company_admin' THEN 2
                    WHEN 'developer' THEN 3
                END
        `).all(
            'adrian.stanca1@gmail.com',
            'adrian@ascladdingltd.co.uk',
            'dev@constructco.com'
        );
        
        users.forEach((user, index) => {
            const dashboardType = 
                user.role === 'super_admin' ? 'Developer Dashboard (Super Admin)' :
                user.role === 'company_admin' ? 'Company Admin Dashboard' :
                user.role === 'developer' ? 'Developer Dashboard' :
                'Unknown';
            
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Company: ${user.company_name}`);
            console.log(`   Dashboard: ${dashboardType}`);
            console.log('');
        });
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🎉 All dashboard users configured successfully!\n');
        console.log('Login Credentials:\n');
        console.log('1. Super Admin (Developer Dashboard):');
        console.log('   adrian.stanca1@gmail.com / password123\n');
        console.log('2. Company Admin (Company Admin Dashboard):');
        console.log('   adrian@ascladdingltd.co.uk / lolozania1\n');
        console.log('3. Developer (Developer Console):');
        console.log('   dev@constructco.com / parola123\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

setupUsers();


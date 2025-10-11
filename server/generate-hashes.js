/**
 * Generate password hashes for test users
 */

import bcrypt from 'bcryptjs';

async function generateHashes() {
    console.log('Generating password hashes...\n');
    
    // User 1: adrian.stanca1@gmail.com - parola123
    const hash1 = await bcrypt.hash('parola123', 10);
    console.log('User 1: adrian.stanca1@gmail.com');
    console.log('Password: parola123');
    console.log('Hash:', hash1);
    console.log('');
    
    // User 2: adrian@ascladdingltd.co.uk - lolozania1
    const hash2 = await bcrypt.hash('lolozania1', 10);
    console.log('User 2: adrian@ascladdingltd.co.uk');
    console.log('Password: lolozania1');
    console.log('Hash:', hash2);
    console.log('');
    
    // User 3: dev@constructco.com - password123
    const hash3 = await bcrypt.hash('password123', 10);
    console.log('User 3: dev@constructco.com');
    console.log('Password: password123');
    console.log('Hash:', hash3);
    console.log('');
    
    // Generate SQL
    console.log('\n=== SQL INSERT STATEMENTS ===\n');
    console.log(`-- User 1: Super Admin`);
    console.log(`INSERT OR REPLACE INTO users (id, email, password_hash, name, role, company_id) VALUES`);
    console.log(`('user-superadmin', 'adrian.stanca1@gmail.com', '${hash1}', 'Adrian Stanca', 'super_admin', 'company-1');\n`);
    
    console.log(`-- User 2: Admin`);
    console.log(`INSERT OR REPLACE INTO users (id, email, password_hash, name, role, company_id) VALUES`);
    console.log(`('user-admin-asc', 'adrian@ascladdingltd.co.uk', '${hash2}', 'Adrian ASC', 'admin', 'company-asc');\n`);
    
    console.log(`-- User 3: Developer`);
    console.log(`INSERT OR REPLACE INTO users (id, email, password_hash, name, role, company_id) VALUES`);
    console.log(`('user-dev', 'dev@constructco.com', '${hash3}', 'Developer User', 'developer', 'company-1');\n`);
}

generateHashes().catch(console.error);


/**
 * Generate password hashes for initial users
 * Run: npx tsx scripts/generate-password-hashes.ts
 */

import bcrypt from 'bcryptjs';

const passwords = [
    { email: 'adrian.stanca1@gmail.com', password: 'Cumparavinde1' },
    { email: 'casey@constructco.com', password: 'password123' },
    { email: 'mike@constructco.com', password: 'password123' }
];

async function generateHashes() {
    console.log('🔐 Generating password hashes...\n');

    for (const { email, password } of passwords) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Hash: ${hash}`);
        console.log('---\n');
    }

    console.log('✅ Done! Copy these hashes to sql/init.sql');
}

generateHashes();


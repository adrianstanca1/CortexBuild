/**
 * Create Test User in Supabase
 * Run with: node scripts/create-test-user.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTestUser() {
    console.log('🔧 Creating test user in Supabase...\n');

    const testUser = {
        email: 'super@admin.com',
        password_hash: '$2b$10$8I9oTo5AMMpX9qBhgNFQtO2oit9WAN/DKacElesviT972b3MCQgW.', // admin123
        name: 'Super Admin',
        role: 'super_admin'
    };

    try {
        // First, check if user already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', testUser.email)
            .single();

        if (existing) {
            console.log('ℹ️  User already exists:', existing.email);
            console.log('   ID:', existing.id);
            
            // Update the password hash
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: testUser.password_hash })
                .eq('email', testUser.email);

            if (updateError) {
                console.error('❌ Failed to update password:', updateError.message);
            } else {
                console.log('✅ Password updated successfully!');
            }
        } else {
            // Create new user
            const { data, error } = await supabase
                .from('users')
                .insert([testUser])
                .select()
                .single();

            if (error) {
                console.error('❌ Failed to create user:', error.message);
                console.error('   Details:', error);
                process.exit(1);
            }

            console.log('✅ Test user created successfully!');
            console.log('   ID:', data.id);
            console.log('   Email:', data.email);
            console.log('   Name:', data.name);
            console.log('   Role:', data.role);
        }

        console.log('\n📝 Login Credentials:');
        console.log('   Email: super@admin.com');
        console.log('   Password: admin123');
        console.log('\n🚀 You can now login at:');
        console.log('   https://constructai-5-6bhvtyh6d-adrian-b7e84541.vercel.app');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        process.exit(1);
    }
}

createTestUser();


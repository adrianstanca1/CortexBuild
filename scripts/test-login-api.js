/**
 * Test Login API Locally
 * Run with: node scripts/test-login-api.js
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Testing login API logic...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'SET' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testLogin() {
    const email = 'super@admin.com';
    const password = 'test123';

    console.log('\n📝 Testing login for:', email);
    console.log('Password:', password);

    // Get user by email
    console.log('\n🔍 Querying database...');
    const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .single();

    if (userError) {
        console.error('❌ Database error:', userError);
        return;
    }

    if (!dbUser) {
        console.error('❌ User not found');
        return;
    }

    console.log('✅ User found:', dbUser.email);
    console.log('User ID:', dbUser.id);
    console.log('Password hash:', dbUser.password_hash);

    // Verify password
    console.log('\n🔐 Verifying password...');
    const isValid = await bcrypt.compare(password, dbUser.password_hash);
    console.log('Password valid:', isValid);

    if (isValid) {
        console.log('\n✅ LOGIN SUCCESSFUL!');
    } else {
        console.log('\n❌ LOGIN FAILED: Invalid password');
    }
}

testLogin().catch(console.error);


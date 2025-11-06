/* eslint-disable no-unused-vars, no-undef */
/**
 * Check Users Table Schema in Supabase
 * Run with: node scripts/check-users-table.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkUsersTable() {
    console.log('🔍 Checking users table...\n');

    try {
        // Try to get any existing users
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error querying users table:', error.message);
            console.error('   Code:', error.code);
            console.error('   Details:', error.details);

            if (error.code === '42P01') {
                console.log('\n💡 The users table does not exist!');
                console.log('   You need to run the migration first:');
                console.log('   1. Go to Supabase Dashboard > SQL Editor');
                console.log('   2. Run the contents of supabase/COMPLETE_SCHEMA.sql');
            }
        } else {
            console.log('✅ Users table exists!');
            if (data && data.length > 0) {
                console.log('\n📊 Sample user data:');
                console.log(JSON.stringify(data[0], null, 2));
                console.log('\n📝 Available columns:');
                console.log(Object.keys(data[0]).join(', '));
            } else {
                console.log('   (No users found in table)');
                console.log('\n💡 Try inserting a minimal user to see what columns are required');
            }
        }

        // Try to get table info from information_schema
        console.log('\n🔍 Checking table schema from information_schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .rpc('get_table_columns', { table_name: 'users' })
            .catch(() => ({ data: null, error: { message: 'RPC not available' } }));

        if (schemaError) {
            console.log('   (Could not query schema info)');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkUsersTable();


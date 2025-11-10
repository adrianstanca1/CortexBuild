/**
 * Check Supabase Schema
 * Usage: node check-schema.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('🔍 Checking Supabase Schema\n');
    console.log('🔗 Supabase URL:', supabaseUrl);
    console.log('\n📋 Checking tables...\n');

    try {
        // Try to query users table to see what columns exist
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error querying users table:', error);
            console.log('\n💡 The users table might not exist yet.');
            console.log('   Run the migration: 001_multi_tenant_schema.sql first');
        } else {
            console.log('✅ Users table exists!');
            if (data && data.length > 0) {
                console.log('\n📊 Sample user record:');
                console.log(JSON.stringify(data[0], null, 2));
                console.log('\n📝 Available columns:');
                console.log(Object.keys(data[0]).join(', '));
            } else {
                console.log('\n⚠️  Users table is empty');
            }
        }

        // Check companies table
        const { data: companies, error: compError } = await supabase
            .from('companies')
            .select('*')
            .limit(1);

        if (compError) {
            console.error('\n❌ Error querying companies table:', compError);
        } else {
            console.log('\n✅ Companies table exists!');
            if (companies && companies.length > 0) {
                console.log('   Sample company:', companies[0]);
            } else {
                console.log('   Table is empty');
            }
        }

    } catch (error) {
        console.error('\n❌ Schema check failed:', error);
    }
}

await checkSchema();

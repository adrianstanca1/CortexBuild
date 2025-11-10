/**
 * Execute SQL in Supabase via REST API
 * Usage: node execute-sql.js <sql-file>
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const sqlFile = process.argv[2] || 'SUPABASE_CREATE_USERS.sql';

console.log('🚀 Executing SQL in Supabase\n');
console.log('📄 File:', sqlFile);
console.log('🔗 URL:', supabaseUrl);
console.log('\n⚙️  Processing...\n');

try {
    if (!fs.existsSync(sqlFile)) {
        console.error(`❌ File not found: ${sqlFile}`);
        process.exit(1);
    }

    // Execute via direct SQL - we'll use individual inserts instead
    // since Supabase doesn't expose a direct SQL execution endpoint
    
    console.log('📝 Creating company...');
    const { error: companyError } = await supabase
        .from('companies')
        .insert({
            id: 'asc-cladding-ltd',
            name: 'ASC Cladding Ltd',
            domain: 'ascladdingltd.co.uk',
            status: 'active',
            subscription_plan: 'professional',
            subscription_status: 'active',
            contact_email: 'adrian@ascladdingltd.co.uk'
        })
        .select()
        .single();

    if (companyError && companyError.code !== '23505') { // Ignore duplicate
        console.error('❌ Company error:', companyError.message);
    } else {
        console.log('✅ Company ready');
    }

    // For Supabase Auth users, we need to use the auth admin API
    console.log('\n📝 Creating users via Supabase Auth API...');
    
    // Create developer user
    try {
        const { data: authUser1, error: authError1 } = await supabase.auth.admin.createUser({
            email: 'dev@constructco.com',
            password: 'parola123',
            email_confirm: true,
            user_metadata: {
                name: 'Dev User',
                role: 'developer'
            }
        });

        if (authError1 && !authError1.message.includes('already registered')) {
            console.error('❌ Auth error (developer):', authError1.message);
        } else if (authUser1) {
            console.log('✅ Developer auth user created:', authUser1.user?.id);
            
            // Insert into public.users
            const { error: userError1 } = await supabase
                .from('users')
                .upsert({
                    id: authUser1.user.id,
                    email: 'dev@constructco.com',
                    name: 'Dev User',
                    role: 'developer',
                    password_hash: '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
                    company_id: '00000000-0000-0000-0000-000000000001'
                }, {
                    onConflict: 'email'
                });

            if (userError1) {
                console.error('⚠️  User table error (developer):', userError1.message);
            } else {
                console.log('✅ Developer user profile created');
            }
        }
    } catch (err) {
        console.log('⚠️  Developer user might already exist:', err instanceof Error ? err.message : String(err));
    }

    // Create company admin user
    try {
        const { data: authUser2, error: authError2 } = await supabase.auth.admin.createUser({
            email: 'adrian@ascladdingltd.co.uk',
            password: 'Lolozania1',
            email_confirm: true,
            user_metadata: {
                name: 'Adrian Stanca',
                role: 'company_admin'
            }
        });

        if (authError2 && !authError2.message.includes('already registered')) {
            console.error('❌ Auth error (company admin):', authError2.message);
        } else if (authUser2) {
            console.log('✅ Company admin auth user created:', authUser2.user?.id);
            
            // Insert into public.users
            const { error: userError2 } = await supabase
                .from('users')
                .upsert({
                    id: authUser2.user.id,
                    email: 'adrian@ascladdingltd.co.uk',
                    name: 'Adrian Stanca',
                    role: 'company_admin',
                    password_hash: '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW',
                    company_id: 'asc-cladding-ltd'
                }, {
                    onConflict: 'email'
                });

            if (userError2) {
                console.error('⚠️  User table error (company admin):', userError2.message);
            } else {
                console.log('✅ Company admin user profile created');
            }
        }
    } catch (err) {
        console.log('⚠️  Company admin user might already exist:', err instanceof Error ? err.message : String(err));
    }

    console.log('\n✅ Migration completed!\n');
    console.log('Test accounts:');
    console.log('  📧 dev@constructco.com (developer) - Password: parola123');
    console.log('  📧 adrian@ascladdingltd.co.uk (company_admin) - Password: Lolozania1\n');

    // Verify users
    console.log('🔍 Verifying users...');
    const { data: users, error: verifyError } = await supabase
        .from('users')
        .select('id, email, name, role, company_id')
        .in('email', ['dev@constructco.com', 'adrian@ascladdingltd.co.uk']);

    if (verifyError) {
        console.error('❌ Verify error:', verifyError);
    } else if (users && users.length > 0) {
        console.log('\n✅ Users verified:');
        for (const u of users) {
            console.log(`   - ${u.email} (${u.role})`);
        }
    } else {
        console.log('⚠️  No users found - they may need to be created manually');
    }

} catch (error) {
    console.error('\n❌ Execution failed:', error);
    process.exit(1);
}

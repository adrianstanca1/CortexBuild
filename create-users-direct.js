/**
 * Create test users in Supabase (Direct Insert)
 * Usage: node create-users-direct.js
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
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

console.log('🚀 Creating Test Users in Supabase\n');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('\n⚙️  Processing...\n');

async function createUsers() {
    try {
        // Step 1: Check/Create company
        console.log('📝 Step 1: Ensuring company exists...');
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('id', 'asc-cladding-ltd')
            .single();

        if (!existingCompany) {
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
                });

            if (companyError) {
                console.error('❌ Company creation error:', companyError);
                throw companyError;
            }
            console.log('✅ Company created: ASC Cladding Ltd');
        } else {
            console.log('✅ Company exists: ASC Cladding Ltd');
        }

        // Step 2: Create/Update developer user
        console.log('\n📝 Step 2: Creating developer user...');
        
        // Check if user exists
        const { data: existingDev } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'dev@constructco.com')
            .single();

        if (existingDev) {
            // Update existing user
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: 'Dev User',
                    role: 'developer',
                    password_hash: '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
                    company_id: '00000000-0000-0000-0000-000000000001',
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingDev.id);

            if (updateError) {
                console.error('❌ Developer user update error:', updateError);
            } else {
                console.log('✅ Developer user updated');
            }
        } else {
            // Create new user
            const { error: devError } = await supabase
                .from('users')
                .insert({
                    id: uuidv4(),
                    email: 'dev@constructco.com',
                    name: 'Dev User',
                    role: 'developer',
                    password_hash: '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
                    company_id: '00000000-0000-0000-0000-000000000001',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (devError) {
                console.error('❌ Developer user creation error:', devError);
                throw devError;
            }
            console.log('✅ Developer user created');
        }

        // Step 3: Create/Update company admin user
        console.log('\n📝 Step 3: Creating company admin user...');
        
        const { data: existingAdmin } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'adrian@ascladdingltd.co.uk')
            .single();

        if (existingAdmin) {
            // Update existing user
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: 'Adrian Stanca',
                    role: 'company_admin',
                    password_hash: '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW',
                    company_id: 'asc-cladding-ltd',
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingAdmin.id);

            if (updateError) {
                console.error('❌ Company admin user update error:', updateError);
            } else {
                console.log('✅ Company admin user updated');
            }
        } else {
            // Create new user
            const { error: adminError } = await supabase
                .from('users')
                .insert({
                    id: uuidv4(),
                    email: 'adrian@ascladdingltd.co.uk',
                    name: 'Adrian Stanca',
                    role: 'company_admin',
                    password_hash: '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW',
                    company_id: 'asc-cladding-ltd',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (adminError) {
                console.error('❌ Company admin user creation error:', adminError);
                throw adminError;
            }
            console.log('✅ Company admin user created');
        }

        // Step 4: Verify
        console.log('\n🔍 Verifying users...');
        const { data: users, error: verifyError } = await supabase
            .from('users')
            .select('id, email, name, role, company_id')
            .in('email', ['dev@constructco.com', 'adrian@ascladdingltd.co.uk'])
            .order('email');

        if (verifyError) {
            console.error('❌ Verification error:', verifyError);
        } else if (users && users.length > 0) {
            console.log('\n✅ Users verified:');
            for (const user of users) {
                console.log(`   - ${user.email} (${user.role}) [${user.id}]`);
            }
        } else {
            console.warn('\n⚠️  No users found!');
        }

        console.log('\n🎉 Migration completed successfully!\n');
        console.log('Test accounts:');
        console.log('  📧 dev@constructco.com');
        console.log('     Password: parola123');
        console.log('     Role: developer\n');
        console.log('  📧 adrian@ascladdingltd.co.uk');
        console.log('     Password: Lolozania1');
        console.log('     Role: company_admin\n');
        console.log('🚀 You can now login at your production URL!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

await createUsers();

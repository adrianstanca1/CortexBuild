/**
 * Apply Supabase Migration - Create Test Users
 * Usage: node apply-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.production.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    console.error('Please check .env.production.local file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    console.log('🚀 Applying Supabase Migration: Create Test Users');
    console.log('==================================================\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/004_create_test_users.sql');
    
    if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file not found: ${migrationPath}`);
        process.exit(1);
    }
    
    console.log('📄 Migration file:', migrationPath);
    console.log('🔗 Supabase URL:', supabaseUrl);
    console.log('⚙️  Executing migration...\n');

    try {
        // Step 1: Create company for company admin
        console.log('📝 Step 1: Creating company...');
        const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .eq('id', 'asc-cladding-ltd')
            .single();

        if (existingCompany) {
            console.log('✅ Company already exists: ASC Cladding Ltd');
        } else {
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
                console.error('❌ Error creating company:', companyError);
                throw companyError;
            }
            console.log('✅ Company created: ASC Cladding Ltd');
        }

        // Step 2: Create developer user
        console.log('\n📝 Step 2: Creating developer user...');
        const { error: devUserError } = await supabase
            .from('users')
            .upsert({
                id: uuidv4(),
                email: 'dev@constructco.com',
                name: 'Dev User',
                role: 'developer',
                password_hash: '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
                company_id: '00000000-0000-0000-0000-000000000001', // Platform admin company
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'email'
            });

        if (devUserError) {
            console.error('❌ Error creating developer user:', devUserError);
            throw devUserError;
        }
        console.log('✅ Developer user created/updated');

        // Step 3: Create company admin user
        console.log('\n📝 Step 3: Creating company admin user...');
        const { error: adminUserError } = await supabase
            .from('users')
            .upsert({
                id: uuidv4(),
                email: 'adrian@ascladdingltd.co.uk',
                name: 'Adrian Stanca',
                role: 'company_admin',
                password_hash: '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW',
                company_id: 'asc-cladding-ltd',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'email'
            });

        if (adminUserError) {
            console.error('❌ Error creating company admin user:', adminUserError);
            throw adminUserError;
        }

        console.log('✅ Migration executed successfully!\n');
        console.log('Test accounts created:');
        console.log('  📧 dev@constructco.com (developer)');
        console.log('     Password: parola123\n');
        console.log('  📧 adrian@ascladdingltd.co.uk (company_admin)');
        console.log('     Password: Lolozania1\n');
        console.log('Company created: ASC Cladding Ltd (comp-test-1)\n');
        console.log('You can now login at your production URL');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

await applyMigration();

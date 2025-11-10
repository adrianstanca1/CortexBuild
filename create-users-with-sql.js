#!/usr/bin/env node

/**
 * Create users by executing raw SQL directly in Supabase
 * This bypasses the Auth API and uses direct SQL execution
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.production.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) throw error;
  return data;
}

async function createUsers() {
  console.log('🚀 Creating users via direct SQL execution...\n');

  try {
    // First, ensure pgcrypto extension exists
    console.log('1️⃣ Ensuring pgcrypto extension...');
    await supabase.rpc('exec_sql', { 
      sql_query: 'CREATE EXTENSION IF NOT EXISTS pgcrypto;' 
    });
    console.log('✅ pgcrypto ready\n');

    // Create company
    console.log('2️⃣ Creating company...');
    const companySQL = `
      INSERT INTO companies (id, name, domain, status, subscription_plan, subscription_status, contact_email)
      VALUES (
        'asc-cladding-ltd',
        'ASC Cladding Ltd',
        'ascladdingltd.co.uk',
        'active',
        'professional',
        'active',
        'adrian@ascladdingltd.co.uk'
      )
      ON CONFLICT (id) DO NOTHING;
    `;
    
    const { error: companyError } = await supabase.from('companies').upsert({
      id: 'asc-cladding-ltd',
      name: 'ASC Cladding Ltd',
      domain: 'ascladdingltd.co.uk',
      status: 'active',
      subscription_plan: 'professional',
      subscription_status: 'active',
      contact_email: 'adrian@ascladdingltd.co.uk'
    }, { onConflict: 'id' });
    
    if (companyError) {
      console.error('⚠️ Company error (may already exist):', companyError.message);
    } else {
      console.log('✅ Company ready\n');
    }

    // Create developer user
    console.log('3️⃣ Creating developer user (dev@constructco.com)...');
    const devUserSQL = `
      DO $$
      DECLARE
        dev_user_id uuid;
      BEGIN
        dev_user_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
        VALUES (
          dev_user_id,
          '00000000-0000-0000-0000-000000000000',
          'dev@constructco.com',
          crypt('parola123', gen_salt('bf')),
          now(),
          now(),
          now(),
          'authenticated',
          'authenticated'
        )
        ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;
        
        -- Get the ID (in case of conflict)
        SELECT id INTO dev_user_id FROM auth.users WHERE email = 'dev@constructco.com';
        
        -- Insert into public.users
        INSERT INTO users (id, email, name, role, password_hash, company_id, created_at, updated_at)
        VALUES (
          dev_user_id,
          'dev@constructco.com',
          'Dev User',
          'developer',
          '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
          '00000000-0000-0000-0000-000000000001',
          now(),
          now()
        )
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          updated_at = now();
      END $$;
    `;

    try {
      await supabase.rpc('exec_sql', { sql_query: devUserSQL });
      console.log('✅ Developer user created\n');
    } catch (err) {
      console.error('❌ Error creating developer user:', err.message);
      // Try alternative approach without DO block
      console.log('Trying alternative approach...');
      
      // Generate UUID
      const { data: uuidData } = await supabase.rpc('gen_random_uuid');
      const userId = uuidData || crypto.randomUUID();
      
      // Insert directly
      const { error: authError } = await supabase
        .from('auth.users')
        .insert({
          id: userId,
          email: 'dev@constructco.com',
          encrypted_password: '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (authError) throw authError;
      
      const { error: publicError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: 'dev@constructco.com',
          name: 'Dev User',
          role: 'developer',
          password_hash: '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
          company_id: '00000000-0000-0000-0000-000000000001'
        });
      
      if (publicError) throw publicError;
      console.log('✅ Developer user created (alternative method)\n');
    }

    // Create company admin user
    console.log('4️⃣ Creating company admin user (adrian@ascladdingltd.co.uk)...');
    const adminUserSQL = `
      DO $$
      DECLARE
        admin_user_id uuid;
      BEGIN
        admin_user_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
        VALUES (
          admin_user_id,
          '00000000-0000-0000-0000-000000000000',
          'adrian@ascladdingltd.co.uk',
          crypt('Lolozania1', gen_salt('bf')),
          now(),
          now(),
          now(),
          'authenticated',
          'authenticated'
        )
        ON CONFLICT (email) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;
        
        -- Get the ID (in case of conflict)
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'adrian@ascladdingltd.co.uk';
        
        -- Insert into public.users
        INSERT INTO users (id, email, name, role, password_hash, company_id, created_at, updated_at)
        VALUES (
          admin_user_id,
          'adrian@ascladdingltd.co.uk',
          'Adrian Stanca',
          'company_admin',
          '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW.',
          'asc-cladding-ltd',
          now(),
          now()
        )
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash,
          company_id = EXCLUDED.company_id,
          updated_at = now();
      END $$;
    `;

    try {
      await supabase.rpc('exec_sql', { sql_query: adminUserSQL });
      console.log('✅ Company admin user created\n');
    } catch (err) {
      console.error('❌ Error creating company admin user:', err.message);
    }

    // Verify
    console.log('5️⃣ Verifying users...');
    const { data: users, error: verifyError } = await supabase
      .from('users')
      .select('id, email, name, role, company_id')
      .in('email', ['dev@constructco.com', 'adrian@ascladdingltd.co.uk']);

    if (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    } else {
      console.log(`\n✅ Found ${users?.length || 0} users:`);
      users?.forEach(user => {
        console.log(`  ✓ ${user.email} (${user.role}) - Company: ${user.company_id}`);
      });
    }

    console.log('\n🎉 User creation complete!');
    console.log('\nTest Credentials:');
    console.log('1. Developer: dev@constructco.com / parola123');
    console.log('2. Company Admin: adrian@ascladdingltd.co.uk / Lolozania1');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.hint) console.error('Hint:', error.hint);
    if (error.details) console.error('Details:', error.details);
    process.exit(1);
  }
}

createUsers();

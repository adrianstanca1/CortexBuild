#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.production.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUsers() {
  console.log('🚀 Creating users with Auth Admin API (v2)...\n');

  // Create company first
  console.log('1️⃣ Creating company...');
  const { error: companyError } = await supabase
    .from('companies')
    .upsert({
      id: 'asc-cladding-ltd',
      name: 'ASC Cladding Ltd',
      domain: 'ascladdingltd.co.uk',
      status: 'active',
      subscription_plan: 'professional',
      subscription_status: 'active',
      contact_email: 'adrian@ascladdingltd.co.uk'
    }, { onConflict: 'id' });
  
  if (companyError) {
    console.log('⚠️ Company may already exist:', companyError.message);
  } else {
    console.log('✅ Company ready\n');
  }

  // Create developer user
  console.log('2️⃣ Creating developer user...');
  try {
    const { data: devAuth, error: devAuthError } = await supabase.auth.admin.createUser({
      email: 'dev@constructco.com',
      password: 'parola123',
      email_confirm: true,
      user_metadata: {
        name: 'Dev User',
        role: 'developer'
      }
    });

    if (devAuthError) {
      console.error('❌ Auth error:', devAuthError.message);
    } else {
      console.log('✅ Auth user created:', devAuth.user.id);
      
      // Create profile
      const { error: devProfileError } = await supabase
        .from('users')
        .upsert({
          id: devAuth.user.id,
          email: 'dev@constructco.com',
          name: 'Dev User',
          role: 'developer',
          password_hash: '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
          company_id: '00000000-0000-0000-0000-000000000001'
        }, { onConflict: 'id' });
      
      if (devProfileError) {
        console.error('❌ Profile error:', devProfileError.message);
      } else {
        console.log('✅ Developer profile created\n');
      }
    }
  } catch (err) {
    console.error('❌ Developer creation failed:', err.message);
  }

  // Create company admin user
  console.log('3️⃣ Creating company admin user...');
  try {
    const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: 'adrian@ascladdingltd.co.uk',
      password: 'Lolozania1',
      email_confirm: true,
      user_metadata: {
        name: 'Adrian Stanca',
        role: 'company_admin'
      }
    });

    if (adminAuthError) {
      console.error('❌ Auth error:', adminAuthError.message);
    } else {
      console.log('✅ Auth user created:', adminAuth.user.id);
      
      // Create profile
      const { error: adminProfileError } = await supabase
        .from('users')
        .upsert({
          id: adminAuth.user.id,
          email: 'adrian@ascladdingltd.co.uk',
          name: 'Adrian Stanca',
          role: 'company_admin',
          password_hash: '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW.',
          company_id: 'asc-cladding-ltd'
        }, { onConflict: 'id' });
      
      if (adminProfileError) {
        console.error('❌ Profile error:', adminProfileError.message);
      } else {
        console.log('✅ Company admin profile created\n');
      }
    }
  } catch (err) {
    console.error('❌ Company admin creation failed:', err.message);
  }

  // Verify
  console.log('4️⃣ Verifying...');
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const targetEmails = ['dev@constructco.com', 'adrian@ascladdingltd.co.uk'];
  const createdAuthUsers = authUsers?.users?.filter(u => targetEmails.includes(u.email));
  
  console.log(`\n✅ Auth users: ${createdAuthUsers?.length || 0}`);
  createdAuthUsers?.forEach(u => console.log(`  - ${u.email} (${u.id})`));

  const { data: publicUsers } = await supabase
    .from('users')
    .select('*')
    .in('email', targetEmails);
  
  console.log(`✅ Public users: ${publicUsers?.length || 0}`);
  publicUsers?.forEach(u => console.log(`  - ${u.email} (${u.role})`));

  console.log('\n🎉 Done!');
}

createUsers().catch(console.error);

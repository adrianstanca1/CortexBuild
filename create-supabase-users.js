#!/usr/bin/env node

/**
 * Create test users in Supabase using the Auth Admin API
 * This script uses the service role key which bypasses RLS
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.production.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const COMPANY_ID = 'asc-cladding-ltd';
const PLATFORM_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

async function createCompany() {
  console.log('\n📦 Creating company...');
  
  const { data, error } = await supabase
    .from('companies')
    .upsert({
      id: COMPANY_ID,
      name: 'ASC Cladding Ltd',
      domain: 'ascladdingltd.co.uk',
      status: 'active',
      subscription_plan: 'professional',
      subscription_status: 'active',
      contact_email: 'adrian@ascladdingltd.co.uk'
    }, {
      onConflict: 'id'
    })
    .select();

  if (error) {
    console.error('❌ Error creating company:', error.message);
    return false;
  }

  console.log('✅ Company ready:', data?.[0]?.name || COMPANY_ID);
  return true;
}

async function createUserInAuth(email, password) {
  console.log(`\n👤 Creating auth user: ${email}`);
  
  try {
    // First check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      console.log('ℹ️  User already exists in auth.users:', existingUser.id);
      return existingUser.id;
    }

    // Create user in auth.users using Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: email.includes('dev@') ? 'Dev User' : 'Adrian Stanca'
      }
    });

    if (error) {
      console.error('❌ Auth API error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from auth.admin.createUser');
    }

    console.log('✅ Auth user created:', data.user.id);
    return data.user.id;
    
  } catch (error) {
    console.error('❌ Failed to create auth user:', error.message);
    throw error;
  }
}

async function createUserInPublic(userId, email, name, role, password, companyId) {
  console.log(`\n📝 Creating public user profile: ${email}`);
  
  // Hash password for public.users table
  const passwordHash = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: email,
      name: name,
      role: role,
      password_hash: passwordHash,
      company_id: companyId,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select();

  if (error) {
    console.error('❌ Error creating public user:', error.message);
    throw error;
  }

  console.log('✅ Public user profile created');
  return data?.[0];
}

async function createDeveloperUser() {
  console.log('\n' + '='.repeat(60));
  console.log('Creating Developer User');
  console.log('='.repeat(60));
  
  const email = 'dev@constructco.com';
  const password = 'parola123';
  
  try {
    // Create in auth.users first
    const authUserId = await createUserInAuth(email, password);
    
    // Create in public.users
    await createUserInPublic(
      authUserId,
      email,
      'Dev User',
      'developer',
      password,
      PLATFORM_COMPANY_ID
    );
    
    console.log('✅ Developer user complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create developer user:', error.message);
    return false;
  }
}

async function createCompanyAdminUser() {
  console.log('\n' + '='.repeat(60));
  console.log('Creating Company Admin User');
  console.log('='.repeat(60));
  
  const email = 'adrian@ascladdingltd.co.uk';
  const password = 'Lolozania1';
  
  try {
    // Create in auth.users first
    const authUserId = await createUserInAuth(email, password);
    
    // Create in public.users
    await createUserInPublic(
      authUserId,
      email,
      'Adrian Stanca',
      'company_admin',
      password,
      COMPANY_ID
    );
    
    console.log('✅ Company admin user complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create company admin user:', error.message);
    return false;
  }
}

async function verifyUsers() {
  console.log('\n' + '='.repeat(60));
  console.log('Verifying Created Users');
  console.log('='.repeat(60));
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, role, company_id')
    .in('email', ['dev@constructco.com', 'adrian@ascladdingltd.co.uk']);

  if (error) {
    console.error('❌ Error verifying users:', error.message);
    return;
  }

  console.log(`\n✅ Found ${users?.length || 0} users:`);
  users?.forEach(user => {
    console.log(`  - ${user.email} (${user.role}) - Company: ${user.company_id}`);
  });
}

async function main() {
  console.log('🚀 Starting Supabase User Creation');
  console.log('URL:', supabaseUrl);
  
  try {
    // Create company
    const companyCreated = await createCompany();
    if (!companyCreated) {
      console.error('❌ Failed to create company. Aborting.');
      process.exit(1);
    }

    // Create developer user
    const devCreated = await createDeveloperUser();
    
    // Create company admin user
    const adminCreated = await createCompanyAdminUser();

    // Verify
    await verifyUsers();

    if (devCreated && adminCreated) {
      console.log('\n✅ All users created successfully!');
      console.log('\nTest Credentials:');
      console.log('1. Developer:');
      console.log('   Email: dev@constructco.com');
      console.log('   Password: parola123');
      console.log('2. Company Admin:');
      console.log('   Email: adrian@ascladdingltd.co.uk');
      console.log('   Password: Lolozania1');
    } else {
      console.log('\n⚠️  Some users failed to create. Check errors above.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * This script helps set up the Supabase database with the required schema
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupSupabase() {
  console.log('🚀 Supabase Database Setup for CortexBuild');
  console.log('==========================================\n');

  // Get Supabase credentials
  const supabaseUrl = await askQuestion('Enter your Supabase URL (https://your-project-id.supabase.co): ');
  const serviceRoleKey = await askQuestion('Enter your Supabase Service Role Key: ');
  const adminEmail = await askQuestion('Enter admin email (default: adrian.stanca1@gmail.com): ') || 'adrian.stanca1@gmail.com';
  const adminPassword = await askQuestion('Enter admin password (default: parola123): ') || 'parola123';

  // Create Supabase client
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log('\n📊 Setting up database schema...');

    // Create companies table
    console.log('Creating companies table...');
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (companiesError) {
      console.error('❌ Error creating companies table:', companiesError);
      return;
    }

    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'company_admin',
          avatar TEXT,
          company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('❌ Error creating users table:', usersError);
      return;
    }

    // Create projects table
    console.log('Creating projects table...');
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (projectsError) {
      console.error('❌ Error creating projects table:', projectsError);
      return;
    }

    // Create tasks table
    console.log('Creating tasks table...');
    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          priority TEXT NOT NULL DEFAULT 'medium',
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          due_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tasksError) {
      console.error('❌ Error creating tasks table:', tasksError);
      return;
    }

    // Create profiles table
    console.log('Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'company_admin',
          avatar TEXT,
          company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (profilesError) {
      console.error('❌ Error creating profiles table:', profilesError);
      return;
    }

    // Create a demo company
    console.log('Creating demo company...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({ name: 'CortexBuild Demo Company' })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Error creating demo company:', companyError);
      return;
    }

    console.log('✅ Database schema created successfully!');
    console.log('✅ Demo company created:', company.name);

    console.log('\n📝 Next Steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Go to Authentication → Users');
    console.log('3. Create a new user with email:', adminEmail);
    console.log('4. Set the user role to "super_admin" in the profiles table');
    console.log('5. Update your environment variables with Supabase credentials');
    console.log('6. Deploy your application');

    console.log('\n🎉 Supabase setup complete!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    rl.close();
  }
}

// Run the setup
setupSupabase().catch(console.error);

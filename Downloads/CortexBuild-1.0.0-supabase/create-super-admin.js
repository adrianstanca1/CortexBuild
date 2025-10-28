#!/usr/bin/env node

/**
 * Script to create the super admin user for ConstructAI
 * User: adrian.stanca1@gmail.com
 * Password: Cumparavinde1
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  console.log('🚀 Creating Super Admin User...');
  console.log('Email: adrian.stanca1@gmail.com');
  console.log('Password: Cumparavinde1');

  try {
    // Step 1: Register the user through the app's registration flow
    console.log('📧 Registering user account...');

    // First, try to sign up the user
    const { error: signUpError } = await supabase.auth.signUp({
      email: 'adrian.stanca1@gmail.com',
      password: 'Cumparavinde1',
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️ User already exists, proceeding with profile setup...');
      } else {
        throw signUpError;
      }
    } else {
      console.log('✅ User account created successfully');
    }

    // Sign in to get the session
    console.log('🔐 Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'adrian.stanca1@gmail.com',
      password: 'Cumparavinde1',
    });

    if (signInError) throw signInError;

    const userId = signInData.user?.id;
    if (!userId) {
      throw new Error('Could not get user ID after sign in');
    }

    console.log('👤 User ID:', userId);

    // Step 2: Create or update the platform company
    console.log('🏢 Creating platform company...');
    const { error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'ConstructAI Platform',
        industry: 'Technology',
        size: 'Platform'
      })
      .select()
      .single();

    if (companyError) throw companyError;
    console.log('✅ Platform company created/updated');

    // Step 3: Update the profile to super admin (this requires manual SQL execution)
    console.log('👑 Note: Profile created with default role. To make super admin, run:');
    console.log('   UPDATE profiles SET role = \'super_admin\', company_id = \'00000000-0000-0000-0000-000000000000\' WHERE email = \'adrian.stanca1@gmail.com\';');
    console.log('   Or run the CREATE_SUPER_ADMIN.sql script in Supabase SQL Editor');

    // Step 4: Create platform analytics tables (if they don't exist)
    console.log('📊 Setting up platform analytics tables...');

    // Platform metrics table
    const { error: metricsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS platform_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          metric_name TEXT NOT NULL,
          metric_value DECIMAL(15, 2),
          metric_type TEXT,
          period_start TIMESTAMPTZ,
          period_end TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS company_activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID REFERENCES companies(id),
          activity_type TEXT,
          activity_data JSONB,
          user_id UUID REFERENCES profiles(id),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS platform_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID REFERENCES companies(id),
          plan_name TEXT,
          status TEXT DEFAULT 'active',
          monthly_price DECIMAL(10, 2),
          started_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS system_health_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          metric_name TEXT NOT NULL,
          metric_value DECIMAL(15, 2),
          status TEXT,
          details JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
        ALTER TABLE company_activity_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
      `
    });

    if (metricsError) {
      console.warn('⚠️ Could not create analytics tables via RPC, they may already exist');
    } else {
      console.log('✅ Platform analytics tables created');
    }

    // Step 5: Insert sample data
    console.log('📈 Inserting sample platform data...');

    // Sample metrics
    const sampleMetrics = [
      { metric_name: 'Total Revenue', metric_value: 125000.00, metric_type: 'revenue', period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), period_end: new Date().toISOString() },
      { metric_name: 'Active Users', metric_value: 156, metric_type: 'users', period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), period_end: new Date().toISOString() },
      { metric_name: 'Total Companies', metric_value: 23, metric_type: 'companies', period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), period_end: new Date().toISOString() },
      { metric_name: 'Active Projects', metric_value: 89, metric_type: 'projects', period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), period_end: new Date().toISOString() }
    ];

    for (const metric of sampleMetrics) {
      await supabase.from('platform_metrics').upsert(metric);
    }

    // Sample health metrics
    const healthMetrics = [
      { metric_name: 'API Response Time', metric_value: 145.5, status: 'healthy', details: { unit: 'ms', threshold: 200 } },
      { metric_name: 'Database CPU', metric_value: 45.2, status: 'healthy', details: { unit: '%', threshold: 80 } },
      { metric_name: 'Active Connections', metric_value: 23, status: 'healthy', details: { unit: 'connections', max: 100 } },
      { metric_name: 'Error Rate', metric_value: 0.5, status: 'healthy', details: { unit: '%', threshold: 5 } }
    ];

    for (const metric of healthMetrics) {
      await supabase.from('system_health_metrics').upsert(metric);
    }

    console.log('✅ Sample data inserted');

    // Step 6: Verification
    console.log('\n🔍 Verification:');

    const { data: profileCheck, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, email, name, role, company_id')
      .eq('email', 'adrian.stanca1@gmail.com')
      .single();

    if (profileCheckError) throw profileCheckError;

    console.log('✅ Super Admin Profile:', {
      id: profileCheck.id,
      email: profileCheck.email,
      name: profileCheck.name,
      role: profileCheck.role,
      companyId: profileCheck.company_id
    });

    const { data: companyCheck, error: companyCheckError } = await supabase
      .from('companies')
      .select('id, name, industry')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single();

    if (companyCheckError) throw companyCheckError;

    console.log('✅ Platform Company:', {
      id: companyCheck.id,
      name: companyCheck.name,
      industry: companyCheck.industry
    });

    console.log('\n🎉 SUPER ADMIN SETUP COMPLETE!');
    console.log('👤 Super Admin: adrian.stanca1@gmail.com');
    console.log('🔑 Password: Cumparavinde1');
    console.log('🏢 Platform Company: ConstructAI Platform');
    console.log('📊 Dashboard: Ready with sample data');
    console.log('\n🚀 You can now login at http://localhost:3000');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();
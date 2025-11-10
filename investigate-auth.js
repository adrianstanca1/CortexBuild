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

async function investigateTriggers() {
  console.log('🔍 Investigating auth setup...\n');

  // Check existing users
  const { data: allAuthUsers } = await supabase.auth.admin.listUsers();
  console.log(`📊 Existing auth users: ${allAuthUsers?.users?.length || 0}`);
  for (const u of allAuthUsers?.users || []) {
    console.log(`  - ${u.email} (${u.id}) - confirmed: ${!!u.email_confirmed_at}`);
  }

  console.log('\n💡 The issue is likely:');
  console.log('  1. RLS policy blocking createUser (even with service role)');
  console.log('  2. Database trigger preventing insert');
  console.log('  3. Custom auth schema requiring specific fields\n');
  
  console.log('🎯 SOLUTION: Use Supabase Dashboard SQL Editor');
  console.log('   https://app.supabase.com/project/zpbuvuxpfemldsknerew/sql/new');
  console.log('\n   Execute the SQL from SUPABASE_CREATE_USERS.sql');
}

investigateTriggers().catch(console.error);

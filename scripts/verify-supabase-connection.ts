/**
 * Verify Supabase connection and check database tables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyConnection() {
  console.log('🔍 Verifying Supabase connection...\n');

  try {
    // Test connection by querying a common table
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);

    if (companiesError && companiesError.code === 'PGRST116') {
      console.log('⚠️  Companies table does not exist yet');
      console.log('   Run migrations first: npm run migrate:supabase\n');
    } else if (companiesError) {
      console.error('❌ Error querying companies:', companiesError.message);
    } else {
      console.log('✅ Companies table exists');
      console.log(`   Found ${companies?.length || 0} companies\n`);
    }

    // Check other critical tables
    const criticalTables = [
      'users',
      'projects',
      'project_tasks_gantt',
      'wbs_structure',
      'project_budgets',
      'payment_applications'
    ];

    console.log('📊 Checking critical tables...\n');
    for (const table of criticalTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`   ⚠️  ${table} - Table does not exist`);
          } else {
            console.log(`   ⚠️  ${table} - Error: ${error.message}`);
          }
        } else {
          console.log(`   ✅ ${table} - Table exists`);
        }
      } catch (err: any) {
        console.log(`   ❌ ${table} - ${err.message}`);
      }
    }

    console.log('\n✅ Connection verification complete!');
    
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

verifyConnection();


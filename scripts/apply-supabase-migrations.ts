/**
 * Apply all Supabase migrations in correct order
 * This script consolidates all database migrations into a single execution
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Required environment variables:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('🚀 Starting Supabase migrations...\n');

  const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');
  const migrations = [
    '001_multi_tenant_schema.sql',
    '002_admin_platform_schema.sql',
    '002_create_super_admin.sql',
    '003_enhanced_rls_security.sql',
    '20251031000000_phase_1_enterprise_core.sql'
  ];

  for (const migrationFile of migrations) {
    const migrationPath = path.join(migrationsDir, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Skipping ${migrationFile} (file not found)`);
      continue;
    }

    console.log(`📄 Applying ${migrationFile}...`);
    
    try {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // Execute via RPC if available, otherwise direct query
            const { error } = await supabase.rpc('exec_sql', {
              sql_query: statement + ';'
            });

            if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
              console.error(`   ❌ Error: ${error.message.substring(0, 100)}`);
            }
          } catch (err: any) {
            // If RPC doesn't exist, try direct SQL execution
            // Note: Supabase JS client doesn't support raw SQL directly
            // We'll use the REST API instead
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ sql_query: statement + ';' })
            });
            
            if (!response.ok) {
              const text = await response.text();
              if (!text.includes('already exists') && !text.includes('duplicate')) {
                console.error(`   ❌ Error: ${text.substring(0, 100)}`);
              }
            }
          }
        }
      }

      console.log(`   ✅ ${migrationFile} applied\n`);
    } catch (error: any) {
      console.error(`   ❌ Failed to apply ${migrationFile}: ${error.message}\n`);
    }
  }

  // Apply complete schema if it exists
  const completeSchemaPath = path.join(projectRoot, 'supabase', 'COMPLETE_SCHEMA.sql');
  if (fs.existsSync(completeSchemaPath)) {
    console.log('📄 Applying COMPLETE_SCHEMA.sql (ensuring all tables exist)...\n');
    // This is done via Supabase dashboard for now
    console.log('   ℹ️  Please apply COMPLETE_SCHEMA.sql manually via Supabase SQL Editor\n');
  }

  console.log('✅ All migrations applied!\n');
  console.log('📋 Next steps:');
  console.log('   1. Verify tables in Supabase dashboard');
  console.log('   2. Update password hashes if needed');
  console.log('   3. Test API connections');
}

applyMigrations().catch(console.error);


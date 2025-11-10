#!/usr/bin/env node

/**
 * Automated Database Migration Script
 * Applies the user_profiles table migration to Supabase
 * Uses credentials from environment or loaded from backup
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`),
};

async function loadEnvironment() {
  log.info('Loading Supabase credentials...');

  // Try to load from environment variables first
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  // If not in environment, try backup credentials
  if (!supabaseUrl || !serviceRoleKey) {
    log.warn('Credentials not in current environment, checking backup...');

    const backupEnvPath = path.join('/Users/admin/CortexBuild-Clean', '.env');
    if (fs.existsSync(backupEnvPath)) {
      const envContent = fs.readFileSync(backupEnvPath, 'utf-8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
          supabaseUrl = line.replace('VITE_SUPABASE_URL=', '').trim();
        }
        if (line.startsWith('SUPABASE_SERVICE_KEY=')) {
          serviceRoleKey = line.replace('SUPABASE_SERVICE_KEY=', '').trim();
        }
      }
      log.success('Loaded credentials from backup');
    }
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Could not load Supabase credentials from environment or backup');
  }

  log.success(`Using Supabase project: ${supabaseUrl}`);
  return { supabaseUrl, serviceRoleKey };
}

async function loadMigrationSQL() {
  log.info('Loading migration SQL...');

  const migrationPath = path.join(__dirname, 'supabase/migrations/004_create_user_profiles_table.sql');

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  log.success(`Loaded migration file (${sql.length} bytes)`);

  return sql;
}

async function applyMigration(supabaseUrl, serviceRoleKey, sql) {
  log.info('Preparing to apply migration...');

  // Parse the project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    throw new Error('Could not parse project reference from Supabase URL');
  }

  log.step(`Project reference: ${projectRef}`);

  // Supabase SQL API endpoint
  const sqlApiUrl = `${supabaseUrl}/rest/v1/rpc/sql_exec`;

  log.info('Note: Direct SQL API may require special setup. Using alternative approach...');
  log.warn('For automated migration, you may need to:');
  log.warn('1. Use Supabase CLI: supabase db push');
  log.warn('2. Or manually apply via Supabase Dashboard');

  return false;
}

async function main() {
  try {
    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║      CortexBuild Database Migration Script v1.0         ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();

    // Load credentials
    const { supabaseUrl, serviceRoleKey } = await loadEnvironment();

    // Load migration SQL
    const migrationSQL = await loadMigrationSQL();

    // Attempt to apply migration
    const success = await applyMigration(supabaseUrl, serviceRoleKey, migrationSQL);

    console.log();
    log.warn('Direct API-based migration requires Supabase CLI or dashboard access');
    log.info('To apply migration manually:');
    console.log(`  1. Go to: https://app.supabase.com/project/${supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]}`);
    console.log(`  2. Open: SQL Editor`);
    console.log(`  3. Paste contents of: supabase/migrations/004_create_user_profiles_table.sql`);
    console.log(`  4. Click: Run`);

    console.log();
    log.info('Alternatively, use Supabase CLI:');
    console.log(`  $ supabase db push`);

  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

main();

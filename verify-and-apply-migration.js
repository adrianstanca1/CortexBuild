#!/usr/bin/env node

/**
 * CortexBuild Migration Verification & Application Script
 *
 * This script:
 * 1. Verifies Supabase credentials
 * 2. Checks if migration has been applied
 * 3. Provides both automated and manual migration paths
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}→${colors.reset} ${colors.bold}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}`),
};

function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData,
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

async function loadCredentials() {
  log.step('Step 1: Loading Supabase Credentials');

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  // Check backup
  if (!supabaseUrl || !serviceRoleKey) {
    const backupPath = '/Users/admin/CortexBuild-Clean/.env';
    if (fs.existsSync(backupPath)) {
      const content = fs.readFileSync(backupPath, 'utf-8');
      const urlMatch = content.match(/VITE_SUPABASE_URL=(.+)/);
      const keyMatch = content.match(/SUPABASE_SERVICE_KEY=(.+)/);

      if (urlMatch) supabaseUrl = urlMatch[1].trim();
      if (keyMatch) serviceRoleKey = keyMatch[1].trim();

      if (supabaseUrl && serviceRoleKey) {
        log.success('Loaded credentials from backup');
      }
    }
  } else {
    log.success('Loaded credentials from environment');
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Could not load Supabase credentials');
  }

  log.info(`Supabase URL: ${supabaseUrl}`);
  log.info(`Service key loaded: ${serviceRoleKey.substring(0, 20)}...`);

  return { supabaseUrl, serviceRoleKey };
}

async function checkMigrationStatus(supabaseUrl, serviceRoleKey) {
  log.step('Step 2: Checking Migration Status');

  const urlObj = new URL(supabaseUrl);
  const projectRef = urlObj.hostname.split('.')[0];

  const options = {
    hostname: urlObj.hostname,
    path: `/rest/v1/information_schema.tables?table_schema=eq.public&table_name=eq.user_profiles`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await httpsRequest(options);

    if (response.status === 200) {
      const tables = JSON.parse(response.body);
      if (tables.length > 0) {
        log.success('user_profiles table already exists!');
        return true;
      } else {
        log.warn('user_profiles table does not exist - migration needed');
        return false;
      }
    } else {
      log.warn('Could not check table status via REST API');
      log.info(`(Status: ${response.status})`);
      return null;
    }
  } catch (error) {
    log.warn(`Error checking status: ${error.message}`);
    return null;
  }
}

function getMigrationSQL() {
  const migrationPath = path.join(__dirname, 'supabase/migrations/004_create_user_profiles_table.sql');

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  return fs.readFileSync(migrationPath, 'utf-8');
}

async function main() {
  console.clear();
  console.log(`${colors.cyan}${colors.bold}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     CortexBuild Database Migration - Automated Checker       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);

  try {
    // Load credentials
    const { supabaseUrl, serviceRoleKey } = await loadCredentials();

    // Check migration status
    const isMigrated = await checkMigrationStatus(supabaseUrl, serviceRoleKey);

    log.divider();

    if (isMigrated === true) {
      log.success('✨ Migration has already been applied!');
      log.info('The user_profiles table is ready to use.');
      process.exit(0);
    }

    // Load migration SQL
    const migrationSQL = getMigrationSQL();
    log.success(`Migration SQL loaded (${migrationSQL.length} bytes)`);

    log.divider();
    log.step('Step 3: Migration Application Options');

    console.log(`
${colors.bold}Option 1: Apply via Supabase Dashboard (Recommended)${colors.reset}
  1. Go to: https://app.supabase.com
  2. Select your CortexBuild project
  3. Click SQL Editor (left sidebar)
  4. Click "New query"
  5. Paste the migration SQL below:

${colors.yellow}--- Copy and paste this SQL into Supabase SQL Editor ---${colors.reset}
${colors.cyan}${migrationSQL}${colors.reset}
${colors.yellow}--- End of migration SQL ---${colors.reset}

  6. Click "Run" button
  7. Verify success message appears


${colors.bold}Option 2: Apply via Supabase CLI${colors.reset}
  Prerequisites:
    $ npm install -g supabase
    $ supabase login

  Then:
    $ cd /Users/admin/Projects/cortexbuild/CortexBuild-1
    $ supabase db push


${colors.bold}Option 3: Check Vercel Environment${colors.reset}
  The Supabase credentials should be in your Vercel project:
  1. Go to: https://vercel.com
  2. Select: cortexbuildcortexbuild-app
  3. Settings → Environment Variables
  4. Verify NEXT_PUBLIC_SUPABASE_URL is set
  5. Verify SUPABASE_SERVICE_ROLE_KEY is set
  6. If missing, add them before redeploying
`);

    log.divider();
    log.step('After Migration');

    console.log(`
Once migration is applied:

1. Verify the table exists:
   SELECT * FROM user_profiles LIMIT 1;

2. Test the API endpoint:
   GET https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile

3. Check the Settings page for profile display

4. Monitor Vercel logs for errors
`);

    log.divider();

  } catch (error) {
    log.error(`Script error: ${error.message}`);
    console.log('\nStack trace:', error);
    process.exit(1);
  }
}

main();

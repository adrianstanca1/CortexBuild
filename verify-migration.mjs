#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  log.step('Step 2: Checking Current Migration Status');

  const urlObj = new URL(supabaseUrl);

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
    log.info('Checking if user_profiles table exists...');
    const response = await httpsRequest(options);

    if (response.status === 200) {
      const tables = JSON.parse(response.body);
      if (Array.isArray(tables) && tables.length > 0) {
        log.success('✨ user_profiles table already exists!');
        return { exists: true, details: tables[0] };
      } else {
        log.warn('user_profiles table does not exist - migration needed');
        return { exists: false };
      }
    } else if (response.status === 401) {
      log.error('Authentication failed - invalid service role key');
      return { exists: null, error: 'Invalid credentials' };
    } else {
      log.warn(`Unexpected response status: ${response.status}`);
      return { exists: null, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    log.warn(`Could not check via API: ${error.message}`);
    return { exists: null, error: error.message };
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
  console.log('║     CortexBuild Database Migration - Status Checker          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);

  try {
    // Load credentials
    const credentials = await loadCredentials();
    const { supabaseUrl, serviceRoleKey } = credentials;

    // Check migration status
    const status = await checkMigrationStatus(supabaseUrl, serviceRoleKey);

    log.divider();

    if (status.exists === true) {
      log.success('Migration Complete!');
      log.info('The user_profiles table is ready for use.');
      console.log();
      process.exit(0);
    }

    // Load migration SQL
    const migrationSQL = getMigrationSQL();
    log.success(`Loaded migration SQL file (${migrationSQL.length} bytes)`);

    log.divider();
    log.step('How to Apply Migration');

    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

    console.log(`
${colors.bold}📌 RECOMMENDED: Apply via Supabase Dashboard${colors.reset}

Steps:
  1. Go to: https://app.supabase.com
  2. Select your CortexBuild project (${projectRef})
  3. Click "SQL Editor" in left sidebar
  4. Click "+ New query" button
  5. Copy and paste the SQL from: supabase/migrations/004_create_user_profiles_table.sql
  6. Click "Run" button
  7. You'll see "Query executed successfully"
  8. Done! ✅

Alternatively, use Supabase CLI:
  $ supabase db push

${colors.bold}⏱️  Expected Time: 2-3 minutes${colors.reset}

${colors.bold}✨ After Migration${colors.reset}
  - Profile CRUD endpoint will work automatically
  - User profiles create on first login
  - All preference settings persist
  - Theme and notification settings saved
`);

    log.divider();

  } catch (error) {
    log.error(`${error.message}`);
    process.exit(1);
  }
}

main();

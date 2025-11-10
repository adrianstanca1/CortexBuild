#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}→${colors.reset} ${colors.bold}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}`),
  success_box: (title) => {
    console.log(`\n${colors.green}${colors.bold}╔${'═'.repeat(58)}╗${colors.reset}`);
    console.log(`${colors.green}${colors.bold}║ ${title.padEnd(56)} ║${colors.reset}`);
    console.log(`${colors.green}${colors.bold}╚${'═'.repeat(58)}╝${colors.reset}\n`);
  },
};

function httpsRequest(options, data = null, timeout = 30000) {
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

    req.setTimeout(timeout);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
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

  if (!supabaseUrl || !serviceRoleKey) {
    const backupPath = '/Users/admin/CortexBuild-Clean/.env';
    if (fs.existsSync(backupPath)) {
      const content = fs.readFileSync(backupPath, 'utf-8');
      const urlMatch = content.match(/VITE_SUPABASE_URL=(.+)/);
      const keyMatch = content.match(/SUPABASE_SERVICE_KEY=(.+)/);

      if (urlMatch) supabaseUrl = urlMatch[1].trim();
      if (keyMatch) serviceRoleKey = keyMatch[1].trim();
    }
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Could not load Supabase credentials from environment or backup');
  }

  log.success('Credentials loaded');
  log.info(`Supabase URL: ${supabaseUrl}`);
  log.info(`Service key: ${serviceRoleKey.substring(0, 20)}...`);

  return { supabaseUrl, serviceRoleKey };
}

async function getMigrationSQL() {
  const migrationPath = path.join(__dirname, 'supabase/migrations/004_create_user_profiles_table.sql');

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  log.success(`Migration SQL loaded (${sql.length} bytes)`);

  return sql;
}

async function checkTableExists(supabaseUrl, serviceRoleKey) {
  log.step('Step 2: Checking if Migration Already Applied');

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
    const response = await httpsRequest(options);

    if (response.status === 200) {
      const tables = JSON.parse(response.body);
      if (Array.isArray(tables) && tables.length > 0) {
        log.success('user_profiles table already exists!');
        return true;
      }
    }
  } catch (error) {
    log.warn(`Could not check via API: ${error.message}`);
  }

  log.info('Table does not exist yet - proceeding with migration');
  return false;
}

async function executeSQL(supabaseUrl, serviceRoleKey, sql) {
  log.step('Step 3: Attempting Direct SQL Execution');

  const urlObj = new URL(supabaseUrl);

  // Try using the raw SQL endpoint (admin)
  const options = {
    hostname: urlObj.hostname,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    log.info('Sending SQL to Supabase...');
    const payload = JSON.stringify({ sql });

    const response = await httpsRequest(options, payload);

    if (response.status === 200 || response.status === 201) {
      log.success('SQL executed successfully!');
      return { success: true, response: response.body };
    } else if (response.status === 401) {
      log.warn('Authentication failed - endpoint not available with this key');
      return { success: false, error: 'Auth failed', canRetry: true };
    } else {
      log.warn(`Server response: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}`, canRetry: false };
    }
  } catch (error) {
    log.warn(`SQL execution error: ${error.message}`);
    return { success: false, error: error.message, canRetry: false };
  }
}

async function verifyMigration(supabaseUrl, serviceRoleKey) {
  log.step('Step 4: Verifying Migration Success');

  try {
    const tableExists = await checkTableExists(supabaseUrl, serviceRoleKey);

    if (tableExists) {
      log.success('Migration verification: Table exists and is accessible');
      return true;
    } else {
      log.warn('Table not yet accessible - may need additional time or manual verification');
      return false;
    }
  } catch (error) {
    log.warn(`Verification error: ${error.message}`);
    return false;
  }
}

function displayManualInstructions(migrationSQL, supabaseUrl) {
  log.divider();
  log.step('Manual Migration Instructions');

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  console.log(`
${colors.bold}📌 For Direct Application in Supabase Dashboard:${colors.reset}

1. Open: https://app.supabase.com
2. Select project: ${projectRef}
3. Go to: SQL Editor
4. Click: + New query
5. Copy and paste this SQL:

${colors.yellow}${'─'.repeat(60)}${colors.reset}
${migrationSQL}
${colors.yellow}${'─'.repeat(60)}${colors.reset}

6. Click: RUN
7. Wait for: "Query executed successfully"
8. Done! ✅

${colors.bold}Alternative - Using Supabase CLI:${colors.reset}

${colors.cyan}$ supabase link --project-ref ${projectRef}${colors.reset}
${colors.cyan}$ supabase db push${colors.reset}

${colors.bold}Or - Using this script with saved credentials:${colors.reset}

${colors.cyan}$ SUPABASE_SERVICE_ROLE_KEY="your-key" node execute-migration.mjs${colors.reset}
`);
}

async function main() {
  console.clear();
  console.log(`${colors.cyan}${colors.bold}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        CortexBuild - Database Migration Executor             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);

  try {
    // Load credentials
    const { supabaseUrl, serviceRoleKey } = await loadCredentials();

    // Check if already applied
    const alreadyMigrated = await checkTableExists(supabaseUrl, serviceRoleKey);

    if (alreadyMigrated) {
      log.success_box('✨ MIGRATION ALREADY COMPLETE ✨');
      console.log('The user_profiles table has been successfully created.');
      console.log('Your CortexBuild application is ready to use!');
      console.log();
      process.exit(0);
    }

    // Get migration SQL
    const migrationSQL = await getMigrationSQL();

    // Try to execute directly
    log.step('Step 3: Executing Migration');

    const result = await executeSQL(supabaseUrl, serviceRoleKey, migrationSQL);

    if (result.success) {
      log.success('SQL execution completed');

      // Verify
      const verified = await verifyMigration(supabaseUrl, serviceRoleKey);

      log.divider();

      if (verified) {
        log.success_box('🎉 MIGRATION SUCCESSFUL 🎉');
        console.log('The user_profiles table has been created!');
        console.log();
        console.log('You can now:');
        console.log('  ✅ Log in to the application');
        console.log('  ✅ Profiles auto-create on first login');
        console.log('  ✅ Settings/preferences persist');
        console.log('  ✅ Theme preferences save');
        console.log();
        console.log('Check your Vercel dashboard for logs: https://vercel.com');
        console.log();
      } else {
        log.warn('Could not verify - but SQL may have executed');
        log.info('Check Supabase dashboard to confirm table creation');
      }

      process.exit(0);
    } else {
      log.error(`Direct execution failed: ${result.error}`);

      if (result.canRetry) {
        log.info('This is expected - Supabase may require dashboard or CLI for migrations');
      }

      log.divider();
      log.warn('Direct SQL API approach did not work');
      displayManualInstructions(migrationSQL, supabaseUrl);

      log.divider();
      log.info('Use one of the above methods to complete the migration');

      process.exit(0);
    }

  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.log();
    log.info('This is likely a configuration issue. Please:');
    console.log('  1. Verify Supabase credentials are correct');
    console.log('  2. Check that the project exists');
    console.log('  3. Use the manual Supabase Dashboard method');
    console.log();
    process.exit(1);
  }
}

main();

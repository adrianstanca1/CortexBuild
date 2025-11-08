import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

// Load env from .env.local then .env (project root)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

function required(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  const url = required('VITE_SUPABASE_URL', process.env.VITE_SUPABASE_URL);
  const anon = required('VITE_SUPABASE_ANON_KEY', process.env.VITE_SUPABASE_ANON_KEY);

  const client = createClient(url, anon);

  const checks: Array<{ name: string; ok: boolean; message?: string }> = [];

  async function checkTable(name: string) {
    try {
      const { error } = await client.from(name).select('id').limit(1);
      checks.push({ name: `table:${name}`, ok: !error, message: error?.message });
    } catch (e: any) {
      checks.push({ name: `table:${name}`, ok: false, message: e?.message });
    }
  }

  // Core tables
  await checkTable('companies');
  await checkTable('users');
  await checkTable('projects');
  await checkTable('tasks');
  await checkTable('rfis');
  await checkTable('documents');

  // Simple test user presence
  try {
    const { data, error } = await client
      .from('users')
      .select('email, role')
      .in('email', [
        'adrian.stanca1@gmail.com',
        'adrian@ascladdingltd.co.uk',
        'adrian.stanca1@icloud.com',
      ]);
    checks.push({ name: 'seed:test_users', ok: !error && !!data, message: error?.message });
  } catch (e: any) {
    checks.push({ name: 'seed:test_users', ok: false, message: e?.message });
  }

  const failed = checks.filter(c => !c.ok);
  for (const c of checks) {
    console.log(`${c.ok ? '✅' : '❌'} ${c.name}${c.message ? ` - ${c.message}` : ''}`);
  }
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});



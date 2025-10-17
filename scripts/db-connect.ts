#!/usr/bin/env tsx
/**
 * Interactive Database Explorer
 * Connect to cortexbuild.db and run queries
 */

import Database from 'better-sqlite3';
import * as readline from 'readline';

const db = new Database('./cortexbuild.db');

console.log('🗄️  Connected to CortexBuild Database\n');

// Show statistics
try {
  const stats = {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
    companies: db.prepare('SELECT COUNT(*) as count FROM companies').get() as { count: number },
    projects: db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number },
    sessions: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now")').get() as { count: number },
  };

  console.log('📊 Database Statistics:');
  console.log(`   Users: ${stats.users.count}`);
  console.log(`   Companies: ${stats.companies.count}`);
  console.log(`   Projects: ${stats.projects.count}`);
  console.log(`   Active Sessions: ${stats.sessions.count}\n`);
} catch (error) {
  console.log('⚠️  Some tables may not exist yet\n');
}

// Interactive SQL prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'SQL> '
});

console.log('Type SQL queries (or "exit" to quit):');
console.log('Examples:');
console.log('  SELECT * FROM users;');
console.log('  .tables  (list all tables)');
console.log('  .schema users  (show table schema)\n');

// Handle special commands
function handleSpecialCommand(cmd: string): boolean {
  if (cmd === '.tables') {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `).all();
    console.log('\n📋 Tables:');
    tables.forEach((t: any) => console.log(`   - ${t.name}`));
    console.log('');
    return true;
  }

  if (cmd.startsWith('.schema ')) {
    const tableName = cmd.split(' ')[1];
    try {
      const schema = db.prepare(`
        SELECT sql FROM sqlite_master
        WHERE type='table' AND name=?
      `).get(tableName) as { sql: string } | undefined;

      if (schema) {
        console.log(`\n📐 Schema for ${tableName}:`);
        console.log(schema.sql);
        console.log('');
      } else {
        console.log(`❌ Table '${tableName}' not found\n`);
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message);
    }
    return true;
  }

  return false;
}

rl.prompt();

rl.on('line', (line) => {
  const query = line.trim();

  if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit' || query.toLowerCase() === '.quit') {
    console.log('👋 Goodbye!');
    db.close();
    rl.close();
    process.exit(0);
  }

  if (!query) {
    rl.prompt();
    return;
  }

  // Handle special commands
  if (handleSpecialCommand(query)) {
    rl.prompt();
    return;
  }

  try {
    if (query.toLowerCase().startsWith('select') || query.toLowerCase().startsWith('pragma')) {
      const results = db.prepare(query).all();
      if (results.length === 0) {
        console.log('📭 No results\n');
      } else {
        console.table(results);
      }
    } else {
      const result = db.prepare(query).run();
      console.log('✅ Query executed:', result);
      console.log('');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message, '\n');
  }

  rl.prompt();
});

rl.on('close', () => {
  db.close();
  process.exit(0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  db.close();
  process.exit(0);
});

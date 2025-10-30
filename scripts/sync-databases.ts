#!/usr/bin/env tsx

/**
 * Database Sync Tool
 * Bidirectional sync between SQLite and Supabase
 * Useful for keeping local and cloud databases in sync
 */

import { SQLiteService } from '../lib/database/SQLiteService';
import { SupabaseService } from '../lib/database/SupabaseService';
import { DatabaseConfig } from '../lib/database/DatabaseAdapter';

type SyncDirection = 'sqlite-to-supabase' | 'supabase-to-sqlite' | 'bidirectional';

async function syncDatabases(direction: SyncDirection = 'bidirectional') {
  console.log(`🚀 Starting database sync (${direction})...\n`);

  // SQLite configuration
  const sqliteConfig: DatabaseConfig = {
    mode: 'sqlite',
    sqlite: {
      path: './cortexbuild.db',
    },
  };

  // Supabase configuration
  const supabaseConfig: DatabaseConfig = {
    mode: 'supabase',
    supabase: {
      url: process.env.VITE_SUPABASE_URL || '',
      anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
  };

  const sqliteService = new SQLiteService(sqliteConfig);
  const supabaseService = new SupabaseService(supabaseConfig);

  try {
    // Connect to both databases
    console.log('📊 Connecting to SQLite...');
    await sqliteService.connect();
    console.log('✅ SQLite connected');

    console.log('☁️ Connecting to Supabase...');
    await supabaseService.connect();
    console.log('✅ Supabase connected\n');

    if (direction === 'sqlite-to-supabase' || direction === 'bidirectional') {
      console.log('🔄 Syncing SQLite → Supabase...');
      const sqliteData = await sqliteService.exportData();
      await supabaseService.importData(sqliteData);
      console.log('✅ SQLite → Supabase sync complete\n');
    }

    if (direction === 'supabase-to-sqlite' || direction === 'bidirectional') {
      console.log('🔄 Syncing Supabase → SQLite...');
      const supabaseData = await supabaseService.exportData();
      await sqliteService.importData(supabaseData);
      console.log('✅ Supabase → SQLite sync complete\n');
    }

    console.log('✅ Database sync completed successfully!');
    console.log('🎉 Databases are now in sync');

  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from databases
    await sqliteService.disconnect();
    await supabaseService.disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const direction = (args[0] as SyncDirection) || 'bidirectional';

// Validate direction
if (!['sqlite-to-supabase', 'supabase-to-sqlite', 'bidirectional'].includes(direction)) {
  console.error('❌ Invalid sync direction. Use: sqlite-to-supabase, supabase-to-sqlite, or bidirectional');
  process.exit(1);
}

// Run sync
syncDatabases(direction).catch(console.error);



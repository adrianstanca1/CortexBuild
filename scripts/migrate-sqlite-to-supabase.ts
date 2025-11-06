#!/usr/bin/env tsx

/**
 * SQLite to Supabase Migration Tool
 * Migrates all data from SQLite database to Supabase
 */

import { SQLiteService } from '../lib/database/SQLiteService';
import { SupabaseService } from '../lib/database/SupabaseService';
import { DatabaseConfig } from '../lib/database/DatabaseAdapter';

async function migrateSQLiteToSupabase() {
  console.log('🚀 Starting SQLite → Supabase migration...\n');

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
    console.log('📊 Connecting to SQLite database...');
    await sqliteService.connect();
    console.log('✅ SQLite connected\n');

    console.log('☁️ Connecting to Supabase database...');
    await supabaseService.connect();
    console.log('✅ Supabase connected\n');

    // Export data from SQLite
    console.log('📦 Exporting data from SQLite...');
    const data = await sqliteService.exportData();

    // Count total records
    const totalRecords = Object.values(data).reduce((sum, records) => sum + records.length, 0);
    console.log(`✅ Exported ${totalRecords} records from ${Object.keys(data).length} tables\n`);

    // Display summary
    console.log('📋 Export Summary:');
    Object.entries(data).forEach(([table, records]) => {
      console.log(`   - ${table}: ${records.length} records`);
    });
    console.log();

    // Import data to Supabase
    console.log('☁️ Importing data to Supabase...');
    await supabaseService.importData(data);
    console.log('✅ Data imported successfully\n');

    // Verify migration
    console.log('🔍 Verifying migration...');
    let verificationPassed = true;

    for (const [table, records] of Object.entries(data)) {
      const { data: supabaseRecords, error } = await supabaseService.select(table);

      if (error) {
        console.log(`   ❌ ${table}: Error verifying (${error.message})`);
        verificationPassed = false;
      } else if (!supabaseRecords || supabaseRecords.length !== records.length) {
        console.log(`   ⚠️  ${table}: Count mismatch (SQLite: ${records.length}, Supabase: ${supabaseRecords?.length || 0})`);
        verificationPassed = false;
      } else {
        console.log(`   ✅ ${table}: ${supabaseRecords.length} records verified`);
      }
    }

    console.log();

    if (verificationPassed) {
      console.log('✅ Migration completed successfully!');
      console.log('🎉 All data has been migrated from SQLite to Supabase');
    } else {
      console.log('⚠️  Migration completed with warnings');
      console.log('Please review the verification results above');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from databases
    await sqliteService.disconnect();
    await supabaseService.disconnect();
  }
}

// Run migration
migrateSQLiteToSupabase().catch(console.error);



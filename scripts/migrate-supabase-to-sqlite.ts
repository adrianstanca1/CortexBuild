#!/usr/bin/env tsx

/**
 * Supabase to SQLite Migration Tool
 * Migrates all data from Supabase to SQLite database
 */

import { SQLiteService } from '../lib/database/SQLiteService';
import { SupabaseService } from '../lib/database/SupabaseService';
import { DatabaseConfig } from '../lib/database/DatabaseAdapter';

async function migrateSupabaseToSQLite() {
  console.log('🚀 Starting Supabase → SQLite migration...\n');

  // Supabase configuration
  const supabaseConfig: DatabaseConfig = {
    mode: 'supabase',
    supabase: {
      url: process.env.VITE_SUPABASE_URL || '',
      anonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
  };

  // SQLite configuration
  const sqliteConfig: DatabaseConfig = {
    mode: 'sqlite',
    sqlite: {
      path: './cortexbuild.db',
    },
  };

  const supabaseService = new SupabaseService(supabaseConfig);
  const sqliteService = new SQLiteService(sqliteConfig);

  try {
    // Connect to both databases
    console.log('☁️ Connecting to Supabase database...');
    await supabaseService.connect();
    console.log('✅ Supabase connected\n');

    console.log('📊 Connecting to SQLite database...');
    await sqliteService.connect();
    console.log('✅ SQLite connected\n');

    // Export data from Supabase
    console.log('📦 Exporting data from Supabase...');
    const data = await supabaseService.exportData();

    // Count total records
    const totalRecords = Object.values(data).reduce((sum, records) => sum + records.length, 0);
    console.log(`✅ Exported ${totalRecords} records from ${Object.keys(data).length} tables\n`);

    // Display summary
    console.log('📋 Export Summary:');
    Object.entries(data).forEach(([table, records]) => {
      console.log(`   - ${table}: ${records.length} records`);
    });
    console.log();

    // Import data to SQLite
    console.log('📊 Importing data to SQLite...');
    await sqliteService.importData(data);
    console.log('✅ Data imported successfully\n');

    // Verify migration
    console.log('🔍 Verifying migration...');
    let verificationPassed = true;

    for (const [table, records] of Object.entries(data)) {
      const { data: sqliteRecords, error } = await sqliteService.select(table);

      if (error) {
        console.log(`   ❌ ${table}: Error verifying (${error.message})`);
        verificationPassed = false;
      } else if (!sqliteRecords || sqliteRecords.length !== records.length) {
        console.log(`   ⚠️  ${table}: Count mismatch (Supabase: ${records.length}, SQLite: ${sqliteRecords?.length || 0})`);
        verificationPassed = false;
      } else {
        console.log(`   ✅ ${table}: ${sqliteRecords.length} records verified`);
      }
    }

    console.log();

    if (verificationPassed) {
      console.log('✅ Migration completed successfully!');
      console.log('🎉 All data has been migrated from Supabase to SQLite');
    } else {
      console.log('⚠️  Migration completed with warnings');
      console.log('Please review the verification results above');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from databases
    await supabaseService.disconnect();
    await sqliteService.disconnect();
  }
}

// Run migration
migrateSupabaseToSQLite().catch(console.error);



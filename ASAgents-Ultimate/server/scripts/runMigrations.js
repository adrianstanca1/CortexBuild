#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs SQL migration files in order
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asagents_db',
  multipleStatements: true
};

// Migration tracking table
const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

async function createMigrationsTable(connection) {
  console.log('Creating migrations tracking table...');
  await connection.execute(MIGRATIONS_TABLE);
}

async function getExecutedMigrations(connection) {
  try {
    const [rows] = await connection.execute('SELECT filename FROM migrations ORDER BY id');
    return rows.map(row => row.filename);
  } catch (error) {
    // Table doesn't exist yet
    return [];
  }
}

async function markMigrationExecuted(connection, filename) {
  await connection.execute(
    'INSERT INTO migrations (filename) VALUES (?)',
    [filename]
  );
}

async function executeMigration(connection, migrationPath, filename) {
  console.log(`Executing migration: ${filename}`);
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  try {
    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    await markMigrationExecuted(connection, filename);
    console.log(`✅ Migration ${filename} completed successfully`);
    
  } catch (error) {
    console.error(`❌ Migration ${filename} failed:`, error.message);
    throw error;
  }
}

async function runMigrations() {
  let connection;
  
  try {
    console.log('🚀 Starting database migrations...');
    console.log(`Connecting to database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');
    
    // Create migrations tracking table
    await createMigrationsTable(connection);
    
    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations(connection);
    console.log(`Found ${executedMigrations.length} previously executed migrations`);
    
    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Execute pending migrations
    let executedCount = 0;
    
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        const migrationPath = path.join(migrationsDir, filename);
        await executeMigration(connection, migrationPath, filename);
        executedCount++;
      } else {
        console.log(`⏭️  Skipping already executed migration: ${filename}`);
      }
    }
    
    if (executedCount === 0) {
      console.log('✅ All migrations are up to date');
    } else {
      console.log(`✅ Successfully executed ${executedCount} new migrations`);
    }
    
    // Verify database structure
    console.log('\n📊 Database structure verification:');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`Total tables: ${tables.length}`);
    
    // Show key tables
    const keyTables = ['tenants', 'users', 'projects', 'tasks', 'companies', 'expenses'];
    for (const tableName of keyTables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  ${tableName}: ${rows[0].count} records`);
      } catch (error) {
        console.log(`  ${tableName}: ❌ Table not found`);
      }
    }
    
    console.log('\n🎉 Database migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Database Migration Runner

Usage: node runMigrations.js [options]

Options:
  --help, -h     Show this help message
  --force        Force re-run all migrations (dangerous!)
  --dry-run      Show what would be executed without running

Environment Variables:
  DB_HOST        Database host (default: localhost)
  DB_PORT        Database port (default: 3306)
  DB_USER        Database user (default: root)
  DB_PASSWORD    Database password
  DB_NAME        Database name (default: asagents_db)

Examples:
  node runMigrations.js
  node runMigrations.js --dry-run
  DB_HOST=mysql.example.com node runMigrations.js
`);
  process.exit(0);
}

if (args.includes('--dry-run')) {
  console.log('🔍 DRY RUN MODE - No changes will be made');
  
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  console.log('\nMigrations that would be executed:');
  migrationFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  
  process.exit(0);
}

if (args.includes('--force')) {
  console.log('⚠️  FORCE MODE - This will re-run all migrations!');
  console.log('This is dangerous and may cause data loss.');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
}

// Run migrations
runMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

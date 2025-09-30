import fs from 'fs';
import path from 'path';
import { getDatabase } from './connection';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  const db = getDatabase();
  
  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute PRAGMA first
    await db.run('PRAGMA foreign_keys = ON');

    // Split schema into logical statements, handling multi-line triggers
    const statements: string[] = [];
    let currentStatement = '';
    let inTrigger = false;

    const lines = schema.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('--') || trimmedLine.startsWith('PRAGMA')) {
        continue;
      }

      currentStatement += line + '\n';

      // Check if we're starting a trigger
      if (trimmedLine.toUpperCase().includes('CREATE TRIGGER')) {
        inTrigger = true;
      }

      // Check if we're ending a statement
      if (trimmedLine.endsWith(';')) {
        if (!inTrigger || trimmedLine.toUpperCase().includes('END;')) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          inTrigger = false;
        }
      }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      try {
        if (statement.trim()) {
          await db.run(statement);
          const preview = statement.replace(/\s+/g, ' ').substring(0, 60);
          console.log(`✅ Executed: ${preview}...`);
        }
      } catch (error) {
        console.error(`❌ Error executing statement: ${statement.substring(0, 200)}...`);
        console.error(error);
        throw error;
      }
    }
    
    console.log('✅ Database migrations completed successfully!');
    
    // Verify tables were created
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    console.log('📊 Created tables:');
    tables.forEach((table: any) => {
      console.log(`  - ${table.name}`);
    });
    
    // Get database stats
    const stats = await db.getStats();
    console.log(`📈 Database stats: ${stats.tables} tables, ${stats.totalRows} rows, ${Math.round(stats.databaseSize / 1024)} KB`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🎉 Migration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    });
}

export { runMigrations };

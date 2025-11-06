import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase credentials
const SUPABASE_URL = 'https://qglvhxkgbzujglehewsa.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbHZoeGtnYnp1amdsZWhld3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODIzNzkwMSwiZXhwIjoyMDczODEzOTAxfQ.eg6hoz1bIc1FzPjMAs8oaCuv1yjymxk_5MYjpg9vEFQ';

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...\n');

  try {
    // Read the complete schema file
    const schemaPath = path.join(__dirname, 'supabase', 'COMPLETE_SCHEMA.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split into individual statements (simple split by semicolon)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err: any) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 Verifying tables...');

    // Verify tables were created
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError);
    } else {
      console.log('\n✅ Tables created:');
      tables?.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
    }

    console.log('\n🔐 Test accounts:');
    console.log('   🔴 Super Admin: adrian.stanca1@gmail.com / parola123');
    console.log('   🟠 Company Admin: adrian@ascladdingltd.co.uk / lolozania1');
    console.log('   🟢 Developer: adrian.stanca1@icloud.com / password123');

  } catch (error: any) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();


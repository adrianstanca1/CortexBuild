/**
 * Setup Supabase Database
 * Run with: npx tsx scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function displaySQL(sqlFile: string) {
    console.log(`\n📄 ${sqlFile}:`);
    console.log('═'.repeat(80));

    const filePath = path.join(process.cwd(), 'supabase', sqlFile);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(sql);
    console.log('═'.repeat(80));
    console.log(`\n✅ Copy the SQL above and run it in Supabase SQL Editor`);
    console.log(`   URL: ${supabaseUrl.replace('.supabase.co', '')}.supabase.co/project/_/sql`);
}

async function setupDatabase() {
    console.log('🚀 CortexBuild Supabase Setup Guide\n');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    console.log(`📍 Project: ${supabaseUrl.split('//')[1].split('.')[0]}`);

    console.log('\n' + '═'.repeat(80));
    console.log('MANUAL SETUP INSTRUCTIONS');
    console.log('═'.repeat(80));

    console.log('\n📋 Step 1: Open Supabase SQL Editor');
    console.log(`   URL: https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/sql/new`);

    console.log('\n📋 Step 2: Run Schema SQL');
    console.log('   Copy and paste the content of: supabase/schema.sql');
    console.log('   Click "Run" to create all tables');

    console.log('\n📋 Step 3: Run Seed Data SQL');
    console.log('   Copy and paste the content of: supabase/seed.sql');
    console.log('   Click "Run" to insert demo data');

    console.log('\n📋 Step 4: Verify Setup');
    console.log('   Check that tables were created in Table Editor');
    console.log('   Verify 6 marketplace apps in sdk_apps table');
    console.log('   Verify 5 demo users in users table');

    console.log('\n👤 Demo Users (Password: parola123):');
    console.log('   ✅ Super Admin:    adrian.stanca1@gmail.com');
    console.log('   ✅ Company Admin:  adrian@ascladdingltd.co.uk');
    console.log('   ✅ Developer:      adrian.stanca1@icloud.com');
    console.log('   ✅ User:           john.smith@ascladdingltd.co.uk');
    console.log('   ✅ Company Admin:  sarah.johnson@buildright.com');

    console.log('\n📦 Marketplace Apps:');
    console.log('   ✅ Project Dashboard (📊 analytics)');
    console.log('   ✅ Team Chat (💬 communication)');
    console.log('   ✅ Time Tracker (⏱️ productivity)');
    console.log('   ✅ Team Calendar (📅 productivity)');
    console.log('   ✅ Task Manager (✅ productivity)');
    console.log('   ✅ Expense Tracker (💰 finance)');

    console.log('\n🌐 Next Steps After Setup:');
    console.log('   1. ✅ Database schema created in Supabase');
    console.log('   2. 🔄 Update backend to use Supabase (see SUPABASE_MIGRATION.md)');
    console.log('   3. 🚀 Deploy backend to Render/Railway');
    console.log('   4. ⚙️  Update VITE_API_URL in Vercel');
    console.log('   5. 🧪 Test login on production');

    console.log('\n' + '═'.repeat(80));
    console.log('SQL FILES READY TO COPY');
    console.log('═'.repeat(80));

    console.log('\n📄 File locations:');
    console.log('   Schema: supabase/schema.sql');
    console.log('   Seed:   supabase/seed.sql');

    console.log('\n✅ Setup guide complete!');
    console.log('   Open Supabase Dashboard and run the SQL files manually.');
}

setupDatabase();


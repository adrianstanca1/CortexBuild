/**
 * Update Password Hashes in Supabase
 * 
 * This script updates password hashes for test users in Supabase
 * using bcrypt (matching the backend verification method)
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
});

interface User {
  email: string;
  password: string;
  name: string;
}

const testUsers: User[] = [
  {
    email: 'adrian.stanca1@gmail.com',
    password: 'parola123',
    name: 'Adrian Stanca',
  },
  {
    email: 'adrian@ascladdingltd.co.uk',
    password: 'lolozania1',
    name: 'Adrian ASC',
  },
  {
    email: 'adrian.stanca1@icloud.com',
    password: 'password123',
    name: 'Adrian Dev',
  },
];

async function updatePasswordHashes() {
  console.log('🔐 Updating password hashes in Supabase...\n');

  for (const testUser of testUsers) {
    try {
      // Hash password using bcrypt (10 rounds, same as backend)
      const passwordHash = await bcrypt.hash(testUser.password, 10);
      console.log(`📝 Hashing password for: ${testUser.email}`);

      // Update user password hash
      const { data, error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString(),
        })
        .eq('email', testUser.email)
        .select();

      if (error) {
        console.error(`❌ Error updating ${testUser.email}:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated password for: ${testUser.email}`);
      } else {
        console.log(`⚠️  User not found: ${testUser.email}`);
        console.log(`   Creating user...`);
        
        // Try to create user (let Supabase generate ID using DEFAULT)
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: testUser.email,
            password_hash: passwordHash,
            name: testUser.name,
            role: testUser.email.includes('gmail') ? 'super_admin' : 
                  testUser.email.includes('ascladding') ? 'company_admin' : 'developer',
            company_id: 'company-1',
          })
          .select();

        if (createError) {
          console.error(`❌ Error creating ${testUser.email}:`, createError.message);
        } else if (newUser && newUser.length > 0) {
          console.log(`✅ Created user: ${testUser.email}`);
        }
      }
    } catch (err: any) {
      console.error(`❌ Exception for ${testUser.email}:`, err.message);
    }
  }

  console.log('\n✅ Password hash update complete!');
  console.log('\n🧪 Test login:');
  console.log('   curl -X POST http://localhost:3001/api/auth/login \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"adrian.stanca1@icloud.com","password":"password123"}\'');
}

// Run the update
updatePasswordHashes()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });


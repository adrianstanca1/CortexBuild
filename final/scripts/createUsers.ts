/**
 * User Creation Script
 * Creates demo users for testing the application
 */

import { supabaseService } from '../services/supabaseService';

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: string;
  position: string;
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@democonstruction.com',
    password: 'DemoPass123!',
    name: 'John Admin',
    role: 'admin',
    position: 'Managing Director',
  },
  {
    email: 'manager@democonstruction.com',
    password: 'DemoPass123!',
    name: 'Sarah Manager',
    role: 'manager',
    position: 'Project Manager',
  },
  {
    email: 'supervisor@democonstruction.com',
    password: 'DemoPass123!',
    name: 'Mike Supervisor',
    role: 'supervisor',
    position: 'Site Supervisor',
  },
  {
    email: 'worker1@democonstruction.com',
    password: 'DemoPass123!',
    name: 'Tom Worker',
    role: 'user',
    position: 'Construction Worker',
  },
  {
    email: 'worker2@democonstruction.com',
    password: 'DemoPass123!',
    name: 'Emma Builder',
    role: 'user',
    position: 'Construction Worker',
  },
  {
    email: 'finance@democonstruction.com',
    password: 'DemoPass123!',
    name: 'Lisa Finance',
    role: 'accountant',
    position: 'Senior Accountant',
  },
];

export async function createDemoUsers() {
  console.log('🚀 Creating demo users...\n');

  const companyName = 'Demo Construction Co';
  let createdCount = 0;
  let errorCount = 0;

  for (const user of demoUsers) {
    try {
      console.log(`Creating user: ${user.name} (${user.email})...`);
      
      await supabaseService.signUp(
        user.email,
        user.password,
        user.name,
        createdCount === 0 ? companyName : undefined // First user creates company
      );
      
      console.log(`✅ Created: ${user.name}\n`);
      createdCount++;
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`❌ Failed to create ${user.name}:`, error.message, '\n');
      errorCount++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Successfully created: ${createdCount} users`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} users`);
  }
  console.log('═══════════════════════════════════════\n');

  console.log('📋 Demo User Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  demoUsers.forEach(user => {
    console.log(`\n${user.name} (${user.role})`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
  });
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎯 Next Steps:');
  console.log('1. Check your email for verification links');
  console.log('2. Click verification links for each user');
  console.log('3. Log in at http://localhost:5173');
  console.log('4. Explore the platform!\n');

  return {
    created: createdCount,
    failed: errorCount,
    users: demoUsers.map(u => ({
      email: u.email,
      password: u.password,
      name: u.name,
    })),
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDemoUsers()
    .then(() => {
      console.log('✨ User creation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error creating users:', error);
      process.exit(1);
    });
}



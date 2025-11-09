/* eslint-env node */
/**
 * Update user passwords in database
 * Run with: node update-passwords.js
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('cortexbuild.db');

const users = [
  {
    email: 'adrian.stanca1@gmail.com',
    password: 'parola123',
    name: 'Super Admin'
  },
  {
    email: 'adrian@ascladdingltd.co.uk',
    password: 'Lolozania1',
    name: 'Company Admin'
  },
  {
    email: 'dev@constructco.com',
    password: 'parola123',
    name: 'Developer'
  }
];

console.log('🔐 Actualizare parole utilizatori...\n');

users.forEach(user => {
  const hash = bcrypt.hashSync(user.password, 10);
  
  const result = db.prepare(`
    UPDATE users 
    SET password_hash = ? 
    WHERE email = ?
  `).run(hash, user.email);
  
  if (result.changes > 0) {
    console.log(`✅ ${user.name} (${user.email})`);
    console.log(`   Parolă: ${user.password}`);
  } else {
    console.log(`❌ Nu s-a găsit: ${user.email}`);
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Parolele au fost actualizate!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n🔐 CREDENȚIALE DE LOGIN:\n');
console.log('Super Admin:');
console.log('  Email:    adrian.stanca1@gmail.com');
console.log('  Parolă:   parola123\n');
console.log('Company Admin:');
console.log('  Email:    adrian@ascladdingltd.co.uk');
console.log('  Parolă:   Lolozania1\n');
console.log('Developer:');
console.log('  Email:    dev@constructco.com');
console.log('  Parolă:   parola123\n');

db.close();

/**
 * Reset password pentru utilizator
 * Usage: node reset-password.js email newpassword
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('./cortexbuild.db');

const email = process.argv[2] || 'adrian.stanca1@gmail.com';
const password = process.argv[3] || 'password123';

console.log(`\n🔐 Resetare parolă pentru: ${email}`);
console.log(`📝 Noua parolă: ${password}\n`);

try {
  // Hash parola
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Update în database
  const stmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');
  const result = stmt.run(hashedPassword, email);

  if (result.changes > 0) {
    console.log('✅ Parolă resetată cu succes!');
    console.log(`\n📋 Credentials pentru login:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}\n`);

    // Verificăm utilizatorul
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').get(email);
    console.log('👤 User info:');
    console.log(`   ID:   ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}\n`);
  } else {
    console.log('❌ Utilizatorul nu a fost găsit!');
  }

  db.close();
} catch (error) {
  console.error('❌ Eroare:', error.message);
  process.exit(1);
}

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('./cortexbuild.db');

const email = 'adrian.stanca1@gmail.com';
const password = 'password123';
const hashedPassword = bcrypt.hashSync(password, 10);

const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?');
const result = stmt.run(hashedPassword, email);

console.log('✅ Parolă resetată!');
console.log('Email:', email);
console.log('Password:', password);
console.log('Changes:', result.changes);
db.close();

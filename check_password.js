const crypto = require('crypto');

// The password you're trying to login with
const password = 'parola123';

// Hash it with SHA-256
const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

console.log('Password:', password);
console.log('SHA-256 Hash:', hashedPassword);
console.log('\nThis is what should be stored in the database for adrian.stanca1@gmail.com');

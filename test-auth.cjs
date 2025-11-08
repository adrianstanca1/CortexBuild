// Test authentication logic
const { authHelpers } = require('./middleware/auth.cjs');

console.log('Testing authentication logic...');

// Test user lookup
const email = 'demo@cortexbuild.com';
const password = 'demo-password';

console.log('Looking up user:', email);
const user = authHelpers.findUserByEmail(email);
console.log('User found:', user);

if (user) {
  console.log('Testing password validation...');
  console.log('Stored password hash:', user.password);
  console.log('Input password:', password);

  const isValid = authHelpers.validatePassword(password, user.password);
  console.log('Password validation result:', isValid);
} else {
  console.log('❌ User not found');
}

// List all demo users
console.log('\nAll demo users:');
const { authHelpers: helpers } = require('./middleware/auth.cjs');
// We need to access the demoUsers array directly
console.log('Demo users should be available in the auth module');

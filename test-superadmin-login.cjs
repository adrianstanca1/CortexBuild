/**
 * SuperAdmin Login Test Script
 * Tests login functionality for superadmin user
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api';

/**
 * API helper
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

/**
 * Test superadmin login
 */
async function testSuperAdminLogin() {
  console.log('🔐 Testing SuperAdmin login...\n');

  const loginData = {
    email: 'adrian.stanca1@gmail.com',
    password: 'password123'
  };

  try {
    console.log('Attempting login with:', loginData.email);
    const response = await api.post('/auth/login', loginData);

    if (response.data.success) {
      console.log('✅ SuperAdmin login successful!');
      console.log('User:', response.data.user);
      console.log('Token received:', response.data.token ? 'Yes' : 'No');

      // Test admin stats endpoint with token
      if (response.data.token) {
        const statsResponse = await api.get('/admin/stats', {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });

        if (statsResponse.data.success) {
          console.log('✅ Admin stats endpoint accessible');
          console.log('Stats:', statsResponse.data);
        } else {
          console.log('❌ Admin stats endpoint failed:', statsResponse.data);
        }
      }

      return true;
    } else {
      console.log('❌ Login failed:', response.data.error);
      return false;
    }
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⏳ Rate limited. Please wait a few minutes and try again.');
      console.log('Rate limit resets in:', error.response.data.retryAfter, 'seconds');
    } else {
      console.error('❌ Login error:', error.response?.data?.error || error.message);
    }
    return false;
  }
}

/**
 * Test with different user
 */
async function testDeveloperLogin() {
  console.log('\n🔧 Testing Developer login...\n');

  const loginData = {
    email: 'adrian.stanca1@icloud.com',
    password: 'password123'
  };

  try {
    console.log('Attempting login with:', loginData.email);
    const response = await api.post('/auth/login', loginData);

    if (response.data.success) {
      console.log('✅ Developer login successful!');
      console.log('User:', response.data.user);

      // Test SDK endpoints
      if (response.data.token) {
        const profileResponse = await api.get('/sdk/profile', {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });

        if (profileResponse.data.success) {
          console.log('✅ SDK profile accessible');
          console.log('Profile:', profileResponse.data.profile);
        }
      }

      return true;
    } else {
      console.log('❌ Developer login failed:', response.data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Developer login error:', error.response?.data?.error || error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function runAuthTests() {
  console.log('🚀 Starting Authentication Tests...\n');

  console.log('📋 Available Test Users:');
  console.log('1. SuperAdmin: adrian.stanca1@gmail.com / password123');
  console.log('2. Developer: adrian.stanca1@icloud.com / password123');
  console.log('3. Company Admin: adrian@ascladdingltd.co.uk / lolozania1');
  console.log('');

  const results = await Promise.all([
    testSuperAdminLogin(),
    testDeveloperLogin()
  ]);

  const allPassed = results.every(result => result);

  if (allPassed) {
    console.log('\n🎉 All authentication tests passed!');
    console.log('🔐 Login system is working correctly!');
  } else {
    console.log('\n⚠️ Some authentication tests failed');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. If rate limited, wait 10-15 minutes');
    console.log('2. Check server logs for detailed errors');
    console.log('3. Verify database has correct password hashes');
  }

  return allPassed;
}

if (require.main === module) {
  runAuthTests()
    .then((success) => {
      console.log('\n✅ Authentication testing completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Authentication test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runAuthTests };
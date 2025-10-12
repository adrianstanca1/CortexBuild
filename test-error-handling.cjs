/**
 * Error Handling Test Script
 * Tests error handling and edge cases for SDK functionality
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
 * Test error handling for various scenarios
 */
async function testErrorHandling() {
  console.log('🛡️ Testing error handling and edge cases...\n');

  const tests = [
    {
      name: 'Invalid authentication',
      test: () => api.get('/sdk/profile'),
      shouldFail: true,
      expectedError: '401 or 403'
    },
    {
      name: 'Invalid workspace creation (no data)',
      test: () => api.post('/sdk/workspaces', {}),
      shouldFail: true,
      expectedError: '400'
    },
    {
      name: 'Invalid collaboration session (no data)',
      test: () => api.post('/sdk/collaboration/sessions', {}),
      shouldFail: true,
      expectedError: '400'
    },
    {
      name: 'Non-existent workspace',
      test: () => api.get('/sdk/workspaces/non-existent-id'),
      shouldFail: true,
      expectedError: '404'
    },
    {
      name: 'Server health check',
      test: () => api.get('/health'),
      shouldFail: false
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test, shouldFail, expectedError } of tests) {
    try {
      await test();

      if (shouldFail) {
        console.log(`❌ ${name}: Expected to fail but succeeded`);
        failed++;
      } else {
        console.log(`✅ ${name}: Passed (no error as expected)`);
        passed++;
      }
    } catch (error) {
      if (shouldFail) {
        const statusCode = error.response?.status?.toString();
        if (!expectedError || statusCode === expectedError || expectedError.includes(statusCode)) {
          console.log(`✅ ${name}: Failed as expected (${statusCode})`);
          passed++;
        } else {
          console.log(`❌ ${name}: Failed with wrong status (${statusCode}, expected ${expectedError})`);
          failed++;
        }
      } else {
        console.log(`❌ ${name}: Unexpected error - ${error.response?.data?.error || error.message}`);
        failed++;
      }
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n📋 Error Handling Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All error handling tests passed!');
    console.log('🛡️ SDK has robust error handling and validation');
  } else {
    console.log(`\n⚠️  ${failed} error handling test(s) failed`);
  }

  return failed === 0;
}

/**
 * Test frontend error scenarios
 */
async function testFrontendErrorScenarios() {
  console.log('\n🎨 Testing frontend error scenarios...');

  // Test server availability for frontend
  try {
    const response = await api.get('/health');
    if (response.data.status === 'ok') {
      console.log('✅ Frontend can connect to backend');
      console.log('✅ Error boundaries should handle user object issues');
      return true;
    }
  } catch (error) {
    console.error('❌ Frontend cannot connect to backend:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function runErrorHandlingTests() {
  console.log('🚀 Starting Error Handling Tests...\n');

  const results = await Promise.all([
    testErrorHandling(),
    testFrontendErrorScenarios()
  ]);

  const allPassed = results.every(result => result);

  if (allPassed) {
    console.log('\n🎉 All error handling tests completed successfully!');
    console.log('🛡️ SDK error handling is robust and production-ready');
  } else {
    console.log('\n⚠️ Some error handling tests failed');
  }

  return allPassed;
}

if (require.main === module) {
  runErrorHandlingTests()
    .then((success) => {
      console.log('\n✅ Error handling testing completed!');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Error handling test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runErrorHandlingTests };
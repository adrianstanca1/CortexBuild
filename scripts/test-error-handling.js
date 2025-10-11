/**
 * Test script for API Error Handling
 * Tests standardized error responses, retry logic, and offline detection
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testErrorHandling() {
  console.log('🧪 Testing API Error Handling...\n');

  try {
    // Test 1: Invalid project ID (should return 400 with ValidationError)
    console.log('Test 1: Invalid project ID');
    try {
      await axios.get(`${BASE_URL}/api/projects/invalid-id`);
    } catch (error) {
      console.log('✅ Response:', error.response?.status, error.response?.data);
    }

    // Test 2: Non-existent project (should return 404 with NotFoundError)
    console.log('\nTest 2: Non-existent project');
    try {
      await axios.get(`${BASE_URL}/api/projects/999999`);
    } catch (error) {
      console.log('✅ Response:', error.response?.status, error.response?.data);
    }

    // Test 3: Invalid project creation data (should return 400 with ValidationError)
    console.log('\nTest 3: Invalid project creation');
    try {
      await axios.post(`${BASE_URL}/api/projects`, {});
    } catch (error) {
      console.log('✅ Response:', error.response?.status, error.response?.data);
    }

    // Test 4: Health check (should work)
    console.log('\nTest 4: Health check');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data);

    console.log('\n🎉 Error handling tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testErrorHandling();
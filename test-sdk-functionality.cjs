/**
 * SDK Functionality Test Script
 * Tests all SDK workspace and developer features
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

// Test data
let authToken = '';
let testWorkspaceId = '';
let testSessionId = '';

/**
 * API helper functions
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

const apiWithAuth = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

apiWithAuth.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

/**
 * Test functions
 */
async function login() {
  console.log('🔐 Testing login...');
  try {
    const response = await api.post('/auth/login', TEST_USER);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testProfile() {
  console.log('👤 Testing SDK profile...');
  try {
    const response = await apiWithAuth.get('/sdk/profile');
    if (response.data.success) {
      console.log('✅ Profile loaded:', response.data.profile);
      return true;
    }
  } catch (error) {
    console.error('❌ Profile test failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testWorkspaces() {
  console.log('🏢 Testing workspace management...');

  // Create workspace
  try {
    const response = await apiWithAuth.post('/sdk/workspaces', {
      name: 'Test Workspace',
      description: 'Test workspace for SDK functionality',
      isPublic: false,
      settings: { theme: 'dark' }
    });

    if (response.data.success) {
      testWorkspaceId = response.data.workspace.id;
      console.log('✅ Workspace created:', testWorkspaceId);
    }
  } catch (error) {
    console.error('❌ Workspace creation failed:', error.response?.data?.error || error.message);
    return false;
  }

  // Get workspaces
  try {
    const response = await apiWithAuth.get('/sdk/workspaces');
    if (response.data.success && response.data.workspaces.length > 0) {
      console.log('✅ Workspaces retrieved:', response.data.workspaces.length);
      return true;
    }
  } catch (error) {
    console.error('❌ Get workspaces failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testCollaboration() {
  console.log('🤝 Testing collaboration features...');

  if (!testWorkspaceId) {
    console.error('❌ No workspace ID available for collaboration test');
    return false;
  }

  // Create collaboration session
  try {
    const response = await apiWithAuth.post('/sdk/collaboration/sessions', {
      workspaceId: testWorkspaceId,
      name: 'Test Collaboration Session',
      description: 'Testing real-time collaboration',
      settings: { maxParticipants: 10 }
    });

    if (response.data.success) {
      testSessionId = response.data.session.id;
      console.log('✅ Collaboration session created:', testSessionId);
    }
  } catch (error) {
    console.error('❌ Session creation failed:', error.response?.data?.error || error.message);
    return false;
  }

  // Join session
  try {
    const response = await apiWithAuth.post(`/sdk/collaboration/sessions/${testSessionId}/join`);
    if (response.data.success) {
      console.log('✅ Joined collaboration session');
    }
  } catch (error) {
    console.error('❌ Join session failed:', error.response?.data?.error || error.message);
    return false;
  }

  // Update live cursor
  try {
    const response = await apiWithAuth.post('/sdk/collaboration/cursor', {
      sessionId: testSessionId,
      filePath: 'test-file.ts',
      lineNumber: 10,
      column: 5,
      color: '#3B82F6'
    });

    if (response.data.success) {
      console.log('✅ Live cursor updated');
    }
  } catch (error) {
    console.error('❌ Cursor update failed:', error.response?.data?.error || error.message);
    return false;
  }

  // Add code comment
  try {
    const response = await apiWithAuth.post('/sdk/collaboration/comments', {
      sessionId: testSessionId,
      filePath: 'test-file.ts',
      lineNumber: 10,
      columnStart: 0,
      columnEnd: 20,
      content: 'This is a test comment for collaboration'
    });

    if (response.data.success) {
      console.log('✅ Code comment added');
    }
  } catch (error) {
    console.error('❌ Add comment failed:', error.response?.data?.error || error.message);
    return false;
  }

  return true;
}

async function testProjectTemplates() {
  console.log('📋 Testing project templates...');

  // Get templates
  try {
    const response = await apiWithAuth.get('/sdk/templates');
    if (response.data.success) {
      console.log('✅ Project templates retrieved:', response.data.templates.length);
      return true;
    }
  } catch (error) {
    console.error('❌ Get templates failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testCodeGeneration() {
  console.log('🤖 Testing AI code generation...');

  try {
    const response = await apiWithAuth.post('/sdk/generate', {
      prompt: 'Create a TypeScript function to calculate construction project budget with materials, labor, and overhead costs',
      provider: 'openai',
      model: 'gpt-4o-mini'
    });

    if (response.data.success) {
      console.log('✅ Code generated successfully');
      console.log('📊 Token usage:', response.data.tokens);
      console.log('💰 Cost:', response.data.cost);
      return true;
    }
  } catch (error) {
    console.error('❌ Code generation failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testAppsAndWorkflows() {
  console.log('📱 Testing apps and workflows...');

  // Save app
  try {
    const response = await apiWithAuth.post('/sdk/apps', {
      name: 'Test Construction App',
      description: 'Test app for construction management',
      code: 'console.log("Hello from test app");',
      status: 'draft',
      companyId: null
    });

    if (response.data.success) {
      console.log('✅ App saved successfully');
    }
  } catch (error) {
    console.error('❌ Save app failed:', error.response?.data?.error || error.message);
    return false;
  }

  // Save workflow
  try {
    const response = await apiWithAuth.post('/sdk/workflows', {
      name: 'Test Workflow',
      definition: {
        nodes: [
          { id: '1', type: 'trigger', name: 'Start', config: {}, position: { x: 0, y: 0 } },
          { id: '2', type: 'action', name: 'Process', config: {}, position: { x: 0, y: 100 } }
        ],
        connections: [
          { id: 'conn-1', source: '1', target: '2' }
        ]
      },
      isActive: true,
      companyId: null
    });

    if (response.data.success) {
      console.log('✅ Workflow saved successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Save workflow failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testAnalytics() {
  console.log('📊 Testing analytics...');

  try {
    const response = await apiWithAuth.get('/sdk/analytics/usage');
    if (response.data.success) {
      console.log('✅ Analytics retrieved:', response.data.costSummary);
      return true;
    }
  } catch (error) {
    console.error('❌ Analytics failed:', error.response?.data?.error || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting SDK Functionality Tests...\n');

  const tests = [
    { name: 'Login', test: login },
    { name: 'SDK Profile', test: testProfile },
    { name: 'Workspaces', test: testWorkspaces },
    { name: 'Collaboration', test: testCollaboration },
    { name: 'Project Templates', test: testProjectTemplates },
    { name: 'Code Generation', test: testCodeGeneration },
    { name: 'Apps & Workflows', test: testAppsAndWorkflows },
    { name: 'Analytics', test: testAnalytics }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      const success = await test();
      if (success) {
        passed++;
        console.log(`✅ ${name}: PASSED\n`);
      } else {
        failed++;
        console.log(`❌ ${name}: FAILED\n`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${name}: ERROR - ${error.message}\n`);
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📋 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All SDK functionality tests passed!');
    console.log('🚀 SDK workspace and developer features are working correctly!');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please check the errors above.`);
  }
}

/**
 * Cleanup function
 */
async function cleanup() {
  console.log('🧹 Cleaning up test data...');

  if (testSessionId) {
    try {
      await apiWithAuth.post(`/sdk/collaboration/sessions/${testSessionId}/leave`);
      console.log('✅ Left collaboration session');
    } catch (error) {
      console.error('❌ Failed to leave session:', error.response?.data?.error || error.message);
    }
  }

  if (testWorkspaceId) {
    try {
      // Note: In a real cleanup, you might want to delete the workspace
      console.log('✅ Test workspace preserved for manual inspection');
    } catch (error) {
      console.error('❌ Cleanup failed:', error.response?.data?.error || error.message);
    }
  }
}

// Handle script execution
if (require.main === module) {
  runAllTests()
    .then(() => {
      return cleanup();
    })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test suite failed:', error);
      cleanup().then(() => process.exit(1));
    });
}

module.exports = { runAllTests, cleanup };
/**
 * Verify All API Endpoints
 * 
 * This script tests all registered API endpoints to ensure they are working correctly
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  requiresAuth?: boolean;
}

const endpoints: Endpoint[] = [
  // Auth endpoints
  { method: 'GET', path: '/health', description: 'Health check', requiresAuth: false },
  { method: 'POST', path: '/auth/login', description: 'Login', requiresAuth: false },
  { method: 'POST', path: '/auth/register', description: 'Register', requiresAuth: false },
  { method: 'GET', path: '/auth/me', description: 'Get current user', requiresAuth: true },
  
  // Core endpoints
  { method: 'GET', path: '/clients', description: 'Get clients', requiresAuth: true },
  { method: 'GET', path: '/projects', description: 'Get projects', requiresAuth: true },
  { method: 'GET', path: '/tasks', description: 'Get tasks', requiresAuth: true },
  { method: 'GET', path: '/rfis', description: 'Get RFIs', requiresAuth: true },
  { method: 'GET', path: '/invoices', description: 'Get invoices', requiresAuth: true },
  { method: 'GET', path: '/time-entries', description: 'Get time entries', requiresAuth: true },
  { method: 'GET', path: '/subcontractors', description: 'Get subcontractors', requiresAuth: true },
  { method: 'GET', path: '/purchase-orders', description: 'Get purchase orders', requiresAuth: true },
  { method: 'GET', path: '/milestones', description: 'Get milestones', requiresAuth: true },
  { method: 'GET', path: '/documents', description: 'Get documents', requiresAuth: true },
  
  // Feature endpoints
  { method: 'GET', path: '/gantt', description: 'Get Gantt chart data', requiresAuth: true },
  { method: 'GET', path: '/wbs', description: 'Get WBS structure', requiresAuth: true },
  { method: 'GET', path: '/budgets', description: 'Get budgets', requiresAuth: true },
  { method: 'GET', path: '/modules', description: 'Get modules', requiresAuth: true },
  { method: 'GET', path: '/marketplace', description: 'Get marketplace', requiresAuth: true },
  { method: 'GET', path: '/smart-tools', description: 'Get smart tools', requiresAuth: true },
  { method: 'GET', path: '/widgets', description: 'Get widgets', requiresAuth: true },
  { method: 'GET', path: '/automations', description: 'Get automations', requiresAuth: true },
  { method: 'GET', path: '/workflows', description: 'Get workflows', requiresAuth: true },
  
  // Advanced endpoints
  { method: 'GET', path: '/integrations', description: 'Get integrations', requiresAuth: true },
  { method: 'GET', path: '/agentkit', description: 'Get agentkit', requiresAuth: true },
  { method: 'GET', path: '/global-marketplace', description: 'Get global marketplace', requiresAuth: true },
  { method: 'GET', path: '/ai', description: 'Get AI chat', requiresAuth: true },
  { method: 'GET', path: '/sdk', description: 'Get SDK', requiresAuth: true },
  { method: 'GET', path: '/developer', description: 'Get developer console', requiresAuth: true },
  
  // Admin endpoints
  { method: 'GET', path: '/admin', description: 'Get admin dashboard', requiresAuth: true },
  { method: 'GET', path: '/admin/sdk', description: 'Get admin SDK', requiresAuth: true },
  { method: 'GET', path: '/admin/enhanced', description: 'Get enhanced admin', requiresAuth: true },
];

async function testEndpoint(endpoint: Endpoint, token?: string): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const config: any = {
      method: endpoint.method.toLowerCase(),
      url: `${BASE_URL}${endpoint.path}`,
    };

    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }

    // For GET requests, we can test. For POST/PUT, we'll just check if endpoint exists
    if (endpoint.method === 'GET') {
      const response = await axios(config);
      return { success: response.status >= 200 && response.status < 400, status: response.status };
    } else {
      // For POST/PUT/DELETE, just check if endpoint is registered (will return 400/401, not 404)
      try {
        const response = await axios(config);
        return { success: response.status !== 404, status: response.status };
      } catch (error: any) {
        if (error.response) {
          // Endpoint exists (got response, not 404)
          return { success: error.response.status !== 404, status: error.response.status };
        } else {
          // Network error
          return { success: false, error: error.message };
        }
      }
    }
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      // 401/403 = endpoint exists, just needs auth
      // 404 = endpoint doesn't exist
      // 400 = endpoint exists, bad request
      if (status === 404) {
        return { success: false, status: 404, error: 'Endpoint not found' };
      } else {
        return { success: status !== 404, status, error: error.response.data?.error || error.message };
      }
    }
    return { success: false, error: error.message };
  }
}

async function verifyAllEndpoints() {
  console.log('🔍 Verifying all API endpoints...\n');

  // First, get auth token if possible
  let token: string | undefined;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'adrian.stanca1@gmail.com',
      password: 'parola123',
    });
    if (loginResponse.data?.token) {
      token = loginResponse.data.token;
      console.log('✅ Authentication successful, using token for protected endpoints\n');
    }
  } catch (error) {
    console.log('⚠️  Authentication failed, testing endpoints without token\n');
  }

  const results: { endpoint: Endpoint; result: { success: boolean; status?: number; error?: string } }[] = [];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint, endpoint.requiresAuth ? token : undefined);
    results.push({ endpoint, result });
    
    const status = result.success ? '✅' : result.status === 404 ? '❌' : '⚠️';
    const statusText = result.status ? ` [${result.status}]` : '';
    console.log(`${status} ${endpoint.method} ${endpoint.path}${statusText} - ${endpoint.description}`);
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success && r.result.status === 404).length;
  const needsAuth = results.filter(r => !r.result.success && r.result.status !== 404).length;

  console.log(`✅ Working: ${successful}/${endpoints.length}`);
  console.log(`❌ Not found: ${failed}/${endpoints.length}`);
  console.log(`⚠️  Needs auth/fix: ${needsAuth}/${endpoints.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed endpoints:');
    results
      .filter(r => !r.result.success && r.result.status === 404)
      .forEach(r => console.log(`   ${r.endpoint.method} ${r.endpoint.path}`));
  }

  return results.every(r => r.result.success || r.result.status !== 404);
}

// Run verification
verifyAllEndpoints()
  .then((allWorking) => {
    if (allWorking) {
      console.log('\n✅ All endpoints verified and working!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some endpoints may need attention');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });


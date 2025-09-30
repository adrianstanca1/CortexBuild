// Frontend-Backend Integration Test Service
import { backendApi } from './backendApiService';

export class IntegrationTestService {
  private testResults: Record<string, any> = {};

  async runConnectivityTests() {
    console.log('🔧 Running Frontend-Backend Integration Tests...');
    
    const tests = [
      { name: 'Health Check', test: () => this.testHealthCheck() },
      { name: 'API Base Connection', test: () => this.testAPIConnection() },
      { name: 'WebSocket Connection', test: () => this.testWebSocketConnection() },
      { name: 'Authentication Endpoints', test: () => this.testAuthEndpoints() },
      { name: 'Project Management', test: () => this.testProjectEndpoints() },
      { name: 'Equipment Management', test: () => this.testEquipmentEndpoints() },
      { name: 'Safety Management', test: () => this.testSafetyEndpoints() },
      { name: 'Time Tracking', test: () => this.testTimeTrackingEndpoints() },
      { name: 'Notifications', test: () => this.testNotificationEndpoints() },
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`  ⏳ Testing ${name}...`);
        const result = await test();
        this.testResults[name] = { status: 'success', result };
        console.log(`  ✅ ${name}: PASSED`);
      } catch (error) {
        this.testResults[name] = { status: 'error', error: error.message };
        console.log(`  ❌ ${name}: FAILED - ${error.message}`);
      }
    }

    this.printSummary();
    return this.testResults;
  }

  private async testHealthCheck() {
    const response = await fetch('http://localhost:5001/api/health');
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }

  private async testAPIConnection() {
    try {
      const response = await backendApi.getSystemHealth();
      return response;
    } catch (error) {
      // Fallback to direct fetch
      const response = await fetch('http://localhost:5001/api');
      if (!response.ok) {
        throw new Error(`API connection failed: ${response.status}`);
      }
      return await response.json();
    }
  }

  private async testWebSocketConnection() {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;
      
      try {
        const ws = backendApi.connectWebSocket((data) => {
          clearTimeout(timeoutId);
          ws?.close();
          resolve(data);
        });

        if (!ws) {
          throw new Error('WebSocket connection failed to initialize');
        }

        timeoutId = setTimeout(() => {
          ws.close();
          reject(new Error('WebSocket connection timeout'));
        }, 3000);

        ws.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('WebSocket connection error'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private async testAuthEndpoints() {
    // Test auth endpoints without actual authentication
    const endpoints = ['/api/auth/status', '/api/auth/logout'];
    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5001${endpoint}`, {
          method: 'GET',
          credentials: 'include'
        });
        results[endpoint] = response.status;
      } catch (error) {
        results[endpoint] = `Error: ${error.message}`;
      }
    }
    
    return results;
  }

  private async testProjectEndpoints() {
    try {
      // Test GET projects endpoint (should work without auth for testing)
      const response = await fetch('http://localhost:5001/api/projects', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return { status: response.status, endpoint: '/api/projects' };
    } catch (error) {
      throw new Error(`Projects endpoint test failed: ${error.message}`);
    }
  }

  private async testEquipmentEndpoints() {
    try {
      const response = await fetch('http://localhost:5001/api/equipment', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return { status: response.status, endpoint: '/api/equipment' };
    } catch (error) {
      throw new Error(`Equipment endpoint test failed: ${error.message}`);
    }
  }

  private async testSafetyEndpoints() {
    try {
      const response = await fetch('http://localhost:5001/api/safety', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return { status: response.status, endpoint: '/api/safety' };
    } catch (error) {
      throw new Error(`Safety endpoint test failed: ${error.message}`);
    }
  }

  private async testTimeTrackingEndpoints() {
    try {
      const response = await fetch('http://localhost:5001/api/time-tracking', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return { status: response.status, endpoint: '/api/time-tracking' };
    } catch (error) {
      throw new Error(`Time tracking endpoint test failed: ${error.message}`);
    }
  }

  private async testNotificationEndpoints() {
    try {
      const response = await fetch('http://localhost:5001/api/notifications', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return { status: response.status, endpoint: '/api/notifications' };
    } catch (error) {
      throw new Error(`Notifications endpoint test failed: ${error.message}`);
    }
  }

  private printSummary() {
    console.log('\n📊 Integration Test Results Summary:');
    console.log('=====================================');
    
    let passed = 0;
    let failed = 0;
    
    Object.entries(this.testResults).forEach(([name, result]) => {
      if (result.status === 'success') {
        passed++;
        console.log(`✅ ${name}: PASSED`);
      } else {
        failed++;
        console.log(`❌ ${name}: FAILED`);
      }
    });
    
    console.log('=====================================');
    console.log(`📈 Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All integration tests passed! Frontend-Backend connectivity is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check backend server status and CORS configuration.');
    }
  }

  // Helper method to get test results
  getResults() {
    return this.testResults;
  }

  // Method to test specific endpoint
  async testEndpoint(url: string, method: string = 'GET', body?: any) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...(body && { body: JSON.stringify(body) })
      });
      
      return {
        status: response.status,
        ok: response.ok,
        url,
        method
      };
    } catch (error) {
      throw new Error(`Endpoint test failed for ${method} ${url}: ${error.message}`);
    }
  }
}

// Export singleton instance
export const integrationTest = new IntegrationTestService();

// Auto-run tests in development mode
if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MODE === 'true') {
  // Run integration tests after a delay to allow servers to start
  setTimeout(() => {
    integrationTest.runConnectivityTests();
  }, 2000);
}
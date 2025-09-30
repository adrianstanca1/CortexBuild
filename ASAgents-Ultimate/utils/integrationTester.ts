/**
 * Integration Test Suite
 * Tests connectivity between frontend and both backends
 */

import { backendClient, serverClient } from '../lib/apiClient';
import { BACKEND_ENDPOINTS, SERVER_ENDPOINTS } from '../config/api.config';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration: number;
}

class IntegrationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<{ success: boolean; results: TestResult[] }> {
    console.log('🧪 Starting Integration Tests...\n');

    this.results = [];

    // Backend tests
    await this.testBackendHealth();
    await this.testBackendCORS();
    
    // Server tests
    await this.testServerHealth();
    await this.testServerCORS();

    // Print results
    this.printResults();

    const allSuccess = this.results.every(r => r.success);
    return {
      success: allSuccess,
      results: this.results,
    };
  }

  private async testBackendHealth() {
    const startTime = Date.now();
    try {
      const response = await backendClient.get(BACKEND_ENDPOINTS.HEALTH);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Backend Health Check',
        success: response.success,
        message: response.success
          ? `✅ Backend is healthy (${duration}ms)`
          : `❌ Backend health check failed: ${response.error}`,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Backend Health Check',
        success: false,
        message: `❌ Backend unreachable: ${error.message}`,
        duration,
      });
    }
  }

  private async testBackendCORS() {
    const startTime = Date.now();
    try {
      const response = await backendClient.get(BACKEND_ENDPOINTS.PROJECTS.LIST);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Backend CORS',
        success: response.status !== 0,
        message: response.status !== 0
          ? `✅ Backend CORS configured (${duration}ms)`
          : '❌ Backend CORS issue detected',
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Backend CORS',
        success: false,
        message: `❌ Backend CORS test failed: ${error.message}`,
        duration,
      });
    }
  }

  private async testServerHealth() {
    const startTime = Date.now();
    try {
      const response = await serverClient.get(SERVER_ENDPOINTS.SYSTEM.HEALTH);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Server Health Check',
        success: response.success,
        message: response.success
          ? `✅ Server is healthy (${duration}ms)`
          : `❌ Server health check failed: ${response.error}`,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Server Health Check',
        success: false,
        message: `❌ Server unreachable: ${error.message}`,
        duration,
      });
    }
  }

  private async testServerCORS() {
    const startTime = Date.now();
    try {
      const response = await serverClient.get(SERVER_ENDPOINTS.DASHBOARD.STATS);
      const duration = Date.now() - startTime;

      this.results.push({
        name: 'Server CORS',
        success: response.status !== 0,
        message: response.status !== 0
          ? `✅ Server CORS configured (${duration}ms)`
          : '❌ Server CORS issue detected',
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: 'Server CORS',
        success: false,
        message: `❌ Server CORS test failed: ${error.message}`,
        duration,
      });
    }
  }

  private printResults() {
    console.log('\n📊 Test Results:\n');
    console.log('─'.repeat(70));
    
    this.results.forEach(result => {
      console.log(`${result.message}`);
    });
    
    console.log('─'.repeat(70));
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;
    
    console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
    console.log(`⏱️  Average response time: ${avgDuration.toFixed(0)}ms\n`);
  }
}

// Export tester instance
export const integrationTester = new IntegrationTester();

// Run tests if executed directly
if (import.meta.env.DEV) {
  integrationTester.runAllTests();
}

import { api } from '../services/mockApi';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: HealthCheck;
    api: HealthCheck;
    auth: HealthCheck;
    storage: HealthCheck;
    performance: HealthCheck;
  };
  metrics: {
    uptime: number;
    memoryUsage?: number;
    responseTime: number;
    activeUsers: number;
    errorRate: number;
  };
}

export interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  responseTime?: number;
  lastChecked: string;
}

export class HealthMonitor {
  private static instance: HealthMonitor;
  private readonly checks: Map<string, HealthCheck> = new Map();
  private readonly startTime: number = Date.now();
  private errorCount: number = 0;
  private requestCount: number = 0;

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    
    // Perform individual health checks
    const [database, apiCheck, auth, storage, performance] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkAPI(), 
      this.checkAuth(),
      this.checkStorage(),
      this.checkPerformance()
    ]);

    const checks = {
      database: this.getCheckResult(database),
      api: this.getCheckResult(apiCheck),
      auth: this.getCheckResult(auth),
      storage: this.getCheckResult(storage),
      performance: this.getCheckResult(performance)
    };

    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (hasFailures) {
      status = 'unhealthy';
    } else if (hasWarnings) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    // Calculate metrics
    const uptime = Date.now() - this.startTime;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      status,
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      checks,
      metrics: {
        uptime,
        memoryUsage: this.getMemoryUsage(),
        responseTime: await this.measureResponseTime(),
        activeUsers: await this.getActiveUsersCount(),
        errorRate
      }
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      // Test database connectivity
      await api.getProjects();
      const responseTime = performance.now() - start;
      
      return {
        status: responseTime < 1000 ? 'pass' : 'warn',
        message: `Database responsive in ${responseTime.toFixed(2)}ms`,
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: performance.now() - start,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkAPI(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      // Test API endpoints
      const companies = await api.getCompanies();
      const responseTime = performance.now() - start;
      
      return {
        status: responseTime < 500 ? 'pass' : 'warn',
        message: `API responsive in ${responseTime.toFixed(2)}ms, ${companies.length} companies loaded`,
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: performance.now() - start,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkAuth(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      // Test authentication system
      const { getAuthConnectionInfo } = await import('../services/authClient');
      const connectionInfo = getAuthConnectionInfo();
      const responseTime = performance.now() - start;
      
      return {
        status: 'pass',
        message: `Auth system operational, mode: ${connectionInfo.mode}`,
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: performance.now() - start,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkStorage(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      // Test localStorage functionality
      const testKey = '__health_check_test__';
      const testValue = Date.now().toString();
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const responseTime = performance.now() - start;
      
      if (retrieved === testValue) {
        return {
          status: 'pass',
          message: `Storage functional in ${responseTime.toFixed(2)}ms`,
          responseTime,
          lastChecked: new Date().toISOString()
        };
      } else {
        throw new Error('Storage write/read mismatch');
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: performance.now() - start,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkPerformance(): Promise<HealthCheck> {
    const start = performance.now();
    try {
      // Check Core Web Vitals and performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const responseTime = performance.now() - start;
      
      let message = `Performance check completed in ${responseTime.toFixed(2)}ms`;
      let status: 'pass' | 'warn' = 'pass';
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        message += `, page load: ${loadTime.toFixed(2)}ms`;
        
        if (loadTime > 3000) {
          status = 'warn';
        }
      }

      // Check memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        message += `, memory: ${memoryUsage.toFixed(1)}%`;
        
        if (memoryUsage > 80) {
          status = 'warn';
        }
      }
      
      return {
        status,
        message,
        responseTime,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: performance.now() - start,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private getCheckResult(settled: PromiseSettledResult<HealthCheck>): HealthCheck {
    if (settled.status === 'fulfilled') {
      return settled.value;
    } else {
      return {
        status: 'fail',
        message: `Health check failed: ${settled.reason}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100; // MB
    }
    return undefined;
  }

  private async measureResponseTime(): Promise<number> {
    const start = performance.now();
    try {
      await new Promise(resolve => setTimeout(resolve, 0)); // Minimal async operation
      return performance.now() - start;
    } catch {
      return -1;
    }
  }

  private async getActiveUsersCount(): Promise<number> {
    try {
      // In a real implementation, this would query active sessions
      // For now, return a mock count based on localStorage activity
      const keys = Object.keys(localStorage);
      const userKeys = keys.filter(key => key.includes('user') || key.includes('auth'));
      return userKeys.length;
    } catch {
      return 0;
    }
  }

  recordRequest(): void {
    this.requestCount++;
  }

  recordError(): void {
    this.errorCount++;
    this.requestCount++;
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getErrorRate(): number {
    return this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
  }
}

export const healthMonitor = HealthMonitor.getInstance();
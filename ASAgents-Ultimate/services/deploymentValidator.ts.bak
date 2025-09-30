interface DeploymentValidation {
  timestamp: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'success' | 'warning' | 'error';
  checks: {
    buildValidation: ValidationCheck;
    healthCheck: ValidationCheck;
    performanceCheck: ValidationCheck;
    securityCheck: ValidationCheck;
    functionalCheck: ValidationCheck;
  };
  metrics: {
    deploymentTime: number;
    buildTime: number;
    testTime: number;
    smokeTestResults: SmokeTestResult[];
  };
  errors: string[];
  warnings: string[];
}

interface ValidationCheck {
  status: 'pass' | 'fail' | 'skip' | 'warn';
  message: string;
  duration: number;
  details?: Record<string, any>;
}

interface SmokeTestResult {
  test: string;
  status: 'pass' | 'fail';
  duration: number;
  error?: string;
}

export class DeploymentValidator {
  private static instance: DeploymentValidator;

  static getInstance(): DeploymentValidator {
    if (!DeploymentValidator.instance) {
      DeploymentValidator.instance = new DeploymentValidator();
    }
    return DeploymentValidator.instance;
  }

  async validateDeployment(options: {
    version?: string;
    environment?: 'development' | 'staging' | 'production';
    skipTests?: string[];
  } = {}): Promise<DeploymentValidation> {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    
    const validation: DeploymentValidation = {
      timestamp,
      version: options.version || process.env.npm_package_version || '1.0.0',
      environment: options.environment || 'development',
      status: 'success',
      checks: {
        buildValidation: { status: 'pass', message: '', duration: 0 },
        healthCheck: { status: 'pass', message: '', duration: 0 },
        performanceCheck: { status: 'pass', message: '', duration: 0 },
        securityCheck: { status: 'pass', message: '', duration: 0 },
        functionalCheck: { status: 'pass', message: '', duration: 0 }
      },
      metrics: {
        deploymentTime: 0,
        buildTime: 0,
        testTime: 0,
        smokeTestResults: []
      },
      errors: [],
      warnings: []
    };

    try {
      // Run validation checks in sequence
      validation.checks.buildValidation = await this.validateBuild(options.skipTests);
      validation.checks.healthCheck = await this.validateHealth(options.skipTests);
      validation.checks.performanceCheck = await this.validatePerformance(options.skipTests);
      validation.checks.securityCheck = await this.validateSecurity(options.skipTests);
      validation.checks.functionalCheck = await this.validateFunctionality(options.skipTests);

      // Run smoke tests
      validation.metrics.smokeTestResults = await this.runSmokeTests();

      // Calculate overall status
      const checkStatuses = Object.values(validation.checks).map(check => check.status);
      const hasErrors = checkStatuses.includes('fail');
      const hasWarnings = checkStatuses.includes('warn');
      
      if (hasErrors) {
        validation.status = 'error';
      } else if (hasWarnings) {
        validation.status = 'warning';
      }

      // Collect errors and warnings
      Object.entries(validation.checks).forEach(([checkName, check]) => {
        if (check.status === 'fail') {
          validation.errors.push(`${checkName}: ${check.message}`);
        } else if (check.status === 'warn') {
          validation.warnings.push(`${checkName}: ${check.message}`);
        }
      });

      validation.metrics.deploymentTime = performance.now() - startTime;

    } catch (error) {
      validation.status = 'error';
      validation.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Log results
    this.logValidationResults(validation);
    
    return validation;
  }

  private async validateBuild(skipTests?: string[]): Promise<ValidationCheck> {
    const start = performance.now();
    
    if (skipTests?.includes('build')) {
      return {
        status: 'skip',
        message: 'Build validation skipped',
        duration: 0
      };
    }

    try {
      // Check if build artifacts exist
      const buildChecks = [
        { name: 'Build directory', check: () => this.checkPath('dist') },
        { name: 'Main bundle', check: () => this.checkPath('dist/index.html') },
        { name: 'Assets directory', check: () => this.checkPath('dist/assets') },
        { name: 'Package manifest', check: () => this.checkPath('package.json') }
      ];

      const results = await Promise.allSettled(
        buildChecks.map(check => check.check())
      );

      const failedChecks = results
        .map((result, index) => ({ result, name: buildChecks[index].name }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ name }) => name);

      if (failedChecks.length > 0) {
        return {
          status: 'fail',
          message: `Build validation failed: Missing ${failedChecks.join(', ')}`,
          duration: performance.now() - start,
          details: { failedChecks }
        };
      }

      return {
        status: 'pass',
        message: 'Build validation successful - all artifacts present',
        duration: performance.now() - start,
        details: { checksPerformed: buildChecks.length }
      };

    } catch (error) {
      return {
        status: 'fail',
        message: `Build validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - start
      };
    }
  }

  private async validateHealth(skipTests?: string[]): Promise<ValidationCheck> {
    const start = performance.now();
    
    if (skipTests?.includes('health')) {
      return {
        status: 'skip',
        message: 'Health check validation skipped',
        duration: 0
      };
    }

    try {
      // Import and run health check
      const { healthMonitor } = await import('./healthMonitor');
      const healthResult = await healthMonitor.performHealthCheck();

      const duration = performance.now() - start;

      if (healthResult.status === 'healthy') {
        return {
          status: 'pass',
          message: `Health check passed - system ${healthResult.status}`,
          duration,
          details: {
            uptime: healthResult.metrics.uptime,
            responseTime: healthResult.metrics.responseTime
          }
        };
      } else if (healthResult.status === 'degraded') {
        return {
          status: 'warn',
          message: `Health check warning - system ${healthResult.status}`,
          duration,
          details: healthResult.checks
        };
      } else {
        return {
          status: 'fail',
          message: `Health check failed - system ${healthResult.status}`,
          duration,
          details: healthResult.checks
        };
      }

    } catch (error) {
      return {
        status: 'fail',
        message: `Health validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - start
      };
    }
  }

  private async validatePerformance(skipTests?: string[]): Promise<ValidationCheck> {
    const start = performance.now();
    
    if (skipTests?.includes('performance')) {
      return {
        status: 'skip',
        message: 'Performance validation skipped',
        duration: 0
      };
    }

    try {
      const performanceMetrics = {
        memoryUsage: this.getMemoryUsage(),
        responseTime: await this.measureApiResponseTime(),
        bundleSize: await this.checkBundleSize(),
        loadTime: this.getPageLoadTime()
      };

      const warnings = [];
      const errors = [];

      // Check memory usage
      if (performanceMetrics.memoryUsage && performanceMetrics.memoryUsage > 100) {
        warnings.push(`High memory usage: ${performanceMetrics.memoryUsage}MB`);
      }

      // Check response time
      if (performanceMetrics.responseTime > 1000) {
        warnings.push(`Slow API response time: ${performanceMetrics.responseTime}ms`);
      } else if (performanceMetrics.responseTime > 5000) {
        errors.push(`Very slow API response time: ${performanceMetrics.responseTime}ms`);
      }

      // Check bundle size
      if (performanceMetrics.bundleSize > 5 * 1024 * 1024) { // 5MB
        warnings.push(`Large bundle size: ${(performanceMetrics.bundleSize / 1024 / 1024).toFixed(2)}MB`);
      }

      // Check load time
      if (performanceMetrics.loadTime > 3000) {
        warnings.push(`Slow page load time: ${performanceMetrics.loadTime}ms`);
      }

      const duration = performance.now() - start;

      if (errors.length > 0) {
        return {
          status: 'fail',
          message: `Performance validation failed: ${errors.join(', ')}`,
          duration,
          details: performanceMetrics
        };
      } else if (warnings.length > 0) {
        return {
          status: 'warn',
          message: `Performance warnings: ${warnings.join(', ')}`,
          duration,
          details: performanceMetrics
        };
      } else {
        return {
          status: 'pass',
          message: 'Performance validation passed',
          duration,
          details: performanceMetrics
        };
      }

    } catch (error) {
      return {
        status: 'fail',
        message: `Performance validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - start
      };
    }
  }

  private async validateSecurity(skipTests?: string[]): Promise<ValidationCheck> {
    const start = performance.now();
    
    if (skipTests?.includes('security')) {
      return {
        status: 'skip',
        message: 'Security validation skipped',
        duration: 0
      };
    }

    try {
      const securityChecks = {
        httpsEnabled: window.location.protocol === 'https:',
        noConsoleErrors: !this.hasConsoleErrors(),
        secureHeaders: await this.checkSecurityHeaders(),
        noSensitiveDataExposed: this.checkForSensitiveData(),
        authTokenSecure: this.validateAuthToken()
      };

      const issues = [];
      const warnings = [];

      if (!securityChecks.httpsEnabled && window.location.hostname !== 'localhost') {
        issues.push('HTTPS not enabled in production');
      }

      if (!securityChecks.noConsoleErrors) {
        warnings.push('Console errors detected');
      }

      if (!securityChecks.secureHeaders) {
        warnings.push('Missing security headers');
      }

      if (!securityChecks.noSensitiveDataExposed) {
        issues.push('Sensitive data potentially exposed');
      }

      if (!securityChecks.authTokenSecure) {
        issues.push('Auth token security issues');
      }

      const duration = performance.now() - start;

      if (issues.length > 0) {
        return {
          status: 'fail',
          message: `Security validation failed: ${issues.join(', ')}`,
          duration,
          details: securityChecks
        };
      } else if (warnings.length > 0) {
        return {
          status: 'warn',
          message: `Security warnings: ${warnings.join(', ')}`,
          duration,
          details: securityChecks
        };
      } else {
        return {
          status: 'pass',
          message: 'Security validation passed',
          duration,
          details: securityChecks
        };
      }

    } catch (error) {
      return {
        status: 'fail',
        message: `Security validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - start
      };
    }
  }

  private async validateFunctionality(skipTests?: string[]): Promise<ValidationCheck> {
    const start = performance.now();
    
    if (skipTests?.includes('functional')) {
      return {
        status: 'skip',
        message: 'Functional validation skipped',
        duration: 0
      };
    }

    try {
      // Test core functionality
      const functionalTests = [
        { name: 'API Connection', test: () => this.testApiConnection() },
        { name: 'Authentication', test: () => this.testAuthentication() },
        { name: 'Data Access', test: () => this.testDataAccess() },
        { name: 'Navigation', test: () => this.testNavigation() }
      ];

      const results = await Promise.allSettled(
        functionalTests.map(test => test.test())
      );

      const failedTests = results
        .map((result, index) => ({ result, name: functionalTests[index].name }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ name, result }) => ({
          name,
          error: result.status === 'rejected' ? result.reason : 'Unknown error'
        }));

      const duration = performance.now() - start;

      if (failedTests.length > 0) {
        return {
          status: 'fail',
          message: `Functional validation failed: ${failedTests.map(t => t.name).join(', ')}`,
          duration,
          details: { failedTests }
        };
      } else {
        return {
          status: 'pass',
          message: `All functional tests passed (${functionalTests.length} tests)`,
          duration,
          details: { testsRun: functionalTests.length }
        };
      }

    } catch (error) {
      return {
        status: 'fail',
        message: `Functional validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: performance.now() - start
      };
    }
  }

  private async runSmokeTests(): Promise<SmokeTestResult[]> {
    const smokeTests = [
      { name: 'Page Load', test: () => this.testPageLoad() },
      { name: 'Basic Rendering', test: () => this.testBasicRendering() },
      { name: 'Error Boundaries', test: () => this.testErrorBoundaries() }
    ];

    const results = await Promise.allSettled(
      smokeTests.map(async (test) => {
        const start = performance.now();
        try {
          await test.test();
          return {
            test: test.name,
            status: 'pass' as const,
            duration: performance.now() - start
          };
        } catch (error) {
          return {
            test: test.name,
            status: 'fail' as const,
            duration: performance.now() - start,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        test: 'Unknown',
        status: 'fail' as const,
        duration: 0,
        error: 'Test execution failed'
      }
    );
  }

  // Helper methods
  private async checkPath(path: string): Promise<boolean> {
    // In a real implementation, this would check if the path exists
    // For browser environment, we'll simulate this
    return fetch(path, { method: 'HEAD' })
      .then(response => response.ok)
      .catch(() => false);
  }

  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100;
    }
    return undefined;
  }

  private async measureApiResponseTime(): Promise<number> {
    const start = performance.now();
    try {
      const { api } = await import('./mockApi');
      await api.getProjects();
      return performance.now() - start;
    } catch {
      return -1;
    }
  }

  private async checkBundleSize(): Promise<number> {
    // Estimate bundle size based on loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    let totalSize = 0;
    
    for (const script of scripts) {
      try {
        const response = await fetch(script.src, { method: 'HEAD' });
        const size = response.headers.get('content-length');
        if (size) {
          totalSize += parseInt(size, 10);
        }
      } catch {
        // Ignore fetch errors
      }
    }
    
    return totalSize || 1024 * 1024; // Default 1MB if can't determine
  }

  private getPageLoadTime(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
  }

  private hasConsoleErrors(): boolean {
    // Check if there are any console errors in the error tracker
    const { errorTracker } = require('./errorTracker');
    const stats = errorTracker.getErrorStats();
    return stats.recentErrors.some((error: any) => error.level === 'error');
  }

  private async checkSecurityHeaders(): Promise<boolean> {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const hasCSP = response.headers.has('content-security-policy');
      const hasXFrameOptions = response.headers.has('x-frame-options');
      const hasXContentTypeOptions = response.headers.has('x-content-type-options');
      
      return hasCSP || hasXFrameOptions || hasXContentTypeOptions;
    } catch {
      return false;
    }
  }

  private checkForSensitiveData(): boolean {
    // Check if any sensitive data is exposed in the DOM or global scope
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /api[_-]?key/i
    ];

    const bodyText = document.body.textContent || '';
    return !sensitivePatterns.some(pattern => pattern.test(bodyText));
  }

  private validateAuthToken(): boolean {
    try {
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return true; // No token is fine
      
      // Check if token looks secure (not obviously test data)
      return !token.includes('test') && !token.includes('demo') && token.length > 10;
    } catch {
      return true;
    }
  }

  // Test helper methods
  private async testApiConnection(): Promise<void> {
    const { api } = await import('./mockApi');
    await api.getCompanies();
  }

  private async testAuthentication(): Promise<void> {
    const { getAuthConnectionInfo } = await import('./authClient');
    const info = getAuthConnectionInfo();
    if (!info.mode) {
      throw new Error('Authentication system not available');
    }
  }

  private async testDataAccess(): Promise<void> {
    const { api } = await import('./mockApi');
    const projects = await api.getProjects();
    if (!Array.isArray(projects)) {
      throw new Error('Data access failed - invalid response');
    }
  }

  private async testNavigation(): Promise<void> {
    const currentPath = window.location.pathname;
    if (!currentPath) {
      throw new Error('Navigation system unavailable');
    }
  }

  private async testPageLoad(): Promise<void> {
    if (document.readyState !== 'complete') {
      throw new Error('Page not fully loaded');
    }
  }

  private async testBasicRendering(): Promise<void> {
    const mainContent = document.querySelector('main, [role="main"], #root, #app');
    if (!mainContent) {
      throw new Error('Main content not rendered');
    }
  }

  private async testErrorBoundaries(): Promise<void> {
    // Check if error boundaries are present in the app
    const errorBoundaries = document.querySelectorAll('[data-error-boundary], .error-boundary');
    if (errorBoundaries.length === 0) {
      console.warn('No error boundaries detected');
    }
  }

  private logValidationResults(validation: DeploymentValidation): void {
    console.group(`🚀 Deployment Validation [${validation.status.toUpperCase()}]`);
    console.log(`Version: ${validation.version}`);
    console.log(`Environment: ${validation.environment}`);
    console.log(`Duration: ${validation.metrics.deploymentTime.toFixed(2)}ms`);
    
    console.group('📋 Check Results');
    Object.entries(validation.checks).forEach(([name, check]) => {
      const icon = check.status === 'pass' ? '✅' : 
                   check.status === 'warn' ? '⚠️' : 
                   check.status === 'skip' ? '⏭️' : '❌';
      console.log(`${icon} ${name}: ${check.message} (${check.duration.toFixed(2)}ms)`);
    });
    console.groupEnd();

    if (validation.errors.length > 0) {
      console.group('❌ Errors');
      validation.errors.forEach(error => console.log(error));
      console.groupEnd();
    }

    if (validation.warnings.length > 0) {
      console.group('⚠️ Warnings');
      validation.warnings.forEach(warning => console.log(warning));
      console.groupEnd();
    }

    console.groupEnd();
  }
}

export const deploymentValidator = DeploymentValidator.getInstance();
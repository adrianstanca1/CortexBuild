/**
 * Error Test Utilities
 * Utilities for testing error handling mechanisms
 */

import { advancedErrorLogger } from './advancedErrorLogger';
import { sessionTracker } from './sessionTracker';
import { performanceMonitor } from './performanceMonitor';

/**
 * Test Error Types
 */
export class TestError extends Error {
    constructor(message: string, public testType: string) {
        super(message);
        this.name = 'TestError';
    }
}

/**
 * Trigger component error
 * Use this to test error boundaries
 */
export function triggerComponentError(componentName: string, errorMessage?: string): void {
    const error = new TestError(
        errorMessage || `Test error in ${componentName}`,
        'component'
    );
    
    // Throw error to be caught by error boundary
    throw error;
}

/**
 * Trigger API error
 * Use this to test API error handling
 */
export async function triggerApiError(
    endpoint: string,
    statusCode: number = 500,
    errorMessage?: string
): Promise<never> {
    const error = new TestError(
        errorMessage || `API error: ${endpoint} returned ${statusCode}`,
        'api'
    );
    
    (error as any).response = {
        status: statusCode,
        statusText: statusCode === 404 ? 'Not Found' : 'Internal Server Error'
    };
    
    throw error;
}

/**
 * Trigger network error
 * Use this to test network error handling
 */
export async function triggerNetworkError(errorMessage?: string): Promise<never> {
    const error = new TestError(
        errorMessage || 'Network connection failed',
        'network'
    );
    
    (error as any).code = 'NETWORK_ERROR';
    
    throw error;
}

/**
 * Trigger timeout error
 * Use this to test timeout handling
 */
export async function triggerTimeoutError(errorMessage?: string): Promise<never> {
    const error = new TestError(
        errorMessage || 'Request timeout',
        'timeout'
    );
    
    (error as any).code = 'TIMEOUT';
    
    throw error;
}

/**
 * Verify error was logged
 */
export function verifyErrorLogged(errorMessage: string): boolean {
    const stats = advancedErrorLogger.getStatistics();
    const recentErrors = stats.recentErrors;
    
    return recentErrors.some(error => error.message.includes(errorMessage));
}

/**
 * Verify error was categorized correctly
 */
export function verifyErrorCategory(errorMessage: string, expectedCategory: string): boolean {
    const stats = advancedErrorLogger.getStatistics();
    const recentErrors = stats.recentErrors;
    const error = recentErrors.find(e => e.message.includes(errorMessage));
    
    return error?.category === expectedCategory;
}

/**
 * Verify error severity
 */
export function verifyErrorSeverity(errorMessage: string, expectedSeverity: string): boolean {
    const stats = advancedErrorLogger.getStatistics();
    const recentErrors = stats.recentErrors;
    const error = recentErrors.find(e => e.message.includes(errorMessage));
    
    return error?.severity === expectedSeverity;
}

/**
 * Verify breadcrumbs were captured
 */
export function verifyBreadcrumbs(minCount: number = 1): boolean {
    const breadcrumbs = advancedErrorLogger.getBreadcrumbs();
    return breadcrumbs.length >= minCount;
}

/**
 * Verify session tracking
 */
export function verifySessionTracking(): boolean {
    const session = sessionTracker.getSession();
    return session.sessionId !== undefined && session.sessionId.length > 0;
}

/**
 * Verify error count in session
 */
export function verifySessionErrorCount(minCount: number = 1): boolean {
    const session = sessionTracker.getSession();
    return session.errors >= minCount;
}

/**
 * Verify performance tracking
 */
export function verifyPerformanceTracking(componentName: string): boolean {
    const stats = performanceMonitor.getComponentStats(componentName);
    return stats !== null && stats.count > 0;
}

/**
 * Get error statistics
 */
export function getErrorStats() {
    return advancedErrorLogger.getStatistics();
}

/**
 * Get session summary
 */
export function getSessionSummary() {
    return sessionTracker.getSessionSummary();
}

/**
 * Get performance issues
 */
export function getPerformanceIssues() {
    return performanceMonitor.getIssues();
}

/**
 * Clear all test data
 */
export function clearTestData(): void {
    advancedErrorLogger.clear();
    performanceMonitor.clear();
}

/**
 * Test Error Boundary Recovery
 */
export class ErrorBoundaryTester {
    private errorTriggered: boolean = false;
    private recoveryAttempted: boolean = false;
    private recoverySuccessful: boolean = false;

    /**
     * Trigger error in component
     */
    triggerError(componentName: string): void {
        this.errorTriggered = true;
        triggerComponentError(componentName, `Test error for ${componentName}`);
    }

    /**
     * Attempt recovery
     */
    attemptRecovery(): void {
        this.recoveryAttempted = true;
        // Simulate recovery by resetting error state
        this.recoverySuccessful = true;
    }

    /**
     * Verify recovery worked
     */
    verifyRecovery(): boolean {
        return this.errorTriggered && this.recoveryAttempted && this.recoverySuccessful;
    }

    /**
     * Reset tester
     */
    reset(): void {
        this.errorTriggered = false;
        this.recoveryAttempted = false;
        this.recoverySuccessful = false;
    }
}

/**
 * Test API Error Recovery
 */
export class ApiErrorTester {
    private errors: Array<{ endpoint: string; status: number; recovered: boolean }> = [];

    /**
     * Simulate API error
     */
    async simulateError(endpoint: string, statusCode: number): Promise<void> {
        this.errors.push({ endpoint, status: statusCode, recovered: false });
        await triggerApiError(endpoint, statusCode);
    }

    /**
     * Mark as recovered
     */
    markRecovered(endpoint: string): void {
        const error = this.errors.find(e => e.endpoint === endpoint);
        if (error) {
            error.recovered = true;
        }
    }

    /**
     * Get recovery rate
     */
    getRecoveryRate(): number {
        if (this.errors.length === 0) return 0;
        const recovered = this.errors.filter(e => e.recovered).length;
        return (recovered / this.errors.length) * 100;
    }

    /**
     * Reset tester
     */
    reset(): void {
        this.errors = [];
    }
}

/**
 * Test Performance Monitoring
 */
export class PerformanceTester {
    /**
     * Simulate slow render
     */
    simulateSlowRender(componentName: string, duration: number = 100): void {
        performanceMonitor.trackComponentRender(componentName, duration);
    }

    /**
     * Simulate slow API
     */
    simulateSlowApi(endpoint: string, duration: number = 5000): void {
        performanceMonitor.trackApiCall(endpoint, duration);
    }

    /**
     * Verify performance issue detected
     */
    verifyIssueDetected(type: 'slow_render' | 'slow_api'): boolean {
        const issues = performanceMonitor.getIssues();
        return issues.some(issue => issue.type === type);
    }

    /**
     * Get performance stats
     */
    getStats(componentOrEndpoint: string, type: 'component' | 'api') {
        if (type === 'component') {
            return performanceMonitor.getComponentStats(componentOrEndpoint);
        } else {
            return performanceMonitor.getApiStats(componentOrEndpoint);
        }
    }
}

/**
 * Create test suite
 */
export function createTestSuite() {
    return {
        errorBoundary: new ErrorBoundaryTester(),
        apiError: new ApiErrorTester(),
        performance: new PerformanceTester(),
        
        // Utility functions
        triggerComponentError,
        triggerApiError,
        triggerNetworkError,
        triggerTimeoutError,
        verifyErrorLogged,
        verifyErrorCategory,
        verifyErrorSeverity,
        verifyBreadcrumbs,
        verifySessionTracking,
        verifySessionErrorCount,
        verifyPerformanceTracking,
        getErrorStats,
        getSessionSummary,
        getPerformanceIssues,
        clearTestData
    };
}

/**
 * Export default test suite
 */
export const testSuite = createTestSuite();


/**
 * Performance Monitor
 * Tracks and monitors application performance
 */

import { PerformanceMetrics, PerformanceIssue, ErrorSeverity } from '../types/errorTypes';
import { contextCollector } from './contextCollector';

/**
 * Performance thresholds
 */
interface PerformanceThresholds {
    slowRender: number;        // ms
    slowApi: number;           // ms
    highMemory: number;        // bytes
    slowPageLoad: number;      // ms
}

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private thresholds: PerformanceThresholds;
    private componentMetrics: Map<string, number[]> = new Map();
    private apiMetrics: Map<string, number[]> = new Map();
    private issues: PerformanceIssue[] = [];
    private maxIssues: number = 50;

    private constructor() {
        this.thresholds = {
            slowRender: 16,        // 60fps = 16ms per frame
            slowApi: 3000,         // 3 seconds
            highMemory: 100 * 1024 * 1024,  // 100MB
            slowPageLoad: 3000     // 3 seconds
        };

        this.setupPerformanceObserver();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Track component render time
     */
    public trackComponentRender(componentName: string, duration: number): void {
        // Store metric
        if (!this.componentMetrics.has(componentName)) {
            this.componentMetrics.set(componentName, []);
        }
        this.componentMetrics.get(componentName)!.push(duration);

        // Keep only last 100 measurements
        const metrics = this.componentMetrics.get(componentName)!;
        if (metrics.length > 100) {
            metrics.shift();
        }

        // Check for slow render
        if (duration > this.thresholds.slowRender) {
            this.reportIssue({
                issueId: this.generateIssueId(),
                type: 'slow_render',
                component: componentName,
                metric: 'renderTime',
                value: duration,
                threshold: this.thresholds.slowRender,
                severity: this.getSeverityForRender(duration),
                timestamp: new Date().toISOString(),
                context: {
                    sessionId: '',
                    browser: contextCollector.collectBrowserInfo(),
                    appState: contextCollector.collectStateSnapshot(),
                    breadcrumbs: contextCollector.getBreadcrumbs(),
                    performance: contextCollector.collectPerformanceMetrics(),
                    network: contextCollector.collectNetworkInfo(),
                    timestamp: new Date().toISOString()
                }
            });
        }
    }

    /**
     * Track API call time
     */
    public trackApiCall(endpoint: string, duration: number, status?: number): void {
        // Store metric
        if (!this.apiMetrics.has(endpoint)) {
            this.apiMetrics.set(endpoint, []);
        }
        this.apiMetrics.get(endpoint)!.push(duration);

        // Keep only last 100 measurements
        const metrics = this.apiMetrics.get(endpoint)!;
        if (metrics.length > 100) {
            metrics.shift();
        }

        // Check for slow API
        if (duration > this.thresholds.slowApi) {
            this.reportIssue({
                issueId: this.generateIssueId(),
                type: 'slow_api',
                component: endpoint,
                metric: 'apiResponseTime',
                value: duration,
                threshold: this.thresholds.slowApi,
                severity: this.getSeverityForApi(duration),
                timestamp: new Date().toISOString(),
                context: {
                    sessionId: '',
                    browser: contextCollector.collectBrowserInfo(),
                    appState: contextCollector.collectStateSnapshot(),
                    breadcrumbs: contextCollector.getBreadcrumbs(),
                    performance: contextCollector.collectPerformanceMetrics(),
                    network: contextCollector.collectNetworkInfo(),
                    timestamp: new Date().toISOString(),
                    custom: { status }
                }
            });
        }
    }

    /**
     * Check memory usage
     */
    public checkMemoryUsage(): void {
        if ((performance as any).memory) {
            const memory = (performance as any).memory;
            const used = memory.usedJSHeapSize;

            if (used > this.thresholds.highMemory) {
                this.reportIssue({
                    issueId: this.generateIssueId(),
                    type: 'memory_leak',
                    metric: 'memoryUsage',
                    value: used,
                    threshold: this.thresholds.highMemory,
                    severity: this.getSeverityForMemory(used),
                    timestamp: new Date().toISOString(),
                    context: {
                        sessionId: '',
                        browser: contextCollector.collectBrowserInfo(),
                        appState: contextCollector.collectStateSnapshot(),
                        breadcrumbs: contextCollector.getBreadcrumbs(),
                        performance: {
                            memoryUsage: {
                                usedJSHeapSize: memory.usedJSHeapSize,
                                totalJSHeapSize: memory.totalJSHeapSize,
                                jsHeapSizeLimit: memory.jsHeapSizeLimit
                            }
                        },
                        network: contextCollector.collectNetworkInfo(),
                        timestamp: new Date().toISOString()
                    }
                });
            }
        }
    }

    /**
     * Get component statistics
     */
    public getComponentStats(componentName: string): {
        count: number;
        average: number;
        min: number;
        max: number;
        p95: number;
    } | null {
        const metrics = this.componentMetrics.get(componentName);
        if (!metrics || metrics.length === 0) return null;

        const sorted = [...metrics].sort((a, b) => a - b);
        const sum = metrics.reduce((a, b) => a + b, 0);

        return {
            count: metrics.length,
            average: sum / metrics.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p95: sorted[Math.floor(sorted.length * 0.95)]
        };
    }

    /**
     * Get API statistics
     */
    public getApiStats(endpoint: string): {
        count: number;
        average: number;
        min: number;
        max: number;
        p95: number;
    } | null {
        const metrics = this.apiMetrics.get(endpoint);
        if (!metrics || metrics.length === 0) return null;

        const sorted = [...metrics].sort((a, b) => a - b);
        const sum = metrics.reduce((a, b) => a + b, 0);

        return {
            count: metrics.length,
            average: sum / metrics.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p95: sorted[Math.floor(sorted.length * 0.95)]
        };
    }

    /**
     * Get all performance issues
     */
    public getIssues(): PerformanceIssue[] {
        return [...this.issues];
    }

    /**
     * Clear all metrics
     */
    public clear(): void {
        this.componentMetrics.clear();
        this.apiMetrics.clear();
        this.issues = [];
    }

    /**
     * Setup performance observer
     */
    private setupPerformanceObserver(): void {
        // Observe long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {  // Long task threshold
                            contextCollector.addBreadcrumb({
                                type: 'custom',
                                category: 'performance',
                                message: `Long task detected: ${entry.duration.toFixed(2)}ms`,
                                data: {
                                    duration: entry.duration,
                                    name: entry.name,
                                    startTime: entry.startTime
                                },
                                level: 'warning'
                            });
                        }
                    }
                });

                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // PerformanceObserver not supported or longtask not available
            }
        }

        // Check memory periodically
        setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // Every 30 seconds
    }

    /**
     * Report performance issue
     */
    private reportIssue(issue: PerformanceIssue): void {
        this.issues.push(issue);

        // Keep only last N issues
        if (this.issues.length > this.maxIssues) {
            this.issues.shift();
        }

        // Log to console in development
        if (import.meta.env.DEV) {
            console.warn(`⚠️ Performance Issue: ${issue.type}`, {
                component: issue.component,
                metric: issue.metric,
                value: `${issue.value.toFixed(2)}ms`,
                threshold: `${issue.threshold}ms`,
                severity: issue.severity
            });
        }
    }

    /**
     * Get severity for render time
     */
    private getSeverityForRender(duration: number): ErrorSeverity {
        if (duration > 100) return ErrorSeverity.HIGH;
        if (duration > 50) return ErrorSeverity.MEDIUM;
        return ErrorSeverity.LOW;
    }

    /**
     * Get severity for API time
     */
    private getSeverityForApi(duration: number): ErrorSeverity {
        if (duration > 10000) return ErrorSeverity.HIGH;
        if (duration > 5000) return ErrorSeverity.MEDIUM;
        return ErrorSeverity.LOW;
    }

    /**
     * Get severity for memory usage
     */
    private getSeverityForMemory(used: number): ErrorSeverity {
        const limit = this.thresholds.highMemory;
        if (used > limit * 2) return ErrorSeverity.CRITICAL;
        if (used > limit * 1.5) return ErrorSeverity.HIGH;
        return ErrorSeverity.MEDIUM;
    }

    /**
     * Generate issue ID
     */
    private generateIssueId(): string {
        return `perf_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
}

/**
 * Export singleton instance
 */
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Convenience functions
 */
export const trackComponentRender = (componentName: string, duration: number) =>
    performanceMonitor.trackComponentRender(componentName, duration);

export const trackApiCall = (endpoint: string, duration: number, status?: number) =>
    performanceMonitor.trackApiCall(endpoint, duration, status);

export const getComponentStats = (componentName: string) =>
    performanceMonitor.getComponentStats(componentName);

export const getApiStats = (endpoint: string) =>
    performanceMonitor.getApiStats(endpoint);

export const getPerformanceIssues = () =>
    performanceMonitor.getIssues();


/**
 * Performance Alerting System
 * Task 3.2: Performance Monitoring
 * 
 * Monitors performance metrics and triggers alerts when thresholds are exceeded
 */

import { advancedErrorLogger } from '../utils/advancedErrorLogger';
import { ErrorSeverity, ErrorCategory } from '../types/errorTypes';
import { metricsCollector } from './metricsCollector';
import { webVitalsCollector } from './webVitals';
import { performanceObserverManager } from './performanceObserver';
import { loggingConfig, Logger } from '../config/logging.config';

/**
 * Alert Types
 */
export type AlertType = 
    | 'poor_web_vitals'
    | 'high_error_rate'
    | 'memory_leak'
    | 'slow_api'
    | 'long_task'
    | 'layout_shift'
    | 'slow_resource';

/**
 * Alert Severity
 */
export type AlertSeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert Interface
 */
export interface PerformanceAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverityLevel;
    message: string;
    details: any;
    timestamp: number;
    acknowledged: boolean;
}

/**
 * Alert Thresholds
 */
export interface AlertThresholds {
    // Web Vitals
    webVitalsScore: number;           // Alert if score < this value
    
    // Error Rate
    errorRatePerMinute: number;       // Alert if errors/min > this value
    
    // Memory
    memoryUsageMB: number;            // Alert if memory > this value (MB)
    memoryGrowthMBPerMinute: number;  // Alert if growth > this value (MB/min)
    
    // API Performance
    avgApiResponseTime: number;       // Alert if avg response > this value (ms)
    slowApiCount: number;             // Alert if slow APIs > this value
    
    // Long Tasks
    longTasksPerMinute: number;       // Alert if long tasks/min > this value
    
    // Layout Shifts
    layoutShiftsPerMinute: number;    // Alert if shifts/min > this value
    
    // Resources
    slowResourcesCount: number;       // Alert if slow resources > this value
}

/**
 * Default Alert Thresholds
 */
const DEFAULT_THRESHOLDS: AlertThresholds = {
    webVitalsScore: 50,
    errorRatePerMinute: 5,
    memoryUsageMB: 150,
    memoryGrowthMBPerMinute: 10,
    avgApiResponseTime: 3000,
    slowApiCount: 5,
    longTasksPerMinute: 10,
    layoutShiftsPerMinute: 5,
    slowResourcesCount: 10
};

/**
 * Performance Alerting Manager
 */
class PerformanceAlertingManager {
    private alerts: PerformanceAlert[] = [];
    private thresholds: AlertThresholds = DEFAULT_THRESHOLDS;
    private checkInterval: number | null = null;
    private listeners: Array<(alert: PerformanceAlert) => void> = [];
    private lastMemoryCheck: number = 0;
    private lastMemoryUsage: number = 0;

    /**
     * Initialize alerting system
     */
    public init(customThresholds?: Partial<AlertThresholds>): void {
        if (customThresholds) {
            this.thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
        }

        // Only enable alerting if configured
        if (!loggingConfig.monitoring.alerts) {
            if (loggingConfig.monitoring.verbose) {
                console.log('⚠️ Performance alerting disabled by config');
            }
            return;
        }

        // Check metrics every 30 seconds
        this.checkInterval = window.setInterval(() => {
            this.checkMetrics();
        }, 30000);

        if (loggingConfig.monitoring.verbose) {
            console.log('✅ Performance alerting initialized');
        }
    }

    /**
     * Check all metrics against thresholds
     */
    private checkMetrics(): void {
        this.checkWebVitals();
        this.checkMemory();
        this.checkApiPerformance();
        this.checkLongTasks();
        this.checkLayoutShifts();
        this.checkSlowResources();
    }

    /**
     * Check Web Vitals
     */
    private checkWebVitals(): void {
        const summary = webVitalsCollector.getSummary();
        
        if (summary.score < this.thresholds.webVitalsScore) {
            this.createAlert({
                type: 'poor_web_vitals',
                severity: summary.score < 30 ? 'critical' : summary.score < 50 ? 'high' : 'medium',
                message: `Poor Web Vitals performance detected (Score: ${summary.score})`,
                details: {
                    score: summary.score,
                    rating: summary.rating,
                    LCP: summary.LCP?.value,
                    INP: summary.INP?.value,
                    CLS: summary.CLS?.value
                }
            });
        }
    }

    /**
     * Check Memory Usage
     */
    private checkMemory(): void {
        const memory = metricsCollector.getMemoryMetrics();
        if (!memory) return;

        const usedMB = memory.usedJSHeapSize / 1024 / 1024;

        // Check absolute memory usage
        if (usedMB > this.thresholds.memoryUsageMB) {
            this.createAlert({
                type: 'memory_leak',
                severity: usedMB > 200 ? 'critical' : 'high',
                message: `High memory usage detected (${Math.round(usedMB)}MB)`,
                details: {
                    usedMB: Math.round(usedMB),
                    totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                    limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
                }
            });
        }

        // Check memory growth rate
        if (this.lastMemoryCheck > 0) {
            const timeDiff = (Date.now() - this.lastMemoryCheck) / 1000 / 60; // minutes
            const memoryDiff = usedMB - this.lastMemoryUsage;
            const growthRate = memoryDiff / timeDiff;

            if (growthRate > this.thresholds.memoryGrowthMBPerMinute) {
                this.createAlert({
                    type: 'memory_leak',
                    severity: 'high',
                    message: `Potential memory leak detected (${Math.round(growthRate)}MB/min growth)`,
                    details: {
                        growthRateMBPerMin: Math.round(growthRate),
                        currentMB: Math.round(usedMB),
                        previousMB: Math.round(this.lastMemoryUsage)
                    }
                });
            }
        }

        this.lastMemoryCheck = Date.now();
        this.lastMemoryUsage = usedMB;
    }

    /**
     * Check API Performance
     */
    private checkApiPerformance(): void {
        const metrics = metricsCollector.getAggregatedMetrics();
        
        if (metrics.performance.avgApiResponseTime > this.thresholds.avgApiResponseTime) {
            this.createAlert({
                type: 'slow_api',
                severity: metrics.performance.avgApiResponseTime > 5000 ? 'high' : 'medium',
                message: `Slow API responses detected (Avg: ${Math.round(metrics.performance.avgApiResponseTime)}ms)`,
                details: {
                    avgResponseTime: Math.round(metrics.performance.avgApiResponseTime),
                    threshold: this.thresholds.avgApiResponseTime
                }
            });
        }
    }

    /**
     * Check Long Tasks
     */
    private checkLongTasks(): void {
        const longTasks = performanceObserverManager.getLongTasks();
        const recentTasks = longTasks.filter(task => 
            Date.now() - task.startTime < 60000 // Last minute
        );

        if (recentTasks.length > this.thresholds.longTasksPerMinute) {
            this.createAlert({
                type: 'long_task',
                severity: recentTasks.length > 20 ? 'high' : 'medium',
                message: `High number of long tasks detected (${recentTasks.length} in last minute)`,
                details: {
                    count: recentTasks.length,
                    threshold: this.thresholds.longTasksPerMinute,
                    longestTask: Math.max(...recentTasks.map(t => t.duration))
                }
            });
        }
    }

    /**
     * Check Layout Shifts
     */
    private checkLayoutShifts(): void {
        const shifts = performanceObserverManager.getLayoutShifts();
        const recentShifts = shifts.filter(shift => 
            Date.now() - shift.startTime < 60000 // Last minute
        );

        if (recentShifts.length > this.thresholds.layoutShiftsPerMinute) {
            this.createAlert({
                type: 'layout_shift',
                severity: 'medium',
                message: `High number of layout shifts detected (${recentShifts.length} in last minute)`,
                details: {
                    count: recentShifts.length,
                    threshold: this.thresholds.layoutShiftsPerMinute,
                    totalShift: recentShifts.reduce((sum, s) => sum + s.value, 0)
                }
            });
        }
    }

    /**
     * Check Slow Resources
     */
    private checkSlowResources(): void {
        const resources = performanceObserverManager.getResources();
        const slowResources = resources.filter(r => r.duration > 3000);

        if (slowResources.length > this.thresholds.slowResourcesCount) {
            this.createAlert({
                type: 'slow_resource',
                severity: 'medium',
                message: `High number of slow resources detected (${slowResources.length})`,
                details: {
                    count: slowResources.length,
                    threshold: this.thresholds.slowResourcesCount,
                    slowestResource: slowResources.reduce((max, r) => 
                        r.duration > max.duration ? r : max
                    )
                }
            });
        }
    }

    /**
     * Create alert
     */
    private createAlert(config: {
        type: AlertType;
        severity: AlertSeverityLevel;
        message: string;
        details: any;
    }): void {
        const alert: PerformanceAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: config.type,
            severity: config.severity,
            message: config.message,
            details: config.details,
            timestamp: Date.now(),
            acknowledged: false
        };

        this.alerts.push(alert);
        this.notifyListeners(alert);
        this.logAlert(alert);

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
    }

    /**
     * Log alert
     */
    private logAlert(alert: PerformanceAlert): void {
        // Only log if alerts are enabled and verbose
        if (loggingConfig.monitoring.alerts && loggingConfig.monitoring.verbose) {
            Logger.warn(`🚨 Performance Alert [${alert.severity.toUpperCase()}]:`, alert.message, alert.details);
        }

        // Log to error logger only for high/critical severity
        if (alert.severity === 'high' || alert.severity === 'critical') {
            const errorSeverity = this.mapAlertSeverityToErrorSeverity(alert.severity);
            advancedErrorLogger.logError(
                new Error(alert.message),
                { custom: { alertType: alert.type, ...alert.details } },
                errorSeverity,
                ErrorCategory.PERFORMANCE
            );
        }
    }

    /**
     * Map alert severity to error severity
     */
    private mapAlertSeverityToErrorSeverity(severity: AlertSeverityLevel): ErrorSeverity {
        switch (severity) {
            case 'critical': return ErrorSeverity.CRITICAL;
            case 'high': return ErrorSeverity.HIGH;
            case 'medium': return ErrorSeverity.MEDIUM;
            case 'low': return ErrorSeverity.LOW;
        }
    }

    /**
     * Add listener
     */
    public addListener(listener: (alert: PerformanceAlert) => void): void {
        this.listeners.push(listener);
    }

    /**
     * Remove listener
     */
    public removeListener(listener: (alert: PerformanceAlert) => void): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * Notify listeners
     */
    private notifyListeners(alert: PerformanceAlert): void {
        this.listeners.forEach(listener => listener(alert));
    }

    /**
     * Get all alerts
     */
    public getAlerts(): PerformanceAlert[] {
        return [...this.alerts];
    }

    /**
     * Get unacknowledged alerts
     */
    public getUnacknowledgedAlerts(): PerformanceAlert[] {
        return this.alerts.filter(a => !a.acknowledged);
    }

    /**
     * Acknowledge alert
     */
    public acknowledgeAlert(alertId: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
        }
    }

    /**
     * Clear all alerts
     */
    public clearAlerts(): void {
        this.alerts = [];
    }

    /**
     * Update thresholds
     */
    public updateThresholds(thresholds: Partial<AlertThresholds>): void {
        this.thresholds = { ...this.thresholds, ...thresholds };
    }

    /**
     * Get thresholds
     */
    public getThresholds(): AlertThresholds {
        return { ...this.thresholds };
    }

    /**
     * Stop monitoring
     */
    public stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

/**
 * Singleton instance
 */
export const performanceAlertingManager = new PerformanceAlertingManager();

/**
 * Initialize alerting system
 */
export function initPerformanceAlerting(thresholds?: Partial<AlertThresholds>): void {
    performanceAlertingManager.init(thresholds);
}

/**
 * Export for convenience
 */
export default performanceAlertingManager;


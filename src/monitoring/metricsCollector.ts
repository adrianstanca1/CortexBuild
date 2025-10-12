/**
 * Metrics Collector
 * Task 3.2: Performance Monitoring
 * 
 * Centralized metrics collection and aggregation
 */

import { performanceMonitor } from '../utils/performanceMonitor';
import { sessionTracker } from '../utils/sessionTracker';
import { webVitalsCollector } from './webVitals';
import { loggingConfig, Logger } from '../config/logging.config';
import { performanceObserverManager } from './performanceObserver';

/**
 * Navigation Metrics
 */
export interface NavigationMetrics {
    route: string;
    loadTime: number;
    renderTime: number;
    timestamp: number;
}

/**
 * User Interaction Metrics
 */
export interface InteractionMetrics {
    type: string;
    target: string;
    duration: number;
    timestamp: number;
}

/**
 * Memory Metrics
 */
export interface MemoryMetrics {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    timestamp: number;
}

/**
 * Network Metrics
 */
export interface NetworkMetrics {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    timestamp: number;
}

/**
 * Aggregated Metrics
 */
export interface AggregatedMetrics {
    // Web Vitals
    webVitals: {
        LCP: number | null;
        FID: number | null;
        CLS: number | null;
        FCP: number | null;
        TTFB: number | null;
        INP: number | null;
        score: number;
    };
    
    // Performance
    performance: {
        avgComponentRenderTime: number;
        avgApiResponseTime: number;
        longTasksCount: number;
        layoutShiftsCount: number;
        slowResourcesCount: number;
    };
    
    // Session
    session: {
        duration: number;
        pageViews: number;
        actions: number;
        errors: number;
    };
    
    // Memory
    memory: MemoryMetrics | null;
    
    // Network
    network: NetworkMetrics | null;
}

/**
 * Metrics Collector
 */
class MetricsCollector {
    private navigationMetrics: NavigationMetrics[] = [];
    private interactionMetrics: InteractionMetrics[] = [];
    private memoryCheckInterval: number | null = null;

    /**
     * Initialize metrics collection
     */
    public init(): void {
        this.startMemoryMonitoring();
        this.trackNavigationTiming();
        // Only log if monitoring is verbose
        if (loggingConfig.monitoring.verbose) {
            Logger.debug('✅ Metrics collector initialized');
        }
    }

    /**
     * Track navigation timing
     */
    private trackNavigationTiming(): void {
        if (typeof window === 'undefined' || !window.performance) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                if (navigation) {
                    const metric: NavigationMetrics = {
                        route: window.location.pathname,
                        loadTime: navigation.loadEventEnd - navigation.fetchStart,
                        renderTime: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                        timestamp: Date.now()
                    };
                    
                    this.navigationMetrics.push(metric);

                    // Only log if navigation tracking is verbose
                    if (loggingConfig.performance.navigation && loggingConfig.performance.verbose) {
                        Logger.debug('📊 Navigation timing:', {
                            route: metric.route,
                            loadTime: `${Math.round(metric.loadTime)}ms`,
                            renderTime: `${Math.round(metric.renderTime)}ms`
                        });
                    }
                }
            }, 0);
        });
    }

    /**
     * Track user interaction
     */
    public trackInteraction(type: string, target: string, duration: number = 0): void {
        const metric: InteractionMetrics = {
            type,
            target,
            duration,
            timestamp: Date.now()
        };
        
        this.interactionMetrics.push(metric);
        
        // Keep only last 100 interactions
        if (this.interactionMetrics.length > 100) {
            this.interactionMetrics.shift();
        }
    }

    /**
     * Start memory monitoring
     */
    private startMemoryMonitoring(): void {
        if (typeof window === 'undefined' || !(performance as any).memory) return;

        // Check memory every 30 seconds
        this.memoryCheckInterval = window.setInterval(() => {
            const memory = this.getMemoryMetrics();
            if (memory) {
                // Check for potential memory leak (>100MB)
                if (memory.usedJSHeapSize > 100 * 1024 * 1024) {
                    Logger.warn('⚠️ High memory usage:', {
                        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
                        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`
                    });
                }
            }
        }, 30000);
    }

    /**
     * Get memory metrics
     */
    public getMemoryMetrics(): MemoryMetrics | null {
        if (typeof window === 'undefined' || !(performance as any).memory) return null;

        const memory = (performance as any).memory;
        return {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            timestamp: Date.now()
        };
    }

    /**
     * Get network metrics
     */
    public getNetworkMetrics(): NetworkMetrics | null {
        if (typeof window === 'undefined' || !(navigator as any).connection) return null;

        const connection = (navigator as any).connection;
        return {
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false,
            timestamp: Date.now()
        };
    }

    /**
     * Get aggregated metrics
     */
    public getAggregatedMetrics(): AggregatedMetrics {
        // Web Vitals
        const webVitalsSummary = webVitalsCollector.getSummary();
        
        // Performance
        const longTasks = performanceObserverManager.getLongTasks();
        const layoutShifts = performanceObserverManager.getLayoutShifts();
        const resources = performanceObserverManager.getResources();

        // Component performance - use default values since we don't track individual components here
        const avgComponentRenderTime = 0;

        // API performance - use default values since we don't track individual APIs here
        const avgApiResponseTime = 0;
        
        // Session
        const session = sessionTracker.getSession();
        
        return {
            webVitals: {
                LCP: webVitalsSummary.LCP?.value || null,
                FID: webVitalsSummary.FID?.value || null,
                CLS: webVitalsSummary.CLS?.value || null,
                FCP: webVitalsSummary.FCP?.value || null,
                TTFB: webVitalsSummary.TTFB?.value || null,
                INP: webVitalsSummary.INP?.value || null,
                score: webVitalsSummary.score
            },
            performance: {
                avgComponentRenderTime,
                avgApiResponseTime,
                longTasksCount: longTasks.length,
                layoutShiftsCount: layoutShifts.length,
                slowResourcesCount: resources.filter(r => r.duration > 3000).length
            },
            session: {
                duration: session.duration,
                pageViews: session.pageViews,
                actions: session.actions,
                errors: session.errors
            },
            memory: this.getMemoryMetrics(),
            network: this.getNetworkMetrics()
        };
    }

    /**
     * Get navigation metrics
     */
    public getNavigationMetrics(): NavigationMetrics[] {
        return [...this.navigationMetrics];
    }

    /**
     * Get interaction metrics
     */
    public getInteractionMetrics(): InteractionMetrics[] {
        return [...this.interactionMetrics];
    }

    /**
     * Clear all metrics
     */
    public clear(): void {
        this.navigationMetrics = [];
        this.interactionMetrics = [];
    }

    /**
     * Stop monitoring
     */
    public stop(): void {
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
            this.memoryCheckInterval = null;
        }
    }
}

/**
 * Singleton instance
 */
export const metricsCollector = new MetricsCollector();

/**
 * Initialize metrics collector
 */
export function initMetricsCollector(): void {
    metricsCollector.init();
}

/**
 * Track user interaction
 */
export function trackInteraction(type: string, target: string, duration?: number): void {
    metricsCollector.trackInteraction(type, target, duration);
}

/**
 * Get aggregated metrics
 */
export function getAggregatedMetrics(): AggregatedMetrics {
    return metricsCollector.getAggregatedMetrics();
}

/**
 * Export for convenience
 */
export default metricsCollector;


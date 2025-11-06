/**
 * Performance Observer
 * Task 3.2: Performance Monitoring
 * 
 * Observes performance entries and reports issues
 */

import { advancedErrorLogger } from '../utils/advancedErrorLogger';
import { ErrorSeverity, ErrorCategory } from '../types/errorTypes';

/**
 * Long Task Entry
 */
export interface LongTaskEntry {
    name: string;
    duration: number;
    startTime: number;
    attribution: string[];
}

/**
 * Layout Shift Entry
 */
export interface LayoutShiftEntry {
    value: number;
    hadRecentInput: boolean;
    startTime: number;
    sources: string[];
}

/**
 * Resource Timing Entry
 */
export interface ResourceTimingEntry {
    name: string;
    type: string;
    duration: number;
    size: number;
    cached: boolean;
}

/**
 * Performance Observer Manager
 */
class PerformanceObserverManager {
    private longTaskObserver: PerformanceObserver | null = null;
    private layoutShiftObserver: PerformanceObserver | null = null;
    private resourceObserver: PerformanceObserver | null = null;
    private longTasks: LongTaskEntry[] = [];
    private layoutShifts: LayoutShiftEntry[] = [];
    private resources: ResourceTimingEntry[] = [];
    private listeners: Map<string, Array<(entry: any) => void>> = new Map();

    /**
     * Initialize performance observers
     */
    public init(): void {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
            console.warn('PerformanceObserver not supported');
            return;
        }

        this.observeLongTasks();
        this.observeLayoutShifts();
        this.observeResources();

        console.log('✅ Performance observers initialized');
    }

    /**
     * Observe long tasks (>50ms)
     */
    private observeLongTasks(): void {
        try {
            this.longTaskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const longTask: LongTaskEntry = {
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime,
                        attribution: this.getAttribution(entry as any)
                    };

                    this.longTasks.push(longTask);
                    this.notifyListeners('longtask', longTask);

                    // Log tasks longer than 300ms to reduce noise during dev
                    // Tasks under 300ms are normal and don't need logging
                    if (entry.duration > 300) {
                        this.logLongTask(longTask);
                    }

                    // Keep only last 100 tasks
                    if (this.longTasks.length > 100) {
                        this.longTasks.shift();
                    }
                }
            });

            this.longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
            console.warn('Long task observation not supported:', error);
        }
    }

    /**
     * Observe layout shifts
     */
    private observeLayoutShifts(): void {
        try {
            this.layoutShiftObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const layoutShift: LayoutShiftEntry = {
                        value: (entry as any).value,
                        hadRecentInput: (entry as any).hadRecentInput,
                        startTime: entry.startTime,
                        sources: this.getLayoutShiftSources(entry as any)
                    };

                    // Only track shifts without recent input
                    if (!layoutShift.hadRecentInput) {
                        this.layoutShifts.push(layoutShift);
                        this.notifyListeners('layout-shift', layoutShift);

                        // Log significant shifts
                        if (layoutShift.value > 0.1) {
                            this.logLayoutShift(layoutShift);
                        }

                        // Keep only last 100 shifts
                        if (this.layoutShifts.length > 100) {
                            this.layoutShifts.shift();
                        }
                    }
                }
            });

            this.layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('Layout shift observation not supported:', error);
        }
    }

    /**
     * Observe resource loading
     */
    private observeResources(): void {
        try {
            this.resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const resource: ResourceTimingEntry = {
                        name: entry.name,
                        type: this.getResourceType(entry.name),
                        duration: entry.duration,
                        size: (entry as any).transferSize || 0,
                        cached: (entry as any).transferSize === 0
                    };

                    this.resources.push(resource);
                    this.notifyListeners('resource', resource);

                    // Log slow resources (>3s)
                    if (resource.duration > 3000) {
                        this.logSlowResource(resource);
                    }

                    // Keep only last 200 resources
                    if (this.resources.length > 200) {
                        this.resources.shift();
                    }
                }
            });

            this.resourceObserver.observe({ entryTypes: ['resource'] });
        } catch (error) {
            console.warn('Resource observation not supported:', error);
        }
    }

    /**
     * Get attribution for long task
     */
    private getAttribution(entry: any): string[] {
        if (!entry.attribution) return [];
        return entry.attribution.map((attr: any) => attr.name || 'unknown');
    }

    /**
     * Get layout shift sources
     */
    private getLayoutShiftSources(entry: any): string[] {
        if (!entry.sources) return [];
        return entry.sources.map((source: any) => {
            const node = source.node;
            if (!node) return 'unknown';
            return node.tagName || node.nodeName || 'unknown';
        });
    }

    /**
     * Get resource type from URL
     */
    private getResourceType(url: string): string {
        if (url.match(/\.(js|mjs)$/)) return 'script';
        if (url.match(/\.css$/)) return 'stylesheet';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
        if (url.match(/\.json$/)) return 'json';
        return 'other';
    }

    /**
     * Log long task
     */
    private logLongTask(task: LongTaskEntry): void {
        if (import.meta.env.DEV) {
            console.warn('⚠️ Long task detected:', {
                duration: `${Math.round(task.duration)}ms`,
                attribution: task.attribution
            });
        }

        advancedErrorLogger.logError(
            new Error(`Long task: ${task.duration}ms`),
            {
                custom: {
                    type: 'long_task',
                    duration: task.duration,
                    attribution: task.attribution
                }
            },
            ErrorSeverity.LOW,
            ErrorCategory.PERFORMANCE
        );
    }

    /**
     * Log layout shift
     */
    private logLayoutShift(shift: LayoutShiftEntry): void {
        if (import.meta.env.DEV) {
            console.warn('⚠️ Layout shift detected:', {
                value: shift.value.toFixed(4),
                sources: shift.sources
            });
        }

        advancedErrorLogger.logError(
            new Error(`Layout shift: ${shift.value}`),
            {
                custom: {
                    type: 'layout_shift',
                    value: shift.value,
                    sources: shift.sources
                }
            },
            ErrorSeverity.LOW,
            ErrorCategory.PERFORMANCE
        );
    }

    /**
     * Log slow resource
     */
    private logSlowResource(resource: ResourceTimingEntry): void {
        if (import.meta.env.DEV) {
            console.warn('⚠️ Slow resource:', {
                name: resource.name,
                duration: `${Math.round(resource.duration)}ms`,
                size: `${Math.round(resource.size / 1024)}KB`
            });
        }

        advancedErrorLogger.logError(
            new Error(`Slow resource: ${resource.name}`),
            {
                custom: {
                    type: 'slow_resource',
                    name: resource.name,
                    duration: resource.duration,
                    size: resource.size
                }
            },
            ErrorSeverity.LOW,
            ErrorCategory.PERFORMANCE
        );
    }

    /**
     * Add listener
     */
    public addListener(type: string, listener: (entry: any) => void): void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type)!.push(listener);
    }

    /**
     * Remove listener
     */
    public removeListener(type: string, listener: (entry: any) => void): void {
        const listeners = this.listeners.get(type);
        if (listeners) {
            this.listeners.set(type, listeners.filter(l => l !== listener));
        }
    }

    /**
     * Notify listeners
     */
    private notifyListeners(type: string, entry: any): void {
        const listeners = this.listeners.get(type);
        if (listeners) {
            listeners.forEach(listener => listener(entry));
        }
    }

    /**
     * Get long tasks
     */
    public getLongTasks(): LongTaskEntry[] {
        return [...this.longTasks];
    }

    /**
     * Get layout shifts
     */
    public getLayoutShifts(): LayoutShiftEntry[] {
        return [...this.layoutShifts];
    }

    /**
     * Get resources
     */
    public getResources(): ResourceTimingEntry[] {
        return [...this.resources];
    }

    /**
     * Clear all data
     */
    public clear(): void {
        this.longTasks = [];
        this.layoutShifts = [];
        this.resources = [];
    }

    /**
     * Disconnect observers
     */
    public disconnect(): void {
        this.longTaskObserver?.disconnect();
        this.layoutShiftObserver?.disconnect();
        this.resourceObserver?.disconnect();
    }
}

/**
 * Singleton instance
 */
export const performanceObserverManager = new PerformanceObserverManager();

/**
 * Initialize performance observers
 */
export function initPerformanceObservers(): void {
    performanceObserverManager.init();
}

/**
 * Export for convenience
 */
export default performanceObserverManager;


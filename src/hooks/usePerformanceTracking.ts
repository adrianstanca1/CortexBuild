/**
 * usePerformanceTracking Hook
 * React hook for tracking component performance
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

/**
 * Hook options
 */
interface UsePerformanceTrackingOptions {
    componentName: string;
    trackRenders?: boolean;
    trackMounts?: boolean;
    warnThreshold?: number;  // ms
}

/**
 * usePerformanceTracking Hook
 * Automatically tracks component render performance
 */
export function usePerformanceTracking(options: UsePerformanceTrackingOptions) {
    const {
        componentName,
        trackRenders = true,
        trackMounts = true,
        warnThreshold = 16  // 60fps
    } = options;

    const renderStartTime = useRef<number>(0);
    const mountStartTime = useRef<number>(0);
    const renderCount = useRef<number>(0);

    /**
     * Track render start - MUST be inside useEffect or after all hooks
     */
    // Moved to useEffect below to comply with React Hooks rules

    /**
     * Track mount
     */
    useEffect(() => {
        if (trackMounts) {
            mountStartTime.current = performance.now();
        }

        return () => {
            if (trackMounts) {
                const mountDuration = performance.now() - mountStartTime.current;
                performanceMonitor.trackComponentRender(
                    `${componentName} (mount)`,
                    mountDuration
                );
            }
        };
    }, [componentName, trackMounts]);

    /**
     * Track render start and end
     */
    useEffect(() => {
        // Track render start
        if (trackRenders) {
            renderStartTime.current = performance.now();
        }
    });

    useEffect(() => {
        if (trackRenders) {
            const renderDuration = performance.now() - renderStartTime.current;
            renderCount.current++;

            performanceMonitor.trackComponentRender(componentName, renderDuration);

            // Warn if slow
            if (renderDuration > warnThreshold && import.meta.env.DEV) {
                console.warn(
                    `⚠️ Slow render detected in ${componentName}: ${renderDuration.toFixed(2)}ms (threshold: ${warnThreshold}ms)`
                );
            }
        }
    });

    /**
     * Measure async operation
     */
    const measureAsync = useCallback(async <T,>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> => {
        const startTime = performance.now();
        try {
            const result = await operation();
            const duration = performance.now() - startTime;
            
            performanceMonitor.trackComponentRender(
                `${componentName}.${operationName}`,
                duration
            );

            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            performanceMonitor.trackComponentRender(
                `${componentName}.${operationName} (error)`,
                duration
            );
            throw error;
        }
    }, [componentName]);

    /**
     * Measure sync operation
     */
    const measureSync = useCallback(<T,>(
        operation: () => T,
        operationName: string
    ): T => {
        const startTime = performance.now();
        try {
            const result = operation();
            const duration = performance.now() - startTime;
            
            performanceMonitor.trackComponentRender(
                `${componentName}.${operationName}`,
                duration
            );

            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            performanceMonitor.trackComponentRender(
                `${componentName}.${operationName} (error)`,
                duration
            );
            throw error;
        }
    }, [componentName]);

    /**
     * Get component stats
     */
    const getStats = useCallback(() => {
        return performanceMonitor.getComponentStats(componentName);
    }, [componentName]);

    return {
        measureAsync,
        measureSync,
        getStats,
        renderCount: renderCount.current
    };
}

/**
 * useRenderTracking Hook
 * Simplified hook for basic render tracking
 */
export function useRenderTracking(componentName: string, warnThreshold?: number) {
    return usePerformanceTracking({
        componentName,
        trackRenders: true,
        trackMounts: false,
        warnThreshold
    });
}

/**
 * useMountTracking Hook
 * Track only mount/unmount performance
 */
export function useMountTracking(componentName: string) {
    return usePerformanceTracking({
        componentName,
        trackRenders: false,
        trackMounts: true
    });
}

/**
 * withPerformanceTracking HOC
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<P extends object>(
    Component: React.ComponentType<P>,
    componentName?: string
) {
    const WrappedComponent = (props: P) => {
        const name = componentName || Component.displayName || Component.name || 'Component';
        usePerformanceTracking({
            componentName: name,
            trackRenders: true,
            trackMounts: true
        });

        return React.createElement(Component, props);
    };

    WrappedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`;

    return WrappedComponent;
}

/**
 * useApiPerformance Hook
 * Track API call performance
 */
export function useApiPerformance() {
    const trackApiCall = useCallback(async <T,>(
        apiCall: () => Promise<T>,
        endpoint: string
    ): Promise<T> => {
        const startTime = performance.now();
        try {
            const result = await apiCall();
            const duration = performance.now() - startTime;
            
            performanceMonitor.trackApiCall(endpoint, duration, 200);

            return result;
        } catch (error: any) {
            const duration = performance.now() - startTime;
            const status = error?.response?.status || 500;
            
            performanceMonitor.trackApiCall(endpoint, duration, status);
            
            throw error;
        }
    }, []);

    return { trackApiCall };
}

/**
 * Performance measurement utilities
 */
export const PerformanceUtils = {
    /**
     * Measure function execution time
     */
    measure: <T,>(fn: () => T, label?: string): T => {
        const startTime = performance.now();
        const result = fn();
        const duration = performance.now() - startTime;
        
        if (label && import.meta.env.DEV) {
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        }
        
        return result;
    },

    /**
     * Measure async function execution time
     */
    measureAsync: async <T,>(fn: () => Promise<T>, label?: string): Promise<T> => {
        const startTime = performance.now();
        const result = await fn();
        const duration = performance.now() - startTime;
        
        if (label && import.meta.env.DEV) {
            console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        }
        
        return result;
    },

    /**
     * Create a performance mark
     */
    mark: (name: string): void => {
        if (performance.mark) {
            performance.mark(name);
        }
    },

    /**
     * Measure between two marks
     */
    measureBetween: (name: string, startMark: string, endMark: string): number | null => {
        if (performance.measure && performance.getEntriesByName) {
            try {
                performance.measure(name, startMark, endMark);
                const measures = performance.getEntriesByName(name);
                return measures.length > 0 ? measures[0].duration : null;
            } catch {
                return null;
            }
        }
        return null;
    },

    /**
     * Clear all marks and measures
     */
    clear: (): void => {
        if (performance.clearMarks) {
            performance.clearMarks();
        }
        if (performance.clearMeasures) {
            performance.clearMeasures();
        }
    }
};


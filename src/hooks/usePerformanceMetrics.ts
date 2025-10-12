/**
 * Use Performance Metrics Hook
 * Task 3.2: Performance Monitoring
 * 
 * React hook for accessing performance metrics
 */

import { useState, useEffect, useCallback } from 'react';
import { metricsCollector, AggregatedMetrics } from '../monitoring/metricsCollector';
import { webVitalsCollector, WebVitalsSummary } from '../monitoring/webVitals';
import { performanceObserverManager } from '../monitoring/performanceObserver';
import { Logger } from '../config/logging.config';

/**
 * Performance Metrics Hook
 */
export function usePerformanceMetrics() {
    const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
    const [webVitals, setWebVitals] = useState<WebVitalsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Refresh metrics
     */
    const refreshMetrics = useCallback(() => {
        try {
            const aggregated = metricsCollector.getAggregatedMetrics();
            const vitals = webVitalsCollector.getSummary();
            
            setMetrics(aggregated);
            setWebVitals(vitals);
            setIsLoading(false);
        } catch (error) {
            Logger.error('Error refreshing metrics:', error);
            setIsLoading(false);
        }
    }, []);

    /**
     * Auto-refresh metrics
     */
    useEffect(() => {
        // Initial load
        refreshMetrics();

        // Refresh every 5 seconds
        const interval = setInterval(refreshMetrics, 5000);

        return () => clearInterval(interval);
    }, [refreshMetrics]);

    /**
     * Get performance score
     */
    const getPerformanceScore = useCallback((): number => {
        return webVitals?.score || 0;
    }, [webVitals]);

    /**
     * Get performance rating
     */
    const getPerformanceRating = useCallback((): 'good' | 'needs-improvement' | 'poor' => {
        return webVitals?.rating || 'poor';
    }, [webVitals]);

    /**
     * Check if performance is good
     */
    const isPerformanceGood = useCallback((): boolean => {
        return getPerformanceRating() === 'good';
    }, [getPerformanceRating]);

    /**
     * Get long tasks count
     */
    const getLongTasksCount = useCallback((): number => {
        return performanceObserverManager.getLongTasks().length;
    }, []);

    /**
     * Get layout shifts count
     */
    const getLayoutShiftsCount = useCallback((): number => {
        return performanceObserverManager.getLayoutShifts().length;
    }, []);

    return {
        metrics,
        webVitals,
        isLoading,
        refreshMetrics,
        getPerformanceScore,
        getPerformanceRating,
        isPerformanceGood,
        getLongTasksCount,
        getLayoutShiftsCount
    };
}

/**
 * Use Web Vitals Hook
 */
export function useWebVitals() {
    const [webVitals, setWebVitals] = useState<WebVitalsSummary | null>(null);

    useEffect(() => {
        const updateWebVitals = () => {
            setWebVitals(webVitalsCollector.getSummary());
        };

        // Initial load
        updateWebVitals();

        // Listen for updates
        const listener = () => updateWebVitals();
        webVitalsCollector.addListener(listener);

        return () => {
            webVitalsCollector.removeListener(listener);
        };
    }, []);

    return webVitals;
}

/**
 * Use Performance Score Hook
 */
export function usePerformanceScore() {
    const webVitals = useWebVitals();
    return webVitals?.score || 0;
}

/**
 * Use Performance Rating Hook
 */
export function usePerformanceRating() {
    const webVitals = useWebVitals();
    return webVitals?.rating || 'poor';
}


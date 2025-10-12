/**
 * Web Vitals Monitoring
 * Task 3.2: Performance Monitoring
 * 
 * Tracks Core Web Vitals and reports to analytics
 */

import { onCLS, onLCP, onFCP, onTTFB, onINP, Metric } from 'web-vitals';
import { advancedErrorLogger } from '../utils/advancedErrorLogger';
import { ErrorSeverity, ErrorCategory } from '../types/errorTypes';
import { loggingConfig, Logger } from '../config/logging.config';

/**
 * Web Vitals Thresholds
 */
export const WEB_VITALS_THRESHOLDS = {
    LCP: { good: 2500, needsImprovement: 4000 },      // Largest Contentful Paint
    INP: { good: 200, needsImprovement: 500 },        // Interaction to Next Paint (replaces FID)
    CLS: { good: 0.1, needsImprovement: 0.25 },       // Cumulative Layout Shift
    FCP: { good: 1800, needsImprovement: 3000 },      // First Contentful Paint
    TTFB: { good: 600, needsImprovement: 1500 }       // Time to First Byte
};

/**
 * Web Vitals Rating
 */
export type WebVitalsRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Web Vitals Metric
 */
export interface WebVitalsMetric {
    name: string;
    value: number;
    rating: WebVitalsRating;
    delta: number;
    id: string;
    navigationType: string;
    timestamp: number;
}

/**
 * Web Vitals Summary
 */
export interface WebVitalsSummary {
    LCP: WebVitalsMetric | null;
    INP: WebVitalsMetric | null;
    CLS: WebVitalsMetric | null;
    FCP: WebVitalsMetric | null;
    TTFB: WebVitalsMetric | null;
    INP: WebVitalsMetric | null;
    score: number;
    rating: WebVitalsRating;
}

/**
 * Web Vitals Collector
 */
class WebVitalsCollector {
    private metrics: Map<string, WebVitalsMetric> = new Map();
    private listeners: Array<(metric: WebVitalsMetric) => void> = [];

    /**
     * Initialize web vitals monitoring
     */
    public init(): void {
        if (typeof window === 'undefined') return;

        // Track Core Web Vitals
        onLCP(this.handleMetric.bind(this));
        onINP(this.handleMetric.bind(this));
        onCLS(this.handleMetric.bind(this));
        onFCP(this.handleMetric.bind(this));
        onTTFB(this.handleMetric.bind(this));

        Logger.debug('✅ Web Vitals monitoring initialized');
    }

    /**
     * Handle metric
     */
    private handleMetric(metric: Metric): void {
        const webVitalsMetric: WebVitalsMetric = {
            name: metric.name,
            value: metric.value,
            rating: metric.rating as WebVitalsRating,
            delta: metric.delta,
            id: metric.id,
            navigationType: metric.navigationType,
            timestamp: Date.now()
        };

        // Store metric
        this.metrics.set(metric.name, webVitalsMetric);

        // Report metric
        this.reportMetric(webVitalsMetric);

        // Notify listeners
        this.notifyListeners(webVitalsMetric);

        // Log poor metrics
        if (webVitalsMetric.rating === 'poor') {
            this.logPoorMetric(webVitalsMetric);
        }
    }

    /**
     * Report metric to analytics
     */
    private reportMetric(metric: WebVitalsMetric): void {
        // Send to analytics (Google Analytics, custom analytics, etc.)
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', metric.name, {
                value: Math.round(metric.value),
                metric_rating: metric.rating,
                metric_delta: Math.round(metric.delta),
                metric_id: metric.id
            });
        }

        // Log to console only if enabled and verbose
        if (loggingConfig.performance.enabled && loggingConfig.performance.verbose) {
            const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
            Logger.debug(`${emoji} ${metric.name}:`, {
                value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
                rating: metric.rating,
                delta: Math.round(metric.delta)
            });
        }
    }

    /**
     * Log poor metric
     */
    private logPoorMetric(metric: WebVitalsMetric): void {
        advancedErrorLogger.logError(
            new Error(`Poor ${metric.name}: ${metric.value}`),
            {
                custom: {
                    metric: metric.name,
                    value: metric.value,
                    rating: metric.rating,
                    threshold: this.getThreshold(metric.name)
                }
            },
            ErrorSeverity.MEDIUM,
            ErrorCategory.PERFORMANCE
        );
    }

    /**
     * Get threshold for metric
     */
    private getThreshold(metricName: string): { good: number; needsImprovement: number } {
        return WEB_VITALS_THRESHOLDS[metricName as keyof typeof WEB_VITALS_THRESHOLDS] || { good: 0, needsImprovement: 0 };
    }

    /**
     * Add listener
     */
    public addListener(listener: (metric: WebVitalsMetric) => void): void {
        this.listeners.push(listener);
    }

    /**
     * Remove listener
     */
    public removeListener(listener: (metric: WebVitalsMetric) => void): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * Notify listeners
     */
    private notifyListeners(metric: WebVitalsMetric): void {
        this.listeners.forEach(listener => listener(metric));
    }

    /**
     * Get metric
     */
    public getMetric(name: string): WebVitalsMetric | null {
        return this.metrics.get(name) || null;
    }

    /**
     * Get all metrics
     */
    public getAllMetrics(): WebVitalsMetric[] {
        return Array.from(this.metrics.values());
    }

    /**
     * Get summary
     */
    public getSummary(): WebVitalsSummary {
        const LCP = this.getMetric('LCP');
        const FID = this.getMetric('FID');
        const CLS = this.getMetric('CLS');
        const FCP = this.getMetric('FCP');
        const TTFB = this.getMetric('TTFB');
        const INP = this.getMetric('INP');

        // Calculate overall score (0-100)
        const score = this.calculateScore();

        // Determine overall rating
        const rating = score >= 90 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor';

        return {
            LCP,
            INP,
            CLS,
            FCP,
            TTFB,
            score,
            rating
        };
    }

    /**
     * Calculate overall performance score
     */
    private calculateScore(): number {
        const metrics = this.getAllMetrics();
        if (metrics.length === 0) return 0;

        let totalScore = 0;
        let count = 0;

        metrics.forEach(metric => {
            const metricScore = this.getMetricScore(metric);
            totalScore += metricScore;
            count++;
        });

        return count > 0 ? Math.round(totalScore / count) : 0;
    }

    /**
     * Get metric score (0-100)
     */
    private getMetricScore(metric: WebVitalsMetric): number {
        if (metric.rating === 'good') return 100;
        if (metric.rating === 'needs-improvement') return 50;
        return 0;
    }

    /**
     * Clear metrics
     */
    public clear(): void {
        this.metrics.clear();
    }
}

/**
 * Singleton instance
 */
export const webVitalsCollector = new WebVitalsCollector();

/**
 * Initialize web vitals monitoring
 */
export function initWebVitals(): void {
    webVitalsCollector.init();
}

/**
 * Get web vitals summary
 */
export function getWebVitalsSummary(): WebVitalsSummary {
    return webVitalsCollector.getSummary();
}

/**
 * Add web vitals listener
 */
export function addWebVitalsListener(listener: (metric: WebVitalsMetric) => void): void {
    webVitalsCollector.addListener(listener);
}

/**
 * Remove web vitals listener
 */
export function removeWebVitalsListener(listener: (metric: WebVitalsMetric) => void): void {
    webVitalsCollector.removeListener(listener);
}

/**
 * Export for convenience
 */
export default webVitalsCollector;


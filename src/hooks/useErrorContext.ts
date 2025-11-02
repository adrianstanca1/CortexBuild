/**
 * useErrorContext Hook
 * React hook for collecting error context in components
 */

import { useEffect, useCallback, useRef } from 'react';
import { ErrorContext, Breadcrumb } from '../types/errorTypes';
import { contextCollector } from '../utils/contextCollector';

/**
 * Hook options
 */
interface UseErrorContextOptions {
    componentName?: string;
    trackRenders?: boolean;
    trackMounts?: boolean;
    trackProps?: boolean;
}

/**
 * useErrorContext Hook
 * Automatically collects context and tracks component lifecycle
 */
export function useErrorContext(options: UseErrorContextOptions = {}) {
    const {
        componentName = 'UnknownComponent',
        trackRenders = true,
        trackMounts = true,
        trackProps = false
    } = options;

    const renderCount = useRef(0);
    const mountTime = useRef<number>(Date.now());

    /**
     * Track component mount
     */
    useEffect(() => {
        if (trackMounts) {
            contextCollector.addBreadcrumb({
                type: 'custom',
                category: 'component',
                message: `Component mounted: ${componentName}`,
                data: {
                    component: componentName,
                    mountTime: mountTime.current
                },
                level: 'info'
            });
        }

        // Track component unmount
        return () => {
            if (trackMounts) {
                const lifetime = Date.now() - mountTime.current;
                contextCollector.addBreadcrumb({
                    type: 'custom',
                    category: 'component',
                    message: `Component unmounted: ${componentName}`,
                    data: {
                        component: componentName,
                        lifetime,
                        renderCount: renderCount.current
                    },
                    level: 'info'
                });
            }
        };
    }, [componentName, trackMounts]);

    /**
     * Track renders
     */
    useEffect(() => {
        if (trackRenders) {
            renderCount.current++;
            
            // Only log every 10th render to avoid spam
            if (renderCount.current % 10 === 0) {
                contextCollector.addBreadcrumb({
                    type: 'custom',
                    category: 'component',
                    message: `Component rendered ${renderCount.current} times: ${componentName}`,
                    data: {
                        component: componentName,
                        renderCount: renderCount.current
                    },
                    level: 'info'
                });
            }
        }
    });

    /**
     * Get current error context
     */
    const getContext = useCallback((): Partial<ErrorContext> => {
        return {
            browser: contextCollector.collectBrowserInfo(),
            network: contextCollector.collectNetworkInfo(),
            performance: contextCollector.collectPerformanceMetrics(),
            appState: {
                ...contextCollector.collectStateSnapshot(),
                component: componentName
            },
            breadcrumbs: contextCollector.getBreadcrumbs()
        };
    }, [componentName]);

    /**
     * Add custom breadcrumb
     */
    const addBreadcrumb = useCallback((breadcrumb: Omit<Breadcrumb, 'timestamp'>) => {
        contextCollector.addBreadcrumb({
            ...breadcrumb,
            data: {
                ...breadcrumb.data,
                component: componentName
            }
        });
    }, [componentName]);

    /**
     * Track user action
     */
    const trackAction = useCallback((action: string, data?: Record<string, any>) => {
        contextCollector.addBreadcrumb({
            type: 'custom',
            category: 'user_action',
            message: `User action: ${action}`,
            data: {
                ...data,
                component: componentName,
                action
            },
            level: 'info'
        });
    }, [componentName]);

    /**
     * Track API call
     */
    const trackApiCall = useCallback((
        endpoint: string,
        method: string,
        status?: number,
        duration?: number
    ) => {
        contextCollector.addBreadcrumb({
            type: 'api',
            category: 'network',
            message: `API ${method} ${endpoint}`,
            data: {
                endpoint,
                method,
                status,
                duration,
                component: componentName
            },
            level: status && status >= 400 ? 'error' : 'info'
        });
    }, [componentName]);

    /**
     * Track navigation
     */
    const trackNavigation = useCallback((to: string, from?: string) => {
        contextCollector.addBreadcrumb({
            type: 'navigation',
            category: 'navigation',
            message: `Navigation: ${from || 'unknown'} → ${to}`,
            data: {
                to,
                from,
                component: componentName
            },
            level: 'info'
        });
    }, [componentName]);

    /**
     * Track error
     */
    const trackError = useCallback((error: Error, additionalData?: Record<string, any>) => {
        contextCollector.addBreadcrumb({
            type: 'error',
            category: 'error',
            message: `Error in ${componentName}: ${error.message}`,
            data: {
                error: error.message,
                stack: error.stack,
                ...additionalData,
                component: componentName
            },
            level: 'error'
        });
    }, [componentName]);

    return {
        getContext,
        addBreadcrumb,
        trackAction,
        trackApiCall,
        trackNavigation,
        trackError,
        componentName,
        renderCount: renderCount.current
    };
}

/**
 * useComponentTracking Hook
 * Simplified hook for basic component tracking
 */
export function useComponentTracking(componentName: string) {
    return useErrorContext({
        componentName,
        trackRenders: true,
        trackMounts: true,
        trackProps: false
    });
}

/**
 * useActionTracking Hook
 * Hook specifically for tracking user actions
 */
export function useActionTracking(componentName: string) {
    const { trackAction } = useErrorContext({ componentName });
    return trackAction;
}

/**
 * useApiTracking Hook
 * Hook specifically for tracking API calls
 */
export function useApiTracking(componentName: string) {
    const { trackApiCall } = useErrorContext({ componentName });
    return trackApiCall;
}


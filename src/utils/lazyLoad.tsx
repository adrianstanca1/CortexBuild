/**
 * Lazy Loading Utilities
 * Task 1.3: Bundle Size Optimization
 * 
 * Utilities for lazy loading components with Suspense
 */

import React, { Suspense, ComponentType } from 'react';

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-12 w-12',
        large: 'h-16 w-16'
    };

    return (
        <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
        </div>
    );
}

/**
 * Full Page Loading Spinner
 */
export function FullPageLoader() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
    );
}

/**
 * Skeleton Loader for Components
 */
export function SkeletonLoader({ type = 'default' }: { type?: 'default' | 'dashboard' | 'editor' | 'list' }) {
    if (type === 'dashboard') {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        );
    }

    if (type === 'editor') {
        return (
            <div className="h-full bg-gray-100 dark:bg-gray-800 animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600" />
                <div className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-4 p-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
            </div>
        );
    }

    return <LoadingSpinner />;
}

/**
 * Lazy load a component with custom fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    fallback?: React.ReactNode
) {
    const LazyComponent = React.lazy(importFunc);
    
    return (props: React.ComponentProps<T>) => (
        <Suspense fallback={fallback || <LoadingSpinner />}>
            <LazyComponent {...props} />
        </Suspense>
    );
}

/**
 * Lazy load with full page loader
 */
export function lazyLoadPage<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
) {
    return lazyLoad(importFunc, <FullPageLoader />);
}

/**
 * Lazy load with skeleton loader
 */
export function lazyLoadWithSkeleton<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    skeletonType: 'default' | 'dashboard' | 'editor' | 'list' = 'default'
) {
    return lazyLoad(importFunc, <SkeletonLoader type={skeletonType} />);
}

/**
 * Lazy load Monaco Editor
 */
export function lazyLoadMonaco() {
    return lazyLoad(
        () => import('@monaco-editor/react'),
        <SkeletonLoader type="editor" />
    );
}

/**
 * Preload a component
 * Use this to preload components before they're needed
 */
export function preloadComponent<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
): void {
    importFunc();
}

/**
 * Lazy load with retry logic
 * Retries loading if it fails (useful for network issues)
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    retries: number = 3,
    fallback?: React.ReactNode
) {
    const retry = (fn: () => Promise<any>, retriesLeft: number): Promise<any> => {
        return fn().catch((error) => {
            if (retriesLeft === 0) {
                throw error;
            }
            console.warn(`Lazy load failed, retrying... (${retriesLeft} retries left)`);
            return new Promise(resolve => setTimeout(resolve, 1000))
                .then(() => retry(fn, retriesLeft - 1));
        });
    };

    const LazyComponent = React.lazy(() => retry(importFunc, retries));
    
    return (props: React.ComponentProps<T>) => (
        <Suspense fallback={fallback || <LoadingSpinner />}>
            <LazyComponent {...props} />
        </Suspense>
    );
}

/**
 * Create a lazy loaded route component
 */
export function createLazyRoute<T extends ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>,
    options?: {
        fallback?: React.ReactNode;
        preload?: boolean;
        retry?: boolean;
    }
) {
    const { fallback, preload, retry } = options || {};

    // Preload if requested
    if (preload) {
        preloadComponent(importFunc);
    }

    // Use retry logic if requested
    if (retry) {
        return lazyLoadWithRetry(importFunc, 3, fallback || <FullPageLoader />);
    }

    return lazyLoad(importFunc, fallback || <FullPageLoader />);
}

/**
 * Lazy load utilities export
 */
export const LazyLoadUtils = {
    lazyLoad,
    lazyLoadPage,
    lazyLoadWithSkeleton,
    lazyLoadMonaco,
    lazyLoadWithRetry,
    createLazyRoute,
    preloadComponent,
    LoadingSpinner,
    FullPageLoader,
    SkeletonLoader
};

export default LazyLoadUtils;


/**
 * SuspenseLoader Component
 * Provides consistent loading UI for lazy-loaded components
 * Improves perceived performance with skeleton screens and spinners
 */

import React, { Suspense, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface SuspenseLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  isDarkMode?: boolean;
}

/**
 * Default loading fallback component
 * Shows a spinner with loading text
 */
const DefaultLoadingFallback: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => (
  <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading experience...
      </p>
    </div>
  </div>
);

/**
 * Skeleton loading component for dashboard-like layouts
 */
const SkeletonLoader: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => (
  <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-6`}>
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className={`h-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-32 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
        ))}
      </div>
      
      {/* Table skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-10 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Lightweight loading component for modals and overlays
 */
const ModalLoadingFallback: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => (
  <div className={`flex items-center justify-center p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading...
      </p>
    </div>
  </div>
);

/**
 * SuspenseLoader Component
 * Wraps lazy-loaded components with Suspense and provides loading UI
 * 
 * @example
 * ```tsx
 * <SuspenseLoader isDarkMode={isDarkMode}>
 *   <LazyComponent />
 * </SuspenseLoader>
 * ```
 */
export const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  children,
  fallback,
  isDarkMode = true,
}) => (
  <Suspense fallback={fallback || <DefaultLoadingFallback isDarkMode={isDarkMode} />}>
    {children}
  </Suspense>
);

/**
 * Dashboard-specific Suspense wrapper with skeleton loading
 */
export const DashboardSuspenseLoader: React.FC<Omit<SuspenseLoaderProps, 'fallback'>> = ({
  children,
  isDarkMode = true,
}) => (
  <Suspense fallback={<SkeletonLoader isDarkMode={isDarkMode} />}>
    {children}
  </Suspense>
);

/**
 * Modal-specific Suspense wrapper with lightweight loading
 */
export const ModalSuspenseLoader: React.FC<Omit<SuspenseLoaderProps, 'fallback'>> = ({
  children,
  isDarkMode = true,
}) => (
  <Suspense fallback={<ModalLoadingFallback isDarkMode={isDarkMode} />}>
    {children}
  </Suspense>
);

export default SuspenseLoader;


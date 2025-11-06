/**
 * LazyComponentWrapper
 * Wraps components with lazy loading and loading states
 * Provides consistent loading UI and error handling
 */

import React, { Suspense, ReactNode, ComponentType } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface LazyComponentWrapperProps {
  children: ReactNode;
  isDarkMode?: boolean;
  showSkeleton?: boolean;
  skeletonHeight?: string;
}

interface LazyComponentOptions {
  isDarkMode?: boolean;
  showSkeleton?: boolean;
  skeletonHeight?: string;
}

/**
 * Skeleton Loader Component
 */
const SkeletonPlaceholder: React.FC<{ height?: string; isDarkMode?: boolean }> = ({
  height = 'h-64',
  isDarkMode = true,
}) => (
  <div className={`${height} rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
);

/**
 * Loading Fallback Component
 */
const LoadingFallback: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => (
  <div className={`flex items-center justify-center p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading component...
      </p>
    </div>
  </div>
);

/**
 * Error Fallback Component
 */
const ErrorFallback: React.FC<{ isDarkMode?: boolean; error?: Error }> = ({
  isDarkMode = true,
  error,
}) => (
  <div className={`flex items-center justify-center p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-red-900' : 'border-red-200'}`}>
    <div className="flex flex-col items-center gap-3">
      <AlertCircle className="h-6 w-6 text-red-500" />
      <div className="text-center">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Failed to load component
        </p>
        {error && (
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
            {error.message}
          </p>
        )}
      </div>
    </div>
  </div>
);

/**
 * LazyComponentWrapper
 * Wraps components with Suspense and provides loading/error UI
 */
export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  isDarkMode = true,
  showSkeleton = false,
  skeletonHeight = 'h-64',
}) => {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    return <ErrorFallback isDarkMode={isDarkMode} error={error} />;
  }

  return (
    <Suspense
      fallback={
        showSkeleton ? (
          <SkeletonPlaceholder height={skeletonHeight} isDarkMode={isDarkMode} />
        ) : (
          <LoadingFallback isDarkMode={isDarkMode} />
        )
      }
    >
      <ErrorBoundary onError={setError}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * Error Boundary Component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}

/**
 * withLazyLoading HOC
 * Wraps a component with lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: LazyComponentOptions = {}
) {
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: Component })
  );

  return (props: P) => (
    <LazyComponentWrapper
      isDarkMode={options.isDarkMode}
      showSkeleton={options.showSkeleton}
      skeletonHeight={options.skeletonHeight}
    >
      <LazyComponent {...props} />
    </LazyComponentWrapper>
  );
}

/**
 * useLazyComponent Hook
 * Dynamically import and lazy load a component
 */
export function useLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions = {}
) {
  const LazyComponent = React.lazy(importFn);

  return (props: P) => (
    <LazyComponentWrapper
      isDarkMode={options.isDarkMode}
      showSkeleton={options.showSkeleton}
      skeletonHeight={options.skeletonHeight}
    >
      <LazyComponent {...props} />
    </LazyComponentWrapper>
  );
}

export default LazyComponentWrapper;


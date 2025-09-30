import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  componentName?: string;
  enableLogging?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  componentName = 'Component',
  enableLogging = process.env.NODE_ENV === 'development'
}) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enableLogging) return;

    renderCount.current += 1;
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    if (renderDuration > 16) { // More than one frame (16ms at 60fps)
      console.warn(`🐌 Slow render detected in ${componentName}:`, {
        duration: `${renderDuration.toFixed(2)}ms`,
        renderCount: renderCount.current,
        timestamp: new Date().toISOString()
      });
    }

    // Log memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        console.warn(`🧠 High memory usage detected:`, {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
          component: componentName
        });
      }
    }
  });

  // Record render start time
  renderStartTime.current = performance.now();

  return <>{children}</>;
};

// Hook for monitoring component performance
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;
      
      if (timeSinceLastRender < 16 && renderCount.current > 1) {
        console.warn(`⚡ Rapid re-renders detected in ${componentName}:`, {
          timeSinceLastRender: `${timeSinceLastRender.toFixed(2)}ms`,
          renderCount: renderCount.current
        });
      }
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    logPerformance: (operation: string, duration: number) => {
      if (duration > 100) { // Operations taking more than 100ms
        console.warn(`🕐 Slow operation in ${componentName}:`, {
          operation,
          duration: `${duration.toFixed(2)}ms`
        });
      }
    }
  };
};

// Memory leak detector
export const useMemoryLeakDetector = (componentName: string) => {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const listenersRef = useRef<Array<{ element: EventTarget; event: string; handler: EventListener }>>([] as any);

  const addTimer = (timer: NodeJS.Timeout) => {
    timersRef.current.add(timer);
    return timer;
  };

  const addInterval = (interval: NodeJS.Timeout) => {
    intervalsRef.current.add(interval);
    return interval;
  };

  const addEventListener = (element: EventTarget, event: string, handler: EventListener) => {
    element.addEventListener(event, handler);
    listenersRef.current.push({ element, event, handler });
  };

  useEffect(() => {
    return () => {
      // Cleanup timers
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();

      // Cleanup intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();

      // Cleanup event listeners
      listenersRef.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listenersRef.current.length = 0;

      if (process.env.NODE_ENV === 'development') {
        console.log(`🧹 Cleaned up resources for ${componentName}`);
      }
    };
  }, [componentName]);

  return {
    addTimer,
    addInterval,
    addEventListener
  };
};

// Error recovery hook
export const useErrorRecovery = () => {
  const [error, setError] = React.useState<Error | null>(null);
  const retryCount = useRef(0);

  const clearError = () => {
    setError(null);
    retryCount.current = 0;
  };

  const handleError = (error: Error) => {
    console.error('Component error:', error);
    setError(error);
    retryCount.current += 1;

    // Auto-recovery for certain types of errors
    if (retryCount.current < 3 && error.message.includes('ChunkLoadError')) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const retry = () => {
    if (retryCount.current < 5) {
      clearError();
    } else {
      console.error('Max retry attempts reached');
    }
  };

  return {
    error,
    retryCount: retryCount.current,
    clearError,
    handleError,
    retry
  };
};

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  performanceMonitor,
  apiCache,
  dataCache,
  calculateVirtualScrollItems
} from '../utils/performance';

/**
 * Hook for debouncing values to prevent excessive re-renders
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling function calls to improve performance
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook for memoizing expensive calculations with dependency tracking
 */
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxAge?: number; // Cache duration in milliseconds
    debug?: boolean;
  } = {}
): T {
  const { maxAge = 60000, debug = false } = options;
  const cache = useRef<{
    value: T;
    timestamp: number;
    deps: React.DependencyList;
  } | null>(null);

  return useMemo(() => {
    const now = Date.now();
    
    // Check if cache is valid
    if (
      cache.current &&
      now - cache.current.timestamp < maxAge &&
      cache.current.deps.length === deps.length &&
      cache.current.deps.every((dep, index) => dep === deps[index])
    ) {
      if (debug) {
        console.log('🚀 Using cached value');
      }
      return cache.current.value;
    }

    // Calculate new value
    if (debug) {
      console.log('🔄 Calculating new value');
    }
    const value = factory();
    
    // Update cache
    cache.current = {
      value,
      timestamp: now,
      deps: [...deps],
    };

    return value;
  }, deps);
}

/**
 * Hook for stable callback references to prevent child re-renders
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback);
  
  // Update the ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return a stable callback that calls the current callback
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Hook for lazy initialization of expensive values
 */
export function useLazyValue<T>(factory: () => T): T {
  const [value] = useState(factory);
  return value;
}

/**
 * Hook for intersection observer to implement virtual scrolling
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  const observe = useCallback((element: Element) => {
    if (!observer.current) {
      observer.current = new IntersectionObserver((entries) => {
        setEntries(entries);
      }, options);
    }
    observer.current.observe(element);
  }, [options]);

  const unobserve = useCallback((element: Element) => {
    observer.current?.unobserve(element);
  }, []);

  const disconnect = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
    setEntries([]);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { entries, observe, unobserve, disconnect };
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string, enabled = false) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    console.log(`📊 ${componentName} render #${renderCount.current} (${timeSinceLastRender}ms since last)`);
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    reset: () => {
      renderCount.current = 0;
      lastRenderTime.current = Date.now();
    },
  };
}

/**
 * Hook for batching state updates to reduce re-renders
 */
export function useBatchedState<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchedSetState = useCallback((update: Partial<T> | ((prev: T) => Partial<T>)) => {
    const updateObj = typeof update === 'function' ? update(state) : update;
    pendingUpdates.current.push(updateObj);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        const newState = { ...prevState };
        pendingUpdates.current.forEach(update => {
          Object.assign(newState, update);
        });
        pendingUpdates.current = [];
        return newState;
      });
      timeoutRef.current = null;
    }, 0);
  }, [state]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedSetState] as const;
}

/**
 * Hook for implementing virtual scrolling for large lists
 */
export function useVirtualScrolling<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  };
}

/**
 * Hook for preloading resources to improve perceived performance
 */
export function usePreloader() {
  const preloadedResources = useRef(new Set<string>());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }, []);

  const preloadCSS = useCallback((href: string): Promise<void> => {
    if (preloadedResources.current.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => {
        preloadedResources.current.add(href);
        resolve();
      };
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadCSS,
    isPreloaded: (resource: string) => preloadedResources.current.has(resource),
  };
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();

    if (startTime.current > 0) {
      const renderTime = endTime - startTime.current;
      performanceMonitor.recordMetric({
        name: `${componentName}_render`,
        value: renderTime,
        timestamp: Date.now(),
        type: 'timing',
        tags: { component: componentName, renderCount: renderCount.current.toString() },
      });
    }
  });

  // Record start time before render
  startTime.current = performance.now();

  return {
    renderCount: renderCount.current,
    recordCustomMetric: (name: string, value: number) => {
      performanceMonitor.recordMetric({
        name: `${componentName}_${name}`,
        value,
        timestamp: Date.now(),
        type: 'gauge',
        tags: { component: componentName },
      });
    },
  };
}

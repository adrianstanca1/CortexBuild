// Performance monitoring and optimization utilities

// Performance metrics collection
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  // Start a timer
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  // End a timer and record the metric
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer ${name} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      value: duration,
      timestamp: Date.now(),
      type: 'timing',
      tags,
    });

    return duration;
  }

  // Record a metric
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Get metrics
  getMetrics(filter?: {
    name?: string;
    type?: PerformanceMetric['type'];
    since?: number;
  }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filter) {
      if (filter.name) {
        filtered = filtered.filter(m => m.name === filter.name);
      }
      if (filter.type) {
        filtered = filtered.filter(m => m.type === filter.type);
      }
      if (filter.since) {
        filtered = filtered.filter(m => m.timestamp >= filter.since);
      }
    }

    return filtered;
  }

  // Get performance summary
  getSummary(): Record<string, any> {
    const timingMetrics = this.metrics.filter(m => m.type === 'timing');
    const summary: Record<string, any> = {};

    // Group by name
    const grouped = timingMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate statistics
    Object.entries(grouped).forEach(([name, values]) => {
      const sorted = values.sort((a, b) => a - b);
      summary[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    });

    return summary;
  }

  // Clear metrics
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Caching utilities
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl?: number): void {
    // Remove expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
      
      // If still full, remove oldest entry
      if (this.cache.size >= this.maxSize) {
        const oldestKey = Array.from(this.cache.keys())[0];
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Increment hit counter
    entry.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Remove expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: now - entry.timestamp,
    }));

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalRequests = totalHits + entries.length; // Simplified hit rate calculation

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      entries: entries.sort((a, b) => b.hits - a.hits),
    };
  }
}

// Create cache instances
export const apiCache = new MemoryCache(500, 2 * 60 * 1000); // 2 minutes TTL
export const dataCache = new MemoryCache(1000, 5 * 60 * 1000); // 5 minutes TTL
export const imageCache = new MemoryCache(200, 30 * 60 * 1000); // 30 minutes TTL

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  fallback?: T
): {
  load: () => Promise<T>;
  isLoaded: () => boolean;
  getValue: () => T | undefined;
  reset: () => void;
} {
  let promise: Promise<T> | null = null;
  let value: T | undefined = fallback;
  let isLoaded = false;

  return {
    load: () => {
      if (!promise) {
        promise = loader().then(result => {
          value = result;
          isLoaded = true;
          return result;
        });
      }
      return promise;
    },
    isLoaded: () => isLoaded,
    getValue: () => value,
    reset: () => {
      promise = null;
      value = fallback;
      isLoaded = false;
    },
  };
}

// Image optimization utilities
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string {
  // In a real application, this would integrate with an image optimization service
  const params = new URLSearchParams();
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  
  const separator = url.includes('?') ? '&' : '?';
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
}

// Bundle size analyzer
export function analyzeBundleSize(): Promise<{
  totalSize: number;
  chunks: Array<{ name: string; size: number }>;
}> {
  return new Promise((resolve) => {
    // Simplified bundle analysis - in production, use webpack-bundle-analyzer
    const chunks = [
      { name: 'main', size: 250000 },
      { name: 'vendor', size: 500000 },
      { name: 'components', size: 150000 },
    ];
    
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    
    resolve({ totalSize, chunks });
  });
}

// Performance timing decorator
export function measurePerformance(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startTimer(name);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        performanceMonitor.endTimer(name);
      }
    };
    
    return descriptor;
  };
}

// Resource preloader
export class ResourcePreloader {
  private preloadedResources = new Set<string>();

  preloadImage(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  preloadScript(src: string): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }

  preloadStylesheet(href: string): Promise<void> {
    if (this.preloadedResources.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => {
        this.preloadedResources.add(href);
        resolve();
      };
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }

  isPreloaded(resource: string): boolean {
    return this.preloadedResources.has(resource);
  }

  getPreloadedResources(): string[] {
    return Array.from(this.preloadedResources);
  }
}

export const resourcePreloader = new ResourcePreloader();

// Virtual scrolling utility
export function calculateVirtualScrollItems(
  totalItems: number,
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  overscan: number = 5
): {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  totalHeight: number;
  offsetY: number;
} {
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + overscan * 2);
  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
  };
}

// Performance budget checker
export function checkPerformanceBudget(): {
  passed: boolean;
  metrics: Record<string, { value: number; budget: number; passed: boolean }>;
} {
  const budgets = {
    'First Contentful Paint': 1500, // ms
    'Largest Contentful Paint': 2500, // ms
    'First Input Delay': 100, // ms
    'Cumulative Layout Shift': 0.1, // score
  };

  const metrics: Record<string, { value: number; budget: number; passed: boolean }> = {};
  let allPassed = true;

  // Get actual performance metrics (simplified)
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    const fcp = navigation.loadEventEnd - navigation.navigationStart;
    metrics['First Contentful Paint'] = {
      value: fcp,
      budget: budgets['First Contentful Paint'],
      passed: fcp <= budgets['First Contentful Paint'],
    };
    
    if (!metrics['First Contentful Paint'].passed) {
      allPassed = false;
    }
  }

  return { passed: allPassed, metrics };
}

'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            console.log('Performance Measure:', entry.name, entry.duration);
          }
        }
      });

      observer.observe({ entryTypes: ['measure'] });

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) {
            console.warn('Slow resource:', entry.name, entry.duration);
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });

      return () => {
        observer.disconnect();
        resourceObserver.disconnect();
      };
    }
  }, []);

  return null;
}
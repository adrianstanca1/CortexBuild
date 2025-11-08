// Performance Monitor Component
import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Measure performance metrics
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0; // MB
      
      // Estimate bundle size from resource entries
      const resources = performance.getEntriesByType('resource');
      const bundleSize = resources
        .filter(r => r.name.includes('.js') || r.name.includes('.css'))
        .reduce((total, r) => total + (r as any).transferSize || 0, 0) / 1024; // KB

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        bundleSize: Math.round(bundleSize)
      });
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Show/hide with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-sm font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Metrics</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Load Time: {metrics.loadTime}ms</div>
        <div>Render Time: {metrics.renderTime}ms</div>
        <div>Memory: {metrics.memoryUsage}MB</div>
        <div>Bundle: {metrics.bundleSize}KB</div>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;

// React Debugging Utility for Infinite Re-render Detection
import React, { useEffect, useRef, useCallback, useState } from 'react';

interface RenderInfo {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  props: any;
  state: any;
}

class ReactDebugger {
  private static instance: ReactDebugger;
  private renderCounts = new Map<string, RenderInfo>();
  private maxRenderCount = 50; // Threshold for infinite loop detection
  private renderTimeWindow = 1000; // 1 second window

  static getInstance(): ReactDebugger {
    if (!ReactDebugger.instance) {
      ReactDebugger.instance = new ReactDebugger();
    }
    return ReactDebugger.instance;
  }

  trackRender(componentName: string, props?: any, state?: any): void {
    const now = Date.now();
    const existing = this.renderCounts.get(componentName);

    if (existing) {
      // Reset count if outside time window
      if (now - existing.lastRenderTime > this.renderTimeWindow) {
        existing.renderCount = 1;
      } else {
        existing.renderCount++;
      }
      existing.lastRenderTime = now;
      existing.props = props;
      existing.state = state;

      // Check for infinite loop
      if (existing.renderCount > this.maxRenderCount) {
        this.handleInfiniteLoop(componentName, existing);
      }
    } else {
      this.renderCounts.set(componentName, {
        componentName,
        renderCount: 1,
        lastRenderTime: now,
        props,
        state
      });
    }
  }

  private handleInfiniteLoop(componentName: string, renderInfo: RenderInfo): void {
    console.error(`🚨 INFINITE RE-RENDER DETECTED in ${componentName}!`);
    console.error(`Render count: ${renderInfo.renderCount} in ${this.renderTimeWindow}ms`);
    console.error('Props:', renderInfo.props);
    console.error('State:', renderInfo.state);
    console.error('Stack trace:', new Error().stack);
    
    // Provide debugging suggestions
    console.warn(`
🔧 DEBUGGING SUGGESTIONS for ${componentName}:

1. Check for setState calls in render method
2. Verify useEffect dependency arrays
3. Look for missing useCallback/useMemo
4. Check for props that change on every render
5. Verify conditional logic before setState

Common patterns to avoid:
- setState directly in render
- useEffect without proper dependencies
- Creating objects/functions in render without memoization
- Infinite loops in useEffect callbacks
    `);

    // Reset counter to prevent spam
    renderInfo.renderCount = 0;
  }

  getRenderStats(): Map<string, RenderInfo> {
    return new Map(this.renderCounts);
  }

  clearStats(): void {
    this.renderCounts.clear();
  }
}

// Hook for tracking component renders
export function useRenderTracker(componentName: string, props?: any, state?: any): void {
  const reactDebugger = ReactDebugger.getInstance();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      reactDebugger.trackRender(componentName, props, state);
    }
  });
}

// Hook for detecting useEffect dependency issues
export function useEffectDebugger(
  effect: React.EffectCallback,
  dependencies: React.DependencyList,
  dependencyNames: string[] = []
): void {
  const previousDeps = useRef<React.DependencyList>();
  const changedDeps = useRef<string[]>([]);

  useEffect(() => {
    if (previousDeps.current) {
      const changed = (dependencies as any[]).reduce((acc: string[], dep: any, index: number) => {
        if (dep !== previousDeps.current![index]) {
          const depName = dependencyNames[index] || `dep${index}`;
          acc.push(depName);
        }
        return acc;
      }, []);

      if (changed.length > 0) {
        changedDeps.current = changed;
        console.log('🔄 useEffect triggered by:', changed);
      }
    }
    previousDeps.current = dependencies;

    return effect();
  }, dependencies);
}

// Hook for detecting unnecessary re-renders
export function useWhyDidYouUpdate(name: string, props: Record<string, any>): void {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props }) as string[];
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach(key => {
        if (previousProps.current![key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current![key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('🔄 [why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Hook for safe setState to prevent infinite loops
export function useSafeState<T>(
  initialState: T | (() => T)
): [T, (newState: T | ((prevState: T) => T)) => void] {
  const [state, setState] = useState(initialState);
  const renderCountRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const safeSetState = useCallback((newState: T | ((prevState: T) => T)) => {
    const now = Date.now();
    
    // Reset counter if enough time has passed
    if (now - lastUpdateRef.current > 100) {
      renderCountRef.current = 0;
    }
    
    renderCountRef.current++;
    lastUpdateRef.current = now;

    // Prevent rapid setState calls
    if (renderCountRef.current > 10) {
      console.warn('🚨 Rapid setState calls detected! Possible infinite loop.');
      console.trace();
      return;
    }

    setState(newState);
  }, []);

  return [state, safeSetState];
}

// Component wrapper for automatic render tracking
export function withRenderTracker<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  return function TrackedComponent(props: P) {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    useRenderTracker(name, props);
    return React.createElement(Component, props);
  };
}

// Error boundary for catching infinite loop errors
export class InfiniteLoopErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Check if it's a maximum update depth error
    if (error.message.includes('Maximum update depth exceeded')) {
      console.error('🚨 Infinite re-render loop caught by error boundary!');
      return { hasError: true, error };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error.message.includes('Maximum update depth exceeded')) {
      console.error('Infinite loop error details:', error, errorInfo);
      
      // Provide debugging information
      console.warn(`
🔧 INFINITE LOOP DEBUGGING STEPS:

1. Check the component stack trace above
2. Look for setState calls in render methods
3. Verify useEffect dependency arrays
4. Check for missing useCallback/useMemo
5. Use React DevTools Profiler to identify the problematic component

Common fixes:
- Move setState out of render
- Add proper dependencies to useEffect
- Wrap functions in useCallback
- Wrap objects/arrays in useMemo
      `);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return React.createElement(FallbackComponent, { error: this.state.error! });
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{
      padding: '20px',
      border: '2px solid #ff6b6b',
      borderRadius: '8px',
      backgroundColor: '#ffe0e0',
      color: '#d63031',
      fontFamily: 'monospace'
    }}>
      <h3>🚨 Infinite Re-render Loop Detected</h3>
      <p>The component has been stopped to prevent browser freeze.</p>
      <details>
        <summary>Error Details</summary>
        <pre>{error.message}</pre>
      </details>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#d63031',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reload Page
      </button>
    </div>
  );
}

export default ReactDebugger;

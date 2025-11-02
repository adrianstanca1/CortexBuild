/**
 * Error Boundaries - Centralized Export
 * Task 2.2: Specific Error Boundaries
 * 
 * All specialized error boundaries for different component types
 */

export { default as EditorErrorBoundary } from './EditorErrorBoundary';
export { default as DashboardErrorBoundary } from './DashboardErrorBoundary';
export { default as ChartErrorBoundary } from './ChartErrorBoundary';
export { default as FormErrorBoundary } from './FormErrorBoundary';
export { default as NavigationErrorBoundary } from './NavigationErrorBoundary';

// Re-export main error boundary from parent
export { default as ErrorBoundary, LightErrorBoundary } from '../ErrorBoundary';


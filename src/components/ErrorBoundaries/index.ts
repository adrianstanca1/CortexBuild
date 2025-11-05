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
export { default as LightErrorBoundary } from '../../../components/ErrorBoundaries/LightErrorBoundary';

// Re-export main error boundary from parent (if exists)
// Note: Using components/ErrorBoundary.tsx instead of src/components/ErrorBoundary.tsx
// export { default as ErrorBoundary, LightErrorBoundary } from '../ErrorBoundary';


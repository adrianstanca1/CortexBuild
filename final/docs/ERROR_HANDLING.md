# Enhanced Error Handling System

This document describes the comprehensive error handling system implemented in the application, including error boundaries, retry mechanisms, user-friendly error messages, and error reporting.

## Overview

The enhanced error handling system provides:

- **Hierarchical Error Boundaries**: Different error boundary levels for pages, sections, and components
- **Retry Mechanisms**: Automatic retry with exponential backoff for transient failures
- **User-Friendly Messages**: Context-aware error messages that users can understand
- **Error Reporting**: Centralized error collection and reporting
- **Toast Notifications**: Enhanced toast system for error display
- **API Error Handling**: Comprehensive API error handling with proper HTTP status code handling

## Components

### Error Boundaries

#### 1. PageErrorBoundary
Used for top-level page errors that should show a full-page error state.

```tsx
import { PageErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <PageErrorBoundary>
      <YourPageContent />
    </PageErrorBoundary>
  );
}
```

#### 2. SectionErrorBoundary
Used for section-level errors that should show a contained error state.

```tsx
import { SectionErrorBoundary } from './components/ErrorBoundary';

function Dashboard() {
  return (
    <div>
      <SectionErrorBoundary>
        <ProjectsList />
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <TasksList />
      </SectionErrorBoundary>
    </div>
  );
}
```

#### 3. ComponentErrorBoundary
Used for individual component errors that should show minimal error state.

```tsx
import { ComponentErrorBoundary } from './components/ErrorBoundary';

function Widget() {
  return (
    <ComponentErrorBoundary>
      <ComplexWidget />
    </ComponentErrorBoundary>
  );
}
```

### Error Handling Hook

The `useErrorHandling` hook provides comprehensive error handling capabilities:

```tsx
import { useErrorHandling } from '../hooks/useErrorHandling';

function MyComponent() {
  const errorHandling = useErrorHandling({
    component: 'MyComponent',
    showToast: addToast,
  });

  const loadData = async () => {
    const result = await errorHandling.executeWithErrorHandling(
      () => api.getData(),
      'load_data',
      {
        retryConfig: { maxAttempts: 3 },
        metadata: { userId: user.id },
      }
    );

    if (result) {
      setData(result);
    }
  };

  const loadDataWithAbort = async () => {
    const result = await errorHandling.withAbortSignal(
      (signal) => api.getData({ signal }),
      'load_data_with_abort'
    )();

    if (result) {
      setData(result);
    }
  };

  return (
    <div>
      {errorHandling.hasError && (
        <div>Error: {errorHandling.error?.userMessage}</div>
      )}
      <button onClick={loadData}>Load Data</button>
      <button onClick={loadDataWithAbort}>Load Data (Abortable)</button>
    </div>
  );
}
```

### Toast System

The enhanced toast system provides better error notifications:

```tsx
import { useToast, useToastHelpers } from './components/ui/Toast';

function MyComponent() {
  const { addToast } = useToast();
  const toastHelpers = useToastHelpers();

  const handleError = () => {
    // Basic error toast
    addToast({
      type: 'error',
      title: 'Operation Failed',
      message: 'Something went wrong. Please try again.',
      action: {
        label: 'Retry',
        onClick: () => retryOperation(),
      },
    });

    // Or use helper methods
    toastHelpers.error('Operation failed', 'Error');
    toastHelpers.networkError();
    toastHelpers.sessionExpired();
  };

  return <button onClick={handleError}>Trigger Error</button>;
}
```

### API Error Handling

The API client provides automatic error handling and retry logic:

```tsx
import { apiClient, withApiErrorHandling } from '../services/apiErrorHandler';

// Using the API client directly
const data = await apiClient.get('/api/data');

// Wrapping API calls with error handling
const getDataWithErrorHandling = withApiErrorHandling(
  (id: string) => apiClient.get(`/api/data/${id}`),
  {
    operation: 'fetch_data',
    component: 'DataComponent',
  }
);

const data = await getDataWithErrorHandling('123');
```

## Error Types

### AppError
Enhanced error class with additional context and metadata:

```tsx
import { AppError } from '../utils/errorHandling';

const error = new AppError(
  'Failed to save data',
  {
    operation: 'save_user_data',
    component: 'UserProfile',
    timestamp: new Date().toISOString(),
    metadata: { userId: '123' },
  },
  {
    severity: 'high',
    userMessage: 'Failed to save your profile. Please try again.',
    isRetryable: true,
  }
);
```

### ApiError
Specialized error for API-related failures:

```tsx
import { ApiError } from '../services/apiErrorHandler';

// Automatically created from API responses
const error = ApiError.fromResponse(response, responseData);

// Check error properties
if (error.isRetryable) {
  // Retry the operation
}

const userMessage = error.getUserMessage();
```

## Retry Configuration

Different retry configurations for different operation types:

```tsx
import { DEFAULT_RETRY_CONFIGS, withRetry } from '../utils/errorHandling';

// Use default API retry config
const result = await withRetry(
  () => api.getData(),
  DEFAULT_RETRY_CONFIGS.api
);

// Custom retry config
const result = await withRetry(
  () => uploadFile(file),
  {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffFactor: 2,
    retryCondition: (error) => !error.message.includes('413'), // Don't retry on file too large
  }
);
```

## Global Error Handling

Global error handlers catch unhandled errors:

```tsx
import { setupGlobalErrorHandling } from '../utils/errorHandling';

// Call this once in your app initialization
setupGlobalErrorHandling();
```

## Best Practices

### 1. Use Appropriate Error Boundaries
- Use `PageErrorBoundary` for top-level routes
- Use `SectionErrorBoundary` for major sections that can fail independently
- Use `ComponentErrorBoundary` for complex widgets or third-party components

### 2. Provide Context
Always provide meaningful context when handling errors:

```tsx
const errorHandling = useErrorHandling({
  component: 'ProjectsList',
  onError: (error) => {
    // Custom error handling logic
    analytics.track('error', { error: error.toReport() });
  },
});
```

### 3. Use Appropriate Retry Strategies
- API calls: Use default API retry config
- File uploads: Use upload retry config with fewer attempts
- Background operations: Use background retry config with more attempts

### 4. Show User-Friendly Messages
Always provide clear, actionable error messages:

```tsx
// Good
toastHelpers.error(
  'Failed to save your changes. Please check your internet connection and try again.',
  'Save Failed'
);

// Bad
toastHelpers.error('Error 500: Internal Server Error');
```

### 5. Handle Abort Signals
For operations that can be cancelled:

```tsx
const loadData = errorHandling.withAbortSignal(
  async (signal) => {
    const response = await fetch('/api/data', { signal });
    return response.json();
  },
  'load_data'
);
```

## Error Reporting

Errors are automatically collected and can be sent to error tracking services:

```tsx
import { errorReporter } from '../utils/errorHandling';

// Errors are automatically reported, but you can also manually report
errorReporter.report(appError);
```

## Testing Error Handling

Test error scenarios in your components:

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('error boundary catches errors', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

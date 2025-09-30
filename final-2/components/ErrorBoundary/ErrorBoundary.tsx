import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
/**
 * Enhanced Error Boundary with better error reporting, retry mechanisms,
 * and different fallback strategies based on error level
 */
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  public state: State = {
    hasError: false,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group(`🚨 Error Boundary Caught Error [${this.state.errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Store error info in state
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (if available)
    this.reportError(error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys changed
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      if (resetKeys.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }

    // Reset error state if any props changed (when resetOnPropsChange is true)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
    };

    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error Report:', errorReport);
    }

    // TODO: Send to error tracking service
    // errorTrackingService.captureException(error, errorReport);
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private renderFallback = () => {
    const { fallback, level = 'component' } = this.props;
    const { error, errorId } = this.state;

    if (fallback) {
      return fallback;
    }

    // Different fallback UIs based on error level
    switch (level) {
      case 'page':
        return this.renderPageErrorFallback();
      case 'section':
        return this.renderSectionErrorFallback();
      case 'component':
      default:
        return this.renderComponentErrorFallback();
    }
  };

  private renderPageErrorFallback = () => {
    const { error, errorId } = this.state;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg w-full border-destructive">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-destructive">Page Error</h1>
              <p className="text-muted-foreground mt-2">
                Something went wrong while loading this page. Please try refreshing or contact support if the problem persists.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={this.handleReload}>
                Refresh Page
              </Button>
            </div>
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error Details (ID: {errorId})
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                {error?.stack || error?.message}
              </pre>
            </details>
          </div>
        </Card>
      </div>
    );
  };

  private renderSectionErrorFallback = () => {
    const { error, errorId } = this.state;
    
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-destructive">Section Unavailable</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This section encountered an error and couldn't load properly.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={this.handleRetry} variant="outline">
                Retry
              </Button>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                {error?.message}
              </pre>
            </details>
          </div>
        </div>
      </Card>
    );
  };

  private renderComponentErrorFallback = () => {
    return (
      <div className="p-3 border border-destructive/30 bg-destructive/5 rounded-md">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-destructive font-medium">Component Error</span>
          <Button size="sm" onClick={this.handleRetry} variant="ghost" className="ml-auto h-6 px-2 text-xs">
            Retry
          </Button>
        </div>
      </div>
    );
  };

  public render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
// Convenience wrapper components for different error levels
export const PageErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="page" />
);

export const SectionErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="section" />
);

export const ComponentErrorBoundary: React.FC<Omit<Props, 'level'>> = (props) => (
  <ErrorBoundary {...props} level="component" />
);

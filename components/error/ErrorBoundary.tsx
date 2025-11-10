/**
 * React Error Boundary Component
 * Catches errors in child components and displays error UI
 */

import React, { ReactNode, ReactElement } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Update state
    this.setState({
      error,
      errorInfo
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 text-center mb-6">
                An unexpected error has occurred. Please try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h3 className="font-mono text-sm font-bold text-red-600 mb-2">
                    Error Details (Development Only)
                  </h3>
                  <p className="font-mono text-xs text-gray-700 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 font-mono">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-red-600 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Go Home
                </button>
              </div>
            </div>

            {/* Help text */}
            <p className="text-center text-sm text-gray-600 mt-6">
              If this problem persists, please{' '}
              <a href="mailto:support@cortexbuild.com" className="text-blue-600 hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

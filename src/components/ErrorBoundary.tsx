/**
 * Error Boundary Component
 * Task 2.1: Error Handling & Resilience
 * Copilot + Augment Collaboration
 * 
 * Catches React errors and displays fallback UI
 * Prevents entire app from crashing due to component errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '../../utils/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetKeys?: Array<string | number>;
    componentName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorCount: number;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error
        const errorId = `error-${Date.now()}`;
        logger.error('Error boundary caught:', {
            error: error.message,
            component: this.props.componentName || 'ErrorBoundary',
            componentStack: errorInfo.componentStack,
            errorCount: this.state.errorCount + 1,
            errorId,
            route: window.location.pathname
        });

        // Update state with error details
        this.setState(prevState => ({
            errorInfo,
            errorCount: prevState.errorCount + 1,
        }));

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        // Reset error boundary when resetKeys change
        if (this.state.hasError && this.props.resetKeys) {
            const hasResetKeyChanged = this.props.resetKeys.some(
                (key, index) => key !== prevProps.resetKeys?.[index]
            );

            if (hasResetKeyChanged) {
                this.resetErrorBoundary();
            }
        }
    }

    resetErrorBoundary = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <DefaultErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    errorCount={this.state.errorCount}
                    onReset={this.resetErrorBoundary}
                    onReload={this.handleReload}
                    onGoHome={this.handleGoHome}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Default Error Fallback UI
 */
interface DefaultErrorFallbackProps {
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorCount: number;
    onReset: () => void;
    onReload: () => void;
    onGoHome: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
    error,
    errorInfo,
    errorCount,
    onReset,
    onReload,
    onGoHome,
}) => {
    const isDevelopment = import.meta.env.DEV;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                {/* Error Title */}
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
                    Oops! Something went wrong
                </h1>

                {/* Error Message */}
                <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
                    We're sorry, but something unexpected happened. Don't worry, your data is safe.
                </p>

                {/* Error Details (Development Only) */}
                {isDevelopment && error && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                            <Bug className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                                    Error Details (Development Mode)
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-400 font-mono mb-2">
                                    {error.name}: {error.message}
                                </p>
                                {error.stack && (
                                    <details className="text-xs text-red-700 dark:text-red-500">
                                        <summary className="cursor-pointer hover:text-red-900 dark:hover:text-red-300">
                                            Stack Trace
                                        </summary>
                                        <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-x-auto">
                                            {error.stack}
                                        </pre>
                                    </details>
                                )}
                                {errorInfo?.componentStack && (
                                    <details className="text-xs text-red-700 dark:text-red-500 mt-2">
                                        <summary className="cursor-pointer hover:text-red-900 dark:hover:text-red-300">
                                            Component Stack
                                        </summary>
                                        <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-x-auto">
                                            {errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Count Warning */}
                {errorCount > 1 && (
                    <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
                            ?? This error has occurred {errorCount} times. Consider reloading the page.
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <button
                        onClick={onReload}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Reload Page
                    </button>

                    <button
                        onClick={onGoHome}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </button>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                    If this problem persists, please contact support or try clearing your browser cache.
                </p>
            </div>
        </div>
    );
};

/**
 * Lightweight Error Boundary for specific components
 */
export const LightErrorBoundary: React.FC<{
    children: ReactNode;
    fallback?: ReactNode;
}> = ({ children, fallback }) => {
    return (
        <ErrorBoundary
            fallback={
                fallback || (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-800 dark:text-red-300 text-sm">
                            ?? This component encountered an error. Please try refreshing the page.
                        </p>
                    </div>
                )
            }
        >
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundary;


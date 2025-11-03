/**
 * Navigation Error Boundary
 * Task 2.2: Specific Error Boundaries
 * 
 * Specialized error boundary for navigation components
 * Ensures critical navigation (Home, Logout) always works
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Home, LogOut, RefreshCw, AlertTriangle, Menu } from 'lucide-react';
import { logger } from '../../../utils/logger';

interface NavigationErrorBoundaryProps {
    children: ReactNode;
    componentName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    onGoHome?: () => void;
    onLogout?: () => void;
}

interface NavigationErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class NavigationErrorBoundary extends Component<NavigationErrorBoundaryProps, NavigationErrorBoundaryState> {
    constructor(props: NavigationErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<NavigationErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error('Navigation error caught:', {
            error: error.message,
            component: this.props.componentName || 'NavigationErrorBoundary',
            componentStack: errorInfo.componentStack,
            type: 'navigation_error',
        });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = (): void => {
        if (this.props.onGoHome) {
            this.props.onGoHome();
        } else {
            window.location.href = '/';
        }
    };

    handleLogout = (): void => {
        if (this.props.onLogout) {
            this.props.onLogout();
        } else {
            // Default logout behavior
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 border-r-2 border-gray-300 dark:border-gray-700 p-4 flex flex-col">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                    Navigation Error
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Menu temporarily unavailable
                                </p>
                            </div>
                        </div>

                        {/* Error Details (Development Only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="p-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs">
                                <p className="font-mono text-gray-700 dark:text-gray-300 truncate">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Essential Navigation */}
                    <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                            <Menu className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Essential Menu
                            </span>
                        </div>

                        <button
                            onClick={this.handleGoHome}
                            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Home className="h-5 w-5" />
                            <span className="font-medium">Home</span>
                        </button>

                        <button
                            onClick={this.handleRetry}
                            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            <RefreshCw className="h-5 w-5" />
                            <span className="font-medium">Retry Menu</span>
                        </button>
                    </div>

                    {/* Logout Button (Always at bottom) */}
                    <div className="mt-auto pt-4 border-t border-gray-300 dark:border-gray-700">
                        <button
                            onClick={this.handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-4 p-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            💡 The navigation menu encountered an error. Use the buttons above to navigate.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default NavigationErrorBoundary;


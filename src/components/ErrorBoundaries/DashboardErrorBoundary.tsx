/**
 * Dashboard Error Boundary
 * Task 2.2: Specific Error Boundaries
 * 
 * Specialized error boundary for dashboard components
 * Provides fallback UI with basic stats when dashboard fails
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LayoutDashboard, RefreshCw, AlertTriangle, Home, TrendingUp, Users, FolderKanban } from 'lucide-react';
import { logger } from '../../../utils/logger';

interface DashboardErrorBoundaryProps {
    children: ReactNode;
    componentName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    fallbackStats?: {
        projects?: number;
        tasks?: number;
        users?: number;
        [key: string]: any;
    };
}

interface DashboardErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class DashboardErrorBoundary extends Component<DashboardErrorBoundaryProps, DashboardErrorBoundaryState> {
    constructor(props: DashboardErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<DashboardErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error('Dashboard error caught:', {
            error: error.message,
            component: this.props.componentName || 'DashboardErrorBoundary',
            componentStack: errorInfo.componentStack,
            type: 'dashboard_error',
        });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRefresh = (): void => {
        window.location.reload();
    };

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            const stats = this.props.fallbackStats;

            return (
                <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-700 p-6 mb-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
                                        <AlertTriangle className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            Dashboard Temporarily Unavailable
                                        </h2>
                                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                                            The dashboard encountered an error. Don't worry, your data is safe.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Error Details (Development Only) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                                    <p className="text-sm font-mono text-blue-800 dark:text-blue-200">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3 mt-6">
                                <button
                                    onClick={this.handleRetry}
                                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    <RefreshCw className="h-5 w-5" />
                                    <span>Try Again</span>
                                </button>
                                <button
                                    onClick={this.handleRefresh}
                                    className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    <RefreshCw className="h-5 w-5" />
                                    <span>Refresh Page</span>
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium"
                                >
                                    <Home className="h-5 w-5" />
                                    <span>Go Home</span>
                                </button>
                            </div>
                        </div>

                        {/* Basic Stats (if available) */}
                        {stats && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <LayoutDashboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Quick Stats
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {stats.projects !== undefined && (
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
                                            <div className="flex items-center space-x-3">
                                                <FolderKanban className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                                <div>
                                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                        {stats.projects}
                                                    </p>
                                                    <p className="text-sm text-purple-700 dark:text-purple-300">
                                                        Projects
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {stats.tasks !== undefined && (
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-700">
                                            <div className="flex items-center space-x-3">
                                                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                        {stats.tasks}
                                                    </p>
                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                        Tasks
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {stats.users !== undefined && (
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
                                            <div className="flex items-center space-x-3">
                                                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                        {stats.users}
                                                    </p>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        Users
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                ?? <strong>What happened?</strong> The dashboard encountered an unexpected error.
                                This is usually temporary. Try refreshing the page or clicking "Try Again".
                                If the problem persists, please contact support.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default DashboardErrorBoundary;


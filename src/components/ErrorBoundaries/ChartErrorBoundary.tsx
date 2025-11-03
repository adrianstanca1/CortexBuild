/**
 * Chart Error Boundary
 * Task 2.2: Specific Error Boundaries
 * 
 * Specialized error boundary for chart/visualization components
 * Provides fallback table view when charts fail
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BarChart3, RefreshCw, AlertTriangle, Download, Table } from 'lucide-react';
import { logger } from '../../../utils/logger';

interface ChartErrorBoundaryProps {
    children: ReactNode;
    componentName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    fallbackData?: Array<Record<string, any>>;
    chartTitle?: string;
}

interface ChartErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
    constructor(props: ChartErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ChartErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error('Chart error caught:', {
            error: error.message,
            component: this.props.componentName || 'ChartErrorBoundary',
            componentStack: errorInfo.componentStack,
            type: 'chart_error',
        });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleDownload = (): void => {
        if (!this.props.fallbackData) return;

        const csv = this.convertToCSV(this.props.fallbackData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.props.chartTitle || 'chart-data'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    convertToCSV = (data: Array<Record<string, any>>): string => {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => row[header]).join(','));
        return [headers.join(','), ...rows].join('\n');
    };

    render(): ReactNode {
        if (this.state.hasError) {
            const data = this.props.fallbackData;

            return (
                <div className="w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                                    {this.props.chartTitle || 'Chart'} Unavailable
                                </h3>
                                <p className="text-sm text-purple-700 dark:text-purple-300">
                                    The chart visualization encountered an error. Data is shown in table format below.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {data && data.length > 0 && (
                                <button
                                    onClick={this.handleDownload}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-200 rounded-lg transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download CSV</span>
                                </button>
                            )}
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Retry</span>
                            </button>
                        </div>
                    </div>

                    {/* Error Details (Development Only) */}
                    {import.meta.env.DEV && this.state.error && (
                        <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-800/50 border border-purple-200 dark:border-purple-700 rounded text-xs">
                            <p className="font-mono text-purple-800 dark:text-purple-200">
                                {this.state.error.message}
                            </p>
                        </div>
                    )}

                    {/* Fallback Table */}
                    {data && data.length > 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-200 dark:border-purple-700 overflow-hidden">
                            <div className="flex items-center space-x-2 px-4 py-3 bg-purple-100 dark:bg-purple-800 border-b border-purple-200 dark:border-purple-700">
                                <Table className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                    Data Table View
                                </span>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-sm">
                                    <thead className="bg-purple-50 dark:bg-purple-900/30">
                                        <tr>
                                            {Object.keys(data[0]).map((key) => (
                                                <th
                                                    key={key}
                                                    className="px-4 py-3 text-left font-semibold text-purple-900 dark:text-purple-100 border-b border-purple-200 dark:border-purple-700"
                                                >
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                            >
                                                {Object.values(row).map((value, i) => (
                                                    <td
                                                        key={i}
                                                        className="px-4 py-3 text-gray-900 dark:text-gray-100 border-b border-purple-100 dark:border-purple-800"
                                                    >
                                                        {String(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-purple-200 dark:border-purple-700 p-8 text-center">
                            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-purple-300 dark:text-purple-700" />
                            <p className="text-purple-700 dark:text-purple-300">
                                No data available to display
                            </p>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-800/50 border border-purple-200 dark:border-purple-700 rounded">
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                            ?? <strong>Tip:</strong> The chart visualization failed, but your data is safe.
                            You can view it in table format above or download it as CSV.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ChartErrorBoundary;


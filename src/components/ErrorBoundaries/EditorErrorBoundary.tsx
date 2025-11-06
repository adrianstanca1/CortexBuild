/**
 * Editor Error Boundary
 * Task 2.2: Specific Error Boundaries
 * 
 * Specialized error boundary for code editor components (Monaco Editor, etc.)
 * Provides fallback textarea when editor fails
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Code, RefreshCw, AlertTriangle, Copy, Check } from 'lucide-react';
import { logger } from '../../../utils/logger';

interface EditorErrorBoundaryProps {
    children: ReactNode;
    componentName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    initialValue?: string;
    language?: string;
}

interface EditorErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    fallbackValue: string;
    copied: boolean;
}

export class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
    constructor(props: EditorErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            fallbackValue: props.initialValue || '',
            copied: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<EditorErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error
        const errorId = `error-${Date.now()}`;
        logger.error('Editor error caught:', {
            error: error.message,
            component: this.props.componentName || 'EditorErrorBoundary',
            componentStack: errorInfo.componentStack,
            type: 'editor_error',
            errorId,
            route: window.location.pathname,
            language: this.props.language
        });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleCopy = (): void => {
        navigator.clipboard.writeText(this.state.fallbackValue);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
    };

    handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({ fallbackValue: e.target.value });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-6 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                                    Code Editor Unavailable
                                </h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    The code editor encountered an error. You can still edit code using the fallback editor below.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Retry</span>
                        </button>
                    </div>

                    {/* Error Details (Development Only) */}
                    {import.meta.env.DEV && this.state.error && (
                        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800/50 border border-yellow-200 dark:border-yellow-700 rounded text-xs">
                            <p className="font-mono text-yellow-800 dark:text-yellow-200">
                                {this.state.error.message}
                            </p>
                        </div>
                    )}

                    {/* Fallback Textarea */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <Code className="h-4 w-4" />
                                <span>Fallback Editor ({this.props.language || 'text'})</span>
                            </div>
                            <button
                                onClick={this.handleCopy}
                                className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 text-yellow-700 dark:text-yellow-200 rounded transition-colors text-sm"
                            >
                                {this.state.copied ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            value={this.state.fallbackValue}
                            onChange={this.handleValueChange}
                            className="flex-1 w-full p-4 bg-white dark:bg-gray-900 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                            placeholder="You can paste and edit code here..."
                            spellCheck={false}
                        />
                    </div>

                    {/* Help Text */}
                    <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-800/50 border border-yellow-200 dark:border-yellow-700 rounded">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            💡 <strong>Tip:</strong> Try refreshing the page or clicking "Retry" to restore the advanced editor.
                            Your code is safe in this fallback editor.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default EditorErrorBoundary;


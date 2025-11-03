/**
 * Form Error Boundary
 * Task 2.2: Specific Error Boundaries
 * 
 * Specialized error boundary for form components
 * Preserves form data and provides recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FileText, RefreshCw, AlertTriangle, Save, Copy, Check } from 'lucide-react';
import { logger } from '../../../utils/logger';

interface FormErrorBoundaryProps {
    children: ReactNode;
    componentName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    formData?: Record<string, any>;
    onSaveDraft?: (data: Record<string, any>) => void;
}

interface FormErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    savedData: boolean;
    copied: boolean;
}

export class FormErrorBoundary extends Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
    constructor(props: FormErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            savedData: false,
            copied: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<FormErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        logger.error('Form error caught:', {
            error: error.message,
            component: this.props.componentName || 'FormErrorBoundary',
            componentStack: errorInfo.componentStack,
            type: 'form_error',
            formData: this.props.formData,
        });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Auto-save form data to localStorage
        if (this.props.formData) {
            try {
                const key = `form_draft_${this.props.componentName || 'unknown'}_${Date.now()}`;
                localStorage.setItem(key, JSON.stringify(this.props.formData));
                this.setState({ savedData: true });
            } catch (e) {
                console.error('Failed to save form data:', e);
            }
        }
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, savedData: false });
    };

    handleSaveDraft = (): void => {
        if (this.props.formData && this.props.onSaveDraft) {
            this.props.onSaveDraft(this.props.formData);
            this.setState({ savedData: true });
        }
    };

    handleCopyData = (): void => {
        if (this.props.formData) {
            const dataString = JSON.stringify(this.props.formData, null, 2);
            navigator.clipboard.writeText(dataString);
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        }
    };

    render(): ReactNode {
        if (this.state.hasError) {
            const formData = this.props.formData;

            return (
                <div className="w-full bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                                    Form Encountered an Error
                                </h3>
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                    {this.state.savedData
                                        ? '✅ Your form data has been saved automatically.'
                                        : 'The form encountered an error, but your data may be preserved.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Retry</span>
                        </button>
                    </div>

                    {/* Error Details (Development Only) */}
                    {import.meta.env.DEV && this.state.error && (
                        <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-800/50 border border-orange-200 dark:border-orange-700 rounded text-xs">
                            <p className="font-mono text-orange-800 dark:text-orange-200">
                                {this.state.error.message}
                            </p>
                        </div>
                    )}

                    {/* Form Data Preview */}
                    {formData && Object.keys(formData).length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-orange-200 dark:border-orange-700 overflow-hidden mb-4">
                            <div className="flex items-center justify-between px-4 py-3 bg-orange-100 dark:bg-orange-800 border-b border-orange-200 dark:border-orange-700">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                        Your Form Data
                                    </span>
                                </div>
                                <button
                                    onClick={this.handleCopyData}
                                    className="flex items-center space-x-1 px-3 py-1 bg-orange-200 dark:bg-orange-700 hover:bg-orange-300 dark:hover:bg-orange-600 text-orange-800 dark:text-orange-200 rounded transition-colors text-sm"
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
                            <div className="p-4 max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <tbody>
                                        {Object.entries(formData).map(([key, value]) => (
                                            <tr
                                                key={key}
                                                className="border-b border-orange-100 dark:border-orange-800 last:border-0"
                                            >
                                                <td className="py-2 pr-4 font-medium text-orange-900 dark:text-orange-100">
                                                    {key}:
                                                </td>
                                                <td className="py-2 text-gray-700 dark:text-gray-300">
                                                    {typeof value === 'object'
                                                        ? JSON.stringify(value)
                                                        : String(value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        {this.props.onSaveDraft && formData && (
                            <button
                                onClick={this.handleSaveDraft}
                                disabled={this.state.savedData}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                    this.state.savedData
                                        ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 cursor-not-allowed'
                                        : 'bg-orange-100 dark:bg-orange-800 hover:bg-orange-200 dark:hover:bg-orange-700 text-orange-700 dark:text-orange-200'
                                }`}
                            >
                                <Save className="h-4 w-4" />
                                <span>{this.state.savedData ? 'Draft Saved' : 'Save Draft'}</span>
                            </button>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-800/50 border border-orange-200 dark:border-orange-700 rounded">
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                            💡 <strong>What to do:</strong> Your form data is shown above and has been saved.
                            Click "Retry" to try submitting again, or copy your data for safekeeping.
                            {this.state.savedData && ' A draft has been saved to your browser storage.'}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default FormErrorBoundary;


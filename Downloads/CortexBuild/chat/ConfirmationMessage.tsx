/**
 * Confirmation Message Component
 * Displays pending actions that require user confirmation
 */

import React from 'react';

export interface ConfirmationMessageProps {
    actionId: string;
    tool: string;
    message: string;
    warning?: string;
    confirmationToken: string;
    onConfirm: (actionId: string, token: string, confirmed: boolean) => void;
}

export const ConfirmationMessage: React.FC<ConfirmationMessageProps> = ({
    actionId,
    tool,
    message,
    warning,
    confirmationToken,
    onConfirm,
}) => {
    return (
        <div className="flex justify-center mb-4">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 max-w-[80%]">
                {/* Warning Icon & Title */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">⚠️</span>
                    <h4 className="font-semibold text-yellow-900">
                        Confirmare Necesară
                    </h4>
                </div>

                {/* Action Details */}
                <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">
                        <strong>Acțiune:</strong> {tool.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-700">
                        {message}
                    </p>
                </div>

                {/* Warning Message */}
                {warning && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-3">
                        <p className="text-sm text-yellow-900">{warning}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={() => onConfirm(actionId, confirmationToken, false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                        ❌ Anulează
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(actionId, confirmationToken, true)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                    >
                        ✅ Confirmă
                    </button>
                </div>

                {/* Token Info (for debugging) */}
                <div className="mt-2 text-xs text-gray-400 text-center">
                    ID: {actionId.substring(0, 8)}...
                </div>
            </div>
        </div>
    );
};


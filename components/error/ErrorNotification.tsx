/**
 * Error Notification Component
 * Displays user-friendly error messages with actions
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

export interface ErrorNotificationProps {
  message: string;
  code?: string;
  details?: Record<string, any>;
  onClose?: () => void;
  onRetry?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  showDetails?: boolean;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  code,
  details,
  onClose,
  onRetry,
  autoClose = true,
  autoCloseDuration = 5000,
  showDetails = process.env.NODE_ENV === 'development'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDuration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md z-50 animate-slide-in-right">
      <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{message}</p>
            {code && (
              <p className="text-xs text-gray-500 mt-1">Error code: {code}</p>
            )}
            {showDetails && details && Object.keys(details).length > 0 && (
              <details className="text-xs text-gray-600 mt-2">
                <summary className="cursor-pointer font-mono text-gray-700">
                  Details
                </summary>
                <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </details>
            )}
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Close error notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;

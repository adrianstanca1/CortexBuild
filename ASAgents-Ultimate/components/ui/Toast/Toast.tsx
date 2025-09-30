import React, { useEffect, useState } from 'react';
import { Button } from '../Button';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
}

export function Toast({ id, type = 'info', title, message, action, onDismiss }: Readonly<ToastProps>) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 200); // Wait for exit animation
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleDismiss();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          title: 'text-green-800 dark:text-green-200',
          message: 'text-green-700 dark:text-green-300',
          button: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300',
          button: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-200',
          message: 'text-yellow-700 dark:text-yellow-300',
          button: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300',
          button: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
        };
    }
  };

  const colors = getColorClasses();
  let progressBarColor = 'bg-blue-500';
  if (type === 'success') {
    progressBarColor = 'bg-green-500';
  } else if (type === 'warning') {
    progressBarColor = 'bg-yellow-500';
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-labelledby={title ? `toast-title-${id}` : undefined}
      aria-describedby={`toast-message-${id}`}
      className={`
        relative w-full max-w-sm p-4 border rounded-lg shadow-lg backdrop-blur-sm
        transition-all duration-200 ease-out transform
        ${colors.container}
        ${isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
        }
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4
              id={`toast-title-${id}`}
              className={`text-sm font-semibold ${colors.title}`}
            >
              {title}
            </h4>
          )}
          <p
            id={`toast-message-${id}`}
            className={`text-sm ${title ? 'mt-1' : ''} ${colors.message}`}
          >
            {message}
          </p>

          {/* Action button */}
          {action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={action.onClick}
                className={`h-8 px-3 text-xs font-medium ${colors.button}`}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors
            ${colors.button}
            hover:bg-black/5 dark:hover:bg-white/5
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current
          `}
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {type !== 'error' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear toast-progress-bar ${progressBarColor}`}
            data-animation={isVisible && !isExiting ? 'progress' : 'none'}
          />
        </div>
      )}


    </div>
  );
}

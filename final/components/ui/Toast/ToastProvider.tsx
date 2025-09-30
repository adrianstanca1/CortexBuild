import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { Toast, ToastProps } from './Toast';

export interface ToastOptions {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
interface ToastContextType {
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  updateToast: (id: string, updates: Partial<ToastOptions>) => void;
const ToastContext = createContext<ToastContextType | undefined>(undefined);

}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
interface ToastState extends ToastOptions {
  id: string;
  createdAt: number;
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    // Clear timeout if it exists
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = options.id || `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.duration ?? (options.type === 'error' ? 8000 : 5000);
    
    const toast: ToastState = {
      ...options,
      id,
      createdAt: Date.now(),
    };

    setToasts(prev => {
      // Remove existing toast with same ID if it exists
      const filtered = prev.filter(t => t.id !== id);
      
      // Add new toast at the beginning
      return [toast, ...filtered];
    });

    // Set auto-dismiss timeout unless persistent
    if (!options.persistent && duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      timeoutRefs.current.set(id, timeoutId);
    }

    return id;
  }, [removeToast]);

  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<ToastOptions>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // Convenience methods for common toast types
  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    clearAllToasts,
    updateToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
interface ToastContainerProps {
  toasts: ToastState[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          action={toast.action}
          onDismiss={() => {
            toast.onDismiss?.();
            onDismiss(toast.id);
          }}
        />
      ))}
    </div>
  );
// Convenience hook for common toast patterns
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    success: useCallback((message: string, title?: string) => 
      addToast({ type: 'success', message, title }), [addToast]),
    
    error: useCallback((message: string, title?: string, options?: { persistent?: boolean; action?: ToastOptions['action'] }) => 
      addToast({ 
        type: 'error', 
        message, 
        title: title || 'Error',
        persistent: options?.persistent,
        action: options?.action,
      }), [addToast]),
    
    warning: useCallback((message: string, title?: string) => 
      addToast({ type: 'warning', message, title }), [addToast]),
    
    info: useCallback((message: string, title?: string) => 
      addToast({ type: 'info', message, title }), [addToast]),

    // Error-specific helpers
    networkError: useCallback(() => 
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Please check your internet connection and try again.',
        persistent: true,
        action: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
      }), [addToast]),

    sessionExpired: useCallback(() => 
      addToast({
        type: 'warning',
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        persistent: true,
        action: {
          label: 'Log In',
          onClick: () => {
            // Clear local storage and redirect to login
            localStorage.clear();
            window.location.href = '/login';
          },
        },
      }), [addToast]),

    permissionDenied: useCallback(() => 
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'You don\'t have permission to perform this action.',
        duration: 6000,
      }), [addToast]),

    operationSuccess: useCallback((operation: string) => 
      addToast({
        type: 'success',
        message: `${operation} completed successfully.`,
        duration: 3000,
      }), [addToast]),

    operationFailed: useCallback((operation: string, canRetry = true) => 
      addToast({
        type: 'error',
        title: 'Operation Failed',
        message: `Failed to ${operation.toLowerCase()}. ${canRetry ? 'Please try again.' : ''}`,
        duration: canRetry ? 6000 : 8000,
      }), [addToast]),
  };
}

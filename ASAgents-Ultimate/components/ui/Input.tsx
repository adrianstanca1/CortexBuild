import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, type = 'text', ...props }, ref) => {
    const baseClasses =
      'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const errorClasses = error ? 'border-destructive' : 'border-input';
    const combined = `${baseClasses} ${errorClasses} ${className}`.trim();

    return <input ref={ref} type={type} className={combined} {...props} />;
  }
);

Input.displayName = 'Input';

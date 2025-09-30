import React from 'react';

type AlertVariant = 'default' | 'success' | 'warning' | 'destructive';

const variantStyles: Record<AlertVariant, string> = {
    default:
        'bg-background text-foreground border-border',
    success:
        'border-green-500/60 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20',
    warning:
        'border-yellow-500/60 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20',
    destructive:
        'border-red-500/60 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30'
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
}

export const Alert: React.FC<AlertProps> = ({
    className = '',
    variant = 'default',
    ...props
}) => {
    const baseClasses = 'relative w-full rounded-lg border p-4';
    const combined = `${baseClasses} ${variantStyles[variant]} ${className}`.trim();

    return <div role="alert" className={combined} {...props} />;
};

export interface AlertTitleProps
    extends React.HTMLAttributes<HTMLHeadingElement> { }

export const AlertTitle: React.FC<AlertTitleProps> = ({
    className = '',
    ...props
}) => {
    const baseClasses = 'mb-1 font-medium leading-none tracking-tight';
    const combined = `${baseClasses} ${className}`.trim();

    return <h5 className={combined} {...props} />;
};

export interface AlertDescriptionProps
    extends React.HTMLAttributes<HTMLParagraphElement> { }

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
    className = '',
    ...props
}) => {
    const baseClasses = 'text-sm [&_p]:leading-relaxed';
    const combined = `${baseClasses} ${className}`.trim();

    return <div className={combined} {...props} />;
};

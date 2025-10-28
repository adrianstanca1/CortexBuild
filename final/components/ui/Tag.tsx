import React from 'react';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  color?: 'green' | 'blue' | 'red' | 'gray' | 'yellow';
  statusIndicator?: 'green' | 'blue' | 'red' | 'gray' | 'yellow';
}

export const Tag: React.FC<TagProps> = ({ label, color = 'gray', className, statusIndicator, ...props }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        gray: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };

    const indicatorColorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        gray: 'bg-slate-400',
    };
    
    const finalClassName = [
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full',
        colorClasses[color],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span
            className={finalClassName}
            {...props}
        >
            {statusIndicator && (
                <span className={`w-1.5 h-1.5 rounded-full ${indicatorColorClasses[statusIndicator]}`}></span>
            )}
            {label}
        </span>
    );
};
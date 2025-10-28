import React from 'react';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  color?: 'green' | 'blue' | 'red' | 'gray' | 'yellow';
  statusIndicator?: 'green' | 'blue' | 'red' | 'gray' | 'yellow';
}

export const Tag: React.FC<TagProps> = ({ label, color = 'gray', className, statusIndicator, ...props }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        gray: 'bg-slate-100 text-slate-800',
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
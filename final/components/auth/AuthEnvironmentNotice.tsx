import React from 'react';

interface AuthEnvironmentNoticeProps {
    align?: 'left' | 'center';
    className?: string;
}

export const AuthEnvironmentNotice: React.FC<AuthEnvironmentNoticeProps> = ({ align = 'center', className = '' }) => {
    // Simplified version to avoid infinite loop - just show a static message for now
    const message = 'Operating in secure offline demo mode. Accounts are stored locally in your browser.';
    const alignmentClass = align === 'left' ? 'text-left' : 'text-center';
    return (
        <p className={`text-xs text-muted-foreground ${alignmentClass} ${className}`.trim()}>{message}</p>
    );
};


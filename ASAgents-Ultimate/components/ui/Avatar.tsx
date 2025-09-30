
import React from 'react';

interface AvatarProps {
    name: string;
    imageUrl?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, className = '', size = 'md' }) => {
    // Size classes mapping
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg'
    };
    
    const sizeClass = typeof size === 'string' && size in sizeClasses 
        ? sizeClasses[size as keyof typeof sizeClasses]
        : size;
    
    if (imageUrl) {
        return <img src={imageUrl} alt={name} title={name} className={`rounded-full object-cover ${sizeClass} ${className}`} />;
    }
    const getInitials = (name: string): string => {
        if (!name) return '';
        const parts = name.split(' ').filter(p => p.length > 0);
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return '';
    };
    return (
        <div title={name} className={`rounded-full bg-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0 ${sizeClass} ${className}`}>
            {getInitials(name)}
        </div>
    );
};

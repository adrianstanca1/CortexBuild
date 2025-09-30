
import React from 'react';

interface AvatarProps {
    name: string;
    imageUrl?: string;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, className = '' }) => {
    if (imageUrl) {
        return <img src={imageUrl} alt={name} title={name} className={`rounded-full object-cover ${className}`} />;
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
        <div title={name} className={`rounded-full bg-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
            {getInitials(name)}
        </div>
    );
};

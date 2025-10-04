import React, { useState, useEffect, useCallback } from 'react';

export const useCommandPalette = () => {
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Use `metaKey` for Command on Mac and `ctrlKey` for Ctrl on Windows/Linux.
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
        }
        
        // Allow closing with Escape key
        if (event.key === 'Escape') {
            setIsCommandPaletteOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return { isCommandPaletteOpen, setIsCommandPaletteOpen };
};
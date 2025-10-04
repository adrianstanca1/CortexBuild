import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onSearchClick: () => void;
  onCommandPaletteClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onSearchClick, onCommandPaletteClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

  return (
    <header className="bg-muted p-4 flex-shrink-0 z-10 sticky top-0 border-b border-border">
        <div className="flex items-center justify-end gap-2 sm:gap-4">
            <button
                onClick={onCommandPaletteClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground bg-card hover:bg-border/80 hover:text-foreground transition-colors border border-border"
                title="Open command palette (⌘K)"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm hidden md:block">Search...</span>
                <kbd className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-sans font-semibold bg-background text-muted-foreground border border-border">⌘K</kbd>
            </button>
             <button
                onClick={() => { /* Placeholder for notifications */}}
                className="p-2 rounded-full text-muted-foreground bg-card hover:bg-border/80 hover:text-foreground transition-colors border border-border"
                title="Notifications"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </button>
             <div className="relative" ref={dropdownRef}>
                <button 
                    className="flex items-center gap-3 text-left"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <div className="text-right hidden sm:block">
                        <p className="font-semibold text-sm text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                    <Avatar name={user.name} className="w-10 h-10 text-sm" />
                </button>
                {isDropdownOpen && (
                    <div 
                        className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-20 border border-border"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                    >
                        <button
                            onClick={() => {
                                onLogout();
                                setIsDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            role="menuitem"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </header>
  );
};
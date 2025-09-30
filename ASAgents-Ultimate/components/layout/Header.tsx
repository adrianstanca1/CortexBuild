import React, { useState } from 'react';
import { User, Notification, Company, CompanyAccessSummary } from '../../types';
import { Avatar } from '../ui/Avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { TenantSwitcher } from './TenantSwitcher';

interface HeaderProps {
    user: User;
    company: Company | null;
    companies: CompanyAccessSummary[];
    activeCompanyId: string | null;
    onLogout: () => void;
    onSearchClick: () => void;
    onCommandPaletteClick: () => void;
    unreadNotificationCount: number;
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onMarkAllNotificationsAsRead: () => void;
    onSwitchCompany: (companyId: string) => Promise<void>;
    onRefreshTenants: () => Promise<void>;
    addToast: (message: string, type: 'success' | 'error') => void;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    company,
    companies,
    activeCompanyId,
    onLogout,
    onSearchClick,
    onCommandPaletteClick,
    unreadNotificationCount,
    notifications,
    onNotificationClick,
    onMarkAllNotificationsAsRead,
    onSwitchCompany,
    onRefreshTenants,
    addToast,
}) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
    const userName = `${user.firstName} ${user.lastName}`;
    const showTenantSwitcher = !!company || companies.length > 0;

    return (
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-lg">
            <div className="flex flex-1 items-center gap-4">
                {showTenantSwitcher && (
                    <TenantSwitcher
                        company={company}
                        companies={companies}
                        activeCompanyId={activeCompanyId}
                        onSwitch={onSwitchCompany}
                        onRefresh={onRefreshTenants}
                    />
                )}
            </div>
            <button
                onClick={onSearchClick}
                className="p-2 rounded-full hover:bg-accent text-muted-foreground"
                aria-label="Open search"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button
                onClick={onCommandPaletteClick}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hidden md:flex items-center gap-2 border text-xs"
                aria-label="Open command palette"
            >
                <kbd>⌘</kbd><kbd>K</kbd>
            </button>
            <div className="relative">
                <button onClick={() => setIsNotificationMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-accent text-muted-foreground relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadNotificationCount > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background"></span>}
                </button>
                {isNotificationMenuOpen && (
                    <NotificationDropdown
                        user={user}
                        notifications={notifications}
                        onClose={() => setIsNotificationMenuOpen(false)}
                        addToast={addToast}
                        onNotificationClick={onNotificationClick}
                        onMarkAllAsRead={onMarkAllNotificationsAsRead}
                    />
                )}
            </div>
            <div className="relative">
                <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center gap-2">
                    <Avatar name={userName} imageUrl={user.avatar} className="w-9 h-9" />
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-foreground">{userName}</p>
                        <p className="text-xs text-muted-foreground">{user.role.replace(/_/g, ' ')}</p>
                    </div>
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border border-border z-10 py-1">
                        <button type="button" className="block w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-accent">My Profile</button>
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10">Logout</button>
                    </div>
                )}
            </div>
        </header>
    );
};
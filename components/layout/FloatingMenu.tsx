import React, { useState, useRef, useEffect } from 'react';
import { Screen, User } from '../../types.ts';
import { MENU_ITEMS, MenuItem } from '../../navigation.ts';
import { usePermissions } from '../../hooks/usePermissions.ts';
import { ChevronDownIcon } from '../Icons.tsx';

interface FloatingMenuProps {
    currentUser: User;
    navigateToModule: (screen: Screen, params?: any) => void;
    openProjectSelector: (title: string, onSelect: (projectId: string) => void) => void;
    onDeepLink: (projectId: string | null, screen: Screen, params: any) => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ currentUser, navigateToModule, openProjectSelector, onDeepLink }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { can } = usePermissions(currentUser);

    const isVisible = (item: MenuItem): boolean => {
        // If it's a parent menu with children, show it if at least one child is visible.
        if (item.children) {
            return item.children.some(isVisible);
        }
        // If it's a direct link, check its permission.
        if (item.permission) {
            return can(item.permission.action, item.permission.subject);
        }
        // If no permission is defined, assume it's a general-access item (like AI Tools).
        return true;
    };

    const visibleMenuItems = MENU_ITEMS.filter(isVisible);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuToggle = (label: string) => {
        setOpenMenu(prev => (prev === label ? null : label));
    };

    const handleNavigation = (item: MenuItem) => {
        if (!item.screen) return;

        setOpenMenu(null); // Close menu on navigation

        if (item.requiresProjectContext) {
            openProjectSelector(`Select a project for ${item.label}`, (projectId) => {
                onDeepLink(projectId, item.screen!, {});
            });
        } else {
            navigateToModule(item.screen);
        }
    };

    return (
        <nav ref={menuRef} className="sticky top-0 bg-white/80 backdrop-blur-lg shadow-sm z-20 border-b border-gray-200">
            <div className="container mx-auto px-6">
                <div className="flex items-center h-14">
                    {visibleMenuItems.map(item => (
                        <div key={item.label} className="relative">
                            {item.children ? (
                                <button
                                    onClick={() => handleMenuToggle(item.label)}
                                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    {item.label}
                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenu === item.label ? 'rotate-180' : ''}`} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNavigation(item)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    {item.label}
                                </button>
                            )}
                            {item.children && openMenu === item.label && (
                                <div className="absolute left-0 mt-2 w-56 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                                    {item.children.filter(isVisible).map(child => (
                                        <button
                                            key={child.label}
                                            onClick={() => handleNavigation(child)}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default FloatingMenu;
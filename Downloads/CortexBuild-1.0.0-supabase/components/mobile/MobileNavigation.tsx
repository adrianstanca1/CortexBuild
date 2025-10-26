// components/mobile/MobileNavigation.tsx
import React, { useState, useEffect } from 'react';
import {
    Menu,
    X,
    Home,
    FolderOpen,
    Users,
    Settings,
    Bell,
    Search,
    Brain,
    Zap,
    Target,
    BarChart3,
    MessageSquare,
    FileText,
    Calendar,
    Camera,
    MapPin,
    ChevronDown,
    ChevronRight,
    Wifi,
    WifiOff
} from 'lucide-react';

interface MobileNavigationProps {
    currentUser: any;
    currentScreen: string;
    onScreenChange: (screen: string) => void;
    onLogout: () => void;
    className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
    currentUser,
    currentScreen,
    onScreenChange,
    onLogout,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const navigationSections = [
        {
            id: 'main',
            title: 'Main',
            icon: Home,
            items: [
                { id: 'global-dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'notifications', label: 'Notifications', icon: Bell },
            ]
        },
        {
            id: 'ai-features',
            title: 'AI Features',
            icon: Brain,
            items: [
                { id: 'ai-recommendations', label: 'AI Recommendations', icon: Brain },
                { id: 'ai-workflow', label: 'Workflow Automation', icon: Zap },
                { id: 'smart-task-assignment', label: 'Smart Assignment', icon: Target },
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced',
            icon: Settings,
            items: [
                { id: 'advanced-search', label: 'Advanced Search', icon: Search },
                { id: 'bulk-operations', label: 'Bulk Operations', icon: FileText },
                { id: 'collaboration-hub', label: 'Collaboration', icon: MessageSquare },
                { id: 'advanced-analytics', label: 'Analytics', icon: BarChart3 },
            ]
        },
        {
            id: 'mobile',
            title: 'Mobile Tools',
            icon: Camera,
            items: [
                { id: 'photo-capture', label: 'Photo Capture', icon: Camera },
                { id: 'location-tracking', label: 'Location Tracking', icon: MapPin },
                { id: 'calendar-sync', label: 'Calendar Sync', icon: Calendar },
            ]
        }
    ];

    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    const handleItemClick = (screenId: string) => {
        onScreenChange(screenId);
        setIsOpen(false);
    };

    const getScreenIcon = (screenId: string) => {
        const allItems = navigationSections.flatMap(section => section.items);
        const item = allItems.find(item => item.id === screenId);
        return item?.icon || Home;
    };

    const getScreenLabel = (screenId: string) => {
        const allItems = navigationSections.flatMap(section => section.items);
        const item = allItems.find(item => item.id === screenId);
        return item?.label || 'Unknown';
    };

    return (
        <>
            {/* Mobile Header */}
            <div className={`mobile-navigation-header ${className}`}>
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">
                                {getScreenLabel(currentScreen)}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs text-gray-500">
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isOnline ? (
                            <Wifi className="w-5 h-5 text-green-600" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-600" />
                        )}
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {currentUser?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">CB</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">CortexBuild</h2>
                                        <p className="text-sm text-gray-500">Construction Management</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-gray-600 font-medium">
                                            {currentUser?.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {currentUser?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {currentUser?.email || 'user@example.com'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Sections */}
                            <div className="flex-1 overflow-y-auto">
                                <nav className="p-4 space-y-2">
                                    {navigationSections.map((section) => {
                                        const IconComponent = section.icon;
                                        const isExpanded = expandedSections.has(section.id);

                                        return (
                                            <div key={section.id}>
                                                <button
                                                    onClick={() => toggleSection(section.id)}
                                                    className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <IconComponent className="w-5 h-5" />
                                                        <span className="font-medium">{section.title}</span>
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>

                                                {isExpanded && (
                                                    <div className="ml-8 space-y-1">
                                                        {section.items.map((item) => {
                                                            const ItemIcon = item.icon;
                                                            const isActive = currentScreen === item.id;

                                                            return (
                                                                <button
                                                                    key={item.id}
                                                                    onClick={() => handleItemClick(item.id)}
                                                                    className={`w-full flex items-center gap-3 p-2 text-left rounded-lg transition-colors ${isActive
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'text-gray-600 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    <ItemIcon className="w-4 h-4" />
                                                                    <span className="text-sm">{item.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            onScreenChange('settings');
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Settings className="w-5 h-5" />
                                        <span className="font-medium">Settings</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Version 1.0.0</span>
                                        <div className="flex items-center gap-1">
                                            {isOnline ? (
                                                <>
                                                    <Wifi className="w-3 h-3 text-green-600" />
                                                    <span>Online</span>
                                                </>
                                            ) : (
                                                <>
                                                    <WifiOff className="w-3 h-3 text-red-600" />
                                                    <span>Offline</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

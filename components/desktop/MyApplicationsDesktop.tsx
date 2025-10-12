/**
 * My Applications Desktop - Full Desktop Environment
 * Complete window management system with taskbar, multi-window support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Maximize2, Minimize2, X, Minus, Square, Monitor,
    Grid3x3, List, Search, Package, Building2, User,
    Play, Pause, RefreshCw, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface App {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    version: string;
    installation_type?: 'individual' | 'company';
    installed_at?: string;
    code?: string;
}

interface RunningApp {
    id: string;
    app: App;
    windowId: string;
    isMinimized: boolean;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
}

interface MyApplicationsDesktopProps {
    isDarkMode?: boolean;
    currentUser?: any;
}

const MyApplicationsDesktop: React.FC<MyApplicationsDesktopProps> = ({
    isDarkMode = true,
    currentUser
}) => {
    const [installedApps, setInstalledApps] = useState<App[]>([]);
    const [runningApps, setRunningApps] = useState<RunningApp[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [maxZIndex, setMaxZIndex] = useState(100);
    const [draggingWindow, setDraggingWindow] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-100';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

    useEffect(() => {
        fetchInstalledApps();
    }, []);

    const fetchInstalledApps = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to view your apps');
                return;
            }

            const response = await fetch('http://localhost:3001/api/global-marketplace/my-installed-apps', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setInstalledApps(data.apps);
            } else {
                toast.error('Failed to load apps');
            }
        } catch (error) {
            console.error('Error fetching installed apps:', error);
            toast.error('Failed to load apps');
        } finally {
            setLoading(false);
        }
    };

    const launchApp = (app: App) => {
        // Check if app is already running
        const existing = runningApps.find(ra => ra.app.id === app.id);
        if (existing) {
            // Bring to front and restore if minimized
            bringToFront(existing.windowId);
            if (existing.isMinimized) {
                toggleMinimize(existing.windowId);
            }
            return;
        }

        // Create new window
        const windowId = `window-${Date.now()}`;
        const newWindow: RunningApp = {
            id: app.id,
            app,
            windowId,
            isMinimized: false,
            isMaximized: false,
            position: {
                x: 100 + (runningApps.length * 30),
                y: 100 + (runningApps.length * 30)
            },
            size: { width: 800, height: 600 },
            zIndex: maxZIndex + 1
        };

        setRunningApps([...runningApps, newWindow]);
        setMaxZIndex(maxZIndex + 1);
        toast.success(`Launched ${app.name}`);
    };

    const closeApp = (windowId: string) => {
        setRunningApps(runningApps.filter(ra => ra.windowId !== windowId));
    };

    const toggleMinimize = (windowId: string) => {
        setRunningApps(runningApps.map(ra => 
            ra.windowId === windowId 
                ? { ...ra, isMinimized: !ra.isMinimized }
                : ra
        ));
    };

    const toggleMaximize = (windowId: string) => {
        setRunningApps(runningApps.map(ra => 
            ra.windowId === windowId 
                ? { ...ra, isMaximized: !ra.isMaximized }
                : ra
        ));
    };

    const bringToFront = (windowId: string) => {
        const newZIndex = maxZIndex + 1;
        setRunningApps(runningApps.map(ra => 
            ra.windowId === windowId 
                ? { ...ra, zIndex: newZIndex }
                : ra
        ));
        setMaxZIndex(newZIndex);
    };

    const startDrag = (windowId: string, e: React.MouseEvent) => {
        const window = runningApps.find(ra => ra.windowId === windowId);
        if (!window || window.isMaximized) return;

        setDraggingWindow(windowId);
        setDragOffset({
            x: e.clientX - window.position.x,
            y: e.clientY - window.position.y
        });
        bringToFront(windowId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingWindow) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        setRunningApps(runningApps.map(ra => 
            ra.windowId === draggingWindow 
                ? { ...ra, position: { x: newX, y: newY } }
                : ra
        ));
    };

    const handleMouseUp = () => {
        setDraggingWindow(null);
    };

    const filteredApps = installedApps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderAppIcon = (app: App) => (
        <div
            key={app.id}
            onClick={() => launchApp(app)}
            className={`${cardClass} border rounded-xl p-4 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg`}
        >
            <div className="flex flex-col items-center space-y-2">
                <div className="text-5xl">{app.icon}</div>
                <div className="text-center">
                    <p className={`font-semibold ${textClass} text-sm`}>{app.name}</p>
                    <p className={`text-xs ${mutedClass}`}>v{app.version}</p>
                </div>
                {app.installation_type && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                        app.installation_type === 'company' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                    }`}>
                        {app.installation_type === 'company' ? (
                            <div className="flex items-center space-x-1">
                                <Building2 className="w-3 h-3" />
                                <span>Company</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>Personal</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderAppList = (app: App) => (
        <div
            key={app.id}
            onClick={() => launchApp(app)}
            className={`${cardClass} border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 flex items-center space-x-4`}
        >
            <div className="text-4xl">{app.icon}</div>
            <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-semibold ${textClass}`}>{app.name}</h3>
                    <span className={`text-xs ${mutedClass}`}>v{app.version}</span>
                    {app.installation_type && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            app.installation_type === 'company' 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : 'bg-blue-500/20 text-blue-400'
                        }`}>
                            {app.installation_type === 'company' ? 'Company' : 'Personal'}
                        </span>
                    )}
                </div>
                <p className={`text-sm ${mutedClass} line-clamp-1`}>{app.description}</p>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    launchApp(app);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
                <Play className="w-4 h-4" />
                <span>Launch</span>
            </button>
        </div>
    );

    const renderWindow = (runningApp: RunningApp) => {
        if (runningApp.isMinimized) return null;

        const style: React.CSSProperties = runningApp.isMaximized
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 60, // Leave space for taskbar
                width: '100%',
                height: 'calc(100% - 60px)',
                zIndex: runningApp.zIndex
            }
            : {
                position: 'fixed',
                left: runningApp.position.x,
                top: runningApp.position.y,
                width: runningApp.size.width,
                height: runningApp.size.height,
                zIndex: runningApp.zIndex
            };

        return (
            <div
                key={runningApp.windowId}
                style={style}
                className={`${cardClass} border rounded-lg shadow-2xl flex flex-col overflow-hidden`}
                onClick={() => bringToFront(runningApp.windowId)}
            >
                {/* Window Title Bar */}
                <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 flex items-center justify-between cursor-move"
                    onMouseDown={(e) => startDrag(runningApp.windowId, e)}
                >
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">{runningApp.app.icon}</span>
                        <span className="text-white font-semibold">{runningApp.app.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMinimize(runningApp.windowId);
                            }}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            <Minus className="w-4 h-4 text-white" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMaximize(runningApp.windowId);
                            }}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                        >
                            {runningApp.isMaximized ? (
                                <Minimize2 className="w-4 h-4 text-white" />
                            ) : (
                                <Maximize2 className="w-4 h-4 text-white" />
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeApp(runningApp.windowId);
                            }}
                            className="p-1 hover:bg-red-500 rounded transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Window Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="text-center">
                        <div className="text-6xl mb-4">{runningApp.app.icon}</div>
                        <h2 className={`text-2xl font-bold ${textClass} mb-2`}>{runningApp.app.name}</h2>
                        <p className={`${mutedClass} mb-4`}>{runningApp.app.description}</p>
                        <div className={`${cardClass} border rounded-lg p-4 text-left`}>
                            <p className={`${mutedClass} text-sm mb-2`}>App is running...</p>
                            <p className={`${mutedClass} text-xs`}>Version: {runningApp.app.version}</p>
                            <p className={`${mutedClass} text-xs`}>Category: {runningApp.app.category}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className={`min-h-screen ${bgClass} relative`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Desktop Area */}
            <div className="p-8 pb-24">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className={`text-4xl font-bold ${textClass} mb-2`}>
                                💻 My Applications
                            </h1>
                            <p className={mutedClass}>
                                {installedApps.length} apps installed • {runningApps.length} running
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : `${cardClass} ${textClass}`}`}
                            >
                                <Grid3x3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : `${cardClass} ${textClass}`}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={fetchInstalledApps}
                                className={`p-2 rounded-lg ${cardClass} ${textClass} hover:bg-blue-600 hover:text-white transition-colors`}
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${mutedClass}`} />
                        <input
                            type="text"
                            placeholder="Search apps..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 ${cardClass} border rounded-lg ${textClass} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        />
                    </div>
                </div>

                {/* Apps Grid/List */}
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className={`${mutedClass} mt-4`}>Loading apps...</p>
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className={`w-16 h-16 ${mutedClass} mx-auto mb-4`} />
                            <p className={`${textClass} text-xl font-semibold mb-2`}>No apps installed</p>
                            <p className={mutedClass}>Visit the Marketplace to install applications</p>
                        </div>
                    ) : (
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'} gap-4`}>
                            {filteredApps.map(app => viewMode === 'grid' ? renderAppIcon(app) : renderAppList(app))}
                        </div>
                    )}
                </div>
            </div>

            {/* Running Windows */}
            {runningApps.map(renderWindow)}

            {/* Taskbar */}
            <div className={`fixed bottom-0 left-0 right-0 ${cardClass} border-t px-4 py-2 flex items-center space-x-2 z-50`}>
                <div className="flex items-center space-x-2 flex-1">
                    <Monitor className="w-6 h-6 text-blue-500" />
                    {runningApps.map(ra => (
                        <button
                            key={ra.windowId}
                            onClick={() => {
                                if (ra.isMinimized) {
                                    toggleMinimize(ra.windowId);
                                }
                                bringToFront(ra.windowId);
                            }}
                            className={`px-3 py-2 rounded-lg transition-all ${
                                ra.isMinimized 
                                    ? `${cardClass} opacity-50` 
                                    : 'bg-blue-600 text-white'
                            } hover:scale-105`}
                        >
                            <div className="flex items-center space-x-2">
                                <span>{ra.app.icon}</span>
                                <span className="text-sm">{ra.app.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
                <div className={`${mutedClass} text-sm`}>
                    {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

export default MyApplicationsDesktop;


import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Maximize2, Minimize2, X, ExternalLink, Package, Grid3x3, List, Search, RefreshCw, Settings, Clock, HardDrive, Activity, Download } from 'lucide-react';

interface MarketplaceApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  url?: string;
  installed: boolean;
  category: string;
  color: string;
  version?: string;
  installation_date?: string;
  size?: string;
  last_used?: string;
  developer?: string;
}

interface RunningApp {
  id: string;
  app: MarketplaceApp;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

interface SystemStats {
  totalApps: number;
  installedApps: number;
  runningApps: number;
  totalStorage: string;
  usedStorage: string;
}

export const MyApplicationsDesktop: React.FC = () => {
  const [installedApps, setInstalledApps] = useState<MarketplaceApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<MarketplaceApp[]>([]);
  const [runningApps, setRunningApps] = useState<RunningApp[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalApps: 0,
    installedApps: 0,
    runningApps: 0,
    totalStorage: '10 GB',
    usedStorage: '2.5 GB'
  });

  // Fetch installed apps
  const fetchInstalledApps = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('constructai_token');

      // Try to fetch from real API first
      const response = await fetch('/api/marketplace/installed', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setInstalledApps(data.data);
          setFilteredApps(data.data);
          setSystemStats(prev => ({ ...prev, installedApps: data.data.length }));
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching installed apps:', error);
    }

    // Fallback to default apps
    const defaultApps: MarketplaceApp[] = [
      {
        id: '1',
        name: 'Project Manager',
        icon: '🏗️',
        description: 'Manage your construction projects efficiently',
        installed: true,
        category: 'productivity',
        color: 'blue',
        version: '2.1.0',
        installation_date: '2024-01-15',
        size: '45 MB',
        developer: 'CortexBuild Team'
      },
      {
        id: '2',
        name: 'Time Tracker',
        icon: '⏱️',
        description: 'Track time and attendance for your team',
        installed: true,
        category: 'productivity',
        color: 'green',
        version: '1.8.2',
        installation_date: '2024-01-10',
        size: '32 MB',
        developer: 'CortexBuild Team'
      },
      {
        id: '3',
        name: 'Invoice Generator',
        icon: '💰',
        description: 'Create and manage invoices professionally',
        installed: true,
        category: 'finance',
        color: 'purple',
        version: '3.0.1',
        installation_date: '2024-01-08',
        size: '28 MB',
        developer: 'CortexBuild Team'
      },
      {
        id: '4',
        name: 'Document Manager',
        icon: '📄',
        description: 'Organize and manage project documents',
        installed: true,
        category: 'productivity',
        color: 'orange',
        version: '1.5.0',
        size: '15 MB',
        developer: 'CortexBuild Team'
      },
      {
        id: '5',
        name: 'RFI System',
        icon: '❓',
        description: 'Request for Information management system',
        installed: true,
        category: 'communication',
        color: 'red',
        version: '2.3.0',
        size: '38 MB',
        developer: 'CortexBuild Team'
      },
      {
        id: '6',
        name: 'Analytics Dashboard',
        icon: '📊',
        description: 'View detailed project analytics and insights',
        installed: true,
        category: 'analytics',
        color: 'indigo',
        version: '4.2.0',
        size: '52 MB',
        developer: 'CortexBuild Team'
      },
    ];

    setInstalledApps(defaultApps);
    setFilteredApps(defaultApps);
    setSystemStats(prev => ({ ...prev, installedApps: defaultApps.length }));
  }, []);

  useEffect(() => {
    fetchInstalledApps();
  }, [fetchInstalledApps]);

  // Update running apps count
  useEffect(() => {
    setSystemStats(prev => ({ ...prev, runningApps: runningApps.length }));
  }, [runningApps]);

  // Filter apps based on search and category
  useEffect(() => {
    let filtered = installedApps;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    setFilteredApps(filtered);
  }, [installedApps, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(installedApps.map(app => app.category)))];

  const launchApp = (app: MarketplaceApp) => {
    // Check if app is already running
    const existing = runningApps.find(ra => ra.app.id === app.id);
    if (existing) {
      // Bring to front and restore if minimized
      setRunningApps(prev => prev.map(ra =>
        ra.id === existing.id
          ? { ...ra, isMinimized: false, zIndex: maxZIndex + 1 }
          : ra
      ));
      setMaxZIndex(prev => prev + 1);
      return;
    }

    // Launch new app
    const newRunningApp: RunningApp = {
      id: `${app.id}-${Date.now()}`,
      app,
      isMaximized: false,
      isMinimized: false,
      zIndex: maxZIndex + 1,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 }
    };

    setRunningApps(prev => [...prev, newRunningApp]);
    setMaxZIndex(prev => prev + 1);
  };

  const closeApp = (runningAppId: string) => {
    setRunningApps(prev => prev.filter(ra => ra.id !== runningAppId));
  };

  const toggleMaximize = (runningAppId: string) => {
    setRunningApps(prev => prev.map(ra =>
      ra.id === runningAppId ? { ...ra, isMaximized: !ra.isMaximized } : ra
    ));
  };

  const toggleMinimize = (runningAppId: string) => {
    setRunningApps(prev => prev.map(ra =>
      ra.id === runningAppId ? { ...ra, isMinimized: !ra.isMinimized } : ra
    ));
  };

  const bringToFront = (runningAppId: string) => {
    setRunningApps(prev => prev.map(ra =>
      ra.id === runningAppId ? { ...ra, zIndex: maxZIndex + 1 } : ra
    ));
    setMaxZIndex(prev => prev + 1);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Desktop Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 bg-black bg-opacity-50 backdrop-blur-md border-b border-white border-opacity-20 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Monitor className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">My Applications Desktop</h1>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>{systemStats.runningApps} running</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span>{systemStats.usedStorage} / {systemStats.totalStorage}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInstalledApps}
              className="p-2 rounded-lg text-gray-300 hover:bg-white hover:bg-opacity-10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white bg-opacity-20 text-white' : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                }`}
              title="Grid View"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white bg-opacity-20 text-white' : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                }`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-15'
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Area - App Icons */}
      <div className="relative z-10 p-8 h-[calc(100vh-200px)] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-12 h-12 animate-spin text-white" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white text-opacity-60">
            <Package className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Applications Found</h2>
            <p className="text-lg">{searchQuery ? 'Try adjusting your search' : 'Visit the Marketplace to install applications'}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredApps.map(app => (
              <button
                key={app.id}
                onClick={() => launchApp(app)}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all transform hover:scale-105"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColorClasses(app.color)} flex items-center justify-center text-4xl shadow-lg group-hover:shadow-2xl transition-shadow relative`}>
                  {app.icon}
                  {app.version && (
                    <span className="absolute -top-2 -right-2 bg-black bg-opacity-50 text-xs px-2 py-1 rounded-full">
                      v{app.version}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-white text-sm font-medium line-clamp-2">{app.name}</div>
                  {app.size && <div className="text-gray-400 text-xs mt-1">{app.size}</div>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => (
              <button
                key={app.id}
                onClick={() => launchApp(app)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getColorClasses(app.color)} flex items-center justify-center text-3xl`}>
                  {app.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{app.name}</h3>
                    {app.version && <span className="text-gray-400 text-xs">v{app.version}</span>}
                  </div>
                  <p className="text-gray-300 text-sm mb-1">{app.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {app.size && <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {app.size}</span>}
                    {app.developer && <span>by {app.developer}</span>}
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-black bg-opacity-70 backdrop-blur-md border-t border-white border-opacity-20 px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {runningApps.filter(ra => !ra.isMinimized).map(ra => (
            <button
              key={ra.id}
              onClick={() => bringToFront(ra.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors flex-shrink-0"
            >
              <span className="text-xl">{ra.app.icon}</span>
              <span className="text-white text-sm font-medium">{ra.app.name}</span>
            </button>
          ))}
          {runningApps.filter(ra => ra.isMinimized).map(ra => (
            <button
              key={ra.id}
              onClick={() => toggleMinimize(ra.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors opacity-60 flex-shrink-0"
            >
              <span className="text-xl">{ra.app.icon}</span>
              <span className="text-white text-sm font-medium">{ra.app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Running Applications Windows */}
      {runningApps.map(ra => !ra.isMinimized && (
        <div
          key={ra.id}
          className={`absolute bg-white rounded-lg shadow-2xl overflow-hidden transition-all ${ra.isMaximized ? 'inset-4' : 'top-20 left-20 w-[800px] h-[600px]'
            }`}
          style={{ zIndex: ra.zIndex }}
          onClick={() => bringToFront(ra.id)}
        >
          {/* Window Title Bar */}
          <div className={`bg-gradient-to-r ${getColorClasses(ra.app.color)} px-4 py-3 flex items-center justify-between cursor-move`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ra.app.icon}</span>
              <div>
                <h3 className="text-white font-semibold">{ra.app.name}</h3>
                {ra.app.version && <p className="text-white text-xs opacity-75">v{ra.app.version}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); toggleMinimize(ra.id); }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleMaximize(ra.id); }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title={ra.isMaximized ? "Restore" : "Maximize"}
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); closeApp(ra.id); }}
                className="p-1 hover:bg-red-500 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="h-[calc(100%-52px)] bg-gray-50">
            {ra.app.url ? (
              <iframe
                src={ra.app.url}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                title={ra.app.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">{ra.app.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{ra.app.name}</h2>
                  <p className="text-gray-600 mb-1">{ra.app.description}</p>
                  {ra.app.version && <p className="text-sm text-gray-500">Version {ra.app.version}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


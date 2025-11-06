import React, { useState, useEffect } from 'react';
import { Monitor, Maximize2, Minimize2, X, ExternalLink, Package, Grid3x3, List } from 'lucide-react';
import { getAPIUrl } from '../../../config/api.config';

interface MarketplaceApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  url?: string;
  installed: boolean;
  category: string;
  color: string;
}

interface RunningApp {
  id: string;
  app: MarketplaceApp;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export const MyApplicationsDesktop: React.FC = () => {
  const [installedApps, setInstalledApps] = useState<MarketplaceApp[]>([]);
  const [runningApps, setRunningApps] = useState<RunningApp[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [maxZIndex, setMaxZIndex] = useState(100);

  useEffect(() => {
    fetchInstalledApps();
  }, []);

  const fetchInstalledApps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getAPIUrl('/marketplace/installed'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setInstalledApps(data.modules || []);
      }
    } catch (error) {
      console.error('Failed to fetch installed apps:', error);
      // Set demo apps for testing
      setInstalledApps([
        { id: '1', name: 'Project Manager', icon: '🏗️', description: 'Manage your construction projects', installed: true, category: 'productivity', color: 'blue', url: '/projects' },
        { id: '2', name: 'Time Tracker', icon: '⏱️', description: 'Track time and attendance', installed: true, category: 'productivity', color: 'green', url: '/timetracking' },
        { id: '3', name: 'Invoice Generator', icon: '💰', description: 'Create and manage invoices', installed: true, category: 'finance', color: 'purple', url: '/invoices' },
        { id: '4', name: 'Document Manager', icon: '📄', description: 'Organize project documents', installed: true, category: 'productivity', color: 'orange', url: '/documents' },
        { id: '5', name: 'RFI System', icon: '❓', description: 'Request for Information management', installed: true, category: 'communication', color: 'red', url: '/rfis' },
        { id: '6', name: 'Analytics Dashboard', icon: '📊', description: 'View project analytics', installed: true, category: 'analytics', color: 'indigo', url: '/reports' },
      ]);
    }
  };

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
      zIndex: maxZIndex + 1
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
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white bg-opacity-20 text-white' : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white bg-opacity-20 text-white' : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Area - App Icons */}
      <div className="relative z-10 p-8 h-[calc(100vh-140px)] overflow-y-auto">
        {installedApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white text-opacity-60">
            <Package className="w-24 h-24 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Applications Installed</h2>
            <p className="text-lg">Visit the Marketplace to install applications</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {installedApps.map(app => (
              <button
                key={app.id}
                onClick={() => launchApp(app)}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all transform hover:scale-105"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColorClasses(app.color)} flex items-center justify-center text-4xl shadow-lg group-hover:shadow-2xl transition-shadow`}>
                  {app.icon}
                </div>
                <span className="text-white text-sm font-medium text-center line-clamp-2">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {installedApps.map(app => (
              <button
                key={app.id}
                onClick={() => launchApp(app)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClasses(app.color)} flex items-center justify-center text-2xl`}>
                  {app.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold">{app.name}</h3>
                  <p className="text-gray-300 text-sm">{app.description}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-black bg-opacity-70 backdrop-blur-md border-t border-white border-opacity-20 px-4 py-2">
        <div className="flex items-center gap-2">
          {runningApps.filter(ra => !ra.isMinimized).map(ra => (
            <button
              key={ra.id}
              onClick={() => bringToFront(ra.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <span className="text-xl">{ra.app.icon}</span>
              <span className="text-white text-sm font-medium">{ra.app.name}</span>
            </button>
          ))}
          {runningApps.filter(ra => ra.isMinimized).map(ra => (
            <button
              key={ra.id}
              onClick={() => toggleMinimize(ra.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors opacity-60"
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
          className={`absolute bg-white rounded-lg shadow-2xl overflow-hidden transition-all ${
            ra.isMaximized ? 'inset-4' : 'top-20 left-20 w-[800px] h-[600px]'
          }`}
          style={{ zIndex: ra.zIndex }}
          onClick={() => bringToFront(ra.id)}
        >
          {/* Window Title Bar */}
          <div className={`bg-gradient-to-r ${getColorClasses(ra.app.color)} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ra.app.icon}</span>
              <h3 className="text-white font-semibold">{ra.app.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); toggleMinimize(ra.id); }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleMaximize(ra.id); }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); closeApp(ra.id); }}
                className="p-1 hover:bg-red-500 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Window Content - Sandboxed Iframe */}
          <div className="h-[calc(100%-52px)] bg-gray-50">
            {ra.app.url ? (
              <iframe
                src={ra.app.url}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms"
                title={ra.app.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">{ra.app.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{ra.app.name}</h2>
                  <p className="text-gray-600">{ra.app.description}</p>
                  <p className="text-sm text-gray-500 mt-4">Application sandbox environment</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


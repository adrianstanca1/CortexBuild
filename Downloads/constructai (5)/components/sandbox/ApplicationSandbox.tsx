/**
 * Application Sandbox View
 * Isolated environment for testing marketplace apps
 */

import React, { useState } from 'react';
import { X, Maximize2, Minimize2, RefreshCw, Settings, Play, Pause, BarChart3, AlertCircle } from 'lucide-react';

interface SandboxApp {
    id: string;
    name: string;
    url: string;
    status: 'running' | 'stopped' | 'error';
    memory: number;
    cpu: number;
    requests: number;
    errors: number;
}

export const ApplicationSandbox = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<SandboxApp | null>(null);
    const [apps, setApps] = useState<SandboxApp[]>([
        {
            id: 'app-1',
            name: 'Project Analytics',
            url: 'http://localhost:3001/sandbox/app-1',
            status: 'running',
            memory: 45,
            cpu: 12,
            requests: 1250,
            errors: 2
        },
        {
            id: 'app-2',
            name: 'Time Tracking Pro',
            url: 'http://localhost:3001/sandbox/app-2',
            status: 'running',
            memory: 38,
            cpu: 8,
            requests: 890,
            errors: 0
        },
        {
            id: 'app-3',
            name: 'Budget Manager',
            url: 'http://localhost:3001/sandbox/app-3',
            status: 'stopped',
            memory: 0,
            cpu: 0,
            requests: 0,
            errors: 0
        }
    ]);

    const toggleAppStatus = (appId: string) => {
        setApps(apps.map(app => 
            app.id === appId 
                ? { ...app, status: app.status === 'running' ? 'stopped' : 'running' }
                : app
        ));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-500';
            case 'stopped': return 'bg-gray-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const containerClass = isFullscreen 
        ? 'fixed inset-0 z-50' 
        : 'relative h-screen';

    return (
        <div className={`${containerClass} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col`}>
            {/* Header */}
            <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BarChart3 size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Application Sandbox</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - App List */}
                <div className="w-80 bg-slate-800/50 border-r border-slate-700 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        <h2 className="text-lg font-semibold text-white mb-4">Running Apps</h2>
                        {apps.map(app => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedApp(app)}
                                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                    selectedApp?.id === app.id
                                        ? 'bg-blue-600/20 border-blue-500'
                                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-white">{app.name}</h3>
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(app.status)}`}></div>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{app.url}</p>
                                
                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-slate-600/50 rounded p-2">
                                        <p className="text-xs text-gray-400">Memory</p>
                                        <p className="text-sm font-semibold text-white">{app.memory}%</p>
                                    </div>
                                    <div className="bg-slate-600/50 rounded p-2">
                                        <p className="text-xs text-gray-400">CPU</p>
                                        <p className="text-sm font-semibold text-white">{app.cpu}%</p>
                                    </div>
                                </div>

                                {/* Control Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAppStatus(app.id);
                                    }}
                                    className={`w-full py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        app.status === 'running'
                                            ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
                                            : 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                                    }`}
                                >
                                    {app.status === 'running' ? (
                                        <>
                                            <Pause size={14} />
                                            Stop
                                        </>
                                    ) : (
                                        <>
                                            <Play size={14} />
                                            Start
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main View */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {selectedApp ? (
                        <>
                            {/* App Header */}
                            <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-white">{selectedApp.name}</h2>
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedApp.status)}`}></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                                        <RefreshCw size={20} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                                        <Settings size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* App Metrics */}
                            <div className="bg-slate-800/30 border-b border-slate-700 px-6 py-3 grid grid-cols-5 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400">Status</p>
                                    <p className="text-sm font-semibold text-white capitalize">{selectedApp.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Memory</p>
                                    <p className="text-sm font-semibold text-white">{selectedApp.memory}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">CPU</p>
                                    <p className="text-sm font-semibold text-white">{selectedApp.cpu}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Requests</p>
                                    <p className="text-sm font-semibold text-white">{selectedApp.requests.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Errors</p>
                                    <p className={`text-sm font-semibold ${selectedApp.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {selectedApp.errors}
                                    </p>
                                </div>
                            </div>

                            {/* Sandbox Iframe */}
                            <div className="flex-1 overflow-hidden">
                                {selectedApp.status === 'running' ? (
                                    <iframe
                                        src={selectedApp.url}
                                        className="w-full h-full border-0"
                                        title={selectedApp.name}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <AlertCircle size={48} className="text-gray-500 mx-auto mb-4" />
                                            <p className="text-gray-400 text-lg">App is stopped</p>
                                            <p className="text-gray-500 text-sm mt-2">Start the app to view it here</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Console/Logs */}
                            <div className="bg-slate-900/50 border-t border-slate-700 px-6 py-3 max-h-32 overflow-y-auto">
                                <p className="text-xs text-gray-400 font-mono">
                                    [INFO] App initialized<br />
                                    [INFO] Connected to database<br />
                                    [INFO] Listening on port 3001<br />
                                    {selectedApp.errors > 0 && '[ERROR] Some requests failed'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 size={48} className="text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg">Select an app to view</p>
                                <p className="text-gray-500 text-sm mt-2">Choose from the list on the left</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationSandbox;


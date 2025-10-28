/**
 * App Container - Runtime environment for mini apps
 * Provides sandboxed environment for running user applications
 */

import React, { useState } from 'react';
import { X, Minimize2, Maximize2, Settings } from 'lucide-react';

export interface MiniApp {
    id: string;
    name: string;
    description: string;
    icon: string;
    version: string;
    author: string;
    category: 'productivity' | 'finance' | 'health' | 'utilities' | 'entertainment';
    component: React.ComponentType<any>;
    installed: boolean;
    free: boolean;
}

interface AppContainerProps {
    app: MiniApp;
    onClose: () => void;
    isDarkMode?: boolean;
}

const AppContainer: React.FC<AppContainerProps> = ({ app, onClose, isDarkMode = true }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    const AppComponent = app.component;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${isMinimized ? 'hidden' : ''}`}>
            <div className={`${
                isMaximized 
                    ? 'w-full h-full rounded-none' 
                    : 'w-11/12 h-5/6 rounded-2xl'
            } ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>
                
                {/* App Window Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{app.icon}</span>
                        <div>
                            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {app.name}
                            </h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                v{app.version} by {app.author}
                            </p>
                        </div>
                    </div>

                    {/* Window Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsMinimized(true)}
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                    ? 'hover:bg-gray-700 text-gray-400' 
                                    : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title="Minimize"
                        >
                            <Minimize2 className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsMaximized(!isMaximized)}
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode 
                                    ? 'hover:bg-gray-700 text-gray-400' 
                                    : 'hover:bg-gray-200 text-gray-600'
                            }`}
                            title={isMaximized ? "Restore" : "Maximize"}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-gray-400"
                            title="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* App Content */}
                <div className="flex-1 overflow-auto">
                    <AppComponent isDarkMode={isDarkMode} />
                </div>
            </div>
        </div>
    );
};

export default AppContainer;


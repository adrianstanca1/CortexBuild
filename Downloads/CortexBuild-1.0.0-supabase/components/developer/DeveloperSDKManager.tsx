import React, { useState } from 'react';
import { Package, Download, Trash2, RefreshCw } from 'lucide-react';

interface SDKModule {
  id: string;
  name: string;
  version: string;
  description: string;
  installed: boolean;
  size: string;
}

export const DeveloperSDKManager: React.FC = () => {
  const [modules, setModules] = useState<SDKModule[]>([
    { id: '1', name: '@cortexbuild/core', version: '1.0.0', description: 'Core SDK functionality', installed: true, size: '2.3 MB' },
    { id: '2', name: '@cortexbuild/ui', version: '1.2.1', description: 'UI components library', installed: true, size: '1.8 MB' },
    { id: '3', name: '@cortexbuild/api', version: '2.0.0', description: 'API client library', installed: false, size: '856 KB' },
    { id: '4', name: '@cortexbuild/auth', version: '1.5.0', description: 'Authentication module', installed: true, size: '512 KB' }
  ]);

  const installModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, installed: true } : m));
  };

  const uninstallModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, installed: false } : m));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">SDK Manager</h2>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(module => (
          <div key={module.id} className="bg-[#252526] rounded-lg border border-[#3e3e42] p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-white font-semibold">{module.name}</h3>
                  <p className="text-sm text-gray-400">v{module.version} • {module.size}</p>
                </div>
              </div>
              {module.installed ? (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Installed</span>
              ) : (
                <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Available</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-4">{module.description}</p>
            <div className="flex gap-2">
              {module.installed ? (
                <button
                  type="button"
                  onClick={() => uninstallModule(module.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Uninstall
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => installModule(module.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


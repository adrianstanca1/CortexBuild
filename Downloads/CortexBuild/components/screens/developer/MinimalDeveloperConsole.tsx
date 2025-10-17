import React from 'react';

interface MinimalDeveloperConsoleProps {
  onLogout?: () => void;
  navigateTo?: (screen: string, params?: any) => void;
}

const MinimalDeveloperConsole: React.FC<MinimalDeveloperConsoleProps> = (props) => {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            💻
          </div>
          <div>
            <h1 className="text-xl font-bold">Developer Console</h1>
            <p className="text-sm text-gray-400">Build & Deploy</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => props.onLogout?.()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          🚪 Logout
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Welcome to Developer Console</h2>
            <p className="text-gray-300 mb-4">Build and deploy your applications here.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold mb-2">📊 Dashboard</h3>
                <p className="text-sm text-gray-400">View your projects</p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold mb-2">🔧 Tools</h3>
                <p className="text-sm text-gray-400">Development tools</p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold mb-2">📚 Docs</h3>
                <p className="text-sm text-gray-400">API documentation</p>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold mb-2">🚀 Deploy</h3>
                <p className="text-sm text-gray-400">Deploy apps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border-t border-gray-700 p-4 text-center text-sm text-gray-400">
        <p>CortexBuild Developer Console v1.0</p>
      </div>
    </div>
  );
};

export default MinimalDeveloperConsole;


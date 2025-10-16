import React from 'react';

interface SimpleDeveloperConsoleProps {
  onLogout?: () => void;
  navigateTo?: (screen: string, params?: any) => void;
}

const SimpleDeveloperConsole: React.FC<SimpleDeveloperConsoleProps> = (props) => {

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">💻</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Developer Console</h1>
            <p className="text-sm text-gray-400">Build & Deploy</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex">
        <button
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'dashboard'
            ? 'border-b-2 border-purple-500 text-purple-400'
            : 'text-gray-400 hover:text-gray-300'
            }`}
        >
          Dashboard
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'console'
            ? 'border-b-2 border-purple-500 text-purple-400'
            : 'text-gray-400 hover:text-gray-300'
            }`}
        >
          Console
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Welcome to Developer Console</h2>
              <p className="text-gray-300 mb-4">
                This is your development workspace for building and deploying applications.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded p-4">
                  <h3 className="font-bold mb-2">🚀 Quick Start</h3>
                  <p className="text-sm text-gray-400">Get started with your first project</p>
                </div>
                <div className="bg-gray-700 rounded p-4">
                  <h3 className="font-bold mb-2">📚 Documentation</h3>
                  <p className="text-sm text-gray-400">Learn how to build with our platform</p>
                </div>
                <div className="bg-gray-700 rounded p-4">
                  <h3 className="font-bold mb-2">🔧 Tools</h3>
                  <p className="text-sm text-gray-400">Access development tools and utilities</p>
                </div>
                <div className="bg-gray-700 rounded p-4">
                  <h3 className="font-bold mb-2">📊 Analytics</h3>
                  <p className="text-sm text-gray-400">Monitor your application performance</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <div className="space-y-2 text-gray-400">
                <p>✓ Application deployed successfully</p>
                <p>✓ Build completed in 12.5s</p>
                <p>✓ All tests passed</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 font-mono text-sm">
            <div className="space-y-2 text-gray-300">
              <p className="text-green-400">&gt; Developer Console Ready</p>
              <p className="text-green-400">&gt; Type commands here...</p>
              <p className="text-gray-500">// Console output will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 text-center text-sm text-gray-400">
        <p>CortexBuild Developer Console v1.0</p>
      </div>
    </div>
  );
};

export default SimpleDeveloperConsole;


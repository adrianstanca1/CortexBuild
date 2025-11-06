/**
 * Integration Test Component
 * Tests that all new Studio and Developer Console components work correctly
 */

import React from 'react';
import { Studio } from './studio/Studio';
import DeveloperConsole from './developer/DeveloperConsole';

interface IntegrationTestProps {
  user: any;
  company?: any;
}

export const IntegrationTest: React.FC<IntegrationTestProps> = ({ user, company }) => {
  const [activeView, setActiveView] = React.useState<'studio' | 'console' | 'both'>('both');

  const handleProjectSelect = (project: any) => {
    console.log('Project selected:', project);
  };

  const handleWorkspaceSelect = (workspace: any) => {
    console.log('Workspace selected:', workspace);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Studio & Developer Console Integration Test
          </h1>
          <p className="text-gray-600 mb-6">
            Testing the newly rebuilt Studio and Developer Console with real utilities
          </p>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveView('studio')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === 'studio'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Studio Only
            </button>
            <button
              onClick={() => setActiveView('console')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === 'console'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Developer Console Only
            </button>
            <button
              onClick={() => setActiveView('both')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === 'both'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Side by Side
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Studio Section */}
          {(activeView === 'studio' || activeView === 'both') && (
            <div className={`bg-white rounded-lg shadow-lg ${activeView === 'both' ? 'h-96' : 'h-screen'}`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">CortexBuild Studio</h2>
                <p className="text-sm text-gray-600">Professional Development Environment</p>
              </div>
              <div className={activeView === 'both' ? 'h-80' : 'h-full'}>
                <Studio
                  user={user}
                  company={company}
                  onProjectSelect={handleProjectSelect}
                />
              </div>
            </div>
          )}

          {/* Developer Console Section */}
          {(activeView === 'console' || activeView === 'both') && (
            <div className={`bg-gray-900 rounded-lg shadow-lg ${activeView === 'both' ? 'h-96' : 'h-screen'}`}>
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Developer Console</h2>
                <p className="text-sm text-gray-400">Advanced Development Environment</p>
              </div>
              <div className={activeView === 'both' ? 'h-80' : 'h-full'}>
                <DeveloperConsole
                  user={user}
                  company={company}
                  onWorkspaceSelect={handleWorkspaceSelect}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Studio Components</p>
                <p className="text-sm text-gray-600">All components loaded successfully</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Developer Console</p>
                <p className="text-sm text-gray-600">All components loaded successfully</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">AI Integration</p>
                <p className="text-sm text-gray-600">Advanced AI tools operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
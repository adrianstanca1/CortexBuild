import React, { useState } from 'react';
import { Code, Package, Upload, Download, Book, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface ModuleTemplate {
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  code: string;
  config_schema: any;
}

export const ModuleDevelopmentSDK: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'test' | 'docs' | 'publish'>('create');
  const [moduleData, setModuleData] = useState<ModuleTemplate>({
    name: '',
    slug: '',
    description: '',
    category: 'utilities',
    version: '1.0.0',
    code: '',
    config_schema: {}
  });
  const [testResult, setTestResult] = useState<any>(null);

  const moduleTemplate = `// CortexBuild Module Template
// Module Name: ${moduleData.name || 'My Module'}
// Version: ${moduleData.version}

export class ${moduleData.slug?.replace(/-/g, '_') || 'MyModule'} {
  constructor(config) {
    this.config = config;
  }

  // Initialize module
  async init() {
    console.log('Module initialized');
  }

  // Main execution function
  async execute(input) {
    // Your module logic here
    return {
      success: true,
      data: input
    };
  }

  // Cleanup function
  async cleanup() {
    console.log('Module cleanup');
  }
}

// Export module metadata
export const metadata = {
  name: '${moduleData.name}',
  version: '${moduleData.version}',
  description: '${moduleData.description}',
  category: '${moduleData.category}',
  author: 'Your Name',
  permissions: ['read', 'write'],
  dependencies: []
};
`;

  const handleCreateModule = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/modules/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...moduleData,
          code: moduleTemplate,
          status: 'draft'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Module created successfully!');
      } else {
        alert(data.error || 'Failed to create module');
      }
    } catch (error) {
      console.error('Failed to create module:', error);
      alert('Failed to create module');
    }
  };

  const handleTestModule = () => {
    setTestResult({
      status: 'success',
      message: 'Module test passed',
      execution_time: '45ms',
      memory_used: '2.3MB',
      tests_passed: 5,
      tests_failed: 0
    });
  };

  const handlePublishModule = async () => {
    if (!confirm('Publish this module to the marketplace?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/modules/publish', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moduleData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Module published successfully!');
      }
    } catch (error) {
      console.error('Failed to publish module:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Module Development SDK</h2>
          <p className="text-gray-600">Create, test, and publish custom modules</p>
        </div>
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">SDK v2.0</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'create', label: 'Create Module', icon: Package },
            { id: 'test', label: 'Test & Debug', icon: Play },
            { id: 'docs', label: 'Documentation', icon: Book },
            { id: 'publish', label: 'Publish', icon: Upload }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Create Module Tab */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                <input
                  type="text"
                  value={moduleData.name}
                  onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Module"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={moduleData.slug}
                  onChange={(e) => setModuleData({ ...moduleData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="my-awesome-module"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={moduleData.description}
                  onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what your module does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={moduleData.category}
                  onChange={(e) => setModuleData({ ...moduleData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="analytics">Analytics</option>
                  <option value="automation">Automation</option>
                  <option value="communication">Communication</option>
                  <option value="finance">Finance</option>
                  <option value="project-management">Project Management</option>
                  <option value="integrations">Integrations</option>
                  <option value="utilities">Utilities</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={moduleData.version}
                  onChange={(e) => setModuleData({ ...moduleData, version: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1.0.0"
                />
              </div>

              <button
                onClick={handleCreateModule}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Package className="w-4 h-4 inline mr-2" />
                Create Module
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Module Code</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                <Download className="w-4 h-4 inline mr-1" />
                Download Template
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto" style={{ maxHeight: '500px' }}>
              <pre className="text-sm text-green-400 font-mono">
                <code>{moduleTemplate}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Test & Debug Tab */}
      {activeTab === 'test' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Your Module</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Input (JSON)</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={6}
                placeholder='{"key": "value"}'
              />
            </div>

            <button
              onClick={handleTestModule}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4 inline mr-2" />
              Run Test
            </button>

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {testResult.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">{testResult.message}</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>Execution Time: {testResult.execution_time}</p>
                  <p>Memory Used: {testResult.memory_used}</p>
                  <p>Tests Passed: {testResult.tests_passed}/{testResult.tests_passed + testResult.tests_failed}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Development Guide</h3>
          <div className="prose max-w-none">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Getting Started</h4>
            <p className="text-gray-700 mb-4">
              CortexBuild modules are JavaScript/TypeScript classes that extend the platform's functionality.
              Each module must implement the required interface and export metadata.
            </p>

            <h4 className="text-md font-semibold text-gray-900 mb-2">Required Methods</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><code className="bg-gray-100 px-2 py-1 rounded">init()</code> - Initialize your module</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">execute(input)</code> - Main execution logic</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">cleanup()</code> - Cleanup resources</li>
            </ul>

            <h4 className="text-md font-semibold text-gray-900 mb-2">Best Practices</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Always validate input data</li>
              <li>Handle errors gracefully</li>
              <li>Use async/await for asynchronous operations</li>
              <li>Document your code with JSDoc comments</li>
              <li>Test thoroughly before publishing</li>
            </ul>
          </div>
        </div>
      )}

      {/* Publish Tab */}
      {activeTab === 'publish' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish to Marketplace</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Pre-publish Checklist</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Module tested and working</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Documentation complete</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Version number updated</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Category selected</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handlePublishModule}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              <Upload className="w-5 h-5 inline mr-2" />
              Publish to Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


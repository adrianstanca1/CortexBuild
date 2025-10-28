/**
 * Developer Console
 * Code editor, workflow builder, API tester, and database explorer
 */

import React, { useState } from 'react';
import { Code2, Workflow, Zap, Database, Settings, Play, Save, MoreVertical, Download, Copy } from 'lucide-react';

interface Tab {
    id: string;
    name: string;
    icon: React.ReactNode;
}

const TABS: Tab[] = [
    { id: 'code-editor', name: 'Code Editor', icon: <Code2 size={18} /> },
    { id: 'workflow-builder', name: 'Workflow Builder', icon: <Workflow size={18} /> },
    { id: 'api-tester', name: 'API Tester', icon: <Zap size={18} /> },
    { id: 'database', name: 'Database', icon: <Database size={18} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} /> }
];

export const DeveloperConsole: React.FC = () => {
    const [activeTab, setActiveTab] = useState('code-editor');
    const [code, setCode] = useState(`// Write your code here
function helloWorld() {
  console.log('Hello, World!');
}

helloWorld();`);
    const [output, setOutput] = useState('');

    const handleRunCode = () => {
        setOutput('Code execution output will appear here...');
    };

    const handleSaveCode = () => {
        setOutput('Code saved successfully!');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'code-editor':
                return <CodeEditorTab code={code} setCode={setCode} onRun={handleRunCode} onSave={handleSaveCode} output={output} />;
            case 'workflow-builder':
                return <WorkflowBuilderTab />;
            case 'api-tester':
                return <APITesterTab />;
            case 'database':
                return <DatabaseTab />;
            case 'settings':
                return <SettingsTab />;
            default:
                return <div className="p-6 text-gray-400">Tab content coming soon...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Developer Console</h1>
                        <p className="text-gray-400 mt-1">Code editor, workflow builder, and API testing</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <Download size={20} />
                        </button>
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-700 bg-slate-800/30 px-6">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors border-b-2 ${
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        {tab.icon}
                        <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

// Code Editor Tab
const CodeEditorTab: React.FC<{
    code: string;
    setCode: (code: string) => void;
    onRun: () => void;
    onSave: () => void;
    output: string;
}> = ({ code, setCode, onRun, onSave, output }) => (
    <div className="space-y-4">
        <div className="flex gap-3">
            <button
                onClick={onRun}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
                <Play size={18} />
                Run Code
            </button>
            <button
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
                <Save size={18} />
                Save
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-700/50 px-4 py-2 border-b border-slate-700">
                    <p className="text-gray-400 text-sm font-semibold">Code Editor</p>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 bg-slate-900 text-gray-100 p-4 font-mono text-sm focus:outline-none resize-none"
                    placeholder="Write your code here..."
                />
            </div>

            {/* Output */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <div className="bg-slate-700/50 px-4 py-2 border-b border-slate-700">
                    <p className="text-gray-400 text-sm font-semibold">Output</p>
                </div>
                <div className="w-full h-96 bg-slate-900 text-gray-100 p-4 font-mono text-sm overflow-y-auto">
                    {output || 'Output will appear here...'}
                </div>
            </div>
        </div>
    </div>
);

// Workflow Builder Tab
const WorkflowBuilderTab: React.FC = () => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Workflow Builder</h3>
            <p className="text-gray-400">Create visual workflows with 25+ nodes</p>
            <div className="grid grid-cols-4 gap-4">
                {['Trigger', 'Action', 'Condition', 'Loop', 'Transform', 'Filter', 'Merge', 'Split'].map(node => (
                    <div key={node} className="bg-slate-700/50 border border-slate-600 rounded p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        <p className="text-gray-300 text-sm font-semibold">{node}</p>
                    </div>
                ))}
            </div>
            <p className="text-gray-400 text-sm mt-4">Drag and drop nodes to build your workflow</p>
        </div>
    </div>
);

// API Tester Tab
const APITesterTab: React.FC = () => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">API Tester</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Method</label>
                    <select className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none">
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                        <option>PATCH</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2">URL</label>
                    <input
                        type="text"
                        placeholder="https://api.example.com/endpoint"
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none"
                    />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors">
                    Send Request
                </button>
            </div>
        </div>
    </div>
);

// Database Tab
const DatabaseTab: React.FC = () => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Database Explorer</h3>
            <p className="text-gray-400">Browse and query your database</p>
            <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-400 text-sm">Tables:</p>
                <ul className="mt-2 space-y-1">
                    {['companies', 'users', 'teams', 'projects', 'tasks'].map(table => (
                        <li key={table} className="text-gray-300 text-sm cursor-pointer hover:text-blue-400">
                            • {table}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

// Settings Tab
const SettingsTab: React.FC = () => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Developer Settings</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-gray-400">API Key</label>
                    <button className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded text-sm transition-colors">
                        <Copy size={14} />
                        Copy
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-gray-400">Webhook URL</label>
                    <input type="text" placeholder="https://..." className="bg-slate-700 text-white px-3 py-1 rounded text-sm w-64" />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-gray-400">Rate Limit</label>
                    <select className="bg-slate-700 text-white px-3 py-1 rounded text-sm">
                        <option>100 req/min</option>
                        <option>1000 req/min</option>
                        <option>Unlimited</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
);

export default DeveloperConsole;


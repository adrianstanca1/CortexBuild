/**
 * Logic Editor - Code editor and visual workflow builder
 */

import React, { useState } from 'react';
import {
    Code,
    Zap,
    Database,
    Globe,
    Bell,
    Calendar,
    Mail,
    MessageSquare,
    Play,
    Save,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LogicEditorProps {
    isDarkMode?: boolean;
    onLogicChange?: (logic: string) => void;
}

const LogicEditor: React.FC<LogicEditorProps> = ({ isDarkMode = true, onLogicChange }) => {
    const [editorMode, setEditorMode] = useState<'code' | 'visual'>('code');
    const [code, setCode] = useState(`// App Logic
// This code runs when your app starts

async function onAppStart() {
    console.log('App started!');
    
    // Initialize database
    await initDatabase();
    
    // Load user data
    const user = await loadUserData();
    console.log('User:', user);
}

async function initDatabase() {
    // Database initialization logic
    console.log('Database initialized');
}

async function loadUserData() {
    // Fetch user data from database
    return {
        id: 1,
        name: 'John Doe',
        role: 'Site Manager'
    };
}

// Event Handlers
function onButtonClick() {
    console.log('Button clicked!');
}

function onFormSubmit(data) {
    console.log('Form submitted:', data);
    // Save to database
}

// Export functions
export { onAppStart, onButtonClick, onFormSubmit };
`);

    const workflows = [
        { id: 'api', name: 'API Call', icon: Globe, color: 'from-blue-600 to-cyan-600' },
        { id: 'database', name: 'Database Query', icon: Database, color: 'from-green-600 to-emerald-600' },
        { id: 'notification', name: 'Send Notification', icon: Bell, color: 'from-yellow-600 to-orange-600' },
        { id: 'schedule', name: 'Schedule Task', icon: Calendar, color: 'from-purple-600 to-pink-600' },
        { id: 'email', name: 'Send Email', icon: Mail, color: 'from-red-600 to-rose-600' },
        { id: 'sms', name: 'Send SMS', icon: MessageSquare, color: 'from-indigo-600 to-blue-600' }
    ];

    const saveCode = () => {
        onLogicChange?.(code);
        toast.success('Logic saved!');
    };

    const runCode = () => {
        toast.success('Code executed in sandbox!');
    };

    const exportCode = () => {
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'app-logic.js';
        a.click();
        toast.success('Code exported!');
    };

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border mb-4 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setEditorMode('code')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            editorMode === 'code'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Code className="h-4 w-4 inline mr-2" />
                        Code Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditorMode('visual')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            editorMode === 'visual'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Zap className="h-4 w-4 inline mr-2" />
                        Visual Workflows
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={runCode}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all"
                    >
                        <Play className="h-4 w-4" />
                        Run
                    </button>
                    <button
                        type="button"
                        onClick={saveCode}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
                    >
                        <Save className="h-4 w-4" />
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={exportCode}
                        className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <div className={`flex-1 rounded-2xl border overflow-hidden ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                {editorMode === 'code' ? (
                    <div className="h-full flex flex-col">
                        <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                app-logic.js
                            </span>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className={`flex-1 p-6 font-mono text-sm resize-none focus:outline-none ${
                                isDarkMode ? 'bg-gray-900 text-green-400' : 'bg-white text-gray-900'
                            }`}
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <div className="p-6">
                        <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Visual Workflow Builder
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workflows.map(workflow => {
                                const Icon = workflow.icon;
                                return (
                                    <button
                                        key={workflow.id}
                                        type="button"
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                                            isDarkMode 
                                                ? 'border-gray-700 bg-gray-700 hover:border-gray-600' 
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${workflow.color} flex items-center justify-center mb-4`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {workflow.name}
                                        </h4>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Add {workflow.name.toLowerCase()} to your workflow
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className={`mt-8 p-6 rounded-xl border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}>
                            <h4 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Workflow Canvas
                            </h4>
                            <div className="text-center py-12">
                                <Zap className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Drag workflow blocks here to build your automation
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogicEditor;


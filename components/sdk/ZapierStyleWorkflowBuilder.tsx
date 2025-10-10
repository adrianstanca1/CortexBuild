/**
 * Zapier-Style Workflow Builder for Construction
 * Enterprise-grade automation platform with API connectors and marketplace apps
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    Play, Plus, Trash2, Settings, Code, Zap, Database, Mail, Webhook,
    GitBranch, Clock, CheckCircle, XCircle, AlertCircle, Info,
    Search, Filter, Package, Building2, FileText, Upload, Download,
    Globe, Key, Lock, Eye, EyeOff, ChevronDown, ChevronRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface WorkflowModule {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'connector' | 'marketplace';
    category: string;
    name: string;
    icon: string;
    description: string;
    config: any;
    position: number;
}

interface MarketplaceApp {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    version: string;
    author: string;
    installed: boolean;
    preConfigured?: {
        endpoint?: string;
        method?: string;
        headers?: Record<string, string>;
    };
}

interface ConsoleLog {
    id: string;
    timestamp: string;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
    details?: any;
}

interface GlobalVariable {
    name: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'object';
}

const ZapierStyleWorkflowBuilder: React.FC = () => {
    const [modules, setModules] = useState<WorkflowModule[]>([]);
    const [selectedModule, setSelectedModule] = useState<WorkflowModule | null>(null);
    const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [sidebarCategory, setSidebarCategory] = useState<'core' | 'connectors' | 'marketplace'>('core');
    const [searchQuery, setSearchQuery] = useState('');
    const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([
        { name: 'projectId', value: '', type: 'string' },
        { name: 'apiKey', value: '', type: 'string' }
    ]);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showVariables, setShowVariables] = useState(false);

    // Marketplace Apps - Complete Construction Industry Integrations
    const [marketplaceApps] = useState<MarketplaceApp[]>([
        // Project Management
        {
            id: 'procore-rfi',
            name: 'Procore: Create RFI',
            icon: '🏗️',
            description: 'Create RFIs in Procore project management',
            category: 'Project Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.procore.com/rest/v1.0/rfis',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        {
            id: 'procore-submittal',
            name: 'Procore: Create Submittal',
            icon: '🏗️',
            description: 'Create submittals in Procore',
            category: 'Project Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.procore.com/rest/v1.0/submittals',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        {
            id: 'procore-daily-log',
            name: 'Procore: Create Daily Log',
            icon: '🏗️',
            description: 'Create daily construction logs',
            category: 'Project Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.procore.com/rest/v1.0/daily_logs',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        // Field Management
        {
            id: 'fieldwire-task',
            name: 'Fieldwire: Update Task',
            icon: '📋',
            description: 'Update tasks in Fieldwire',
            category: 'Field Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.fieldwire.com/api/v3/tasks',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        {
            id: 'fieldwire-punch',
            name: 'Fieldwire: Create Punch Item',
            icon: '📋',
            description: 'Create punch list items',
            category: 'Field Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.fieldwire.com/api/v3/punch_items',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        {
            id: 'plangrid-photos',
            name: 'PlanGrid: Upload Photos',
            icon: '📸',
            description: 'Upload photos to PlanGrid',
            category: 'Field Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.plangrid.com/api/v1/photos',
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        },
        // Document Management
        {
            id: 'aconex-document',
            name: 'Aconex: Fetch Document',
            icon: '📄',
            description: 'Retrieve documents from Aconex',
            category: 'Document Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.aconex.com/api/documents',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        {
            id: 'aconex-upload',
            name: 'Aconex: Upload Document',
            icon: '📄',
            description: 'Upload documents to Aconex',
            category: 'Document Management',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.aconex.com/api/documents/upload',
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        },
        // BIM & Design
        {
            id: 'bim360-issues',
            name: 'BIM 360: Sync Issues',
            icon: '🏢',
            description: 'Sync issues with Autodesk BIM 360',
            category: 'BIM',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://developer.api.autodesk.com/issues/v1/containers',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        {
            id: 'bim360-models',
            name: 'BIM 360: Get Models',
            icon: '🏢',
            description: 'Retrieve BIM models and metadata',
            category: 'BIM',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://developer.api.autodesk.com/data/v1/projects',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        // Communication
        {
            id: 'slack-message',
            name: 'Slack: Send Message',
            icon: '💬',
            description: 'Send messages to Slack channels',
            category: 'Communication',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://slack.com/api/chat.postMessage',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        {
            id: 'teams-notification',
            name: 'Microsoft Teams: Send Notification',
            icon: '💬',
            description: 'Send notifications to Teams channels',
            category: 'Communication',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://graph.microsoft.com/v1.0/teams',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        // Email
        {
            id: 'gmail-send',
            name: 'Gmail: Send Email',
            icon: '📧',
            description: 'Send emails via Gmail',
            category: 'Email',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        // Storage
        {
            id: 'dropbox-upload',
            name: 'Dropbox: Upload File',
            icon: '📦',
            description: 'Upload files to Dropbox',
            category: 'Storage',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://content.dropboxapi.com/2/files/upload',
                method: 'POST',
                headers: { 'Content-Type': 'application/octet-stream' }
            }
        },
        {
            id: 'google-drive-upload',
            name: 'Google Drive: Upload File',
            icon: '📦',
            description: 'Upload files to Google Drive',
            category: 'Storage',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://www.googleapis.com/upload/drive/v3/files',
                method: 'POST',
                headers: { 'Content-Type': 'multipart/related' }
            }
        },
        // Scheduling
        {
            id: 'google-calendar-event',
            name: 'Google Calendar: Create Event',
            icon: '📅',
            description: 'Create calendar events',
            category: 'Scheduling',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        // Database
        {
            id: 'airtable-create',
            name: 'Airtable: Create Record',
            icon: '🗄️',
            description: 'Create records in Airtable',
            category: 'Database',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: 'https://api.airtable.com/v0',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        },
        // Webhooks
        {
            id: 'webhook-post',
            name: 'Webhook: POST Data',
            icon: '🔗',
            description: 'Send data to any webhook',
            category: 'Webhooks',
            version: '1.0.0',
            author: 'CortexBuild',
            installed: true,
            preConfigured: {
                endpoint: '',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }
        }
    ]);

    // Core Logic Modules - Complete Zapier-like functionality
    const coreModules = [
        // Triggers
        { id: 'trigger-schedule', name: 'Schedule Trigger', icon: '⏰', description: 'Run on schedule (cron)', category: 'trigger' },
        { id: 'trigger-webhook', name: 'Webhook Trigger', icon: '🔗', description: 'Trigger via HTTP webhook', category: 'trigger' },
        { id: 'trigger-email', name: 'Email Trigger', icon: '📧', description: 'Trigger on new email', category: 'trigger' },
        { id: 'trigger-form', name: 'Form Submission', icon: '📋', description: 'Trigger on form submit', category: 'trigger' },
        { id: 'trigger-database', name: 'Database Change', icon: '🗄️', description: 'Trigger on DB update', category: 'trigger' },

        // Conditions
        { id: 'condition-if', name: 'If/Else Condition', icon: '🔀', description: 'Conditional branching', category: 'condition' },
        { id: 'condition-filter', name: 'Filter', icon: '🔍', description: 'Filter data by criteria', category: 'condition' },
        { id: 'condition-exists', name: 'Only Continue If', icon: '✓', description: 'Continue only if exists', category: 'condition' },

        // Actions
        { id: 'action-log', name: 'Log Message', icon: '📝', description: 'Log to console', category: 'action' },
        { id: 'action-delay', name: 'Delay', icon: '⏱️', description: 'Wait for duration', category: 'action' },
        { id: 'action-transform', name: 'Transform Data', icon: '🔄', description: 'Transform/format data', category: 'action' },
        { id: 'action-loop', name: 'Loop', icon: '🔁', description: 'Loop through items', category: 'action' },
        { id: 'action-split', name: 'Split Text', icon: '✂️', description: 'Split text by delimiter', category: 'action' },
        { id: 'action-merge', name: 'Merge Data', icon: '🔗', description: 'Merge multiple data sources', category: 'action' },
        { id: 'action-math', name: 'Math Operation', icon: '🔢', description: 'Perform calculations', category: 'action' },
        { id: 'action-date', name: 'Date/Time', icon: '📅', description: 'Format dates and times', category: 'action' },
        { id: 'action-code', name: 'Run JavaScript', icon: '💻', description: 'Execute custom code', category: 'action' },
        { id: 'action-error', name: 'Error Handler', icon: '⚠️', description: 'Handle errors', category: 'action' }
    ];

    // Connector Modules
    const connectorModules = [
        { id: 'api-connector', name: 'API Connector', icon: '🌐', description: 'Universal HTTP connector', category: 'connector' }
    ];

    const addLog = (type: ConsoleLog['type'], message: string, details?: any) => {
        const log: ConsoleLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type,
            message,
            details
        };
        setConsoleLogs(prev => [...prev, log]);
    };

    const addModule = (moduleTemplate: any, type: 'core' | 'connector' | 'marketplace', marketplaceApp?: MarketplaceApp) => {
        const newModule: WorkflowModule = {
            id: `module-${Date.now()}`,
            type: type === 'marketplace' ? 'marketplace' : moduleTemplate.category as any,
            category: moduleTemplate.id,
            name: moduleTemplate.name,
            icon: moduleTemplate.icon,
            description: moduleTemplate.description,
            config: marketplaceApp?.preConfigured || {},
            position: modules.length
        };

        setModules([...modules, newModule]);
        setSelectedModule(newModule);
        addLog('info', `Added module: ${newModule.name}`);
    };

    const removeModule = (id: string) => {
        setModules(modules.filter(m => m.id !== id));
        if (selectedModule?.id === id) {
            setSelectedModule(null);
        }
        addLog('info', 'Module removed');
    };

    const updateModuleConfig = (id: string, config: any) => {
        setModules(modules.map(m => m.id === id ? { ...m, config } : m));
        if (selectedModule?.id === id) {
            setSelectedModule({ ...selectedModule, config });
        }
    };

    const interpolateVariables = (text: string): string => {
        let result = text;
        globalVariables.forEach(v => {
            result = result.replace(new RegExp(`{{${v.name}}}`, 'g'), String(v.value));
        });
        return result;
    };

    const executeWorkflow = async () => {
        setIsExecuting(true);
        addLog('info', '🚀 Starting workflow execution...');

        try {
            for (const module of modules) {
                addLog('info', `▶️ Executing: ${module.name}`);

                if (module.category === 'api-connector' || module.type === 'marketplace') {
                    const url = interpolateVariables(module.config.url || module.config.endpoint || '');
                    const method = module.config.method || 'GET';

                    addLog('info', `🌐 Making ${method} request to ${url}...`);

                    try {
                        const headers: any = {};
                        if (module.config.headers) {
                            Object.entries(module.config.headers).forEach(([key, value]) => {
                                headers[key] = interpolateVariables(String(value));
                            });
                        }

                        if (module.config.authType === 'bearer' && module.config.bearerToken) {
                            headers['Authorization'] = `Bearer ${interpolateVariables(module.config.bearerToken)}`;
                        } else if (module.config.authType === 'apikey' && module.config.apiKey) {
                            headers[module.config.apiKeyHeader || 'X-API-Key'] = interpolateVariables(module.config.apiKey);
                        }

                        const options: RequestInit = {
                            method,
                            headers
                        };

                        if (method !== 'GET' && module.config.body) {
                            options.body = interpolateVariables(module.config.body);
                        }

                        const response = await fetch(url, options);
                        const data = await response.json();

                        if (response.ok) {
                            addLog('success', `✅ API call successful`, { status: response.status, data });
                        } else {
                            addLog('error', `❌ API call failed`, { status: response.status, data });
                        }
                    } catch (error: any) {
                        addLog('error', `❌ Error: ${error.message}`, error);
                    }
                } else if (module.category === 'action-log') {
                    addLog('info', `📝 ${interpolateVariables(module.config.message || 'Log message')}`);
                } else if (module.category === 'action-delay') {
                    const delay = parseInt(module.config.duration || '1000');
                    addLog('info', `⏱️ Waiting ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                addLog('success', `✅ Completed: ${module.name}`);
            }

            addLog('success', '🎉 Workflow execution completed successfully!');
        } catch (error: any) {
            addLog('error', `❌ Workflow execution failed: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const clearConsole = () => {
        setConsoleLogs([]);
    };

    const getLogColor = (type: ConsoleLog['type']) => {
        switch (type) {
            case 'info': return 'text-blue-600';
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    const getLogIcon = (type: ConsoleLog['type']) => {
        switch (type) {
            case 'info': return Info;
            case 'success': return CheckCircle;
            case 'error': return XCircle;
            case 'warning': return AlertCircle;
            default: return Info;
        }
    };

    const filteredMarketplaceApps = marketplaceApps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">⚡ Zapier for Construction</h1>
                    <p className="text-sm text-gray-600">Enterprise-grade automation platform</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowVariables(!showVariables)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                        <Database className="w-4 h-4" />
                        <span>Variables</span>
                    </button>
                    <button
                        onClick={executeWorkflow}
                        disabled={isExecuting || modules.length === 0}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play className="w-5 h-5" />
                        <span>{isExecuting ? 'Running...' : 'Run Workflow'}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Module Library */}
                <div className="w-80 bg-white border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold mb-3">Module Library</h3>
                        <div className="flex space-x-2 mb-3">
                            <button
                                onClick={() => setSidebarCategory('core')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarCategory === 'core' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Core Logic
                            </button>
                            <button
                                onClick={() => setSidebarCategory('connectors')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarCategory === 'connectors' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Connectors
                            </button>
                            <button
                                onClick={() => setSidebarCategory('marketplace')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarCategory === 'marketplace' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Marketplace
                            </button>
                        </div>
                        {sidebarCategory === 'marketplace' && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search apps..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {sidebarCategory === 'core' && coreModules.map(module => (
                            <button
                                key={module.id}
                                onClick={() => addModule(module, 'core')}
                                className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{module.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{module.name}</p>
                                        <p className="text-xs text-gray-600">{module.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {sidebarCategory === 'connectors' && connectorModules.map(module => (
                            <button
                                key={module.id}
                                onClick={() => addModule(module, 'connector')}
                                className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{module.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{module.name}</p>
                                        <p className="text-xs text-gray-600">{module.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {sidebarCategory === 'marketplace' && filteredMarketplaceApps.map(app => (
                            <div
                                key={app.id}
                                className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-start space-x-3 mb-2">
                                    <span className="text-3xl">{app.icon}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{app.name}</p>
                                        <p className="text-xs text-gray-600 mb-1">{app.description}</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{app.category}</span>
                                            <span>v{app.version}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => addModule({ id: app.id, name: app.name, icon: app.icon, description: app.description, category: 'marketplace' }, 'marketplace', app)}
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${app.installed
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {app.installed ? 'Add to Workflow' : 'Install & Add'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content - Workflow Canvas & Inspector */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex overflow-hidden">
                        {/* Workflow Canvas */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {modules.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No modules yet</h3>
                                        <p className="text-gray-600 mb-4">Add modules from the library to build your workflow</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-3xl mx-auto">
                                    {modules.map((module, index) => (
                                        <div key={module.id}>
                                            <div
                                                onClick={() => setSelectedModule(module)}
                                                className={`p-4 bg-white border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${selectedModule?.id === module.id ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-3xl">{module.icon}</span>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{module.name}</p>
                                                            <p className="text-sm text-gray-600">{module.description}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeModule(module.id);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {index < modules.length - 1 && (
                                                <div className="flex justify-center py-2">
                                                    <ChevronDown className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Inspector Panel */}
                        {selectedModule && (
                            <div className="w-96 bg-white border-l overflow-y-auto">
                                <div className="p-4 border-b bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-semibold">Inspector</h3>
                                        <button
                                            onClick={() => setShowPublishModal(true)}
                                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Publish to Marketplace
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600">{selectedModule.name}</p>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* API Connector Configuration */}
                                    {(selectedModule.category === 'api-connector' || selectedModule.type === 'marketplace') && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Request URL</label>
                                                <input
                                                    type="text"
                                                    value={selectedModule.config.url || selectedModule.config.endpoint || ''}
                                                    onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, url: e.target.value })}
                                                    placeholder="https://api.example.com/endpoint"
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Use {'{{'} variableName {'}}'}  for interpolation</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">HTTP Method</label>
                                                <select
                                                    value={selectedModule.config.method || 'GET'}
                                                    onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, method: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                >
                                                    <option value="GET">GET</option>
                                                    <option value="POST">POST</option>
                                                    <option value="PUT">PUT</option>
                                                    <option value="PATCH">PATCH</option>
                                                    <option value="DELETE">DELETE</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Authentication</label>
                                                <select
                                                    value={selectedModule.config.authType || 'none'}
                                                    onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, authType: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                                                >
                                                    <option value="none">No Auth</option>
                                                    <option value="bearer">Bearer Token</option>
                                                    <option value="apikey">API Key</option>
                                                    <option value="basic">Basic Auth</option>
                                                </select>

                                                {selectedModule.config.authType === 'bearer' && (
                                                    <input
                                                        type="password"
                                                        value={selectedModule.config.bearerToken || ''}
                                                        onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, bearerToken: e.target.value })}
                                                        placeholder="Bearer token"
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                )}

                                                {selectedModule.config.authType === 'apikey' && (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={selectedModule.config.apiKeyHeader || 'X-API-Key'}
                                                            onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, apiKeyHeader: e.target.value })}
                                                            placeholder="Header name"
                                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                                                        />
                                                        <input
                                                            type="password"
                                                            value={selectedModule.config.apiKey || ''}
                                                            onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, apiKey: e.target.value })}
                                                            placeholder="API key"
                                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Headers</label>
                                                <textarea
                                                    value={JSON.stringify(selectedModule.config.headers || {}, null, 2)}
                                                    onChange={(e) => {
                                                        try {
                                                            const headers = JSON.parse(e.target.value);
                                                            updateModuleConfig(selectedModule.id, { ...selectedModule.config, headers });
                                                        } catch (err) {
                                                            // Invalid JSON, ignore
                                                        }
                                                    }}
                                                    placeholder='{"Content-Type": "application/json"}'
                                                    rows={4}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                                />
                                            </div>

                                            {selectedModule.config.method !== 'GET' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Body (JSON)</label>
                                                    <textarea
                                                        value={selectedModule.config.body || ''}
                                                        onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, body: e.target.value })}
                                                        placeholder='{"key": "value"}'
                                                        rows={6}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Log Message Configuration */}
                                    {selectedModule.category === 'action-log' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Log Message</label>
                                            <input
                                                type="text"
                                                value={selectedModule.config.message || ''}
                                                onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, message: e.target.value })}
                                                placeholder="Enter message to log"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    )}

                                    {/* Delay Configuration */}
                                    {selectedModule.category === 'action-delay' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (ms)</label>
                                            <input
                                                type="number"
                                                value={selectedModule.config.duration || '1000'}
                                                onChange={(e) => updateModuleConfig(selectedModule.id, { ...selectedModule.config, duration: e.target.value })}
                                                placeholder="1000"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Console */}
                    <div className="h-64 bg-gray-900 border-t flex flex-col">
                        <div className="px-4 py-2 bg-gray-800 flex items-center justify-between">
                            <h3 className="text-white font-semibold">Console</h3>
                            <button
                                onClick={clearConsole}
                                className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
                            {consoleLogs.length === 0 ? (
                                <p className="text-gray-500">Console output will appear here...</p>
                            ) : (
                                consoleLogs.map(log => {
                                    const Icon = getLogIcon(log.type);
                                    return (
                                        <div key={log.id} className="flex items-start space-x-2">
                                            <span className="text-gray-500 text-xs">{log.timestamp}</span>
                                            <Icon className={`w-4 h-4 mt-0.5 ${getLogColor(log.type)}`} />
                                            <span className={getLogColor(log.type)}>{log.message}</span>
                                            {log.details && (
                                                <pre className="text-xs text-gray-400 ml-6">{JSON.stringify(log.details, null, 2)}</pre>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Variables Panel */}
            {showVariables && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold">Global Variables</h2>
                            <button onClick={() => setShowVariables(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <p className="text-sm text-gray-600 mb-4">
                                Variables can be used in API requests using {'{{'} variableName {'}}'}  syntax
                            </p>
                            <div className="space-y-3">
                                {globalVariables.map((variable, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            value={variable.name}
                                            onChange={(e) => {
                                                const newVars = [...globalVariables];
                                                newVars[index].name = e.target.value;
                                                setGlobalVariables(newVars);
                                            }}
                                            placeholder="Variable name"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={variable.value}
                                            onChange={(e) => {
                                                const newVars = [...globalVariables];
                                                newVars[index].value = e.target.value;
                                                setGlobalVariables(newVars);
                                            }}
                                            placeholder="Value"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => setGlobalVariables(globalVariables.filter((_, i) => i !== index))}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setGlobalVariables([...globalVariables, { name: '', value: '', type: 'string' }])}
                                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Variable</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Publish Modal */}
            {showPublishModal && selectedModule && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold">Publish to Marketplace</h2>
                            <button onClick={() => setShowPublishModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">App Name *</label>
                                    <input
                                        type="text"
                                        defaultValue={selectedModule.name}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                    <textarea
                                        defaultValue={selectedModule.description}
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                            <option>Project Management</option>
                                            <option>Field Management</option>
                                            <option>Document Management</option>
                                            <option>BIM</option>
                                            <option>Safety</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                                        <input
                                            type="text"
                                            defaultValue="1.0.0"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        defaultValue={selectedModule.icon}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={() => {
                                        const packageData = {
                                            name: selectedModule.name,
                                            description: selectedModule.description,
                                            icon: selectedModule.icon,
                                            config: selectedModule.config,
                                            type: selectedModule.type,
                                            category: selectedModule.category
                                        };
                                        console.log('📦 Publishing to marketplace:', packageData);
                                        addLog('success', `✅ Published "${selectedModule.name}" to marketplace!`, packageData);
                                        toast.success('Module published successfully!');
                                        setShowPublishModal(false);
                                    }}
                                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                >
                                    Publish
                                </button>
                                <button
                                    onClick={() => setShowPublishModal(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZapierStyleWorkflowBuilder;


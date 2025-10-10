/**
 * N8N + Procore + Zapier Combined Workflow Builder
 * The ultimate construction automation platform combining:
 * - n8n's visual node-based editor with drag & drop
 * - Procore's complete construction API suite
 * - Zapier's pre-built integrations and triggers
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    Play, Plus, Trash2, Settings, Code, Zap, Database, Mail, Webhook,
    GitBranch, Clock, CheckCircle, XCircle, AlertCircle, Info,
    Search, Filter, Package, Building2, FileText, Upload, Download,
    Globe, Key, Lock, Eye, EyeOff, ChevronDown, ChevronRight, X,
    Move, Copy, Link, Maximize2, Minimize2, RotateCw, Save,
    Layers, Grid, List, Workflow, Boxes, Network
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface Node {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'procore' | 'integration';
    category: string;
    name: string;
    icon: string;
    description: string;
    config: any;
    position: { x: number; y: number };
    connections: Connection[];
}

interface Connection {
    from: string;
    to: string;
    type: 'success' | 'error' | 'conditional';
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

const N8nProcoreWorkflowBuilder: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [sidebarCategory, setSidebarCategory] = useState<'triggers' | 'procore' | 'integrations' | 'logic'>('procore');
    const [searchQuery, setSearchQuery] = useState('');
    const [globalVariables, setGlobalVariables] = useState<GlobalVariable[]>([
        { name: 'procoreProjectId', value: '', type: 'string' },
        { name: 'procoreCompanyId', value: '', type: 'string' },
        { name: 'procoreApiKey', value: '', type: 'string' }
    ]);
    const [showVariables, setShowVariables] = useState(false);
    const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedNode, setDraggedNode] = useState<string | null>(null);

    // COMPLETE PROCORE API SUITE
    const procoreNodes = [
        // Project Management
        { id: 'procore-projects-list', name: 'List Projects', icon: '🏗️', description: 'Get all Procore projects', category: 'procore', endpoint: '/rest/v1.0/projects', method: 'GET' },
        { id: 'procore-project-get', name: 'Get Project', icon: '🏗️', description: 'Get project details', category: 'procore', endpoint: '/rest/v1.0/projects/{id}', method: 'GET' },
        { id: 'procore-project-create', name: 'Create Project', icon: '🏗️', description: 'Create new project', category: 'procore', endpoint: '/rest/v1.0/projects', method: 'POST' },
        { id: 'procore-project-update', name: 'Update Project', icon: '🏗️', description: 'Update project', category: 'procore', endpoint: '/rest/v1.0/projects/{id}', method: 'PATCH' },

        // RFIs (Request for Information)
        { id: 'procore-rfis-list', name: 'List RFIs', icon: '📋', description: 'Get all RFIs', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/rfis', method: 'GET' },
        { id: 'procore-rfi-create', name: 'Create RFI', icon: '📋', description: 'Create new RFI', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/rfis', method: 'POST' },
        { id: 'procore-rfi-update', name: 'Update RFI', icon: '📋', description: 'Update RFI', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/rfis/{id}', method: 'PATCH' },
        { id: 'procore-rfi-respond', name: 'Respond to RFI', icon: '📋', description: 'Add RFI response', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/rfis/{id}/responses', method: 'POST' },

        // Submittals
        { id: 'procore-submittals-list', name: 'List Submittals', icon: '📄', description: 'Get all submittals', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/submittals', method: 'GET' },
        { id: 'procore-submittal-create', name: 'Create Submittal', icon: '📄', description: 'Create new submittal', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/submittals', method: 'POST' },
        { id: 'procore-submittal-update', name: 'Update Submittal', icon: '📄', description: 'Update submittal', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/submittals/{id}', method: 'PATCH' },
        { id: 'procore-submittal-review', name: 'Review Submittal', icon: '📄', description: 'Add submittal review', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/submittals/{id}/reviews', method: 'POST' },

        // Daily Logs
        { id: 'procore-daily-logs-list', name: 'List Daily Logs', icon: '📅', description: 'Get daily logs', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/daily_logs', method: 'GET' },
        { id: 'procore-daily-log-create', name: 'Create Daily Log', icon: '📅', description: 'Create daily log', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/daily_logs', method: 'POST' },
        { id: 'procore-daily-log-update', name: 'Update Daily Log', icon: '📅', description: 'Update daily log', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/daily_logs/{id}', method: 'PATCH' },

        // Change Orders
        { id: 'procore-change-orders-list', name: 'List Change Orders', icon: '💰', description: 'Get change orders', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/change_orders', method: 'GET' },
        { id: 'procore-change-order-create', name: 'Create Change Order', icon: '💰', description: 'Create change order', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/change_orders', method: 'POST' },
        { id: 'procore-change-order-update', name: 'Update Change Order', icon: '💰', description: 'Update change order', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/change_orders/{id}', method: 'PATCH' },

        // Punch List
        { id: 'procore-punch-items-list', name: 'List Punch Items', icon: '✓', description: 'Get punch list items', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/punch_items', method: 'GET' },
        { id: 'procore-punch-item-create', name: 'Create Punch Item', icon: '✓', description: 'Create punch item', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/punch_items', method: 'POST' },
        { id: 'procore-punch-item-update', name: 'Update Punch Item', icon: '✓', description: 'Update punch item', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/punch_items/{id}', method: 'PATCH' },
        { id: 'procore-punch-item-close', name: 'Close Punch Item', icon: '✓', description: 'Close punch item', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/punch_items/{id}/close', method: 'POST' },

        // Inspections
        { id: 'procore-inspections-list', name: 'List Inspections', icon: '🔍', description: 'Get inspections', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/inspections', method: 'GET' },
        { id: 'procore-inspection-create', name: 'Create Inspection', icon: '🔍', description: 'Create inspection', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/inspections', method: 'POST' },
        { id: 'procore-inspection-update', name: 'Update Inspection', icon: '🔍', description: 'Update inspection', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/inspections/{id}', method: 'PATCH' },

        // Incidents
        { id: 'procore-incidents-list', name: 'List Incidents', icon: '⚠️', description: 'Get safety incidents', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/incidents', method: 'GET' },
        { id: 'procore-incident-create', name: 'Create Incident', icon: '⚠️', description: 'Report incident', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/incidents', method: 'POST' },
        { id: 'procore-incident-update', name: 'Update Incident', icon: '⚠️', description: 'Update incident', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/incidents/{id}', method: 'PATCH' },

        // Documents
        { id: 'procore-documents-list', name: 'List Documents', icon: '📁', description: 'Get documents', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/documents', method: 'GET' },
        { id: 'procore-document-upload', name: 'Upload Document', icon: '📁', description: 'Upload document', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/documents', method: 'POST' },
        { id: 'procore-document-download', name: 'Download Document', icon: '📁', description: 'Download document', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/documents/{id}/download', method: 'GET' },

        // Photos
        { id: 'procore-photos-list', name: 'List Photos', icon: '📸', description: 'Get photos', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/photos', method: 'GET' },
        { id: 'procore-photo-upload', name: 'Upload Photo', icon: '📸', description: 'Upload photo', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/photos', method: 'POST' },

        // Drawings
        { id: 'procore-drawings-list', name: 'List Drawings', icon: '📐', description: 'Get drawings', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/drawings', method: 'GET' },
        { id: 'procore-drawing-upload', name: 'Upload Drawing', icon: '📐', description: 'Upload drawing', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/drawings', method: 'POST' },

        // Meetings
        { id: 'procore-meetings-list', name: 'List Meetings', icon: '👥', description: 'Get meetings', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/meetings', method: 'GET' },
        { id: 'procore-meeting-create', name: 'Create Meeting', icon: '👥', description: 'Create meeting', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/meetings', method: 'POST' },

        // Timesheets
        { id: 'procore-timesheets-list', name: 'List Timesheets', icon: '⏰', description: 'Get timesheets', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/timesheets', method: 'GET' },
        { id: 'procore-timesheet-create', name: 'Create Timesheet', icon: '⏰', description: 'Create timesheet', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/timesheets', method: 'POST' },

        // Budget
        { id: 'procore-budget-list', name: 'List Budget Items', icon: '💵', description: 'Get budget', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/budget_line_items', method: 'GET' },
        { id: 'procore-budget-update', name: 'Update Budget', icon: '💵', description: 'Update budget', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/budget_line_items/{id}', method: 'PATCH' },

        // Contracts
        { id: 'procore-contracts-list', name: 'List Contracts', icon: '📜', description: 'Get contracts', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/contracts', method: 'GET' },
        { id: 'procore-contract-create', name: 'Create Contract', icon: '📜', description: 'Create contract', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/contracts', method: 'POST' },

        // Purchase Orders
        { id: 'procore-pos-list', name: 'List Purchase Orders', icon: '🛒', description: 'Get POs', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/purchase_orders', method: 'GET' },
        { id: 'procore-po-create', name: 'Create Purchase Order', icon: '🛒', description: 'Create PO', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/purchase_orders', method: 'POST' },

        // Work Orders
        { id: 'procore-work-orders-list', name: 'List Work Orders', icon: '🔧', description: 'Get work orders', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/work_orders', method: 'GET' },
        { id: 'procore-work-order-create', name: 'Create Work Order', icon: '🔧', description: 'Create work order', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/work_orders', method: 'POST' },

        // Schedule
        { id: 'procore-schedule-list', name: 'List Schedule Items', icon: '📊', description: 'Get schedule', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/schedule', method: 'GET' },
        { id: 'procore-schedule-update', name: 'Update Schedule', icon: '📊', description: 'Update schedule', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/schedule/{id}', method: 'PATCH' },

        // Observations
        { id: 'procore-observations-list', name: 'List Observations', icon: '👁️', description: 'Get observations', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/observations', method: 'GET' },
        { id: 'procore-observation-create', name: 'Create Observation', icon: '👁️', description: 'Create observation', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/observations', method: 'POST' },

        // Correspondence
        { id: 'procore-correspondence-list', name: 'List Correspondence', icon: '✉️', description: 'Get correspondence', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/correspondence', method: 'GET' },
        { id: 'procore-correspondence-create', name: 'Create Correspondence', icon: '✉️', description: 'Send correspondence', category: 'procore', endpoint: '/rest/v1.0/projects/{project_id}/correspondence', method: 'POST' }
    ];

    // ZAPIER-STYLE TRIGGERS
    const triggerNodes = [
        { id: 'trigger-schedule', name: 'Schedule', icon: '⏰', description: 'Run on schedule (cron)', category: 'trigger' },
        { id: 'trigger-webhook', name: 'Webhook', icon: '🔗', description: 'HTTP webhook trigger', category: 'trigger' },
        { id: 'trigger-email', name: 'Email', icon: '📧', description: 'New email trigger', category: 'trigger' },
        { id: 'trigger-form', name: 'Form Submit', icon: '📋', description: 'Form submission', category: 'trigger' },
        { id: 'trigger-database', name: 'Database', icon: '🗄️', description: 'DB change trigger', category: 'trigger' },
        { id: 'trigger-procore-rfi', name: 'Procore: New RFI', icon: '🏗️', description: 'New RFI created', category: 'trigger' },
        { id: 'trigger-procore-submittal', name: 'Procore: New Submittal', icon: '🏗️', description: 'New submittal', category: 'trigger' },
        { id: 'trigger-procore-incident', name: 'Procore: New Incident', icon: '🏗️', description: 'New incident', category: 'trigger' },
        { id: 'trigger-procore-punch', name: 'Procore: New Punch Item', icon: '🏗️', description: 'New punch item', category: 'trigger' }
    ];

    // INTEGRATION NODES (Zapier-style)
    const integrationNodes = [
        // Communication
        { id: 'slack-message', name: 'Slack: Send Message', icon: '💬', description: 'Send Slack message', category: 'integration' },
        { id: 'teams-notification', name: 'Teams: Send Notification', icon: '💬', description: 'Send Teams notification', category: 'integration' },
        { id: 'gmail-send', name: 'Gmail: Send Email', icon: '📧', description: 'Send email via Gmail', category: 'integration' },

        // Storage
        { id: 'dropbox-upload', name: 'Dropbox: Upload', icon: '📦', description: 'Upload to Dropbox', category: 'integration' },
        { id: 'google-drive-upload', name: 'Google Drive: Upload', icon: '📦', description: 'Upload to Drive', category: 'integration' },

        // Database
        { id: 'airtable-create', name: 'Airtable: Create Record', icon: '🗄️', description: 'Create Airtable record', category: 'integration' },
        { id: 'mysql-query', name: 'MySQL: Run Query', icon: '🗄️', description: 'Execute MySQL query', category: 'integration' },

        // Other Construction Tools
        { id: 'fieldwire-task', name: 'Fieldwire: Update Task', icon: '📋', description: 'Update Fieldwire task', category: 'integration' },
        { id: 'plangrid-photo', name: 'PlanGrid: Upload Photo', icon: '📸', description: 'Upload to PlanGrid', category: 'integration' },
        { id: 'bim360-issue', name: 'BIM 360: Create Issue', icon: '🏢', description: 'Create BIM 360 issue', category: 'integration' }
    ];

    // LOGIC NODES (n8n-style)
    const logicNodes = [
        { id: 'if-condition', name: 'IF', icon: '🔀', description: 'Conditional branching', category: 'logic' },
        { id: 'switch', name: 'Switch', icon: '🔀', description: 'Multiple conditions', category: 'logic' },
        { id: 'merge', name: 'Merge', icon: '🔗', description: 'Merge data streams', category: 'logic' },
        { id: 'split', name: 'Split', icon: '✂️', description: 'Split into batches', category: 'logic' },
        { id: 'loop', name: 'Loop', icon: '🔁', description: 'Loop through items', category: 'logic' },
        { id: 'transform', name: 'Transform', icon: '🔄', description: 'Transform data', category: 'logic' },
        { id: 'filter', name: 'Filter', icon: '🔍', description: 'Filter items', category: 'logic' },
        { id: 'aggregate', name: 'Aggregate', icon: '📊', description: 'Aggregate data', category: 'logic' },
        { id: 'code', name: 'Code', icon: '💻', description: 'Run JavaScript', category: 'logic' },
        { id: 'delay', name: 'Delay', icon: '⏱️', description: 'Wait/delay', category: 'logic' },
        { id: 'error-handler', name: 'Error Handler', icon: '⚠️', description: 'Handle errors', category: 'logic' }
    ];

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                                <Network className="w-7 h-7 text-blue-600" />
                                <span>n8n + Procore + Zapier Builder</span>
                            </h1>
                            <p className="text-sm text-gray-600">Visual workflow automation for construction</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setViewMode(viewMode === 'canvas' ? 'list' : 'canvas')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                            >
                                {viewMode === 'canvas' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                                <span>{viewMode === 'canvas' ? 'List View' : 'Canvas View'}</span>
                            </button>
                            <button
                                onClick={() => setShowVariables(!showVariables)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                            >
                                <Database className="w-4 h-4" />
                                <span>Variables</span>
                            </button>
                            <button
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                            >
                                <Play className="w-4 h-4" />
                                <span>Execute</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Node Library */}
                <div className="w-80 bg-white border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold mb-3">Node Library</h3>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                                onClick={() => setSidebarCategory('procore')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarCategory === 'procore' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🏗️ Procore
                            </button>
                            <button
                                onClick={() => setSidebarCategory('triggers')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarCategory === 'triggers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                ⚡ Triggers
                            </button>
                            <button
                                onClick={() => setSidebarCategory('integrations')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarCategory === 'integrations' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🔌 Apps
                            </button>
                            <button
                                onClick={() => setSidebarCategory('logic')}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sidebarCategory === 'logic' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🔀 Logic
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search nodes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                            {sidebarCategory === 'procore' && `${procoreNodes.length} Procore APIs`}
                            {sidebarCategory === 'triggers' && `${triggerNodes.length} Triggers`}
                            {sidebarCategory === 'integrations' && `${integrationNodes.length} Integrations`}
                            {sidebarCategory === 'logic' && `${logicNodes.length} Logic Nodes`}
                        </p>

                        {/* Render nodes based on category */}
                        {sidebarCategory === 'procore' && procoreNodes
                            .filter(node => node.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(node => (
                                <div
                                    key={node.id}
                                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-move"
                                    draggable
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{node.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{node.name}</p>
                                            <p className="text-xs text-gray-600 truncate">{node.description}</p>
                                            <p className="text-xs text-blue-600 font-mono mt-1">{node.method} {node.endpoint}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

                        {sidebarCategory === 'triggers' && triggerNodes
                            .filter(node => node.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(node => (
                                <div
                                    key={node.id}
                                    className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-move"
                                    draggable
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{node.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{node.name}</p>
                                            <p className="text-xs text-gray-600 truncate">{node.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

                        {sidebarCategory === 'integrations' && integrationNodes
                            .filter(node => node.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(node => (
                                <div
                                    key={node.id}
                                    className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors cursor-move"
                                    draggable
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{node.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{node.name}</p>
                                            <p className="text-xs text-gray-600 truncate">{node.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

                        {sidebarCategory === 'logic' && logicNodes
                            .filter(node => node.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(node => (
                                <div
                                    key={node.id}
                                    className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-move"
                                    draggable
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{node.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{node.name}</p>
                                            <p className="text-xs text-gray-600 truncate">{node.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Canvas / List View */}
                <div className="flex-1 flex flex-col">
                    {viewMode === 'canvas' ? (
                        <div ref={canvasRef} className="flex-1 bg-gray-50 relative overflow-auto">
                            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                            <div className="relative p-8">
                                <div className="text-center text-gray-400 py-20">
                                    <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Drag nodes from the sidebar to build your workflow</p>
                                    <p className="text-sm mt-2">Connect nodes to create automation flows</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto p-6">
                            <div className="max-w-4xl mx-auto">
                                <h2 className="text-xl font-bold mb-4">Workflow Steps</h2>
                                <div className="bg-white rounded-lg border p-6 text-center text-gray-400">
                                    <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No workflow steps yet</p>
                                    <p className="text-sm mt-1">Add nodes to see them listed here</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .bg-grid-pattern {
                    background-image: 
                        linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

export default N8nProcoreWorkflowBuilder;


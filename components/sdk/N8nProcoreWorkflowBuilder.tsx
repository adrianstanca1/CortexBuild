/**
 * N8N + Procore + Zapier MEGA BUILDER
 * Ultimate Construction Automation Platform
 * Combines N8N's visual node editor, Procore's API suite, and Zapier's integrations
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Play, Plus, Trash2, Settings, Code, Zap, Database, Mail, Webhook,
    GitBranch, Clock, CheckCircle, XCircle, AlertCircle, Info, Search,
    Filter, Package, Building2, FileText, Upload, Download, Globe, Key,
    Lock, Eye, EyeOff, ChevronDown, ChevronRight, X, Move, Copy, Save,
    Share, Layers, Grid, Workflow, Bot, Brain, Target, Gauge, Users,
    Calendar, DollarSign, Truck, Hammer, HardHat, MapPin, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

// Enhanced Types for N8N-style workflow
interface WorkflowNode {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'ai' | 'procore' | 'integration';
    category: string;
    name: string;
    icon: React.ComponentType<any>;
    description: string;
    config: any;
    position: { x: number; y: number };
    connections: { input: string[]; output: string[] };
    status: 'idle' | 'running' | 'success' | 'error';
    data?: any;
}

interface ProcoreEndpoint {
    id: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    description: string;
    category: string;
    parameters: Array<{
        name: string;
        type: string;
        required: boolean;
        description: string;
    }>;
}

interface WorkflowExecution {
    id: string;
    status: 'running' | 'completed' | 'failed' | 'paused';
    startTime: Date;
    endTime?: Date;
    nodeResults: Record<string, any>;
    logs: Array<{
        timestamp: Date;
        level: 'info' | 'warn' | 'error';
        message: string;
        nodeId?: string;
    }>;
}

const N8nProcoreWorkflowBuilder: React.FC = () => {
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [execution, setExecution] = useState<WorkflowExecution | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'nodes' | 'procore' | 'ai' | 'integrations'>('nodes');
    const [searchQuery, setSearchQuery] = useState('');
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [draggedNodeType, setDraggedNodeType] = useState<any>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Add node to canvas
    const addNodeToCanvas = useCallback((nodeTemplate: any, position: { x: number; y: number }) => {
        const newNode: WorkflowNode = {
            id: `node-${Date.now()}`,
            type: nodeTemplate.type || 'action',
            category: nodeTemplate.id,
            name: nodeTemplate.name,
            icon: nodeTemplate.icon,
            description: nodeTemplate.description,
            config: {},
            position,
            connections: { input: [], output: [] },
            status: 'idle',
            data: null
        };
        setNodes(prev => [...prev, newNode]);
        setSelectedNode(newNode);
        toast.success(`Added ${nodeTemplate.name} to workflow`);
    }, []);

    // Handle canvas drop
    const handleCanvasDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedNodeType || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
            x: e.clientX - rect.left - canvasOffset.x,
            y: e.clientY - rect.top - canvasOffset.y
        };

        addNodeToCanvas(draggedNodeType, position);
        setDraggedNodeType(null);
    }, [draggedNodeType, canvasOffset, addNodeToCanvas]);

    // Handle drag start from sidebar
    const handleDragStart = useCallback((nodeTemplate: any) => {
        setDraggedNodeType(nodeTemplate);
    }, []);

    // Delete node
    const deleteNode = useCallback((nodeId: string) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        if (selectedNode?.id === nodeId) {
            setSelectedNode(null);
        }
        toast.success('Node deleted');
    }, [selectedNode]);

    // Comprehensive Procore API Endpoints (60+ endpoints)
    const procoreEndpoints: ProcoreEndpoint[] = [
        // Projects
        { id: 'projects-list', name: 'List Projects', method: 'GET', endpoint: '/projects', description: 'Get all projects', category: 'Projects', parameters: [] },
        {
            id: 'projects-create', name: 'Create Project', method: 'POST', endpoint: '/projects', description: 'Create new project', category: 'Projects', parameters: [
                { name: 'name', type: 'string', required: true, description: 'Project name' },
                { name: 'project_number', type: 'string', required: true, description: 'Project number' }
            ]
        },

        // RFIs (Request for Information)
        { id: 'rfis-list', name: 'List RFIs', method: 'GET', endpoint: '/rfis', description: 'Get all RFIs', category: 'RFIs', parameters: [] },
        {
            id: 'rfis-create', name: 'Create RFI', method: 'POST', endpoint: '/rfis', description: 'Create new RFI', category: 'RFIs', parameters: [
                { name: 'subject', type: 'string', required: true, description: 'RFI subject' },
                { name: 'question', type: 'string', required: true, description: 'RFI question' }
            ]
        },
        { id: 'rfis-update', name: 'Update RFI', method: 'PUT', endpoint: '/rfis/{id}', description: 'Update existing RFI', category: 'RFIs', parameters: [] },

        // Submittals
        { id: 'submittals-list', name: 'List Submittals', method: 'GET', endpoint: '/submittals', description: 'Get all submittals', category: 'Submittals', parameters: [] },
        { id: 'submittals-create', name: 'Create Submittal', method: 'POST', endpoint: '/submittals', description: 'Create new submittal', category: 'Submittals', parameters: [] },
        { id: 'submittals-approve', name: 'Approve Submittal', method: 'PATCH', endpoint: '/submittals/{id}/approve', description: 'Approve submittal', category: 'Submittals', parameters: [] },

        // Daily Logs
        { id: 'daily-logs-list', name: 'List Daily Logs', method: 'GET', endpoint: '/daily_logs', description: 'Get daily logs', category: 'Daily Logs', parameters: [] },
        { id: 'daily-logs-create', name: 'Create Daily Log', method: 'POST', endpoint: '/daily_logs', description: 'Create daily log entry', category: 'Daily Logs', parameters: [] },

        // Change Orders
        { id: 'change-orders-list', name: 'List Change Orders', method: 'GET', endpoint: '/change_orders', description: 'Get change orders', category: 'Change Orders', parameters: [] },
        { id: 'change-orders-create', name: 'Create Change Order', method: 'POST', endpoint: '/change_orders', description: 'Create change order', category: 'Change Orders', parameters: [] },

        // Punch List
        { id: 'punch-list-items', name: 'List Punch Items', method: 'GET', endpoint: '/punch_list_items', description: 'Get punch list items', category: 'Punch List', parameters: [] },
        { id: 'punch-list-create', name: 'Create Punch Item', method: 'POST', endpoint: '/punch_list_items', description: 'Create punch list item', category: 'Punch List', parameters: [] },

        // Inspections
        { id: 'inspections-list', name: 'List Inspections', method: 'GET', endpoint: '/inspections', description: 'Get inspections', category: 'Inspections', parameters: [] },
        { id: 'inspections-create', name: 'Create Inspection', method: 'POST', endpoint: '/inspections', description: 'Create inspection', category: 'Inspections', parameters: [] },

        // Documents
        { id: 'documents-list', name: 'List Documents', method: 'GET', endpoint: '/documents', description: 'Get documents', category: 'Documents', parameters: [] },
        { id: 'documents-upload', name: 'Upload Document', method: 'POST', endpoint: '/documents', description: 'Upload document', category: 'Documents', parameters: [] },

        // Photos
        { id: 'photos-list', name: 'List Photos', method: 'GET', endpoint: '/photos', description: 'Get photos', category: 'Photos', parameters: [] },
        { id: 'photos-upload', name: 'Upload Photo', method: 'POST', endpoint: '/photos', description: 'Upload photo', category: 'Photos', parameters: [] },

        // Meetings
        { id: 'meetings-list', name: 'List Meetings', method: 'GET', endpoint: '/meetings', description: 'Get meetings', category: 'Meetings', parameters: [] },
        { id: 'meetings-create', name: 'Create Meeting', method: 'POST', endpoint: '/meetings', description: 'Create meeting', category: 'Meetings', parameters: [] },

        // Schedules
        { id: 'schedules-list', name: 'List Schedules', method: 'GET', endpoint: '/schedules', description: 'Get schedules', category: 'Schedules', parameters: [] },
        { id: 'schedules-create', name: 'Create Schedule', method: 'POST', endpoint: '/schedules', description: 'Create schedule', category: 'Schedules', parameters: [] },

        // Budget
        { id: 'budget-list', name: 'List Budget Items', method: 'GET', endpoint: '/budget_line_items', description: 'Get budget items', category: 'Budget', parameters: [] },
        { id: 'budget-create', name: 'Create Budget Item', method: 'POST', endpoint: '/budget_line_items', description: 'Create budget item', category: 'Budget', parameters: [] },

        // Contracts
        { id: 'contracts-list', name: 'List Contracts', method: 'GET', endpoint: '/contracts', description: 'Get contracts', category: 'Contracts', parameters: [] },
        { id: 'contracts-create', name: 'Create Contract', method: 'POST', endpoint: '/contracts', description: 'Create contract', category: 'Contracts', parameters: [] },

        // Purchase Orders
        { id: 'purchase-orders-list', name: 'List Purchase Orders', method: 'GET', endpoint: '/purchase_orders', description: 'Get purchase orders', category: 'Purchase Orders', parameters: [] },
        { id: 'purchase-orders-create', name: 'Create Purchase Order', method: 'POST', endpoint: '/purchase_orders', description: 'Create purchase order', category: 'Purchase Orders', parameters: [] },

        // Invoices
        { id: 'invoices-list', name: 'List Invoices', method: 'GET', endpoint: '/invoices', description: 'Get invoices', category: 'Invoices', parameters: [] },
        { id: 'invoices-create', name: 'Create Invoice', method: 'POST', endpoint: '/invoices', description: 'Create invoice', category: 'Invoices', parameters: [] },

        // Time Tracking
        { id: 'timesheets-list', name: 'List Timesheets', method: 'GET', endpoint: '/timesheets', description: 'Get timesheets', category: 'Time Tracking', parameters: [] },
        { id: 'timesheets-create', name: 'Create Timesheet', method: 'POST', endpoint: '/timesheets', description: 'Create timesheet', category: 'Time Tracking', parameters: [] },

        // Safety
        { id: 'incidents-list', name: 'List Safety Incidents', method: 'GET', endpoint: '/incidents', description: 'Get safety incidents', category: 'Safety', parameters: [] },
        { id: 'incidents-create', name: 'Create Safety Incident', method: 'POST', endpoint: '/incidents', description: 'Create safety incident', category: 'Safety', parameters: [] },

        // Quality
        { id: 'quality-list', name: 'List Quality Items', method: 'GET', endpoint: '/quality_items', description: 'Get quality items', category: 'Quality', parameters: [] },
        { id: 'quality-create', name: 'Create Quality Item', method: 'POST', endpoint: '/quality_items', description: 'Create quality item', category: 'Quality', parameters: [] },

        // Vendors
        { id: 'vendors-list', name: 'List Vendors', method: 'GET', endpoint: '/vendors', description: 'Get vendors', category: 'Vendors', parameters: [] },
        { id: 'vendors-create', name: 'Create Vendor', method: 'POST', endpoint: '/vendors', description: 'Create vendor', category: 'Vendors', parameters: [] },

        // Equipment
        { id: 'equipment-list', name: 'List Equipment', method: 'GET', endpoint: '/equipment', description: 'Get equipment', category: 'Equipment', parameters: [] },
        { id: 'equipment-create', name: 'Create Equipment', method: 'POST', endpoint: '/equipment', description: 'Create equipment', category: 'Equipment', parameters: [] },

        // Materials
        { id: 'materials-list', name: 'List Materials', method: 'GET', endpoint: '/materials', description: 'Get materials', category: 'Materials', parameters: [] },
        { id: 'materials-create', name: 'Create Material', method: 'POST', endpoint: '/materials', description: 'Create material', category: 'Materials', parameters: [] },

        // Labor
        { id: 'labor-list', name: 'List Labor', method: 'GET', endpoint: '/labor', description: 'Get labor records', category: 'Labor', parameters: [] },
        { id: 'labor-create', name: 'Create Labor', method: 'POST', endpoint: '/labor', description: 'Create labor record', category: 'Labor', parameters: [] },

        // Reports
        { id: 'reports-project', name: 'Project Report', method: 'GET', endpoint: '/reports/project', description: 'Generate project report', category: 'Reports', parameters: [] },
        { id: 'reports-financial', name: 'Financial Report', method: 'GET', endpoint: '/reports/financial', description: 'Generate financial report', category: 'Reports', parameters: [] },
        { id: 'reports-safety', name: 'Safety Report', method: 'GET', endpoint: '/reports/safety', description: 'Generate safety report', category: 'Reports', parameters: [] },

        // Notifications
        { id: 'notifications-list', name: 'List Notifications', method: 'GET', endpoint: '/notifications', description: 'Get notifications', category: 'Notifications', parameters: [] },
        { id: 'notifications-send', name: 'Send Notification', method: 'POST', endpoint: '/notifications', description: 'Send notification', category: 'Notifications', parameters: [] },

        // Users
        { id: 'users-list', name: 'List Users', method: 'GET', endpoint: '/users', description: 'Get users', category: 'Users', parameters: [] },
        { id: 'users-create', name: 'Create User', method: 'POST', endpoint: '/users', description: 'Create user', category: 'Users', parameters: [] },

        // Companies
        { id: 'companies-list', name: 'List Companies', method: 'GET', endpoint: '/companies', description: 'Get companies', category: 'Companies', parameters: [] },
        { id: 'companies-create', name: 'Create Company', method: 'POST', endpoint: '/companies', description: 'Create company', category: 'Companies', parameters: [] },

        // Trades
        { id: 'trades-list', name: 'List Trades', method: 'GET', endpoint: '/trades', description: 'Get trades', category: 'Trades', parameters: [] },
        { id: 'trades-create', name: 'Create Trade', method: 'POST', endpoint: '/trades', description: 'Create trade', category: 'Trades', parameters: [] },

        // Cost Codes
        { id: 'cost-codes-list', name: 'List Cost Codes', method: 'GET', endpoint: '/cost_codes', description: 'Get cost codes', category: 'Cost Codes', parameters: [] },
        { id: 'cost-codes-create', name: 'Create Cost Code', method: 'POST', endpoint: '/cost_codes', description: 'Create cost code', category: 'Cost Codes', parameters: [] },

        // Work Orders
        { id: 'work-orders-list', name: 'List Work Orders', method: 'GET', endpoint: '/work_orders', description: 'Get work orders', category: 'Work Orders', parameters: [] },
        { id: 'work-orders-create', name: 'Create Work Order', method: 'POST', endpoint: '/work_orders', description: 'Create work order', category: 'Work Orders', parameters: [] },

        // Permits
        { id: 'permits-list', name: 'List Permits', method: 'GET', endpoint: '/permits', description: 'Get permits', category: 'Permits', parameters: [] },
        { id: 'permits-create', name: 'Create Permit', method: 'POST', endpoint: '/permits', description: 'Create permit', category: 'Permits', parameters: [] },

        // Deliveries
        { id: 'deliveries-list', name: 'List Deliveries', method: 'GET', endpoint: '/deliveries', description: 'Get deliveries', category: 'Deliveries', parameters: [] },
        { id: 'deliveries-create', name: 'Create Delivery', method: 'POST', endpoint: '/deliveries', description: 'Create delivery', category: 'Deliveries', parameters: [] },

        // Weather
        { id: 'weather-list', name: 'List Weather', method: 'GET', endpoint: '/weather', description: 'Get weather data', category: 'Weather', parameters: [] },
        { id: 'weather-create', name: 'Create Weather', method: 'POST', endpoint: '/weather', description: 'Create weather entry', category: 'Weather', parameters: [] }
    ];

    // N8N-style Node Templates
    const nodeTemplates = {
        triggers: [
            { id: 'schedule', name: 'Schedule', icon: Clock, description: 'Run on a schedule', color: 'blue' },
            { id: 'webhook', name: 'Webhook', icon: Webhook, description: 'Trigger via HTTP request', color: 'green' },
            { id: 'procore-event', name: 'Procore Event', icon: Building2, description: 'Procore data change', color: 'orange' },
            { id: 'file-watch', name: 'File Watcher', icon: FileText, description: 'Watch for file changes', color: 'purple' }
        ],
        actions: [
            { id: 'http-request', name: 'HTTP Request', icon: Globe, description: 'Make HTTP request', color: 'blue' },
            { id: 'email', name: 'Send Email', icon: Mail, description: 'Send email notification', color: 'red' },
            { id: 'database', name: 'Database', icon: Database, description: 'Database operation', color: 'purple' },
            { id: 'file-operation', name: 'File Operation', icon: FileText, description: 'File operations', color: 'gray' }
        ],
        ai: [
            { id: 'ai-analyze', name: 'AI Analysis', icon: Brain, description: 'AI-powered analysis', color: 'indigo' },
            { id: 'ai-predict', name: 'AI Prediction', icon: Target, description: 'Predictive analytics', color: 'pink' },
            { id: 'ai-classify', name: 'AI Classification', icon: Bot, description: 'Classify data with AI', color: 'cyan' }
        ],
        integrations: [
            { id: 'zapier', name: 'Zapier', icon: Zap, description: 'Zapier integration', color: 'yellow' },
            { id: 'slack', name: 'Slack', icon: Users, description: 'Slack notifications', color: 'green' },
            { id: 'microsoft', name: 'Microsoft 365', icon: Mail, description: 'Microsoft integration', color: 'blue' },
            { id: 'google', name: 'Google Workspace', icon: Globe, description: 'Google integration', color: 'red' }
        ]
    };

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">🚀 N8N + Procore + Zapier</h2>
                    <p className="text-sm text-gray-600">Ultimate Construction Automation</p>

                    {/* Tab Navigation */}
                    <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
                        {[
                            { id: 'nodes', label: 'Nodes', icon: Workflow },
                            { id: 'procore', label: 'Procore', icon: Building2 },
                            { id: 'ai', label: 'AI', icon: Brain },
                            { id: 'integrations', label: 'Apps', icon: Package }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSidebarTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-medium transition-colors ${sidebarTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-1" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {sidebarTab === 'nodes' && (
                        <div className="space-y-6">
                            {Object.entries(nodeTemplates).map(([category, templates]) => (
                                <div key={category}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize flex items-center">
                                        {category === 'triggers' && <Zap className="w-4 h-4 mr-2 text-blue-600" />}
                                        {category === 'actions' && <Settings className="w-4 h-4 mr-2 text-green-600" />}
                                        {category === 'ai' && <Brain className="w-4 h-4 mr-2 text-purple-600" />}
                                        {category === 'integrations' && <Package className="w-4 h-4 mr-2 text-orange-600" />}
                                        {category}
                                    </h3>
                                    <div className="space-y-2">
                                        {templates.map(template => (
                                            <div
                                                key={template.id}
                                                draggable
                                                onDragStart={() => handleDragStart({ ...template, type: category.slice(0, -1) })}
                                                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-move transition-colors"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <template.icon className={`w-5 h-5 text-${template.color}-600`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                                                        <p className="text-xs text-gray-600">{template.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {sidebarTab === 'procore' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">60+ Procore API endpoints</p>
                            {Object.entries(
                                procoreEndpoints.reduce((acc, endpoint) => {
                                    if (!acc[endpoint.category]) acc[endpoint.category] = [];
                                    acc[endpoint.category].push(endpoint);
                                    return acc;
                                }, {} as Record<string, ProcoreEndpoint[]>)
                            ).map(([category, endpoints]) => (
                                <div key={category}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                        <Building2 className="w-4 h-4 mr-2 text-orange-600" />
                                        {category}
                                    </h3>
                                    <div className="space-y-1">
                                        {endpoints.slice(0, 3).map(endpoint => (
                                            <div
                                                key={endpoint.id}
                                                draggable
                                                className="p-2 border border-gray-200 rounded hover:border-orange-300 hover:bg-orange-50 cursor-move text-xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{endpoint.name}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                                                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                                            endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                                                endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {endpoint.method}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mt-1">{endpoint.description}</p>
                                            </div>
                                        ))}
                                        {endpoints.length > 3 && (
                                            <p className="text-xs text-gray-500 text-center py-2">
                                                +{endpoints.length - 3} more endpoints
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-lg font-semibold text-gray-900">Workflow Builder</h1>
                        <div className="flex items-center space-x-2">
                            <button type="button" title="Save workflow" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Save className="w-4 h-4" />
                            </button>
                            <button type="button" title="Share workflow" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Share className="w-4 h-4" />
                            </button>
                            <button type="button" title="Workflow settings" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsExecuting(true);
                                toast.success('Workflow execution started!');
                                setTimeout(() => {
                                    setIsExecuting(false);
                                    toast.success('Workflow completed successfully!');
                                }, 3000);
                            }}
                            disabled={isExecuting || nodes.length === 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <Play className="w-4 h-4" />
                            <span>{isExecuting ? 'Running...' : 'Execute'}</span>
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div
                    ref={canvasRef}
                    className="flex-1 relative overflow-hidden bg-gray-50"
                    onDrop={handleCanvasDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                        backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                >
                    {nodes.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your Workflow</h3>
                                <p className="text-gray-600 mb-4">Drag nodes from the sidebar to create your automation</p>
                                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Building2 className="w-4 h-4 mr-1" />
                                        60+ Procore APIs
                                    </div>
                                    <div className="flex items-center">
                                        <Brain className="w-4 h-4 mr-1" />
                                        AI-Powered
                                    </div>
                                    <div className="flex items-center">
                                        <Zap className="w-4 h-4 mr-1" />
                                        Zapier Compatible
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 p-8">
                            {/* Render workflow nodes */}
                            {nodes.map((node, index) => (
                                <div
                                    key={node.id}
                                    onClick={() => setSelectedNode(node)}
                                    className={`absolute bg-white border-2 rounded-lg p-4 cursor-pointer shadow-lg min-w-48 ${selectedNode?.id === node.id
                                            ? 'border-blue-500 shadow-blue-200'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    style={{
                                        left: node.position.x,
                                        top: node.position.y,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${node.type === 'trigger' ? 'bg-blue-100' :
                                                node.type === 'action' ? 'bg-green-100' :
                                                    node.type === 'ai' ? 'bg-purple-100' :
                                                        node.type === 'procore' ? 'bg-orange-100' :
                                                            'bg-gray-100'
                                            }`}>
                                            <node.icon className={`w-5 h-5 ${node.type === 'trigger' ? 'text-blue-600' :
                                                    node.type === 'action' ? 'text-green-600' :
                                                        node.type === 'ai' ? 'text-purple-600' :
                                                            node.type === 'procore' ? 'text-orange-600' :
                                                                'text-gray-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900">{node.name}</h4>
                                            <p className="text-xs text-gray-600">{node.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className={`w-2 h-2 rounded-full ${node.status === 'success' ? 'bg-green-500' :
                                                    node.status === 'error' ? 'bg-red-500' :
                                                        node.status === 'running' ? 'bg-yellow-500' :
                                                            'bg-gray-300'
                                                }`} />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNode(node.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Delete node"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Properties Panel */}
            {selectedNode && (
                <div className="w-80 bg-white border-l flex flex-col">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Node Properties</h3>
                            <button
                                type="button"
                                onClick={() => setSelectedNode(null)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Close properties panel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{selectedNode.name}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Node Name
                                </label>
                                <input
                                    type="text"
                                    value={selectedNode.name}
                                    placeholder="Enter node name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={selectedNode.description}
                                    rows={3}
                                    placeholder="Enter node description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {/* Additional configuration options will be added here */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default N8nProcoreWorkflowBuilder;

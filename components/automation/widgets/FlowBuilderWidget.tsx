import React, { useState, useCallback } from 'react';
import { BaseWidget, WidgetAction } from './BaseWidget';
import {
    Workflow,
    Play,
    Save,
    Share2,
    Sparkles,
    Plus,
    Zap,
    Clock,
    GitBranch,
    CheckCircle,
    Mail,
    Database,
    Code,
    Globe,
    FileText,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FlowNode {
    id: string;
    type: 'trigger' | 'condition' | 'action' | 'ai' | 'approval';
    label: string;
    icon: React.ReactNode;
    config: any;
    position: { x: number; y: number };
}

interface Flow {
    id: string;
    name: string;
    description: string;
    nodes: FlowNode[];
    status: 'draft' | 'active' | 'paused';
    runs: number;
    lastRun?: Date;
}

export const FlowBuilderWidget: React.FC = () => {
    const [flows, setFlows] = useState<Flow[]>([
        {
            id: 'flow-1',
            name: 'RFQ Auto-Notification',
            description: 'Automatically notify vendors when new RFQ is created',
            nodes: [],
            status: 'active',
            runs: 45,
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            id: 'flow-2',
            name: 'Bid Comparison Report',
            description: 'Generate comparison when 3 bids received',
            nodes: [],
            status: 'active',
            runs: 12,
            lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
            id: 'flow-3',
            name: 'Budget Alert',
            description: 'Alert when project budget exceeds 80%',
            nodes: [],
            status: 'draft',
            runs: 0
        }
    ]);

    const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);

    // Available node types
    const nodeTypes = [
        {
            type: 'trigger',
            label: 'Triggers',
            nodes: [
                { icon: <FileText size={16} />, label: 'RFQ Created', id: 'rfq-created' },
                { icon: <CheckCircle size={16} />, label: 'Bid Submitted', id: 'bid-submitted' },
                { icon: <Clock size={16} />, label: 'Schedule', id: 'schedule' },
                { icon: <Globe size={16} />, label: 'Webhook', id: 'webhook' }
            ]
        },
        {
            type: 'condition',
            label: 'Conditions',
            nodes: [
                { icon: <GitBranch size={16} />, label: 'If/Else', id: 'if-else' },
                { icon: <CheckCircle size={16} />, label: 'Compare Values', id: 'compare' },
                { icon: <Database size={16} />, label: 'Check Data', id: 'check-data' }
            ]
        },
        {
            type: 'action',
            label: 'Actions',
            nodes: [
                { icon: <Mail size={16} />, label: 'Send Email', id: 'send-email' },
                { icon: <Database size={16} />, label: 'Update Database', id: 'update-db' },
                { icon: <FileText size={16} />, label: 'Create Document', id: 'create-doc' },
                { icon: <Globe size={16} />, label: 'HTTP Request', id: 'http-request' }
            ]
        },
        {
            type: 'ai',
            label: 'AI Tools',
            nodes: [
                { icon: <Sparkles size={16} />, label: 'AI Analysis', id: 'ai-analysis' },
                { icon: <FileText size={16} />, label: 'Generate Text', id: 'generate-text' },
                { icon: <Code size={16} />, label: 'Extract Data', id: 'extract-data' }
            ]
        }
    ];

    const handleCreateFlow = () => {
        setShowBuilder(true);
        toast.success('Opening flow builder...');
    };

    const handleRunFlow = async (flow: Flow) => {
        toast.loading('Running flow...', { duration: 2000 });

        // Simulate flow execution
        setTimeout(() => {
            setFlows(prev => prev.map(f =>
                f.id === flow.id
                    ? { ...f, runs: f.runs + 1, lastRun: new Date() }
                    : f
            ));
            toast.success('Flow executed successfully!');
        }, 2000);
    };

    const handleToggleFlowStatus = (flow: Flow) => {
        const newStatus = flow.status === 'active' ? 'paused' : 'active';
        setFlows(prev => prev.map(f =>
            f.id === flow.id ? { ...f, status: newStatus } : f
        ));
        toast.success(`Flow ${newStatus === 'active' ? 'activated' : 'paused'}`);
    };

    const actions: WidgetAction[] = [
        {
            icon: <Plus size={16} />,
            label: 'Create Flow',
            onClick: handleCreateFlow,
            variant: 'primary'
        },
        {
            icon: <Sparkles size={16} />,
            label: 'AI Generate',
            onClick: () => {
                toast('AI Flow Generation coming soon!', { icon: '🤖' });
            },
            variant: 'secondary'
        }
    ];

    const getStatusBadge = (status: Flow['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            paused: 'bg-yellow-100 text-yellow-700',
            draft: 'bg-slate-100 text-slate-600'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatLastRun = (date?: Date) => {
        if (!date) return 'Never';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    return (
        <>
            <BaseWidget
                id="flow-builder"
                title="No-Code Flow Builder"
                icon={<Workflow size={20} />}
                collapsible={true}
                expandable={true}
                defaultCollapsed={false}
                actions={actions}
                className="flow-builder-widget"
            >
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-emerald-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Workflow className="text-emerald-600" size={18} />
                                <span className="text-sm font-medium text-slate-600">Total Flows</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{flows.length}</div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="text-blue-600" size={18} />
                                <span className="text-sm font-medium text-slate-600">Active</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                                {flows.filter(f => f.status === 'active').length}
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Play className="text-purple-600" size={18} />
                                <span className="text-sm font-medium text-slate-600">Total Runs</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                                {flows.reduce((sum, f) => sum + f.runs, 0)}
                            </div>
                        </div>
                    </div>

                    {/* Flows List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-700">Your Flows</h4>

                        {flows.map(flow => (
                            <div
                                key={flow.id}
                                className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-semibold text-slate-900">{flow.name}</h5>
                                            {getStatusBadge(flow.status)}
                                        </div>
                                        <p className="text-sm text-slate-600">{flow.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Play size={14} />
                                            {flow.runs} runs
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {formatLastRun(flow.lastRun)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {flow.status !== 'draft' && (
                                            <button
                                                onClick={() => handleRunFlow(flow)}
                                                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                                                title="Run Flow"
                                            >
                                                <Play size={14} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleToggleFlowStatus(flow)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${flow.status === 'active'
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                            title={flow.status === 'active' ? 'Pause Flow' : 'Activate Flow'}
                                        >
                                            {flow.status === 'active' ? 'Pause' : 'Activate'}
                                        </button>

                                        <button
                                            onClick={() => setSelectedFlow(flow)}
                                            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                                            title="Edit Flow"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Templates */}
                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-emerald-600" size={18} />
                            <h4 className="text-sm font-semibold text-slate-900">Flow Templates</h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                            Start with pre-built templates for common workflows
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 transition-colors text-left">
                                📋 Auto-approve small purchases
                            </button>
                            <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 transition-colors text-left">
                                📧 Daily progress report
                            </button>
                            <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 transition-colors text-left">
                                ⚠️ Safety incident alerts
                            </button>
                            <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 transition-colors text-left">
                                💰 Invoice reminders
                            </button>
                        </div>
                    </div>
                </div>
            </BaseWidget>

            {/* Flow Builder Modal (Canvas) */}
            {showBuilder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Flow Builder</h3>
                                <p className="text-sm text-slate-600">Drag and drop nodes to create your workflow</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                                    <Save size={16} className="inline mr-2" />
                                    Save
                                </button>
                                <button
                                    onClick={() => setShowBuilder(false)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                    title="Close Builder"
                                >
                                    Done
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Node Palette */}
                            <div className="w-64 border-r border-slate-200 overflow-y-auto p-4 bg-slate-50">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Components</h4>

                                {nodeTypes.map(category => (
                                    <div key={category.type} className="mb-4">
                                        <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                            {category.label}
                                        </div>
                                        <div className="space-y-1">
                                            {category.nodes.map(node => (
                                                <button
                                                    key={node.id}
                                                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                                                >
                                                    {node.icon}
                                                    <span>{node.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Canvas */}
                            <div className="flex-1 bg-slate-100 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <Workflow className="mx-auto mb-4 text-slate-300" size={64} />
                                        <h4 className="text-lg font-semibold text-slate-600 mb-2">
                                            Drag nodes from the palette
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            React Flow integration coming in next update
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

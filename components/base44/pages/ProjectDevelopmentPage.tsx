/**
 * Project Development Dashboard
 * Comprehensive view of all platform features and modules
 */

import React, { useState } from 'react';

interface Module {
    id: string;
    name: string;
    icon: string;
    description: string;
    status: 'active' | 'in-progress' | 'planned';
    features: string[];
    color: string;
}

export const ProjectDevelopmentPage: React.FC = () => {
    const [selectedModule, setSelectedModule] = useState<string | null>(null);

    const modules: Module[] = [
        {
            id: 'core',
            name: 'Core Platform',
            icon: '🏗️',
            description: 'Essential construction management features',
            status: 'active',
            color: 'blue',
            features: [
                'Project Management',
                'Task Tracking',
                'Daily Logs',
                'Photo Gallery',
                'Document Management',
                'Team Collaboration',
            ],
        },
        {
            id: 'rfi',
            name: 'RFI Management',
            icon: '📋',
            description: 'Request for Information system',
            status: 'active',
            color: 'purple',
            features: [
                'Create RFIs',
                'Track Status',
                'Assign Reviewers',
                'Response Management',
                'Document Attachments',
                'Email Notifications',
            ],
        },
        {
            id: 'punchlist',
            name: 'Punch List',
            icon: '✓',
            description: 'Quality control and defect tracking',
            status: 'active',
            color: 'green',
            features: [
                'Item Creation',
                'Priority Levels',
                'Photo Documentation',
                'Status Tracking',
                'Assignment System',
                'Completion Reports',
            ],
        },
        {
            id: 'drawings',
            name: 'Drawings & Plans',
            icon: '📐',
            description: 'Blueprint and plan management',
            status: 'active',
            color: 'indigo',
            features: [
                'Drawing Upload',
                'Version Control',
                'Markup Tools',
                'Comparison View',
                'Sheet Management',
                'PDF Viewer',
            ],
        },
        {
            id: 'daywork',
            name: 'Daywork Sheets',
            icon: '📊',
            description: 'Daily work tracking and reporting',
            status: 'active',
            color: 'yellow',
            features: [
                'Labor Tracking',
                'Equipment Hours',
                'Material Usage',
                'Weather Conditions',
                'Progress Notes',
                'Approval Workflow',
            ],
        },
        {
            id: 'financial',
            name: 'Financial Management',
            icon: '💰',
            description: 'Accounting and financial tracking',
            status: 'active',
            color: 'emerald',
            features: [
                'Invoicing',
                'Budget Tracking',
                'Cost Analysis',
                'Payment Tracking',
                'Financial Reports',
                'Profit/Loss Analysis',
            ],
        },
        {
            id: 'subcontractors',
            name: 'Subcontractor Management',
            icon: '👷',
            description: 'Manage subcontractors and vendors',
            status: 'active',
            color: 'orange',
            features: [
                'Contractor Database',
                'Contract Management',
                'Performance Tracking',
                'Payment Schedules',
                'Insurance Tracking',
                'Compliance Management',
            ],
        },
        {
            id: 'timetracking',
            name: 'Time Tracking',
            icon: '⏱️',
            description: 'Employee time and attendance',
            status: 'active',
            color: 'cyan',
            features: [
                'Clock In/Out',
                'Timesheet Management',
                'Overtime Tracking',
                'Project Time Allocation',
                'Payroll Integration',
                'Reports & Analytics',
            ],
        },
        {
            id: 'ai-tools',
            name: 'AI Tools',
            icon: '🤖',
            description: 'Artificial intelligence features',
            status: 'in-progress',
            color: 'violet',
            features: [
                'AI Chatbot Assistant',
                'Document Analysis',
                'Predictive Analytics',
                'Smart Scheduling',
                'Risk Assessment',
                'Cost Estimation',
            ],
        },
        {
            id: 'ml-analytics',
            name: 'ML & Analytics',
            icon: '📈',
            description: 'Machine learning and advanced analytics',
            status: 'in-progress',
            color: 'pink',
            features: [
                'Performance Metrics',
                'Trend Analysis',
                'Predictive Models',
                'Custom Dashboards',
                'Data Visualization',
                'Automated Reports',
            ],
        },
        {
            id: 'business-dev',
            name: 'Business Development',
            icon: '🎯',
            description: 'Sales and client management',
            status: 'planned',
            color: 'rose',
            features: [
                'Lead Management',
                'Proposal Generation',
                'Client Portal',
                'Bid Management',
                'Sales Pipeline',
                'CRM Integration',
            ],
        },
        {
            id: 'marketplace',
            name: 'AI Agents Marketplace',
            icon: '🛒',
            description: 'Custom AI agents and integrations',
            status: 'planned',
            color: 'fuchsia',
            features: [
                'Agent Library',
                'Custom Workflows',
                'Third-party Integrations',
                'API Marketplace',
                'Plugin System',
                'Developer Tools',
            ],
        },
    ];

    const getStatusBadge = (status: Module['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            planned: 'bg-gray-100 text-gray-800',
        };
        const labels = {
            active: 'Active',
            'in-progress': 'In Progress',
            planned: 'Planned',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
            purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
            green: 'bg-green-50 border-green-200 hover:border-green-400',
            indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
            yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
            emerald: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
            orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
            cyan: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
            violet: 'bg-violet-50 border-violet-200 hover:border-violet-400',
            pink: 'bg-pink-50 border-pink-200 hover:border-pink-400',
            rose: 'bg-rose-50 border-rose-200 hover:border-rose-400',
            fuchsia: 'bg-fuchsia-50 border-fuchsia-200 hover:border-fuchsia-400',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🚀 Project Development Dashboard
                </h1>
                <p className="text-gray-600">
                    Comprehensive overview of all ConstructAI platform features and modules
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Total Modules</div>
                    <div className="text-3xl font-bold text-gray-900">{modules.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Active</div>
                    <div className="text-3xl font-bold text-green-600">
                        {modules.filter(m => m.status === 'active').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">In Progress</div>
                    <div className="text-3xl font-bold text-yellow-600">
                        {modules.filter(m => m.status === 'in-progress').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-600 mb-1">Planned</div>
                    <div className="text-3xl font-bold text-gray-600">
                        {modules.filter(m => m.status === 'planned').length}
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <div
                        key={module.id}
                        className={`bg-white rounded-lg border-2 shadow-sm transition-all cursor-pointer ${getColorClasses(module.color)} ${
                            selectedModule === module.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{module.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{module.name}</h3>
                                        {getStatusBadge(module.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                            {/* Features */}
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-gray-700 uppercase">
                                    Features ({module.features.length})
                                </div>
                                <ul className="space-y-1">
                                    {module.features.slice(0, selectedModule === module.id ? undefined : 3).map((feature, idx) => (
                                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                {module.features.length > 3 && selectedModule !== module.id && (
                                    <button
                                        type="button"
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        +{module.features.length - 3} more features
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


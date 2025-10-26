// components/integrations/ThirdPartyIntegrations.tsx
import React, { useState, useEffect } from 'react';
import {
    ExternalLink,
    CheckCircle,
    XCircle,
    RefreshCw,
    Settings,
    DollarSign,
    Calendar,
    MessageSquare,
    Cloud,
    Shield,
    Zap,
    AlertTriangle,
    Info,
    Plus,
    Trash2,
    Edit,
    Key,
    Link,
    Unlink,
    CreditCard
} from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    description: string;
    category: 'accounting' | 'payment' | 'communication' | 'storage' | 'productivity';
    icon: React.ComponentType<any>;
    status: 'connected' | 'disconnected' | 'error' | 'pending';
    lastSync?: string;
    syncStatus?: 'success' | 'error' | 'pending';
    features: string[];
    setupRequired: boolean;
    apiKey?: string;
    webhookUrl?: string;
    permissions: string[];
    dataFlow: {
        direction: 'inbound' | 'outbound' | 'bidirectional';
        frequency: 'realtime' | 'hourly' | 'daily' | 'manual';
        lastSync?: string;
    };
}

interface ThirdPartyIntegrationsProps {
    currentUser: any;
    onIntegrationConnect: (integrationId: string) => void;
    onIntegrationDisconnect: (integrationId: string) => void;
    onIntegrationConfigure: (integrationId: string) => void;
    className?: string;
}

export const ThirdPartyIntegrations: React.FC<ThirdPartyIntegrationsProps> = ({
    currentUser,
    onIntegrationConnect,
    onIntegrationDisconnect,
    onIntegrationConfigure,
    className = ""
}) => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showSetupModal, setShowSetupModal] = useState<string | null>(null);

    // Mock integrations - replace with actual API calls
    const mockIntegrations: Integration[] = [
        {
            id: 'quickbooks',
            name: 'QuickBooks Online',
            description: 'Sync invoices, expenses, and financial data with QuickBooks Online',
            category: 'accounting',
            icon: DollarSign,
            status: 'connected',
            lastSync: '2024-01-20T10:30:00Z',
            syncStatus: 'success',
            features: ['Invoice Sync', 'Expense Tracking', 'Financial Reports', 'Tax Integration'],
            setupRequired: false,
            permissions: ['Read invoices', 'Write expenses', 'Access reports'],
            dataFlow: {
                direction: 'bidirectional',
                frequency: 'hourly',
                lastSync: '2024-01-20T10:30:00Z'
            }
        },
        {
            id: 'stripe',
            name: 'Stripe Payments',
            description: 'Process payments and manage subscriptions through Stripe',
            category: 'payment',
            icon: CreditCard,
            status: 'connected',
            lastSync: '2024-01-20T10:25:00Z',
            syncStatus: 'success',
            features: ['Payment Processing', 'Subscription Management', 'Invoice Generation', 'Refund Handling'],
            setupRequired: false,
            permissions: ['Process payments', 'Manage subscriptions', 'Access transaction data'],
            dataFlow: {
                direction: 'bidirectional',
                frequency: 'realtime',
                lastSync: '2024-01-20T10:25:00Z'
            }
        },
        {
            id: 'google-calendar',
            name: 'Google Calendar',
            description: 'Sync project deadlines and team schedules with Google Calendar',
            category: 'productivity',
            icon: Calendar,
            status: 'disconnected',
            features: ['Event Sync', 'Deadline Tracking', 'Team Scheduling', 'Meeting Integration'],
            setupRequired: true,
            permissions: ['Read calendar', 'Create events', 'Update events'],
            dataFlow: {
                direction: 'bidirectional',
                frequency: 'hourly'
            }
        },
        {
            id: 'slack',
            name: 'Slack',
            description: 'Send project notifications and updates to Slack channels',
            category: 'communication',
            icon: MessageSquare,
            status: 'connected',
            lastSync: '2024-01-20T09:45:00Z',
            syncStatus: 'success',
            features: ['Project Notifications', 'Team Updates', 'File Sharing', 'Bot Commands'],
            setupRequired: false,
            permissions: ['Send messages', 'Upload files', 'Create channels'],
            dataFlow: {
                direction: 'outbound',
                frequency: 'realtime',
                lastSync: '2024-01-20T09:45:00Z'
            }
        },
        {
            id: 'microsoft-teams',
            name: 'Microsoft Teams',
            description: 'Integrate with Microsoft Teams for project communication',
            category: 'communication',
            icon: MessageSquare,
            status: 'disconnected',
            features: ['Team Chat', 'Video Meetings', 'File Collaboration', 'Project Updates'],
            setupRequired: true,
            permissions: ['Send messages', 'Schedule meetings', 'Access files'],
            dataFlow: {
                direction: 'bidirectional',
                frequency: 'hourly'
            }
        },
        {
            id: 'dropbox',
            name: 'Dropbox',
            description: 'Sync project files and documents with Dropbox storage',
            category: 'storage',
            icon: Cloud,
            status: 'error',
            lastSync: '2024-01-19T15:20:00Z',
            syncStatus: 'error',
            features: ['File Sync', 'Document Sharing', 'Version Control', 'Backup'],
            setupRequired: true,
            permissions: ['Read files', 'Write files', 'Share files'],
            dataFlow: {
                direction: 'bidirectional',
                frequency: 'hourly',
                lastSync: '2024-01-19T15:20:00Z'
            }
        },
        {
            id: 'google-drive',
            name: 'Google Drive',
            description: 'Store and share project documents through Google Drive',
            category: 'storage',
            icon: Cloud,
            status: 'disconnected',
            features: ['Document Storage', 'File Sharing', 'Collaborative Editing', 'Version History'],
            setupRequired: true,
            permissions: ['Read files', 'Write files', 'Share files'],
            dataFlow: {
                direction: 'bidirectional',
                frequency: 'daily'
            }
        },
        {
            id: 'xero',
            name: 'Xero',
            description: 'Alternative accounting integration with Xero for financial management',
            category: 'accounting',
            icon: DollarSign,
            status: 'disconnected',
            features: ['Invoice Management', 'Expense Tracking', 'Bank Reconciliation', 'Financial Reporting'],
            setupRequired: true,
            permissions: ['Read invoices', 'Write expenses', 'Access reports'],
            dataFlow: {
                direction: 'bidirectional',
                frequency: 'daily'
            }
        }
    ];

    useEffect(() => {
        const loadIntegrations = async () => {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIntegrations(mockIntegrations);
            setLoading(false);
        };

        loadIntegrations();
    }, []);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'accounting': return <DollarSign className="w-5 h-5 text-green-600" />;
            case 'payment': return <CreditCard className="w-5 h-5 text-blue-600" />;
            case 'communication': return <MessageSquare className="w-5 h-5 text-purple-600" />;
            case 'storage': return <Cloud className="w-5 h-5 text-gray-600" />;
            case 'productivity': return <Calendar className="w-5 h-5 text-orange-600" />;
            default: return <ExternalLink className="w-5 h-5 text-gray-600" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'accounting': return 'bg-green-50 text-green-700 border-green-200';
            case 'payment': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'communication': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'storage': return 'bg-gray-50 text-gray-700 border-gray-200';
            case 'productivity': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'disconnected': return <XCircle className="w-5 h-5 text-gray-400" />;
            case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'pending': return <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />;
            default: return <XCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-50';
            case 'disconnected': return 'text-gray-600 bg-gray-50';
            case 'error': return 'text-red-600 bg-red-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getSyncStatusColor = (syncStatus?: string) => {
        switch (syncStatus) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'pending': return 'text-yellow-600';
            default: return 'text-gray-400';
        }
    };

    const filteredIntegrations = integrations.filter(integration =>
        selectedCategory === 'all' || integration.category === selectedCategory
    );

    const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))];

    const handleConnect = (integrationId: string) => {
        setShowSetupModal(integrationId);
        onIntegrationConnect(integrationId);
    };

    const handleDisconnect = (integrationId: string) => {
        onIntegrationDisconnect(integrationId);
    };

    const handleConfigure = (integrationId: string) => {
        onIntegrationConfigure(integrationId);
    };

    if (loading) {
        return (
            <div className={`third-party-integrations ${className}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading integrations...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`third-party-integrations ${className}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ExternalLink className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Third-Party Integrations</h2>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {integrations.filter(i => i.status === 'connected').length} connected
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Integrations */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIntegrations.map(integration => {
                            const IconComponent = integration.icon;

                            return (
                                <div
                                    key={integration.id}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <IconComponent className="w-8 h-8 text-gray-600" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(integration.category)}`}>
                                                    {integration.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {getStatusIcon(integration.status)}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4">{integration.description}</p>

                                    {/* Features */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {integration.features.slice(0, 3).map(feature => (
                                                <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {feature}
                                                </span>
                                            ))}
                                            {integration.features.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    +{integration.features.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sync Status */}
                                    {integration.lastSync && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Last sync:</span>
                                                <span className={`font-medium ${getSyncStatusColor(integration.syncStatus)}`}>
                                                    {new Date(integration.lastSync).toLocaleString()}
                                                </span>
                                            </div>
                                            {integration.dataFlow && (
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                                    <span>{integration.dataFlow.frequency}</span>
                                                    <span>{integration.dataFlow.direction}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {integration.status === 'connected' ? (
                                            <>
                                                <button
                                                    onClick={() => handleConfigure(integration.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Configure
                                                </button>
                                                <button
                                                    onClick={() => handleDisconnect(integration.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                                >
                                                    <Unlink className="w-4 h-4" />
                                                    Disconnect
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleConnect(integration.id)}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                            >
                                                <Link className="w-4 h-4" />
                                                Connect
                                            </button>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {integration.status === 'error' && (
                                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                                            Connection error. Click configure to retry.
                                        </div>
                                    )}

                                    {/* Setup Required */}
                                    {integration.setupRequired && integration.status === 'disconnected' && (
                                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                            <Info className="w-3 h-3 inline mr-1" />
                                            Setup required before connecting.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filteredIntegrations.length === 0 && (
                        <div className="text-center py-12">
                            <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                            <p className="text-gray-600">Try adjusting your category filter or add new integrations.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Setup Modal */}
            {showSetupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Setup Integration</h3>
                            <button
                                onClick={() => setShowSetupModal(null)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                <input
                                    type="password"
                                    placeholder="Enter your API key"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://your-domain.com/webhook"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSetupModal(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowSetupModal(null)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';
import { Bot, Download, Star, TrendingUp, Filter, Search, Play, Clock, CheckCircle } from 'lucide-react';

interface AIAgent {
    id: string;
    name: string;
    description: string;
    category: string;
    version: string;
    isPublic: boolean;
    price: number;
    subscriptions: number;
    rating: number;
    createdAt: string;
}

interface AgentExecution {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt: string;
    completedAt: string | null;
    duration: number | null;
    errorMessage: string | null;
}

export const AgentMarketplace: React.FC = () => {
    const [agents, setAgents] = useState<AIAgent[]>([]);
    const [subscribedAgents, setSubscribedAgents] = useState<AIAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'marketplace' | 'subscribed'>('marketplace');
    const [executingAgent, setExecutingAgent] = useState<string | null>(null);
    const { showSuccess, showError, showInfo } = useToast();

    const categories = [
        { id: 'all', label: 'All Agents', icon: Bot },
        { id: 'automation', label: 'Automation', icon: TrendingUp },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'safety', label: 'Safety', icon: CheckCircle },
        { id: 'financial', label: 'Financial', icon: TrendingUp },
        { id: 'communication', label: 'Communication', icon: TrendingUp },
        { id: 'integration', label: 'Integration', icon: Download }
    ];

    useEffect(() => {
        loadMarketplaceAgents();
        loadSubscribedAgents();
    }, [selectedCategory, searchQuery]);

    const loadMarketplaceAgents = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await axios.get('/api/agents/marketplace', { params });
            setAgents(response.data.agents || []);
        } catch (error) {
            console.error('Failed to load agents:', error);
            showError('Failed to Load', 'Could not load marketplace agents. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadSubscribedAgents = async () => {
        try {
            const response = await axios.get('/api/agents/subscriptions/my');
            setSubscribedAgents(response.data.agents || []);
        } catch (error) {
            console.error('Failed to load subscriptions:', error);
            showError('Failed to Load', 'Could not load your subscriptions.');
        }
    };

    const handleSubscribe = async (agentId: string) => {
        try {
            await axios.post(`/api/agents/${agentId}/subscribe`, {});
            showSuccess('Subscribed!', 'Successfully subscribed to agent');
            loadSubscribedAgents();
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.error || 'Failed to subscribe'
                : 'An unexpected error occurred';
            showError('Subscription Failed', errorMessage);
        }
    };

    const handleExecuteAgent = async (agentId: string) => {
        try {
            setExecutingAgent(agentId);
            showInfo('Executing Agent', 'Agent execution started...');

            // Example input - in production, show a form to collect user input
            const input = {
                action: 'analyze',
                data: {
                    projectId: 'current-project',
                    timestamp: new Date().toISOString()
                }
            };

            const response = await axios.post(`/api/agents/${agentId}/execute`, { input });
            const executionId = response.data.executionId;

            // Poll for execution status
            const checkStatus = async () => {
                const statusResponse = await axios.get(`/api/agents/executions/${executionId}`);
                const execution: AgentExecution = statusResponse.data.execution;

                if (execution.status === 'completed') {
                    showSuccess('Execution Complete', 'Agent executed successfully!');
                    setExecutingAgent(null);
                } else if (execution.status === 'failed') {
                    showError('Execution Failed', execution.errorMessage || 'Agent execution failed');
                    setExecutingAgent(null);
                } else {
                    // Still running, check again in 2 seconds
                    setTimeout(checkStatus, 2000);
                }
            };

            checkStatus();
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.error || 'Failed to execute agent'
                : 'An unexpected error occurred';
            showError('Execution Failed', errorMessage);
            setExecutingAgent(null);
        }
    }; const renderAgentCard = (agent: AIAgent, isSubscribed: boolean = false) => (
        <div key={agent.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{agent.name}</h3>
                        <span className="text-sm text-gray-500">{agent.category}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{agent.rating.toFixed(1)}</span>
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        {agent.subscriptions} users
                    </span>
                    <span>v{agent.version}</span>
                </div>
                <span className="font-semibold text-gray-900">
                    {agent.price > 0 ? `$${agent.price}/mo` : 'Free'}
                </span>
            </div>

            <div className="flex space-x-2">
                {isSubscribed ? (
                    <button
                        onClick={() => handleExecuteAgent(agent.id)}
                        disabled={executingAgent === agent.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {executingAgent === agent.id ? (
                            <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Execute
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => handleSubscribe(agent.id)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Subscribe
                    </button>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Details
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Agent Marketplace</h1>
                        <p className="text-gray-600">Discover and deploy AI-powered automation agents</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'marketplace'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Marketplace ({agents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('subscribed')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'subscribed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        My Agents ({subscribedAgents.length})
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Search agents"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            aria-label="Filter agents by category"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'marketplace'
                            ? agents.map((agent) => renderAgentCard(agent, false))
                            : subscribedAgents.map((agent) => renderAgentCard(agent, true))}
                    </div>
                )}

                {!loading && ((activeTab === 'marketplace' && agents.length === 0) ||
                    (activeTab === 'subscribed' && subscribedAgents.length === 0)) && (
                        <div className="text-center py-12">
                            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {activeTab === 'marketplace' ? 'No agents found' : 'No subscribed agents'}
                            </h3>
                            <p className="text-gray-600">
                                {activeTab === 'marketplace'
                                    ? 'Try adjusting your search or filters'
                                    : 'Subscribe to agents from the marketplace to get started'}
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
};

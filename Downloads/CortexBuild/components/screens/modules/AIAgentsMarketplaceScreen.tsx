import React, { useState } from 'react';
import { User, AIAgent, CompanySubscription } from '../../../types';
import { useAIAgents } from '../../../hooks/useAIAgents';

interface AIAgentsMarketplaceScreenProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    goBack: () => void;
}

const AIAgentsMarketplaceScreen: React.FC<AIAgentsMarketplaceScreenProps> = ({
    currentUser,
    navigateTo,
    goBack
}) => {
    const {
        availableAgents,
        companySubscriptions,
        isLoading,
        error,
        subscribeToAgent,
        hasAgentAccess,
        tenantContext
    } = useAIAgents(currentUser);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [subscribingTo, setSubscribingTo] = useState<string | null>(null);

    const categories = [
        { id: 'all', name: 'All Agents', icon: '🤖' },
        { id: 'safety', name: 'Safety', icon: '🦺' },
        { id: 'quality', name: 'Quality', icon: '✅' },
        { id: 'productivity', name: 'Productivity', icon: '📈' },
        { id: 'compliance', name: 'Compliance', icon: '📋' },
        { id: 'analytics', name: 'Analytics', icon: '📊' },
        { id: 'documentation', name: 'Documentation', icon: '📄' },
        { id: 'communication', name: 'Communication', icon: '💬' },
        { id: 'planning', name: 'Planning', icon: '📅' }
    ];

    const filteredAgents = selectedCategory === 'all' 
        ? availableAgents 
        : availableAgents.filter(agent => agent.category === selectedCategory);

    const handleSubscribe = async (agent: AIAgent, billingCycle: 'monthly' | 'yearly') => {
        setSubscribingTo(agent.id);
        try {
            const success = await subscribeToAgent(agent.id, billingCycle);
            if (success) {
                // Show success message or navigate to success page
                console.log('✅ Successfully subscribed to', agent.name);
            }
        } catch (error) {
            console.error('❌ Subscription failed:', error);
        } finally {
            setSubscribingTo(null);
        }
    };

    const AgentCard: React.FC<{ agent: AIAgent }> = ({ agent }) => {
        const isSubscribed = hasAgentAccess(agent.id);
        const subscription = companySubscriptions.find(sub => sub.agentId === agent.id);

        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                {agent.isFeatured && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                        ⭐ Featured Agent
                    </div>
                )}
                
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                                {agent.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                    {categories.find(c => c.id === agent.category)?.icon} {agent.category}
                                </span>
                            </div>
                        </div>
                        
                        {isSubscribed && (
                            <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                                <span>✅</span>
                                <span>Active</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{agent.description}</p>

                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {agent.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-gray-500">Pricing:</div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                    ${agent.priceMonthly}/mo
                                </div>
                                <div className="text-sm text-gray-500">
                                    ${agent.priceYearly}/year (save {Math.round((1 - agent.priceYearly / (agent.priceMonthly * 12)) * 100)}%)
                                </div>
                            </div>
                        </div>

                        {isSubscribed ? (
                            <div className="space-y-2">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-green-700 font-medium">
                                            Subscribed ({subscription?.billingCycle})
                                        </span>
                                        <span className="text-green-600">
                                            ${subscription?.pricePaid}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigateTo('ai-agent-detail', { agentId: agent.id })}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Use Agent
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleSubscribe(agent, 'monthly')}
                                    disabled={subscribingTo === agent.id}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400"
                                >
                                    {subscribingTo === agent.id ? 'Subscribing...' : 'Subscribe Monthly'}
                                </button>
                                <button
                                    onClick={() => handleSubscribe(agent, 'yearly')}
                                    disabled={subscribingTo === agent.id}
                                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:bg-gray-400"
                                >
                                    {subscribingTo === agent.id ? 'Subscribing...' : 'Subscribe Yearly'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading && availableAgents.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Agents Marketplace</h1>
                        <p className="text-gray-600 mt-2">
                            Enhance your construction projects with powerful AI agents
                        </p>
                    </div>
                    <button
                        onClick={goBack}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                {/* Tenant Context Info */}
                {tenantContext && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-900">
                                    {tenantContext.company.name} - Active Subscriptions
                                </h3>
                                <p className="text-blue-700 text-sm">
                                    You have {tenantContext.subscriptions.length} active AI agent subscriptions
                                </p>
                            </div>
                            <div className="text-blue-600 text-2xl">🏢</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Category Filter */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedCategory === category.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {category.icon} {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800">{error}</div>
                </div>
            )}

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>

            {filteredAgents.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🤖</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
                    <p className="text-gray-600">
                        {selectedCategory === 'all' 
                            ? 'No AI agents are currently available.' 
                            : `No agents found in the ${selectedCategory} category.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default AIAgentsMarketplaceScreen;

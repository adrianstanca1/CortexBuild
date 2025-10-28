import React from 'react';
import { User, Screen } from '../../types';
import { useAIAgents } from '../../hooks/useAIAgents';

interface AIAgentsWidgetProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
}

const AIAgentsWidget: React.FC<AIAgentsWidgetProps> = ({ currentUser, navigateTo }) => {
    const { 
        companySubscriptions, 
        availableAgents, 
        isLoading, 
        hasAgentAccess,
        tenantContext 
    } = useAIAgents(currentUser);

    const activeSubscriptions = companySubscriptions.filter(sub => sub.status === 'active');
    const featuredAgents = availableAgents.filter(agent => agent.isFeatured).slice(0, 3);

    if (isLoading && companySubscriptions.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">🤖</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Agents</h3>
                        <p className="text-sm text-gray-600">
                            {tenantContext?.company.name} - Multi-tenant AI Platform
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigateTo('ai-agents-marketplace')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    View All →
                </button>
            </div>

            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Active Subscriptions ({activeSubscriptions.length})
                    </h4>
                    <div className="space-y-2">
                        {activeSubscriptions.slice(0, 3).map(subscription => (
                            <div 
                                key={subscription.id}
                                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="text-green-600 text-sm font-bold">
                                            {subscription.agent?.name.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {subscription.agent?.name || 'AI Agent'}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {subscription.agent?.category} • {subscription.billingCycle}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                        Active
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        ${subscription.pricePaid}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {activeSubscriptions.length > 3 && (
                            <div className="text-center">
                                <button
                                    onClick={() => navigateTo('ai-agents-marketplace')}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    +{activeSubscriptions.length - 3} more subscriptions
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Featured Agents (if no subscriptions) */}
            {activeSubscriptions.length === 0 && featuredAgents.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Featured AI Agents
                    </h4>
                    <div className="space-y-2">
                        {featuredAgents.map(agent => (
                            <div 
                                key={agent.id}
                                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                                onClick={() => navigateTo('ai-agents-marketplace')}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-blue-600 text-sm font-bold">
                                            {agent.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {agent.name}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {agent.category} • ${agent.priceMonthly}/mo
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                        ⭐ Featured
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Multi-tenant Info */}
            <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                        <span className="font-medium">Company:</span> {tenantContext?.company.name}
                    </div>
                    <div className="text-gray-600">
                        <span className="font-medium">Available:</span> {availableAgents.length} agents
                    </div>
                </div>
                
                {/* Quick Stats */}
                <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-gray-900">
                            {activeSubscriptions.length}
                        </div>
                        <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-gray-900">
                            {availableAgents.length}
                        </div>
                        <div className="text-xs text-gray-600">Available</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-lg font-bold text-gray-900">
                            ${activeSubscriptions.reduce((sum, sub) => sum + sub.pricePaid, 0).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-600">Monthly</div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            {activeSubscriptions.length === 0 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigateTo('ai-agents-marketplace')}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all text-sm font-medium"
                    >
                        Explore AI Agents Marketplace
                    </button>
                </div>
            )}
        </div>
    );
};

export default AIAgentsWidget;

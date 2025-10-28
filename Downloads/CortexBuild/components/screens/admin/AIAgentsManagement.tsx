import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import * as api from '../../../api';

interface AIAgentsManagementProps {
    currentUser: User;
}

const AIAgentsManagement: React.FC<AIAgentsManagementProps> = ({ currentUser }) => {
    const [agents, setAgents] = useState<api.AIAgent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingAgent, setEditingAgent] = useState<api.AIAgent | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'safety' as api.AIAgent['category'],
        priceMonthly: 0,
        priceYearly: 0,
        features: [] as string[],
        capabilities: [] as string[],
        iconUrl: '',
        bannerUrl: '',
        isActive: true,
        isFeatured: false,
        minPlan: 'basic' as api.AIAgent['minPlan']
    });

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const agentsData = await api.fetchAvailableAIAgents();
            setAgents(agentsData);
        } catch (err: any) {
            console.error('Error loading AI agents:', err);
            setError(err.message || 'Failed to load AI agents');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'safety',
            priceMonthly: 0,
            priceYearly: 0,
            features: [],
            capabilities: [],
            iconUrl: '',
            bannerUrl: '',
            isActive: true,
            isFeatured: false,
            minPlan: 'basic'
        });
        setEditingAgent(null);
        setShowCreateForm(false);
    };

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await api.createAIAgent(currentUser, formData);
            resetForm();
            loadAgents();
        } catch (err: any) {
            setError(err.message || 'Failed to create AI agent');
        }
    };

    const handleEditAgent = (agent: api.AIAgent) => {
        setEditingAgent(agent);
        setFormData({
            name: agent.name,
            description: agent.description,
            category: agent.category,
            priceMonthly: agent.priceMonthly,
            priceYearly: agent.priceYearly,
            features: agent.features,
            capabilities: agent.capabilities,
            iconUrl: agent.iconUrl || '',
            bannerUrl: agent.bannerUrl || '',
            isActive: agent.isActive,
            isFeatured: agent.isFeatured,
            minPlan: agent.minPlan
        });
        setShowCreateForm(true);
    };

    const handleUpdateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await api.updateAIAgent(currentUser, editingAgent!.id, formData);
            resetForm();
            loadAgents();
        } catch (err: any) {
            setError(err.message || 'Failed to update AI agent');
        }
    };

    const handleToggleAgentStatus = async (agentId: string, isActive: boolean) => {
        try {
            await api.toggleAIAgentStatus(currentUser, agentId, isActive);
            loadAgents();
        } catch (err: any) {
            setError(err.message || 'Failed to update agent status');
        }
    };

    const addFeature = () => {
        setFormData({...formData, features: [...formData.features, '']});
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({...formData, features: newFeatures});
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({...formData, features: newFeatures});
    };

    const addCapability = () => {
        setFormData({...formData, capabilities: [...formData.capabilities, '']});
    };

    const updateCapability = (index: number, value: string) => {
        const newCapabilities = [...formData.capabilities];
        newCapabilities[index] = value;
        setFormData({...formData, capabilities: newCapabilities});
    };

    const removeCapability = (index: number) => {
        const newCapabilities = formData.capabilities.filter((_, i) => i !== index);
        setFormData({...formData, capabilities: newCapabilities});
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI Agents Marketplace Management</h3>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create New Agent
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">{error}</div>
                </div>
            )}

            {/* Create/Edit Agent Form */}
            {showCreateForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                        {editingAgent ? 'Edit AI Agent' : 'Create New AI Agent'}
                    </h4>
                    <form onSubmit={editingAgent ? handleUpdateAgent : handleCreateAgent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Agent Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter agent name"
                                    title="Agent Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value as api.AIAgent['category']})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Category"
                                >
                                    <option value="safety">Safety</option>
                                    <option value="quality">Quality</option>
                                    <option value="productivity">Productivity</option>
                                    <option value="compliance">Compliance</option>
                                    <option value="analytics">Analytics</option>
                                    <option value="documentation">Documentation</option>
                                    <option value="communication">Communication</option>
                                    <option value="planning">Planning</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter agent description"
                                title="Description"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Monthly Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.priceMonthly}
                                    onChange={(e) => setFormData({...formData, priceMonthly: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    title="Monthly Price"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Yearly Price ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.priceYearly}
                                    onChange={(e) => setFormData({...formData, priceYearly: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    title="Yearly Price"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Icon URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.iconUrl}
                                    onChange={(e) => setFormData({...formData, iconUrl: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/icon.png"
                                    title="Icon URL"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banner URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.bannerUrl}
                                    onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/banner.png"
                                    title="Banner URL"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Plan
                            </label>
                            <select
                                value={formData.minPlan}
                                onChange={(e) => setFormData({...formData, minPlan: e.target.value as api.AIAgent['minPlan']})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Minimum Plan"
                            >
                                <option value="basic">Basic</option>
                                <option value="professional">Professional</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>

                        {/* Features */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Features
                                </label>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    + Add Feature
                                </button>
                            </div>
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter feature"
                                        title={`Feature ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Capabilities */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Capabilities
                                </label>
                                <button
                                    type="button"
                                    onClick={addCapability}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    + Add Capability
                                </button>
                            </div>
                            {formData.capabilities.map((capability, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="text"
                                        value={capability}
                                        onChange={(e) => updateCapability(index, e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter capability"
                                        title={`Capability ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCapability(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Featured</span>
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {editingAgent ? 'Update Agent' : 'Create Agent'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <div key={agent.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-lg">
                                        {agent.iconUrl ? (
                                            <img src={agent.iconUrl} alt={agent.name} className="w-8 h-8 rounded" />
                                        ) : (
                                            '🤖'
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                        {agent.name}
                                        {agent.isFeatured && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Featured
                                            </span>
                                        )}
                                    </h4>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        agent.category === 'safety' ? 'bg-red-100 text-red-800' :
                                        agent.category === 'quality' ? 'bg-blue-100 text-blue-800' :
                                        agent.category === 'productivity' ? 'bg-green-100 text-green-800' :
                                        'bg-purple-100 text-purple-800'
                                    }`}>
                                        {agent.category}
                                    </span>
                                </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {agent.description}
                        </p>

                        <div className="mb-4">
                            <div className="text-lg font-bold text-gray-900">
                                ${agent.priceMonthly}/mo
                            </div>
                            <div className="text-sm text-gray-500">
                                ${agent.priceYearly}/yr
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleEditAgent(agent)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleToggleAgentStatus(agent.id, !agent.isActive)}
                                className={`text-sm font-medium ${
                                    agent.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                                }`}
                            >
                                {agent.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {agents.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-500">
                    No AI agents found. Click "Create New Agent" to get started.
                </div>
            )}
        </div>
    );
};

export default AIAgentsManagement;
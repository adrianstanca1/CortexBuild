import React, { useState, useEffect } from 'react';
import { Bot, Plus, Play, Pause, Trash2, Settings, Activity, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Copy, Download, Upload } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'code-generator' | 'data-analyzer' | 'task-automator' | 'custom';
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
  totalRuns: number;
  successRate: number;
  avgExecutionTime: number;
  createdAt: string;
  config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    tools?: string[];
  };
}

interface AgentExecution {
  id: string;
  agentId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  input: string;
  output?: string;
  error?: string;
  tokensUsed?: number;
  cost?: number;
}

const AGENT_TYPES = [
  { id: 'code-generator', name: 'Code Generator', description: 'Generates code from natural language', icon: '🔧' },
  { id: 'data-analyzer', name: 'Data Analyzer', description: 'Analyzes data and provides insights', icon: '📊' },
  { id: 'task-automator', name: 'Task Automator', description: 'Automates repetitive tasks', icon: '⚡' },
  { id: 'custom', name: 'Custom Agent', description: 'Build your own agent', icon: '🎨' }
];

export const AIAgentsDashboard: React.FC<{ subscriptionTier: string }> = ({ subscriptionTier }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<AgentExecution | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'analytics'>('overview');

  // New agent form
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    type: 'code-generator' as Agent['type'],
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    tools: [] as string[]
  });

  const [testInput, setTestInput] = useState('');
  const [testRunning, setTestRunning] = useState(false);

  useEffect(() => {
    loadAgents();
    loadExecutions();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/sdk/agents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      const response = await fetch('/api/sdk/agents/executions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExecutions(data);
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  };

  const createAgent = async () => {
    try {
      const response = await fetch('/api/sdk/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAgent)
      });

      if (response.ok) {
        const agent = await response.json();
        setAgents([...agents, agent]);
        setShowCreateModal(false);
        setNewAgent({
          name: '',
          description: '',
          type: 'code-generator',
          model: 'gpt-4-turbo',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: '',
          tools: []
        });
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`/api/sdk/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAgents(agents.map(a => a.id === agentId ? { ...a, status: newStatus as Agent['status'] } : a));
      }
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await fetch(`/api/sdk/agents/${agentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setAgents(agents.filter(a => a.id !== agentId));
        if (selectedAgent?.id === agentId) setSelectedAgent(null);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const runAgent = async (agentId: string, input: string) => {
    setTestRunning(true);
    try {
      const response = await fetch(`/api/sdk/agents/${agentId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input })
      });

      if (response.ok) {
        const execution = await response.json();
        setExecutions([execution, ...executions]);
        setTestInput('');
        alert('Agent executed successfully!');
        loadAgents(); // Refresh stats
      }
    } catch (error) {
      console.error('Failed to run agent:', error);
      alert('Failed to execute agent');
    } finally {
      setTestRunning(false);
    }
  };

  const duplicateAgent = async (agent: Agent) => {
    setNewAgent({
      name: `${agent.name} (Copy)`,
      description: agent.description,
      type: agent.type,
      model: agent.config.model || 'gpt-4-turbo',
      temperature: agent.config.temperature || 0.7,
      maxTokens: agent.config.maxTokens || 2000,
      systemPrompt: agent.config.systemPrompt || '',
      tools: agent.config.tools || []
    });
    setShowCreateModal(true);
  };

  const exportAgent = (agent: Agent) => {
    const dataStr = JSON.stringify(agent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `agent-${agent.id}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Calculate analytics
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === 'completed').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const averageExecutionTime = executions.length > 0
    ? executions.filter(e => e.duration).reduce((sum, e) => sum + (e.duration || 0), 0) / executions.filter(e => e.duration).length
    : 0;
  const totalTokensUsed = executions.reduce((sum, e) => sum + (e.tokensUsed || 0), 0);
  const totalCost = executions.reduce((sum, e) => sum + (e.cost || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">AI Agents</h1>
              <p className="text-sm text-gray-600">{agents.length} agents • {totalExecutions} executions</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Create Agent</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 border-b-2 font-medium ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className={`pb-2 px-1 border-b-2 font-medium ${activeTab === 'executions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Executions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 px-1 border-b-2 font-medium ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Total Agents</span>
                  <Bot className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-bold">{agents.length}</div>
                <div className="text-xs opacity-75 mt-1">{agents.filter(a => a.status === 'active').length} active</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Executions</span>
                  <Activity className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-bold">{totalExecutions}</div>
                <div className="text-xs opacity-75 mt-1">{successfulExecutions} successful</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Success Rate</span>
                  <TrendingUp className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-bold">
                  {totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0}%
                </div>
                <div className="text-xs opacity-75 mt-1">{failedExecutions} failed</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Avg Time</span>
                  <Clock className="w-5 h-5 opacity-75" />
                </div>
                <div className="text-3xl font-bold">{averageExecutionTime.toFixed(1)}s</div>
                <div className="text-xs opacity-75 mt-1">{totalTokensUsed.toLocaleString()} tokens</div>
              </div>
            </div>

            {/* Agents Grid */}
            {agents.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
                <p className="text-gray-600 mb-6">Create your first AI agent to automate tasks</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create Your First Agent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{AGENT_TYPES.find(t => t.id === agent.type)?.icon}</div>
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-xs text-gray-600">{agent.type}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(agent.status)}`}>
                        {getStatusIcon(agent.status)}
                        <span>{agent.status}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-bold text-blue-600">{agent.totalRuns}</div>
                        <div className="text-xs text-gray-600">Runs</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-bold text-green-600">{agent.successRate}%</div>
                        <div className="text-xs text-gray-600">Success</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-lg font-bold text-purple-600">{agent.avgExecutionTime}s</div>
                        <div className="text-xs text-gray-600">Avg Time</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => { setSelectedAgent(agent); setTestInput(''); }}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Test Agent"
                        >
                          <Play className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => toggleAgentStatus(agent.id, agent.status)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title={agent.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {agent.status === 'active' ? <Pause className="w-4 h-4 text-gray-600" /> : <Play className="w-4 h-4 text-gray-600" />}
                        </button>
                        <button
                          onClick={() => duplicateAgent(agent)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => exportAgent(agent)}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Export"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => { setSelectedAgent(agent); setShowCreateModal(true); }}
                          className="p-2 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteAgent(agent.id)}
                          className="p-2 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'executions' && (
          <div className="bg-white rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {executions.slice(0, 50).map(execution => {
                    const agent = agents.find(a => a.id === execution.agentId);
                    return (
                      <tr key={execution.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium">{agent?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{agent?.type}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(execution.status)}`}>
                            {getStatusIcon(execution.status)}
                            <span>{execution.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{execution.duration ? `${execution.duration.toFixed(2)}s` : '-'}</td>
                        <td className="px-6 py-4 text-sm">{execution.tokensUsed?.toLocaleString() || '-'}</td>
                        <td className="px-6 py-4 text-sm">£{execution.cost?.toFixed(4) || '0.0000'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(execution.startedAt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => { setSelectedExecution(execution); setShowExecutionModal(true); }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {executions.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No executions yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold mb-4">Execution Trends</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Successful</span>
                    <span className="font-medium text-green-600">{successfulExecutions}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Failed</span>
                    <span className="font-medium text-red-600">{failedExecutions}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Running</span>
                    <span className="font-medium text-blue-600">{executions.filter(e => e.status === 'running').length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${totalExecutions > 0 ? (executions.filter(e => e.status === 'running').length / totalExecutions) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-semibold mb-4">Cost Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                  <div className="text-3xl font-bold text-purple-600">£{totalCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tokens Used</div>
                  <div className="text-2xl font-bold">{totalTokensUsed.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Avg Cost per Execution</div>
                  <div className="text-2xl font-bold">£{totalExecutions > 0 ? (totalCost / totalExecutions).toFixed(4) : '0.0000'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 col-span-2">
              <h3 className="font-semibold mb-4">Top Performing Agents</h3>
              <div className="space-y-3">
                {agents.sort((a, b) => b.totalRuns - a.totalRuns).slice(0, 5).map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{AGENT_TYPES.find(t => t.id === agent.type)?.icon}</div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-gray-600">{agent.totalRuns} executions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{agent.successRate}% success</div>
                      <div className="text-xs text-gray-600">{agent.avgExecutionTime}s avg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Create New Agent</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Agent Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="My Code Generator"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what your agent does..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Agent Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {AGENT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setNewAgent({ ...newAgent, type: type.id as Agent['type'] })}
                      className={`p-3 border-2 rounded-lg text-left hover:border-blue-500 ${newAgent.type === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <select
                  value={newAgent.model}
                  onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Temperature ({newAgent.temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={newAgent.temperature}
                    onChange={(e) => setNewAgent({ ...newAgent, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Tokens</label>
                  <input
                    type="number"
                    value={newAgent.maxTokens}
                    onChange={(e) => setNewAgent({ ...newAgent, maxTokens: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">System Prompt</label>
                <textarea
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={6}
                  placeholder="You are a helpful assistant that..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => { setShowCreateModal(false); setSelectedAgent(null); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createAgent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Agent Modal */}
      {selectedAgent && !showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Test Agent: {selectedAgent.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Input</label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Enter your test input..."
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => runAgent(selectedAgent.id, testInput)}
                disabled={testRunning || !testInput}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {testRunning ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{testRunning ? 'Running...' : 'Run Agent'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Details Modal */}
      {showExecutionModal && selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Execution Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 w-fit ${getStatusColor(selectedExecution.status)}`}>
                    {getStatusIcon(selectedExecution.status)}
                    <span>{selectedExecution.status}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="text-lg font-semibold">{selectedExecution.duration?.toFixed(2)}s</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tokens Used</div>
                  <div className="text-lg font-semibold">{selectedExecution.tokensUsed?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Cost</div>
                  <div className="text-lg font-semibold">£{selectedExecution.cost?.toFixed(4)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Input</div>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">{selectedExecution.input}</div>
              </div>

              {selectedExecution.output && (
                <div>
                  <div className="text-sm font-medium mb-2">Output</div>
                  <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">{selectedExecution.output}</div>
                </div>
              )}

              {selectedExecution.error && (
                <div>
                  <div className="text-sm font-medium mb-2 text-red-600">Error</div>
                  <div className="bg-red-50 rounded-lg p-4 font-mono text-sm text-red-600">{selectedExecution.error}</div>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => { setShowExecutionModal(false); setSelectedExecution(null); }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

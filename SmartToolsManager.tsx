import React, { useState, useEffect } from 'react';
import { Zap, Clock, Play, Pause, Trash2, Plus, Calendar, Activity } from 'lucide-react';

interface SmartTool {
  id: number;
  name: string;
  description: string;
  tool_type: string;
  schedule: string;
  is_active: boolean;
  last_run_at: string;
  next_run_at: string;
  config: any;
}

interface Execution {
  id: number;
  tool_id: number;
  status: string;
  started_at: string;
  completed_at: string;
  error_message: string;
}

export const SmartToolsManager: React.FC = () => {
  const [tools, setTools] = useState<SmartTool[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<SmartTool | null>(null);

  useEffect(() => {
    fetchTools();
    fetchExecutions();
  }, []);

  const fetchTools = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/smart-tools', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTools(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  };

  const fetchExecutions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/smart-tools/executions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setExecutions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    }
  };

  const createTool = async (toolData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/smart-tools', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(toolData)
      });
      const data = await response.json();
      if (data.success) {
        fetchTools();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create tool:', error);
    }
  };

  const toggleTool = async (toolId: number, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/smart-tools/${toolId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !isActive })
      });
      fetchTools();
    } catch (error) {
      console.error('Failed to toggle tool:', error);
    }
  };

  const runTool = async (toolId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/smart-tools/${toolId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Tool executed successfully!');
        fetchExecutions();
      }
    } catch (error) {
      console.error('Failed to run tool:', error);
    }
  };

  const deleteTool = async (toolId: number) => {
    if (!confirm('Delete this smart tool?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/smart-tools/${toolId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTools();
    } catch (error) {
      console.error('Failed to delete tool:', error);
    }
  };

  const getToolTypeIcon = (type: string) => {
    switch (type) {
      case 'scheduled': return <Clock className="w-5 h-5" />;
      case 'webhook': return <Zap className="w-5 h-5" />;
      case 'workflow': return <Activity className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Tools & Automation</h2>
          <p className="text-gray-600">Schedule tasks, create workflows, and automate processes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Create Smart Tool
        </button>
      </div>

      {/* Smart Tools List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Smart Tools</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {tools.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No smart tools created yet</p>
              <p className="text-sm mt-2">Create your first automation tool to get started</p>
            </div>
          ) : (
            tools.map(tool => (
              <div key={tool.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${tool.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {getToolTypeIcon(tool.tool_type)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{tool.name}</h4>
                        <p className="text-sm text-gray-600">{tool.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mt-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Schedule: {tool.schedule || 'Manual'}</span>
                      </span>
                      {tool.last_run_at && (
                        <span>Last run: {new Date(tool.last_run_at).toLocaleString()}</span>
                      )}
                      {tool.next_run_at && (
                        <span>Next run: {new Date(tool.next_run_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => runTool(tool.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Run now"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleTool(tool.id, tool.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        tool.is_active
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title={tool.is_active ? 'Pause' : 'Activate'}
                    >
                      {tool.is_active ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteTool(tool.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Executions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tool</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No executions yet
                  </td>
                </tr>
              ) : (
                executions.map(execution => {
                  const tool = tools.find(t => t.id === execution.tool_id);
                  const duration = execution.completed_at
                    ? Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000)
                    : null;

                  return (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tool?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(execution.started_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {duration ? `${duration}s` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        {execution.error_message || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tool Modal */}
      {showCreateModal && (
        <CreateToolModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createTool}
        />
      )}
    </div>
  );
};

// Create Tool Modal Component
const CreateToolModal: React.FC<{ onClose: () => void; onCreate: (data: any) => void }> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tool_type: 'scheduled',
    schedule: '0 0 * * *', // Daily at midnight
    config: '{}'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Smart Tool</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.tool_type}
              onChange={(e) => setFormData({ ...formData, tool_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Scheduled (Cron)</option>
              <option value="webhook">Webhook Trigger</option>
              <option value="workflow">Workflow Chain</option>
            </select>
          </div>

          {formData.tool_type === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule (Cron Expression)
              </label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0 0 * * *"
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: "0 0 * * *" (daily), "0 */6 * * *" (every 6 hours)
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


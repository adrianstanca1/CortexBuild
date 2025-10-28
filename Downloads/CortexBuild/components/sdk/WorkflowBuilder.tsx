import React, { useState } from 'react';
import { Play, Save, Download, Zap, Database, Mail, Webhook, Code, GitBranch, Clock, Trash2, Settings } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  category: string;
  name: string;
  config: any;
}

interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  status: 'draft' | 'active' | 'paused';
}

const NODE_TYPES = {
  triggers: [
    { id: 'schedule', name: 'Schedule', icon: Clock, color: 'blue', description: 'Run on a schedule' },
    { id: 'webhook', name: 'Webhook', icon: Webhook, color: 'green', description: 'Trigger via HTTP request' },
    { id: 'database', name: 'Database Event', icon: Database, color: 'purple', description: 'On data change' },
  ],
  actions: [
    { id: 'api-call', name: 'API Call', icon: Code, color: 'orange', description: 'Make HTTP request' },
    { id: 'database-query', name: 'Database Query', icon: Database, color: 'purple', description: 'Query database' },
    { id: 'send-email', name: 'Send Email', icon: Mail, color: 'red', description: 'Send email notification' },
    { id: 'webhook-call', name: 'Call Webhook', icon: Webhook, color: 'green', description: 'Call external webhook' },
    { id: 'run-code', name: 'Run Code', icon: Code, color: 'blue', description: 'Execute custom code' },
  ],
  conditions: [
    { id: 'if-else', name: 'If/Else', icon: GitBranch, color: 'yellow', description: 'Conditional branching' },
  ]
};

export const WorkflowBuilder: React.FC<{ subscriptionTier: string }> = ({ subscriptionTier }) => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'new-workflow',
    name: 'New Workflow',
    nodes: [],
    status: 'draft'
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(true);

  const addNode = (nodeType: any, category: 'trigger' | 'action' | 'condition') => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: category,
      category: nodeType.id,
      name: nodeType.name,
      config: {}
    };
    setWorkflow(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
  };

  const deleteNode = (nodeId: string) => {
    setWorkflow(prev => ({ ...prev, nodes: prev.nodes.filter(n => n.id !== nodeId) }));
    setSelectedNode(null);
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 border-blue-300 text-blue-800',
    green: 'bg-green-100 border-green-300 text-green-800',
    purple: 'bg-purple-100 border-purple-300 text-purple-800',
    orange: 'bg-orange-100 border-orange-300 text-orange-800',
    red: 'bg-red-100 border-red-300 text-red-800',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  };

  const getColor = (category: string) => {
    const all = [...NODE_TYPES.triggers, ...NODE_TYPES.actions, ...NODE_TYPES.conditions];
    return all.find(t => t.id === category)?.color || 'blue';
  };

  const getIcon = (category: string) => {
    const all = [...NODE_TYPES.triggers, ...NODE_TYPES.actions, ...NODE_TYPES.conditions];
    return all.find(t => t.id === category)?.icon || Code;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {showLibrary && (
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Node Library</h3>
            <p className="text-sm text-gray-600">Click to add nodes</p>
          </div>
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-blue-600" />Triggers
            </h4>
            {NODE_TYPES.triggers.map(t => (
              <button key={t.id} type="button" onClick={() => addNode(t, 'trigger')}
                className="w-full p-3 mb-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left">
                <div className="flex items-center space-x-2">
                  <t.icon className="w-5 h-5 text-blue-600" />
                  <div><p className="font-medium text-sm">{t.name}</p><p className="text-xs text-gray-600">{t.description}</p></div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Code className="w-4 h-4 mr-2 text-green-600" />Actions
            </h4>
            {NODE_TYPES.actions.map(a => (
              <button key={a.id} type="button" onClick={() => addNode(a, 'action')}
                className="w-full p-3 mb-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-left">
                <div className="flex items-center space-x-2">
                  <a.icon className="w-5 h-5 text-green-600" />
                  <div><p className="font-medium text-sm">{a.name}</p><p className="text-xs text-gray-600">{a.description}</p></div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <GitBranch className="w-4 h-4 mr-2 text-yellow-600" />Conditions
            </h4>
            {NODE_TYPES.conditions.map(c => (
              <button key={c.id} type="button" onClick={() => addNode(c, 'condition')}
                className="w-full p-3 mb-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 text-left">
                <div className="flex items-center space-x-2">
                  <c.icon className="w-5 h-5 text-yellow-600" />
                  <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-gray-600">{c.description}</p></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <input type="text" value={workflow.name} onChange={(e) => setWorkflow(p => ({ ...p, name: e.target.value }))}
              className="text-xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2" />
            <div className="flex space-x-2">
              <button type="button" onClick={() => setShowLibrary(!showLibrary)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
                {showLibrary ? 'Hide' : 'Show'} Library
              </button>
              <button type="button" className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium">
                <Download className="w-4 h-4" /><span>Export</span>
              </button>
              <button type="button" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Save className="w-4 h-4" /><span>Save</span>
              </button>
              <button type="button" className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                <Play className="w-4 h-4" /><span>Run</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {workflow.nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-600 mb-4">Add nodes from the library</p>
                <button type="button" onClick={() => setShowLibrary(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Open Node Library
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {workflow.nodes.map((node, i) => {
                const Icon = getIcon(node.category);
                const color = getColor(node.category);
                return (
                  <div key={node.id} className="mb-4">
                    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]} ${selectedNode === node.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''} cursor-pointer hover:shadow-lg`}
                      onClick={() => setSelectedNode(node.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-6 h-6" />
                          <div><p className="font-semibold">{node.name}</p><p className="text-xs opacity-75">{node.type.toUpperCase()}</p></div>
                        </div>
                        <div className="flex space-x-2">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"><Settings className="w-4 h-4" /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                    {i < workflow.nodes.length - 1 && <div className="flex justify-center my-2"><div className="w-0.5 h-8 bg-gray-300" /></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {selectedNode && (
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Node Configuration</h3>
            <p className="text-sm text-gray-600">{workflow.nodes.find(n => n.id === selectedNode)?.name}</p>
          </div>
          <div className="p-4"><p className="text-sm text-gray-600">Configuration options will appear here.</p></div>
        </div>
      )}
    </div>
  );
};


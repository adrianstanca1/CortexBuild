import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Save, Download, Upload, Trash2, Settings, Plus, Zap, Clock, Database, Mail, Webhook, GitBranch, CheckCircle } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  position: { x: number; y: number };
  config: Record<string, any>;
  connections: string[];
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  isActive: boolean;
  lastRun?: string;
  runCount: number;
}

export const WorkflowCanvas: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'new-workflow',
    name: 'New Workflow',
    description: 'Describe your workflow here',
    nodes: [],
    connections: [],
    isActive: false,
    runCount: 0
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<Omit<WorkflowNode, 'id' | 'position' | 'connections'> | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showNodeLibrary, setShowNodeLibrary] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Node templates
  const nodeTemplates: Omit<WorkflowNode, 'id' | 'position' | 'connections'>[] = [
    {
      type: 'trigger',
      title: 'Time Trigger',
      description: 'Run on schedule',
      icon: Clock,
      config: { schedule: 'daily', time: '09:00' }
    },
    {
      type: 'trigger',
      title: 'Webhook Trigger',
      description: 'Run on HTTP request',
      icon: Webhook,
      config: { method: 'POST', path: '/webhook' }
    },
    {
      type: 'trigger',
      title: 'Database Trigger',
      description: 'Run on data change',
      icon: Database,
      config: { table: '', event: 'insert' }
    },
    {
      type: 'action',
      title: 'Send Email',
      description: 'Send notification email',
      icon: Mail,
      config: { to: '', subject: '', template: '' }
    },
    {
      type: 'action',
      title: 'API Call',
      description: 'Make HTTP request',
      icon: Zap,
      config: { url: '', method: 'GET', headers: {} }
    },
    {
      type: 'action',
      title: 'Database Action',
      description: 'Create/update records',
      icon: Database,
      config: { table: '', action: 'insert', data: {} }
    },
    {
      type: 'condition',
      title: 'If/Then',
      description: 'Conditional logic',
      icon: GitBranch,
      config: { condition: '', trueAction: '', falseAction: '' }
    },
    {
      type: 'delay',
      title: 'Wait',
      description: 'Add delay',
      icon: Clock,
      config: { duration: 5, unit: 'minutes' }
    }
  ];

  const addNode = useCallback((template: Omit<WorkflowNode, 'id' | 'position' | 'connections'>, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      ...template,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      connections: []
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => c.from !== nodeId && c.to !== nodeId)
    }));
    setSelectedNode(null);
  }, []);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, position } : node
      )
    }));
  }, []);

  const connectNodes = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) {return;}

    const connectionExists = workflow.connections.some(
      c => c.from === fromId && c.to === toId
    );

    if (!connectionExists) {
      const newConnection: WorkflowConnection = {
        id: `conn-${Date.now()}`,
        from: fromId,
        to: toId
      };

      setWorkflow(prev => ({
        ...prev,
        connections: [...prev.connections, newConnection]
      }));
    }

    setIsConnecting(null);
  }, [workflow.connections]);

  const saveWorkflow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/workflows', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflow)
      });

      if (response.ok) {
        console.log('Workflow saved successfully');
      }
    } catch (error) {
      console.error('Save workflow error:', error);
    }
  };

  const runWorkflow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/workflows/${workflow.id}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWorkflow(prev => ({
          ...prev,
          runCount: prev.runCount + 1,
          lastRun: new Date().toISOString()
        }));
        console.log('Workflow executed successfully');
      }
    } catch (error) {
      console.error('Run workflow error:', error);
    }
  };

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNode || !canvasRef.current) {return;}

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };

    addNode(draggedNode, position);
    setDraggedNode(null);
  }, [draggedNode, addNode, pan, zoom]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const renderConnections = () => {
    return workflow.connections.map(connection => {
      const fromNode = workflow.nodes.find(n => n.id === connection.from);
      const toNode = workflow.nodes.find(n => n.id === connection.to);

      if (!fromNode || !toNode) {return null;}

      const fromX = fromNode.position.x + 100;
      const fromY = fromNode.position.y + 40;
      const toX = toNode.position.x;
      const toY = toNode.position.y + 40;

      return (
        <line
          key={connection.id}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="#3B82F6"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Node Library Sidebar */}
      {showNodeLibrary && (
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Node Library</h3>
            <button
              type="button"
              onClick={() => setShowNodeLibrary(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close node library"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {nodeTemplates.map((template, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => setDraggedNode(template)}
                className="p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <template.icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{template.title}</p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="Workflow name"
                aria-label="Workflow name"
              />
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${workflow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {workflow.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {!showNodeLibrary && (
                <button
                  type="button"
                  onClick={() => setShowNodeLibrary(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                  aria-label="Show node library"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nodes</span>
                </button>
              )}

              <button
                type="button"
                onClick={saveWorkflow}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                aria-label="Save workflow"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={runWorkflow}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                aria-label="Run workflow"
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button>

              <button
                type="button"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900"
                aria-label="Workflow settings"
                title="Workflow settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {workflow.lastRun && (
            <div className="mt-2 text-sm text-gray-500">
              Last run: {new Date(workflow.lastRun).toLocaleString()} • {workflow.runCount} total runs
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gray-50"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          style={{
            backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          {/* SVG for connections */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#3B82F6"
                />
              </marker>
            </defs>
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              {renderConnections()}
            </g>
          </svg>

          {/* Workflow Nodes */}
          <div
            className="absolute inset-0"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {workflow.nodes.map(node => (
              <div
                key={node.id}
                className={`absolute w-48 bg-white border-2 rounded-lg shadow-sm cursor-move ${selectedNode === node.id ? 'border-blue-500' : 'border-gray-200'
                  } hover:border-blue-300 transition-colors`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  transform: 'translate(0, 0)'
                }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <node.icon className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{node.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                      aria-label="Delete node"
                      title="Delete node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{node.description}</p>

                  {/* Connection points */}
                  <div className="flex justify-between mt-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full cursor-pointer hover:bg-blue-500" />
                    <div
                      className="w-3 h-3 bg-gray-300 rounded-full cursor-pointer hover:bg-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsConnecting(isConnecting === node.id ? null : node.id);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {workflow.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-500 mb-4">Drag nodes from the library to create your automation</p>
                {!showNodeLibrary && (
                  <button
                    type="button"
                    onClick={() => setShowNodeLibrary(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    aria-label="Open node library"
                  >
                    Open Node Library
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Work Breakdown Structure (WBS) Builder
 * Hierarchical task organization with cost and schedule tracking
 */

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { wbsAPI } from '../../lib/api-client';

interface WBSNode {
  id: string;
  code: string;
  name: string;
  description?: string;
  level: number;
  cost_budget: number;
  actual_cost: number;
  percentage_complete: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  children?: WBSNode[];
}

interface WBSBuilderProps {
  projectId: string | number;
  onNodeClick?: (node: WBSNode) => void;
}

const WBSBuilder: React.FC<WBSBuilderProps> = ({ projectId, onNodeClick }) => {
  const [nodes, setNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWBS();
  }, [projectId]);

  const loadWBS = async () => {
    try {
      setLoading(true);
      const response = await wbsAPI.getWBS(projectId);
      const flatNodes: WBSNode[] = response.data.data || [];
      
      // Build hierarchical structure
      const hierarchicalNodes = buildHierarchy(flatNodes);
      setNodes(hierarchicalNodes);
    } catch (error: any) {
      console.error('Failed to load WBS:', error);
      toast.error('Failed to load Work Breakdown Structure');
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (flatNodes: WBSNode[]): WBSNode[] => {
    const nodeMap = new Map<string, WBSNode>();
    const rootNodes: WBSNode[] = [];

    // First pass: create all nodes
    flatNodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Second pass: build hierarchy
    flatNodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id);
      if (!nodeWithChildren) return;

      // Find parent node
      const parentNode = flatNodes.find(n => n.code === getParentCode(node.code));
      if (parentNode && parentNode.id !== node.id) {
        const parent = nodeMap.get(parentNode.id);
        if (parent && parent.children) {
          parent.children.push(nodeWithChildren);
        }
      } else {
        // Root level node
        rootNodes.push(nodeWithChildren);
      }
    });

    return rootNodes;
  };

  const getParentCode = (code: string): string => {
    const parts = code.split('.');
    if (parts.length <= 1) return '';
    parts.pop();
    return parts.join('.');
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const renderNode = (node: WBSNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const variance = node.actual_cost - node.cost_budget;

    return (
      <div key={node.id}>
        <div
          className={`
            flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100
            ${depth > 0 ? 'pl-8' : ''}
          `}
          style={{ paddingLeft: `${depth * 2 + 0.75}rem` }}
        >
          {/* Expand/Collapse */}
          <button
            onClick={() => hasChildren && toggleNode(node.id)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* WBS Code */}
          <div className="font-mono font-bold text-sm text-blue-600 w-20">
            {node.code}
          </div>

          {/* Node Name */}
          <div className="flex-1">
            <div className="font-medium text-gray-900">{node.name}</div>
            {node.description && (
              <div className="text-sm text-gray-600 mt-0.5">{node.description}</div>
            )}
          </div>

          {/* Progress */}
          <div className="w-32">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${node.percentage_complete === 100 ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-300`}
                style={{ width: `${node.percentage_complete}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1 text-center">{node.percentage_complete}%</div>
          </div>

          {/* Budget */}
          <div className="w-32 text-right">
            <div className="flex items-center justify-end gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">${(node.cost_budget / 1000).toFixed(0)}k</div>
                {node.actual_cost > 0 && (
                  <div className={`text-xs ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${(node.actual_cost / 1000).toFixed(0)}k
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className={`px-3 py-1 rounded border text-xs font-medium capitalize ${getStatusColor(node.status)}`}>
            {node.status.replace('_', ' ')}
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Work Breakdown Structure</h2>
          <p className="text-sm text-gray-600 mt-1">Hierarchical project organization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Node
        </button>
      </div>

      {/* Column Headers */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8" /> {/* Icon space */}
          <div className="font-mono font-bold text-sm text-gray-700 w-20">Code</div>
          <div className="flex-1 font-semibold text-gray-900">Task Description</div>
          <div className="w-32 text-center font-semibold text-gray-900">Progress</div>
          <div className="w-32 text-right font-semibold text-gray-900">Budget</div>
          <div className="w-28 text-center font-semibold text-gray-900">Status</div>
        </div>
      </div>

      {/* WBS Tree */}
      <div>
        {nodes.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No WBS structure defined</p>
            <p className="text-gray-500 text-sm mt-1">Create a Work Breakdown Structure for this project</p>
          </div>
        ) : (
          nodes.map(node => renderNode(node))
        )}
      </div>
    </div>
  );
};

export default WBSBuilder;


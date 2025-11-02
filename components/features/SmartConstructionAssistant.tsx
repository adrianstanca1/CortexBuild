// Smart Construction Assistant - AI-Powered Help System
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface AssistantSuggestion {
  id: string;
  type: 'safety' | 'efficiency' | 'compliance' | 'cost' | 'schedule';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

interface SmartConstructionAssistantProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const SmartConstructionAssistant: React.FC<SmartConstructionAssistantProps> = ({
  currentUser: _currentUser,
  isOpen,
  onClose,
  onAction
}) => {
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'help' | 'chat'>('suggestions');

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    
    // Mock AI-generated suggestions based on current context
    const mockSuggestions: AssistantSuggestion[] = [
      {
        id: '1',
        type: 'safety',
        title: 'Weather Alert',
        description: 'High winds expected tomorrow. Consider postponing crane operations.',
        action: 'schedule-weather-review',
        priority: 'high'
      },
      {
        id: '2',
        type: 'efficiency',
        title: 'Resource Optimization',
        description: 'Team A is ahead of schedule. They could assist Team B with concrete work.',
        action: 'optimize-resources',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'compliance',
        title: 'Permit Reminder',
        description: 'Electrical permit expires in 5 days. Schedule renewal now.',
        action: 'renew-permit',
        priority: 'high'
      },
      {
        id: '4',
        type: 'cost',
        title: 'Material Savings',
        description: 'Bulk order discount available for next week\'s materials. Save 15%.',
        action: 'bulk-order',
        priority: 'medium'
      },
      {
        id: '5',
        type: 'schedule',
        title: 'Critical Path Update',
        description: 'Foundation work completed early. Advance framing by 2 days.',
        action: 'update-schedule',
        priority: 'low'
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setSuggestions(mockSuggestions);
    setIsLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safety': return '🛡️';
      case 'efficiency': return '⚡';
      case 'compliance': return '📋';
      case 'cost': return '💰';
      case 'schedule': return '📅';
      default: return '💡';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'safety': return 'bg-red-100 text-red-800';
      case 'efficiency': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-yellow-100 text-yellow-800';
      case 'cost': return 'bg-green-100 text-green-800';
      case 'schedule': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">🤖 Smart Construction Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'suggestions', label: 'AI Suggestions', icon: '💡' },
            { id: 'help', label: 'Quick Help', icon: '❓' },
            { id: 'chat', label: 'AI Chat', icon: '💬' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your project data...</p>
                </div>
              ) : (
                suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className={`bg-white border-l-4 ${getPriorityColor(suggestion.priority)} p-4 rounded-r-lg shadow-sm`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(suggestion.type)}</span>
                        <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                          {suggestion.type}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${
                        suggestion.priority === 'high' ? 'text-red-600' :
                        suggestion.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {suggestion.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{suggestion.description}</p>
                    {suggestion.action && (
                      <button
                        onClick={() => onAction(suggestion.action!)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Take Action
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Quick Help Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Safety Protocols', description: 'View current safety requirements and procedures' },
                  { title: 'Material Ordering', description: 'Learn how to order materials and track deliveries' },
                  { title: 'Schedule Management', description: 'Update project schedules and milestones' },
                  { title: 'Quality Control', description: 'Access quality checklists and inspection forms' },
                  { title: 'Team Communication', description: 'Best practices for team coordination' },
                  { title: 'Compliance Tracking', description: 'Monitor permits and regulatory requirements' }
                ].map((topic, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <h4 className="font-medium text-gray-900 mb-2">{topic.title}</h4>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Chat Coming Soon</h3>
              <p className="text-gray-600">
                Real-time AI chat assistance will be available in the next update.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartConstructionAssistant;

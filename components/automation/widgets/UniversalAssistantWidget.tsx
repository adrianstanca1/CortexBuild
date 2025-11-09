import React, { useState, useEffect, useRef } from 'react';
import { BaseWidget, WidgetAction } from './BaseWidget';
import {
  Send,
  Sparkles,
  FileText,
  CheckSquare,
  DollarSign,
  Users,
  Calendar,
  Search,
  Command,
  Loader,
  X,
  Lightbulb,
  Zap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: QuickAction[];
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  command: string;
  category: 'procurement' | 'project' | 'financial' | 'team' | 'workflow';
}

type NavigationParams = Record<string, unknown>;

interface UniversalAssistantWidgetProps {
  onNavigate?: (screen: string, _params?: NavigationParams) => void;
}

export const UniversalAssistantWidget: React.FC<UniversalAssistantWidgetProps> = ({
  onNavigate
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 Hello! I\'m your Universal AI Assistant. I can help you with:\n\n• Creating RFQs and managing procurement\n• Analyzing project data and generating reports\n• Managing tasks and workflows\n• Financial tracking and invoicing\n• Team coordination\n\nTry asking me anything or use Cmd+K to open the command palette!',
      timestamp: new Date(),
      suggestions: [
        {
          icon: <FileText size={16} />,
          label: 'Create new RFQ',
          command: 'create rfq for electrical materials',
          category: 'procurement'
        },
        {
          icon: <CheckSquare size={16} />,
          label: 'Review pending bids',
          command: 'show me pending bids',
          category: 'procurement'
        },
        {
          icon: <DollarSign size={16} />,
          label: 'Budget analysis',
          command: 'analyze project budget',
          category: 'financial'
        },
        {
          icon: <Users size={16} />,
          label: 'Team performance',
          command: 'show team productivity',
          category: 'team'
        }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick actions database
  const quickActions: QuickAction[] = [
    // Procurement
    { icon: <FileText size={16} />, label: 'Create RFQ', command: 'create new rfq', category: 'procurement' },
    { icon: <CheckSquare size={16} />, label: 'Review Bids', command: 'show pending bids', category: 'procurement' },
    { icon: <DollarSign size={16} />, label: 'Create Purchase Order', command: 'create purchase order', category: 'procurement' },

    // Project Management
    { icon: <Calendar size={16} />, label: 'Create Task', command: 'create new task', category: 'project' },
    { icon: <CheckSquare size={16} />, label: 'Project Status', command: 'show project status', category: 'project' },
    { icon: <FileText size={16} />, label: 'Generate Report', command: 'generate project report', category: 'project' },

    // Financial
    { icon: <DollarSign size={16} />, label: 'Create Invoice', command: 'create invoice', category: 'financial' },
    { icon: <DollarSign size={16} />, label: 'Budget Analysis', command: 'analyze budget', category: 'financial' },
    { icon: <DollarSign size={16} />, label: 'Expense Tracking', command: 'show expenses', category: 'financial' },

    // Team
    { icon: <Users size={16} />, label: 'Team Performance', command: 'show team performance', category: 'team' },
    { icon: <Users size={16} />, label: 'Assign Task', command: 'assign task to team member', category: 'team' },

    // Workflows
    { icon: <Zap size={16} />, label: 'Create Workflow', command: 'create automation workflow', category: 'workflow' },
    { icon: <Zap size={16} />, label: 'Run Workflow', command: 'run workflow', category: 'workflow' }
  ];

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setCommandSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call AI backend
      const response = await axios.post('/api/ai/chat', {
        message: textToSend,
        context: 'automation_studio',
        history: messages.slice(-5) // Last 5 messages for context
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        suggestions: response.data.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute actions if provided
      if (response.data.action) {
        executeAction(response.data.action);
      }
    } catch (error: any) {
      console.error('AI chat error:', error);

      // Fallback response with keyword matching
      const fallbackResponse = generateFallbackResponse(textToSend);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date(),
        suggestions: fallbackResponse.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackResponse = (input: string): { content: string; suggestions: QuickAction[] } => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('rfq') || lowerInput.includes('request for quote')) {
      return {
        content: '📋 I can help you create a new RFQ! To get started, I\'ll need:\n\n• Project/category\n• Items or services needed\n• Estimated value\n• Due date\n• Preferred vendors\n\nWould you like to create an RFQ now?',
        suggestions: [
          { icon: <FileText size={16} />, label: 'Create RFQ', command: 'create rfq', category: 'procurement' },
          { icon: <Users size={16} />, label: 'View Vendors', command: 'show vendors', category: 'procurement' }
        ]
      };
    }

    if (lowerInput.includes('bid') || lowerInput.includes('bids')) {
      return {
        content: '📊 Here\'s what I can help with regarding bids:\n\n• Review pending bids\n• Compare bid prices\n• Generate bid analysis\n• Accept/reject bids\n• Create purchase orders from accepted bids\n\nWhat would you like to do?',
        suggestions: [
          { icon: <CheckSquare size={16} />, label: 'Review Bids', command: 'review pending bids', category: 'procurement' },
          { icon: <DollarSign size={16} />, label: 'Compare Prices', command: 'compare bid prices', category: 'procurement' }
        ]
      };
    }

    if (lowerInput.includes('budget') || lowerInput.includes('cost') || lowerInput.includes('expense')) {
      return {
        content: '💰 I can help analyze your financial data:\n\n• Project budget status\n• Cost breakdown by category\n• Expense tracking\n• Budget forecasting\n• Invoice management\n\nWhat financial insights do you need?',
        suggestions: [
          { icon: <DollarSign size={16} />, label: 'Budget Analysis', command: 'analyze budget', category: 'financial' },
          { icon: <FileText size={16} />, label: 'Generate Report', command: 'generate financial report', category: 'financial' }
        ]
      };
    }

    if (lowerInput.includes('task') || lowerInput.includes('todo')) {
      return {
        content: '✅ Task management at your service:\n\n• Create new tasks\n• Assign to team members\n• Track progress\n• Set deadlines\n• Generate task reports\n\nHow can I help with tasks?',
        suggestions: [
          { icon: <CheckSquare size={16} />, label: 'Create Task', command: 'create task', category: 'project' },
          { icon: <Users size={16} />, label: 'Assign Task', command: 'assign task', category: 'team' }
        ]
      };
    }

    // Default response
    return {
      content: '🤔 I\'m not sure I understood that. Here are some things I can help with:\n\n• **Procurement**: RFQs, bids, purchase orders\n• **Projects**: Tasks, milestones, reports\n• **Finance**: Budgets, expenses, invoices\n• **Team**: Performance, assignments, coordination\n• **Workflows**: Automation, integrations\n\nTry asking about any of these topics!',
      suggestions: quickActions.slice(0, 4)
    };
  };

  const executeAction = (action: any) => {
    // Execute specific actions based on AI response
    switch (action.type) {
      case 'navigate':
        onNavigate?.(action.screen, action.params);
        toast.success(`Navigating to ${action.screen}`);
        break;
      case 'create_rfq':
        toast.success('Opening RFQ creation form...');
        // Trigger RFQ creation modal
        break;
      case 'show_data':
        toast.success('Loading data...');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.command);
    setShowCommandPalette(false);
    setCommandSearch('');
  };

  const filteredQuickActions = commandSearch
    ? quickActions.filter(action =>
      action.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
      action.command.toLowerCase().includes(commandSearch.toLowerCase())
    )
    : quickActions;

  const actions: WidgetAction[] = [
    {
      icon: <Command size={16} />,
      label: 'Open Palette (⌘K)',
      onClick: () => setShowCommandPalette(true),
      variant: 'secondary'
    },
    {
      icon: <X size={16} />,
      label: 'Clear Chat',
      onClick: () => {
        setMessages([]);
        toast.success('Chat cleared');
      },
      variant: 'secondary'
    }
  ];

  return (
    <>
      <BaseWidget
        id="universal-assistant"
        title="Universal AI Assistant"
        icon={<Sparkles size={20} />}
        collapsible={true}
        expandable={true}
        defaultCollapsed={false}
        actions={actions}
        className="universal-assistant-widget"
      >
        <div className="flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                    }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(suggestion)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          {suggestion.icon}
                          <span>{suggestion.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                  <Loader className="animate-spin text-emerald-600" size={20} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything... (or press ⌘K for quick commands)"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </BaseWidget>

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                  type="text"
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Search commands..."
                  className="flex-1 outline-none text-lg"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="max-h-96 overflow-y-auto">
              {filteredQuickActions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Search className="mx-auto mb-2" size={32} />
                  <p>No commands found</p>
                </div>
              ) : (
                <div className="p-2">
                  {['procurement', 'project', 'financial', 'team', 'workflow'].map(category => {
                    const categoryActions = filteredQuickActions.filter(a => a.category === category);
                    if (categoryActions.length === 0) return null;

                    return (
                      <div key={category} className="mb-4">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                          {category}
                        </div>
                        {categoryActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 rounded-lg transition-colors group"
                          >
                            <div className="text-slate-600 group-hover:text-emerald-600">
                              {action.icon}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-slate-900">
                                {action.label}
                              </div>
                              <div className="text-xs text-slate-500">
                                {action.command}
                              </div>
                            </div>
                            <Zap className="text-slate-400 group-hover:text-emerald-600" size={16} />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={14} />
                <span>Tip: You can ask natural questions or use quick commands</span>
              </div>
              <button
                onClick={() => {
                  setShowCommandPalette(false);
                  setCommandSearch('');
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
};

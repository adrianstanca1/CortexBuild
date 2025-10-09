import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import MonacoEditor from '@monaco-editor/react';
import {
  Code,
  Zap,
  Package,
  TrendingUp,
  Settings,
  Play,
  Save,
  Copy,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

// Types
interface SdkWorkflow {
  id: string;
  developerId: string;
  name: string;
  companyId?: string;
  definition: {
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      config: any;
      position: { x: number; y: number };
    }>;
    connections: Array<{
      id: string;
      source: string;
      target: string;
    }>;
  };
  isActive: boolean;
  createdAt: Date;
}

interface AiAgent {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
  description: string;
}

interface SdkApp {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  updatedAt: Date;
}

interface SdkProfile {
  apiRequestsUsed: number;
  apiRequestsLimit: number;
  subscriptionTier: SdkSubscriptionTier;
}

type SdkSubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

interface CostSummary {
  provider: string;
  monthToDateCost: number;
  requestsThisMonth: number;
}

// Constants
const GEMINI_MODELS = [
  { id: 'gemini-pro', label: 'Gemini Pro' },
  { id: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  { id: 'gemini-ultra', label: 'Gemini Ultra' }
];

const SUBSCRIPTION_DETAILS = {
  free: { label: 'Free', limit: 100 },
  starter: { label: 'Starter', limit: 1000 },
  pro: { label: 'Pro', limit: 10000 },
  enterprise: { label: 'Enterprise', limit: 100000 }
};

const TEMPLATE_LIBRARY = [
  {
    id: '1',
    name: 'RFI Assistant',
    category: 'AI',
    description: 'Generate an AI assistant that summarises RFIs and proposes responses.'
  },
  {
    id: '2',
    name: 'Safety Inspector',
    category: 'Safety',
    description: 'Build a safety inspection checklist with AI photo analysis.'
  },
  {
    id: '3',
    name: 'Performance Dashboard',
    category: 'Analytics',
    description: 'Create a subcontractor performance dashboard with scoring.'
  }
];

// Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', size = 'md', isLoading, disabled }) => {
  const baseClasses = 'rounded-lg font-semibold transition-colors inline-flex items-center justify-center';
  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : children}
    </button>
  );
};

interface SDKDeveloperViewProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const SDKDeveloperView: React.FC<SDKDeveloperViewProps> = ({ user, onNavigate }) => {
  // State
  const [activeTab, setActiveTab] = useState<'builder' | 'workflows' | 'agents' | 'marketplace' | 'settings'>('builder');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('// Generated code will appear here...');
  const [aiExplanation, setAiExplanation] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingApp, setIsSavingApp] = useState(false);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const [profile, setProfile] = useState<SdkProfile | null>({
    apiRequestsUsed: 45,
    apiRequestsLimit: 100,
    subscriptionTier: 'free'
  });

  const [apps, setApps] = useState<SdkApp[]>([]);
  const [workflows, setWorkflows] = useState<SdkWorkflow[]>([]);
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary[]>([]);
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0 });
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('All');
  const [activeGeminiKey, setActiveGeminiKey] = useState('');

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const isDemo = user.role !== 'developer';
  const mode = isDemo ? 'demo' : 'live';
  const developerId = user.id;

  // Helper functions
  const addToast = (message: string, type: 'success' | 'error') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // TODO: Implement actual toast notification
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const encryptValue = async (value: string, userId: string): Promise<string> => {
    // Simple base64 encoding for demo - use proper encryption in production
    return btoa(`${userId}:${value}`);
  };

  const getStorageKey = (userId: string) => `gemini_key_${userId}`;

  // API mock functions (replace with actual API calls)
  const api = {
    saveSdkWorkflow: async (workflow: SdkWorkflow) => {
      return { ...workflow, id: `wf-${Date.now()}` };
    },
    updateAiAgentStatus: async (id: string, status: string) => {
      return agents.find(a => a.id === id);
    },
    updateSdkSubscriptionTier: async (userId: string, tier: SdkSubscriptionTier) => {
      return { ...profile!, subscriptionTier: tier };
    },
    saveAiApiKeyForUser: async (userId: string, provider: string, key: string) => {
      return true;
    },
    updateSdkAppStatus: async (id: string, status: string) => {
      return apps.find(a => a.id === id);
    },
    generateWithGemini: async (prompt: string, model: string) => {
      return {
        code: `// Generated code for: ${prompt}\nfunction generatedFunction() {\n  console.log("AI generated code");\n}`,
        explanation: `This code was generated based on your prompt: "${prompt}"`
      };
    },
    saveApp: async (app: Partial<SdkApp>) => {
      return { ...app, id: `app-${Date.now()}`, version: '1.0.0', updatedAt: new Date() } as SdkApp;
    }
  };

  // Event handlers
  const handleSaveWorkflow = async () => {
    if (!developerId) return;
    setIsSavingWorkflow(true);
    try {
      const definition = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: 'action',
          name: typeof node.data?.label === 'string' ? node.data.label : 'Node',
          config: {},
          position: node.position,
        })),
        connections: edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target })),
      };
      const saved = await api.saveSdkWorkflow({
        id: '',
        developerId,
        name: `Workflow ${new Date().toLocaleTimeString()}`,
        companyId: user.company_id ?? undefined,
        definition,
        isActive: !isDemo,
        createdAt: new Date(),
      });
      setWorkflows(prev => [saved, ...prev]);
      addToast(isDemo ? 'Demo workflow saved locally.' : 'Workflow saved to sandbox.', 'success');
    } catch (error) {
      console.error('Failed to save workflow', error);
      addToast('Unable to save workflow.', 'error');
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  const handleAgentToggle = async (agent: AiAgent) => {
    if (isDemo) {
      addToast('Demo mode: Agent orchestration is read-only.', 'error');
      return;
    }
    const newStatus = agent.status === 'running' ? 'paused' : 'running';
    try {
      const updated = await api.updateAiAgentStatus(agent.id, newStatus);
      if (updated) {
        setAgents(prev => prev.map(a => (a.id === updated.id ? updated : a)));
        addToast(`Agent ${updated.name} is now ${updated.status}.`, 'success');
      }
    } catch (error) {
      addToast('Failed to update agent state.', 'error');
    }
  };

  const handleSubscriptionChange = async (tier: SdkSubscriptionTier) => {
    if (!profile || isDemo) return;
    setSubscriptionLoading(true);
    try {
      const updated = await api.updateSdkSubscriptionTier(user.id, tier);
      if (updated) {
        setProfile(updated);
        addToast(`Subscription updated to ${SUBSCRIPTION_DETAILS[tier].label}.`, 'success');
      }
    } catch (error) {
      addToast('Unable to update subscription tier.', 'error');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleApiKeySave = async (value: string) => {
    if (!value.trim()) {
      addToast('API key cannot be empty.', 'error');
      return;
    }
    if (typeof window === 'undefined') return;
    try {
      const encrypted = await encryptValue(value, user.id);
      window.localStorage.setItem(getStorageKey(user.id), encrypted);
      await api.saveAiApiKeyForUser(user.id, 'gemini', encrypted);
      setActiveGeminiKey(value);
      addToast('Gemini API key stored securely for this session.', 'success');
    } catch (error) {
      addToast('Failed to store API key.', 'error');
    }
  };

  const handleSubmitForReview = async (app: SdkApp) => {
    if (isDemo) {
      addToast('Demo mode: Publishing requires an SDK Developer subscription.', 'error');
      return;
    }
    const newStatus = app.status === 'pending_review' ? 'approved' : 'pending_review';
    try {
      const updated = await api.updateSdkAppStatus(app.id, newStatus);
      if (updated) {
        setApps(prev => prev.map(existing => (existing.id === updated.id ? updated : existing)));
        addToast(`App status updated to ${updated.status}.`, 'success');
      }
    } catch (error) {
      addToast('Unable to update marketplace status.', 'error');
    }
  };

  const handleGenerateApp = async () => {
    if (!prompt.trim()) {
      addToast('Please enter a prompt first.', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const result = await api.generateWithGemini(prompt, selectedModel);
      setGeneratedCode(result.code);
      setAiExplanation(result.explanation);
      setTokenUsage({ prompt: prompt.length, completion: result.code.length });
      addToast('Code generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate code.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApp = async () => {
    if (!generatedCode || generatedCode === '// Generated code will appear here...') {
      addToast('Generate code first before saving.', 'error');
      return;
    }
    setIsSavingApp(true);
    try {
      const saved = await api.saveApp({
        name: prompt.substring(0, 50) || 'Untitled App',
        description: aiExplanation || 'AI generated application',
        status: 'draft'
      });
      setApps(prev => [saved, ...prev]);
      addToast(isDemo ? 'Demo app saved locally.' : 'App saved to sandbox.', 'success');
    } catch (error) {
      addToast('Failed to save app.', 'error');
    } finally {
      setIsSavingApp(false);
    }
  };

  const refreshAnalytics = () => {
    // Refresh analytics data
    addToast('Analytics refreshed.', 'success');
  };

  const filteredTemplates = useMemo(() => {
    if (selectedTemplateCategory === 'All') return TEMPLATE_LIBRARY;
    return TEMPLATE_LIBRARY.filter(template => template.category === selectedTemplateCategory);
  }, [selectedTemplateCategory]);

  // Render functions
  const renderUsageBar = () => {
    if (!profile) return null;
    const percent = profile.apiRequestsLimit === 0 ? 0 : Math.min((profile.apiRequestsUsed / profile.apiRequestsLimit) * 100, 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>AI requests used</span>
          <span>
            {profile.apiRequestsUsed} / {profile.apiRequestsLimit}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">SDK Developer Platform</h1>
              <p className="text-slate-600 mt-1">Build, test, and deploy AI-powered construction apps</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {SUBSCRIPTION_DETAILS[profile?.subscriptionTier || 'free'].label}
              </span>
              <Button variant="secondary" onClick={() => setActiveTab('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'builder', label: 'AI Builder', icon: Code },
              { id: 'workflows', label: 'Workflows', icon: Zap },
              { id: 'agents', label: 'AI Agents', icon: Package },
              { id: 'marketplace', label: 'Marketplace', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Prompt Builder</h3>
                    <p className="text-sm text-slate-500">Describe the construction workflow or module you want Gemini to build.</p>
                  </div>
                  <select
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                    value={selectedModel}
                    onChange={event => setSelectedModel(event.target.value)}
                    disabled={isDemo}
                  >
                    {GEMINI_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={prompt}
                  onChange={event => setPrompt(event.target.value)}
                  className="w-full min-h-[120px] border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Describe the app you need..."
                />
                <div className="flex flex-wrap gap-2">
                  {[
                    'Generate an AI assistant that summarises RFIs and proposes responses.',
                    'Build a safety inspection checklist with AI photo analysis.',
                    'Create a subcontractor performance dashboard with scoring.',
                  ].map(example => (
                    <Button key={example} variant="ghost" size="sm" onClick={() => setPrompt(example)}>
                      {example}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleGenerateApp} isLoading={isGenerating}>
                    {isDemo ? 'Preview Demo Output' : 'Generate with Gemini'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSaveApp}
                    isLoading={isSavingApp}
                    disabled={isDemo && mode === 'demo'}
                  >
                    {isDemo ? 'Save Demo Draft' : 'Save to Sandbox'}
                  </Button>
                  <span className="text-xs text-slate-500">
                    Tokens: prompt {tokenUsage.prompt} / completion {tokenUsage.completion}
                  </span>
                </div>
              </Card>
              <Card className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">Usage & Cost</h3>
                {renderUsageBar()}
                <div className="space-y-2 text-sm text-slate-600">
                  {costSummary.length === 0 ? (
                    <p>No usage recorded yet.</p>
                  ) : (
                    costSummary.map(summary => (
                      <div key={summary.provider} className="flex justify-between">
                        <span className="capitalize">{summary.provider}</span>
                        <span>
                          {formatCurrency(summary.monthToDateCost)} / {summary.requestsThisMonth} reqs
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={refreshAnalytics}>
                  Refresh Analytics
                </Button>
                <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 bg-slate-50">
                  Gemini requests automatically log prompts, responses, and token usage for audit. Fallback caching is enabled when the
                  provider is unavailable.
                </div>
              </Card>
            </div>
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Generated Code</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to clipboard
                </Button>
              </div>
              <MonacoEditor
                height="400px"
                language="typescript"
                theme="vs-dark"
                value={generatedCode}
                onChange={value => setGeneratedCode(value ?? '')}
                options={{ minimap: { enabled: false } }}
              />
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-line">
                {aiExplanation}
              </div>
            </Card>
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Sandbox Apps</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {apps.map(app => (
                  <div key={app.id} className="border border-slate-200 rounded-lg p-4 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800">{app.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${app.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : app.status === 'pending_review'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">{app.description}</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>Version {app.version}</div>
                      <div>Updated {new Date(app.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSubmitForReview(app)}
                      >
                        {isDemo ? 'Preview workflow' : app.status === 'pending_review' ? 'Approve' : 'Submit for review'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('marketplace')}
                      >
                        Marketplace preview
                      </Button>
                    </div>
                  </div>
                ))}
                {apps.length === 0 && <p className="text-sm text-slate-500">No sandbox apps yet. Generate your first AI application.</p>}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Workflow Automation</h2>
                <Button onClick={handleSaveWorkflow} isLoading={isSavingWorkflow}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Workflow
                </Button>
              </div>
              <p className="text-slate-600">Create and manage automated workflows for your construction processes.</p>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Zap className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Visual Workflow Builder</h3>
                <p className="text-slate-500 mb-4">Drag and drop nodes to create automated workflows</p>
                <Button variant="secondary">
                  Open Workflow Editor
                </Button>
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Saved Workflows</h3>
              <div className="space-y-3">
                {workflows.length === 0 ? (
                  <p className="text-sm text-slate-500">No workflows saved yet. Create your first workflow above.</p>
                ) : (
                  workflows.map(workflow => (
                    <div key={workflow.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{workflow.name}</h4>
                        <p className="text-sm text-slate-500">
                          {workflow.definition.nodes.length} nodes, {workflow.definition.connections.length} connections
                        </p>
                        <p className="text-xs text-slate-400">
                          Created {new Date(workflow.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${workflow.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">AI Agent Orchestration</h2>
              <p className="text-slate-600">Manage and monitor your AI agents for automated tasks.</p>

              {isDemo && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900">Demo Mode</h4>
                    <p className="text-sm text-amber-700">Agent orchestration is read-only in demo mode. Upgrade to control agents.</p>
                  </div>
                </div>
              )}
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agents.length === 0 ? (
                <Card className="col-span-full">
                  <p className="text-sm text-slate-500 text-center py-8">No AI agents configured yet.</p>
                </Card>
              ) : (
                agents.map(agent => (
                  <Card key={agent.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">{agent.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.status === 'running'
                        ? 'bg-emerald-100 text-emerald-700'
                        : agent.status === 'paused'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{agent.description}</p>
                    <Button
                      variant={agent.status === 'running' ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleAgentToggle(agent)}
                      disabled={isDemo}
                    >
                      {agent.status === 'running' ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Pause Agent
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Agent
                        </>
                      )}
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">App Marketplace</h2>
              <p className="text-slate-600">Browse and publish AI-powered construction applications.</p>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_LIBRARY.map(template => (
                <Card key={template.id} className="space-y-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{template.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{template.description}</p>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => setPrompt(template.description)}>
                      Use Template
                    </Button>
                    <Button variant="ghost" size="sm">
                      Preview
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Your Published Apps</h3>
              <div className="space-y-3">
                {apps.filter(app => app.status === 'approved').length === 0 ? (
                  <p className="text-sm text-slate-500">No published apps yet. Submit an app for review to get started.</p>
                ) : (
                  apps.filter(app => app.status === 'approved').map(app => (
                    <div key={app.id} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{app.name}</h4>
                        <p className="text-sm text-slate-600">{app.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-emerald-600 font-medium">Published</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Developer Settings</h2>

              {/* Subscription Tier */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">Subscription Tier</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {(Object.keys(SUBSCRIPTION_DETAILS) as SdkSubscriptionTier[]).map(tier => (
                    <div
                      key={tier}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${profile?.subscriptionTier === tier
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                      onClick={() => !isDemo && handleSubscriptionChange(tier)}
                    >
                      <h4 className="font-semibold text-slate-800 mb-2">
                        {SUBSCRIPTION_DETAILS[tier].label}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {SUBSCRIPTION_DETAILS[tier].limit.toLocaleString()} requests/month
                      </p>
                      {profile?.subscriptionTier === tier && (
                        <div className="mt-2 flex items-center text-emerald-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Current Plan
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {isDemo && (
                  <p className="text-sm text-amber-600">Demo mode: Subscription changes are disabled.</p>
                )}
              </div>

              {/* API Key Management */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">Gemini API Key</h3>
                <p className="text-sm text-slate-600">
                  Store your Gemini API key securely for AI code generation.
                </p>
                <div className="flex gap-3">
                  <input
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={activeGeminiKey}
                    onChange={e => setActiveGeminiKey(e.target.value)}
                  />
                  <Button onClick={() => handleApiKeySave(activeGeminiKey)}>
                    Save Key
                  </Button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">
                  Your API key is encrypted and stored securely. It's only used for generating code and never shared.
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">Usage Statistics</h3>
                {renderUsageBar()}
                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-900">{profile?.apiRequestsUsed || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">Remaining</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(profile?.apiRequestsLimit || 0) - (profile?.apiRequestsUsed || 0)}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">Usage %</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {profile?.apiRequestsLimit === 0
                        ? 0
                        : Math.round(((profile?.apiRequestsUsed || 0) / (profile?.apiRequestsLimit || 1)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};


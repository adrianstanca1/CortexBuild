import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types';
import MonacoEditor from '@monaco-editor/react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
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
  XCircle,
  BarChart3,
  Webhook,
  ShieldCheck,
  Trash2,
  Globe,
  Activity,
  Workflow
} from 'lucide-react';
import ZapierStyleWorkflowBuilder from './ZapierStyleWorkflowBuilder';

type Provider = 'openai' | 'gemini';
type TabKey = 'builder' | 'workflows' | 'agents' | 'marketplace' | 'analytics' | 'settings' | 'management' | 'zapier';

interface ModelOption {
  id: string;
  label: string;
}

interface WorkflowNodeDefinition {
  id: string;
  type: string;
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
}

interface SdkWorkflow {
  id: string;
  developerId: string;
  name: string;
  companyId?: string | null;
  definition: {
    nodes: WorkflowNodeDefinition[];
    connections: WorkflowConnection[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AiAgent {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
  description: string;
  updatedAt?: string;
}

interface SdkApp {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  updatedAt: string;
  createdAt?: string;
}

interface SdkProfile {
  apiRequestsUsed: number;
  apiRequestsLimit: number;
  subscriptionTier: SdkSubscriptionTier;
}

interface CostSummary {
  provider: string;
  monthToDateCost: number;
  requestsThisMonth: number;
  totalTokens?: number;
}

interface WebhookEntry {
  id: number;
  name: string;
  url: string;
  events: string;
  is_active: number;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

type SdkSubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

interface BuilderNode {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
}

interface BuilderEdge {
  id: string;
  source: string;
  target: string;
}

// API Configuration
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('constructai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Constants
const GEMINI_MODELS = [
  { id: 'gemini-pro', label: 'Gemini Pro' },
  { id: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  { id: 'gemini-ultra', label: 'Gemini Ultra' }
];

const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' }
];

const getFallbackModels = (provider: Provider): ModelOption[] =>
  provider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS;

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  gemini: 'Google Gemini'
};

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

const NAV_TABS: Array<{ id: TabKey; label: string; icon: React.ComponentType<any> }> = [
  { id: 'builder', label: 'AI Builder', icon: Code },
  { id: 'zapier', label: 'Zapier Builder', icon: Zap },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'agents', label: 'AI Agents', icon: Package },
  { id: 'marketplace', label: 'Marketplace', icon: TrendingUp },
  { id: 'management', label: 'Platform', icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
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

interface ProductionSDKDeveloperViewProps {
  user: User;
  onNavigate: (page: string) => void;
  startTab?: TabKey;
}

export const ProductionSDKDeveloperView: React.FC<ProductionSDKDeveloperViewProps> = ({ user, onNavigate: _onNavigate, startTab }) => {
  // State
  const [activeTab, setActiveTab] = useState<TabKey>(startTab ?? 'builder');
  const [provider, setProvider] = useState<Provider>('openai');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('// Generated code will appear here...');
  const [aiExplanation, setAiExplanation] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(getFallbackModels('openai'));
  const [modelsLoading, setModelsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingApp, setIsSavingApp] = useState(false);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const [profile, setProfile] = useState<SdkProfile | null>(null);
  const [apps, setApps] = useState<SdkApp[]>([]);
  const [workflows, setWorkflows] = useState<SdkWorkflow[]>([]);
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary[]>([]);
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0, total: 0 });
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('All');
  const [activeGeminiKey, setActiveGeminiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [lastCost, setLastCost] = useState<number | null>(null);
  const [lastGenerationMeta, setLastGenerationMeta] = useState<{ provider: string; model: string } | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('New Workflow');
  const [newNodeLabel, setNewNodeLabel] = useState('');

  const [nodes, setNodes] = useState<BuilderNode[]>([]);
  const [edges, setEdges] = useState<BuilderEdge[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [availableWebhookEvents, setAvailableWebhookEvents] = useState<string[]>([]);
  const [webhookForm, setWebhookForm] = useState<{ name: string; url: string; events: string[] }>({
    name: '',
    url: '',
    events: ['project.created']
  });
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [isSeedingWebhooks, setIsSeedingWebhooks] = useState(false);
  const [isSeedingWorkflows, setIsSeedingWorkflows] = useState(false);

  const isDemo = user.role !== 'developer';
  const mode = isDemo ? 'demo' : 'live';
  const developerId = user.id;

  // Load data on mount
  useEffect(() => {
    loadProfile();
    loadApps();
    loadWorkflows();
    loadAgents();
    loadAnalytics();
    loadWebhooks();
    loadWebhookEvents();
  }, []);

  useEffect(() => {
    if (startTab) {
      setActiveTab(startTab);
    }
  }, [startTab]);

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const response = await api.get(`/sdk/models/${provider}`);
        if (response.data?.success && Array.isArray(response.data.models) && response.data.models.length > 0) {
          const parsed: ModelOption[] = response.data.models.map((model: any) => ({
            id: model.id || model.model || model.name || model.value || model,
            label: model.label || model.displayName || model.name || model.id || model
          }));
          setModelOptions(parsed);
          setSelectedModel(prev => (parsed.some(option => option.id === prev) ? prev : parsed[0].id));
          return;
        }
      } catch (error) {
        console.error(`Failed to load ${provider} models from API, using fallback`, error);
      } finally {
        setModelsLoading(false);
      }

      const fallback = getFallbackModels(provider);
      setModelOptions(fallback);
      setSelectedModel(prev => (fallback.some(option => option.id === prev) ? prev : fallback[0]?.id || ''));
    };

    fetchModels().catch(() => {
      const fallback = getFallbackModels(provider);
      setModelOptions(fallback);
      setSelectedModel(prev => (fallback.some(option => option.id === prev) ? prev : fallback[0]?.id || ''));
      setModelsLoading(false);
    });
  }, [provider]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(getStorageKey(user.id));
    if (stored) {
      try {
        const decoded = atob(stored);
        const [, keyValue] = decoded.split(':');
        if (keyValue) {
          setActiveGeminiKey(keyValue);
        }
      } catch (error) {
        console.warn('Failed to decode stored Gemini API key', error);
      }
    }
  }, [user.id]);

  // API Functions
  const loadProfile = async () => {
    try {
      const response = await api.get('/sdk/profile');
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      if (!axios.isAxiosError(error) || error.response?.status !== 403) {
        toast.error('Failed to load SDK profile');
      }
    }
  };

  const loadApps = async () => {
    try {
      const response = await api.get('/sdk/apps');
      if (response.data.success) {
        setApps(response.data.apps);
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await api.get('/sdk/workflows');
      if (response.data.success) {
        setWorkflows(response.data.workflows);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await api.get('/sdk/agents');
      if (response.data.success) {
        setAgents(response.data.agents);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/sdk/analytics/usage');
      if (response.data.success) {
        setCostSummary(response.data.costSummary);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadWebhooks = async () => {
    try {
      const response = await api.get('/integrations/webhooks/list');
      if (response.data.success) {
        setWebhooks(response.data.webhooks);
      }
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  };

  const loadWebhookEvents = async () => {
    try {
      const response = await api.get('/integrations/webhooks/events/available');
      if (response.data.success) {
        setAvailableWebhookEvents(response.data.events);
      }
    } catch (error) {
      console.error('Failed to load webhook events:', error);
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const encryptValue = async (value: string, userId: string): Promise<string> => {
    // Simple base64 encoding for demo - use proper encryption in production
    return btoa(`${userId}:${value}`);
  };

  const getStorageKey = (userId: string) => `gemini_key_${userId}`;

  const maskKey = (value: string) => {
    if (!value) return '';
    if (value.length <= 8) return `${value.slice(0, 2)}••••`;
    return `${value.slice(0, 4)}••••${value.slice(-4)}`;
  };

  const recomputeEdges = (nodeList: BuilderNode[]) => {
    const sequential = nodeList.slice(1).map((node, index) => ({
      id: `edge-${nodeList[index].id}-${node.id}`,
      source: nodeList[index].id,
      target: node.id
    }));
    setEdges(sequential);
  };

  // Render usage bar
  const renderUsageBar = () => {
    if (!profile) return null;
    const limit = profile.apiRequestsLimit;
    const percent = limit < 0 ? 100 : limit === 0 ? 0 : Math.min((profile.apiRequestsUsed / limit) * 100, 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>AI requests used</span>
          <span>
            {profile.apiRequestsUsed} / {limit < 0 ? 'Unlimited' : profile.apiRequestsLimit}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  };

  // Event Handlers
  const handleGenerateApp = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt first');
      return;
    }

    if (!selectedModel) {
      toast.error('Select a model before generating code');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.post('/sdk/generate', {
        prompt,
        provider,
        model: selectedModel
      });

      if (response.data.success) {
        setGeneratedCode(response.data.code);
        setAiExplanation(response.data.explanation);
        const tokens = response.data.tokens || {};
        setTokenUsage({
          prompt: tokens.prompt || 0,
          completion: tokens.completion || 0,
          total: tokens.total || (tokens.prompt || 0) + (tokens.completion || 0)
        });
        setLastCost(typeof response.data.cost === 'number' ? response.data.cost : null);
        setLastGenerationMeta({
          provider: response.data.provider || provider,
          model: response.data.model || selectedModel
        });
        toast.success(`Code generated successfully! (${(tokens.total || 0)} tokens${response.data.cost ? `, ${formatCurrency(response.data.cost)}` : ''})`);
        await loadProfile(); // Refresh usage
        await loadAnalytics();
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast.error('Developer access required to use the SDK generator');
      } else {
        const errorMsg = error.response?.data?.error || 'Failed to generate code';
        toast.error(errorMsg);
      }
      console.error('Generate error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApp = async () => {
    if (!generatedCode || generatedCode === '// Generated code will appear here...') {
      toast.error('Generate code first before saving');
      return;
    }

    setIsSavingApp(true);
    try {
      const response = await api.post('/sdk/apps', {
        name: prompt.substring(0, 50) || 'Untitled App',
        description: aiExplanation || 'AI generated application',
        code: generatedCode,
        status: 'draft',
        companyId: user.company_id
      });

      if (response.data.success) {
        setApps(prev => [response.data.app, ...prev]);
        await loadApps();
        toast.success(isDemo ? 'Demo app saved locally' : 'App saved to sandbox');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save app');
    } finally {
      setIsSavingApp(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!developerId) return;
    if (!newWorkflowName.trim()) {
      toast.error('Name your workflow before saving');
      return;
    }
    if (nodes.length === 0) {
      toast.error('Add at least one workflow step');
      return;
    }

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
        connections: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target
        })),
      };

      const response = await api.post('/sdk/workflows', {
        name: newWorkflowName.trim(),
        definition,
        isActive: !isDemo,
        companyId: user.company_id
      });

      if (response.data.success) {
        setWorkflows(prev => [response.data.workflow, ...prev]);
        await loadWorkflows();
        setNewWorkflowName('New Workflow');
        setNewNodeLabel('');
        setNodes([]);
        setEdges([]);
        toast.success(isDemo ? 'Demo workflow saved locally' : 'Workflow saved to sandbox');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save workflow');
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  const handleAgentToggle = async (agent: AiAgent) => {
    if (isDemo) {
      toast.error('Demo mode: Agent orchestration is read-only');
      return;
    }

    const newStatus = agent.status === 'running' ? 'paused' : 'running';

    try {
      const response = await api.patch(`/sdk/agents/${agent.id}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setAgents(prev => prev.map(a =>
          a.id === response.data.agent.id ? response.data.agent : a
        ));
        await loadAgents();
        toast.success(`Agent ${response.data.agent.name} is now ${response.data.agent.status}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update agent state');
    }
  };

  const handleSubscriptionChange = async (tier: SdkSubscriptionTier) => {
    if (!profile || isDemo) return;

    setSubscriptionLoading(true);
    try {
      const response = await api.patch('/sdk/profile/subscription', { tier });

      if (response.data.success) {
        setProfile(response.data.profile);
        toast.success(`Subscription updated to ${SUBSCRIPTION_DETAILS[tier].label}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update subscription');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleApiKeySave = async (value: string) => {
    if (!value.trim()) {
      toast.error('API key cannot be empty');
      return;
    }

    try {
      const encrypted = await encryptValue(value, user.id);
      window.localStorage.setItem(getStorageKey(user.id), encrypted);

      await api.post('/sdk/profile/api-key', {
        provider: 'gemini',
        encryptedKey: encrypted
      });

      setActiveGeminiKey(value);
      setApiKeyInput('');
      toast.success('Gemini API key stored securely');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to store API key');
    }
  };

  const handleSubmitForReview = async (app: SdkApp) => {
    if (isDemo) {
      toast.error('Demo mode: Publishing requires an SDK Developer subscription');
      return;
    }

    const newStatus = app.status === 'pending_review' ? 'approved' : 'pending_review';

    try {
      const response = await api.patch(`/sdk/apps/${app.id}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setApps(prev => prev.map(a =>
          a.id === response.data.app.id ? response.data.app : a
        ));
        await loadApps();
        toast.success(`App status updated to ${response.data.app.status}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update app status');
    }
  };

  const refreshAnalytics = async () => {
    await loadAnalytics();
    toast.success('Analytics refreshed');
  };

  const handleCopyCode = async () => {
    if (!generatedCode || generatedCode === '// Generated code will appear here...') {
      toast.error('Nothing to copy yet');
      return;
    }
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast.success('Code copied to clipboard');
    } catch (error) {
      console.error('Clipboard error', error);
      toast.error('Unable to copy code');
    }
  };

  const handleAddWorkflowNode = () => {
    if (!newNodeLabel.trim()) {
      toast.error('Enter a step label first');
      return;
    }
    const id = `node-${Date.now()}`;
    setNodes(prev => {
      const next = [...prev, { id, data: { label: newNodeLabel.trim() }, position: { x: 0, y: prev.length * 120 } }];
      recomputeEdges(next);
      return next;
    });
    setNewNodeLabel('');
  };

  const handleRemoveWorkflowNode = (id: string) => {
    setNodes(prev => {
      const next = prev.filter(node => node.id !== id);
      recomputeEdges(next);
      return next;
    });
  };

  const handleWebhookFormEventToggle = (eventId: string) => {
    setWebhookForm(prev => {
      const hasEvent = prev.events.includes(eventId);
      return {
        ...prev,
        events: hasEvent ? prev.events.filter(ev => ev !== eventId) : [...prev.events, eventId]
      };
    });
  };

  const handleWebhookCreate = async () => {
    if (!webhookForm.name.trim() || !webhookForm.url.trim() || webhookForm.events.length === 0) {
      toast.error('Provide a name, URL, and at least one event');
      return;
    }
    setIsCreatingWebhook(true);
    try {
      const response = await api.post('/integrations/webhooks', {
        name: webhookForm.name.trim(),
        url: webhookForm.url.trim(),
        events: webhookForm.events
      });
      if (response.data.success) {
        setWebhooks(prev => [response.data.webhook, ...prev]);
        setWebhookForm({ name: '', url: '', events: ['project.created'] });
        toast.success('Webhook created');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create webhook');
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleWebhookDelete = async (webhookId: number) => {
    try {
      await api.delete(`/integrations/webhooks/${webhookId}`);
      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
      toast.success('Webhook deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete webhook');
    }
  };

  const handleWebhookToggle = async (webhook: WebhookEntry) => {
    try {
      const currentlyActive = Boolean(webhook.is_active);
      await api.patch(`/integrations/webhooks/${webhook.id}`, {
        is_active: currentlyActive ? 0 : 1
      });
      setWebhooks(prev =>
        prev.map(entry =>
          entry.id === webhook.id ? { ...entry, is_active: currentlyActive ? 0 : 1 } : entry
        )
      );
      toast.success(`Webhook ${webhook.name} ${currentlyActive ? 'paused' : 'activated'}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update webhook');
    }
  };

  const handleWebhookTest = async (webhookId: number) => {
    try {
      const response = await api.post(`/integrations/webhooks/${webhookId}/test`);
      toast.success(response.data.delivered ? 'Test event delivered' : 'Test event queued');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to test webhook');
    }
  };

  const seedWebhooks = async () => {
    if (isDemo) {
      toast.error('Demo mode cannot manage production webhooks');
      return;
    }
    setIsSeedingWebhooks(true);
    try {
      const templates = [
        {
          name: 'Project Pulse Alerts',
          url: 'https://hooks.constructai.dev/project-pulse',
          events: ['project.status_changed', 'project.created']
        },
        {
          name: 'Invoice Sync Callback',
          url: 'https://hooks.constructai.dev/invoice-sync',
          events: ['invoice.paid', 'invoice.overdue']
        },
        {
          name: 'Safety Channel',
          url: 'https://hooks.constructai.dev/safety-monitor',
          events: ['task.completed', 'time_entry.approved']
        }
      ];
      await Promise.all(
        templates.map(template =>
          api.post('/integrations/webhooks', template).then(response => {
            if (response.data.success) {
              setWebhooks(prev => [response.data.webhook, ...prev]);
            }
          })
        )
      );
      toast.success('Sample webhooks created');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to seed webhooks');
    } finally {
      setIsSeedingWebhooks(false);
    }
  };

  const seedWorkflows = async () => {
    if (isDemo) {
      toast.error('Demo mode cannot write workflows');
      return;
    }
    setIsSeedingWorkflows(true);
    try {
      const definitions = [
        {
          name: 'Daily Safety Digest',
          nodes: [
            { id: 'trigger', type: 'trigger', name: 'Start of Day', config: { schedule: '06:00' }, position: { x: 0, y: 0 } },
            { id: 'fetch', type: 'action', name: 'Aggregate Inspections', config: { module: 'inspections' }, position: { x: 0, y: 120 } },
            { id: 'notify', type: 'action', name: 'Send Summary', config: { channel: 'safety-team' }, position: { x: 0, y: 240 } }
          ],
          connections: [
            { id: 'c1', source: 'trigger', target: 'fetch' },
            { id: 'c2', source: 'fetch', target: 'notify' }
          ]
        },
        {
          name: 'Invoice Approval Ladder',
          nodes: [
            { id: 'start', type: 'trigger', name: 'Invoice Submitted', config: { event: 'invoice.created' }, position: { x: 0, y: 0 } },
            { id: 'pm', type: 'action', name: 'Notify PM', config: { role: 'project_manager' }, position: { x: -160, y: 140 } },
            { id: 'finance', type: 'action', name: 'Escalate to Finance', config: { role: 'finance' }, position: { x: 0, y: 140 } },
            { id: 'log', type: 'action', name: 'Log Decision', config: { target: 'erp' }, position: { x: 160, y: 140 } }
          ],
          connections: [
            { id: 'c3', source: 'start', target: 'pm' },
            { id: 'c4', source: 'pm', target: 'finance' },
            { id: 'c5', source: 'finance', target: 'log' }
          ]
        },
        {
          name: 'Subcontractor Performance Pulse',
          nodes: [
            { id: 'weekly', type: 'trigger', name: 'Weekly Snapshot', config: { schedule: 'Friday 17:00' }, position: { x: 0, y: 0 } },
            { id: 'score', type: 'action', name: 'Score Vendors', config: { metric: 'quality' }, position: { x: 0, y: 120 } },
            { id: 'share', type: 'action', name: 'Share Dashboard', config: { channel: 'executive' }, position: { x: 0, y: 240 } }
          ],
          connections: [
            { id: 'c6', source: 'weekly', target: 'score' },
            { id: 'c7', source: 'score', target: 'share' }
          ]
        }
      ];

      await Promise.all(
        definitions.map(workflow =>
          api.post('/sdk/workflows', {
            name: workflow.name,
            definition: {
              nodes: workflow.nodes,
              connections: workflow.connections
            },
            isActive: true,
            companyId: user.company_id
          }).then(response => {
            if (response.data.success) {
              setWorkflows(prev => [response.data.workflow, ...prev]);
            }
          })
        )
      );
      toast.success('Sample workflows added to sandbox');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to seed workflows');
    } finally {
      setIsSeedingWorkflows(false);
    }
  };

  const templateCategories = useMemo(
    () => ['All', ...Array.from(new Set(TEMPLATE_LIBRARY.map(template => template.category)))],
    []
  );

  const filteredTemplates = useMemo(() => {
    if (selectedTemplateCategory === 'All') return TEMPLATE_LIBRARY;
    return TEMPLATE_LIBRARY.filter(template => template.category === selectedTemplateCategory);
  }, [selectedTemplateCategory]);

  const subscriptionTier = profile?.subscriptionTier ?? 'free';

  const formatDateTime = (value?: string) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const renderBuilderTab = () => (
    <div className="space-y-6">
      <Card className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">Developer Sandbox</h2>
          <p className="text-slate-600">
            Safe environment to build, test, and debug your modules before deploying to production.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Code className="w-5 h-5 text-emerald-600" />,
              title: 'Build & Test',
              description: 'Create modules with the SDK, exercise them against sample data, and iterate with integrated debug tools.'
            },
            {
              icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
              title: 'Monitor Performance',
              description: 'Track API usage, latency, and user engagement with built-in analytics dashboards.'
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
              title: 'Deploy Instantly',
              description: 'One-click deploy to production with automatic versioning and instant rollback support.'
            }
          ].map(item => (
            <div key={item.title} className="rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                {item.icon}
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Module Marketplace</h2>
            <p className="text-slate-600">
              Publish your modules and reach thousands of construction professionals.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">For Developers</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'Publish unlimited modules',
                  '70% revenue share',
                  'Built-in payment processing',
                  'Marketing and promotion support'
                ].map(point => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">For Users</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'Browse 100+ modules',
                  'Community ratings and reviews',
                  'One-click installation',
                  'Free and premium options'
                ].map(point => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Join our growing community of developers transforming the construction industry.
            </p>
            <Button onClick={() => setActiveTab('marketplace')}>
              Start Building Today
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Prompt Builder</h3>
              <p className="text-sm text-slate-600">
                Describe the construction workflow or module you want the AI to create.
              </p>
            </div>
            <div className="flex flex-col gap-2 items-start sm:items-end">
              <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                {(Object.keys(PROVIDER_LABELS) as Provider[]).map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setProvider(option)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${provider === option
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {PROVIDER_LABELS[option]}
                  </button>
                ))}
              </div>
              <select
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedModel}
                onChange={event => setSelectedModel(event.target.value)}
                disabled={modelsLoading}
              >
                {modelOptions.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
              {modelsLoading && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Loading models…
                </span>
              )}
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            className="w-full min-h-[140px] border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="Describe the app you need..."
          />
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_LIBRARY.map(template => (
              <Button key={template.id} variant="ghost" size="sm" onClick={() => setPrompt(template.description)}>
                {template.description}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleGenerateApp} isLoading={isGenerating} disabled={isDemo && mode === 'demo'}>
              <Zap className="w-4 h-4 mr-2" />
              {isDemo ? 'Preview (Demo)' : `Generate with ${PROVIDER_LABELS[provider]}`}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveApp}
              isLoading={isSavingApp}
              disabled={isDemo && mode === 'demo'}
            >
              <Save className="w-4 h-4 mr-2" />
              {isDemo ? 'Save Demo Draft' : 'Save to Sandbox'}
            </Button>
            <Button variant="ghost" onClick={handleCopyCode}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            <div className="text-xs text-slate-500">
              Tokens: prompt {tokenUsage.prompt} · completion {tokenUsage.completion} · total {tokenUsage.total}
              {lastCost !== null && (
                <span className="ml-2">| Cost {formatCurrency(lastCost)}</span>
              )}
              {lastGenerationMeta && (
                <span className="ml-2">
                  | {lastGenerationMeta.provider} · {lastGenerationMeta.model}
                </span>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Usage Summary</h3>
          {renderUsageBar()}
          <div className="space-y-3">
            {costSummary.length === 0 ? (
              <p className="text-sm text-slate-500">Generate with the SDK to populate usage analytics.</p>
            ) : (
              costSummary.map(summary => (
                <div key={summary.provider} className="flex items-center justify-between border border-slate-100 rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-slate-800 capitalize">{summary.provider}</p>
                    <p className="text-xs text-slate-500">
                      {summary.requestsThisMonth} requests · {summary.totalTokens ?? 0} tokens
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(summary.monthToDateCost)}
                  </span>
                </div>
              ))
            )}
          </div>
          <Button variant="secondary" onClick={refreshAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Generated Code</h3>
          <span className="text-xs text-slate-500">
            Auto saves are not enabled — remember to store valuable blueprints.
          </span>
        </div>
        <MonacoEditor
          height="420px"
          language="typescript"
          theme="vs-dark"
          value={generatedCode}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
          onChange={value => setGeneratedCode(value || '')}
        />
      </Card>

      {aiExplanation && (
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">AI Explanation</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{aiExplanation}</p>
        </Card>
      )}
    </div>
  );

  const renderWorkflowsTab = () => (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Design Workflow</h3>
            <p className="text-sm text-slate-600">
              Compose sequential steps to automate project operations. Saved workflows live in your SDK sandbox.
            </p>
          </div>
          <input
            type="text"
            value={newWorkflowName}
            onChange={(event) => setNewWorkflowName(event.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Workflow name"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={newNodeLabel}
            onChange={(event) => setNewNodeLabel(event.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Add a workflow step (e.g. Notify superintendent)"
          />
          <Button onClick={handleAddWorkflowNode}>
            <PlusIcon />
            Add Step
          </Button>
        </div>

        <div className="space-y-2">
          {nodes.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-lg py-8 text-center text-sm text-slate-500">
              No steps added yet. Use the field above to add your first step.
            </div>
          ) : (
            nodes.map((node, index) => (
              <div
                key={node.id}
                className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{node.data.label}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Action</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveWorkflowNode(node.id)}
                  className="text-sm text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSaveWorkflow} isLoading={isSavingWorkflow} disabled={isDemo && mode === 'demo'}>
            <Save className="w-4 h-4 mr-2" />
            Save Workflow
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setNodes([]);
              setEdges([]);
              setNewNodeLabel('');
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Builder
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Saved Workflows</h3>
        {workflows.length === 0 ? (
          <p className="text-sm text-slate-500">
            You have not saved any workflows yet. Build one above to get started.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workflows.map(workflow => (
              <div key={workflow.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{workflow.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(workflow.updatedAt)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${workflow.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {workflow.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="space-y-2">
                  {workflow.definition.nodes.map((node, index) => (
                    <div key={node.id} className="text-xs text-slate-600 flex items-center gap-2">
                      <div className="h-6 w-6 flex items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                        {index + 1}
                      </div>
                      <span>{node.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderAgentsTab = () => (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">AI Agent Orchestration</h3>
        <p className="text-xs text-slate-500">Toggle agents to manage real-time automations.</p>
      </div>
      {agents.length === 0 ? (
        <p className="text-sm text-slate-500">
          No agents registered yet. Agents appear here after you bootstrap them through the SDK.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map(agent => (
            <div key={agent.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-slate-900">{agent.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${agent.status === 'running'
                  ? 'bg-emerald-100 text-emerald-700'
                  : agent.status === 'paused'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-500'
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
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const renderMarketplaceTab = () => (
    <div className="space-y-6">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">App Marketplace</h3>
        <p className="text-sm text-slate-600">
          Publish your AI-powered construction applications. Submit drafts for review when they are production ready.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {templateCategories.map(category => (
          <Button
            key={category}
            variant={selectedTemplateCategory === category ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTemplateCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="space-y-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">{template.name}</h4>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {template.category}
              </span>
            </div>
            <p className="text-sm text-slate-600">{template.description}</p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={() => setPrompt(template.description)}>
                Use Template
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTemplateCategory(template.category)}>
                Related
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Your Applications</h3>
        {apps.length === 0 ? (
          <p className="text-sm text-slate-500">
            Generated apps will appear here. Save an app from the builder tab to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {apps.map(app => (
              <div key={app.id} className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900">{app.name}</h4>
                  <p className="text-sm text-slate-600">{app.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Updated {formatDateTime(app.updatedAt)} · v{app.version}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${app.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : app.status === 'pending_review'
                      ? 'bg-amber-100 text-amber-700'
                      : app.status === 'rejected'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSubmitForReview(app)}
                    disabled={isDemo}
                  >
                    {app.status === 'pending_review' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Draft
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Usage Analytics</h3>
          <Button variant="secondary" size="sm" onClick={refreshAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          Track token consumption and cost for each AI provider connected to your SDK account.
        </p>
        {renderUsageBar()}
      </Card>

      {costSummary.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No analytics to display yet. Generate code to populate cost data.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {costSummary.map(summary => (
            <Card key={summary.provider} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900 capitalize">{summary.provider}</h4>
                <span className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(summary.monthToDateCost)}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                <p>{summary.requestsThisMonth.toLocaleString()} requests this month</p>
                <p>{(summary.totalTokens ?? 0).toLocaleString()} tokens processed</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderManagementTab = () => (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Webhook Registry</h3>
            <p className="text-sm text-slate-600">
              Manage outbound notifications for critical project, finance, and compliance events.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={loadWebhooks}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={seedWebhooks} isLoading={isSeedingWebhooks} disabled={isDemo}>
              <Webhook className="w-4 h-4 mr-2" />
              Seed Sample Webhooks
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-slate-200 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Create Webhook
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={webhookForm.name}
                onChange={event => setWebhookForm(prev => ({ ...prev, name: event.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="url"
                placeholder="https://example.com/webhooks/cortexbuild"
                value={webhookForm.url}
                onChange={event => setWebhookForm(prev => ({ ...prev, url: event.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Events</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableWebhookEvents.slice(0, 12).map(eventId => (
                  <label key={eventId} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      checked={webhookForm.events.includes(eventId)}
                      onChange={() => handleWebhookFormEventToggle(eventId)}
                    />
                    <span className="capitalize">{eventId.replace(/\./g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleWebhookCreate} isLoading={isCreatingWebhook} disabled={isDemo}>
              <Save className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          <div className="space-y-3">
            {webhooks.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-lg p-6 text-sm text-slate-500 text-center">
                No webhooks configured yet. Create one to deliver real-time payloads to your stack.
              </div>
            ) : (
              webhooks.map(webhook => {
                const events = (() => {
                  try {
                    return JSON.parse(webhook.events) as string[];
                  } catch {
                    return [];
                  }
                })();

                return (
                  <div key={webhook.id} className="border border-slate-200 rounded-lg p-4 space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{webhook.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${webhook.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {webhook.is_active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 break-all">
                          <Globe className="w-3 h-3" />
                          {webhook.url}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleWebhookToggle(webhook)} disabled={isDemo}>
                          {webhook.is_active ? 'Pause' : 'Activate'}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleWebhookTest(webhook.id)} disabled={isDemo}>
                          <Activity className="w-4 h-4 mr-1" />
                          Test
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleWebhookDelete(webhook.id)} disabled={isDemo}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      {events.map(event => (
                        <span key={event} className="inline-flex items-center rounded-full border border-slate-200 px-2 py-0.5">
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500">
                      Success: {webhook.success_count} · Failures: {webhook.failure_count}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Workflow Launchpad</h3>
            <p className="text-sm text-slate-600">
              Spin up curated automations that showcase billing, safety, and operational use cases.
            </p>
          </div>
          <Button onClick={seedWorkflows} isLoading={isSeedingWorkflows} disabled={isDemo}>
            <Zap className="w-4 h-4 mr-2" />
            Add Sample Workflows
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          Generated workflows drop directly into your sandbox so you can tailor them, enable/disable modules, and publish to the marketplace.
        </p>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Subscription Tier</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(SUBSCRIPTION_DETAILS) as SdkSubscriptionTier[]).map(tier => (
            <div
              key={tier}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${subscriptionTier === tier
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}
              onClick={() => !isDemo && handleSubscriptionChange(tier)}
            >
              <h4 className="font-semibold text-slate-900 mb-1">{SUBSCRIPTION_DETAILS[tier].label}</h4>
              <p className="text-sm text-slate-600 mb-2">
                {SUBSCRIPTION_DETAILS[tier].limit.toLocaleString()} requests / month
              </p>
              {subscriptionTier === tier && (
                <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active Tier
                </span>
              )}
            </div>
          ))}
        </div>
        {subscriptionLoading && (
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Updating subscription…
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Gemini API Key</h3>
        <p className="text-sm text-slate-600">
          Store a Gemini API key to unlock Google models inside the SDK. Keys are encrypted at rest.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="password"
            value={apiKeyInput}
            onChange={event => setApiKeyInput(event.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Paste Gemini API key"
          />
          <Button onClick={() => handleApiKeySave(apiKeyInput)} disabled={isDemo}>
            <Save className="w-4 h-4 mr-2" />
            Save Key
          </Button>
        </div>
        <div className="text-sm text-slate-500">
          {activeGeminiKey
            ? <>Stored key: <span className="font-semibold text-slate-700">{maskKey(activeGeminiKey)}</span></>
            : 'No Gemini key stored yet.'}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Sandbox Mode</h3>
        <p className="text-sm text-slate-600">
          You are currently operating in <span className="font-semibold text-slate-900">{mode.toUpperCase()}</span> mode. Draft
          assets stay within your developer sandbox until promoted to production through the admin workflow.
        </p>
      </Card>
    </div>
  );

  // Simple icon component to avoid extra import for Plus
  function PlusIcon() {
    return <span className="mr-2 font-bold text-lg leading-none">+</span>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

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
                {profile ? SUBSCRIPTION_DETAILS[subscriptionTier].label : 'Loading...'}
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
            {NAV_TABS.map(tab => (
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
        {activeTab === 'builder' && renderBuilderTab()}
        {activeTab === 'zapier' && <ZapierStyleWorkflowBuilder />}
        {activeTab === 'workflows' && renderWorkflowsTab()}
        {activeTab === 'agents' && renderAgentsTab()}
        {activeTab === 'marketplace' && renderMarketplaceTab()}
        {activeTab === 'management' && renderManagementTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

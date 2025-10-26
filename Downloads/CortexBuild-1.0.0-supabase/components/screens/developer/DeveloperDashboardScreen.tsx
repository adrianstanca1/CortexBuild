import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AppWindow,
  ArrowRight,
  Brain,
  Code,
  Globe,
  Key,
  Layers,
  ListChecks,
  MessageCircle,
  Plug,
  PlugZap,
  RefreshCw,
  Rocket,
  Shield,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Store,
  Workflow,
  Zap,
  BookOpen
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Screen, User } from '../../../types';
import DeveloperMetricsWidget from '../../widgets/DeveloperMetricsWidget';
import DeveloperInsightsWidget from '../../widgets/DeveloperInsightsWidget';
import DeveloperFocusWidget from '../../widgets/DeveloperFocusWidget';
import { processDeveloperDashboardData } from '../../../utils/developerDashboardLogic';

interface DeveloperDashboardScreenProps {
  currentUser: User;
  navigateTo: (screen: Screen, params?: any) => void;
}

interface SdkProfile {
  apiRequestsUsed: number;
  apiRequestsLimit: number;
  subscriptionTier: string;
  gemini_api_key?: string;
}

interface SdkApp {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  version: string;
  updatedAt?: string;
  createdAt?: string;
}

interface SdkWorkflow {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface WebhookEntry {
  id: number;
  name: string;
  url: string;
  events: string;
  is_active: number;
  success_count: number;
  failure_count: number;
  updated_at?: string;
}

interface UsageSummary {
  provider: string;
  requestsThisMonth: number;
  monthToDateCost: number;
  totalTokens?: number;
}

interface AgentEntry {
  id: string;
  status: string;
}

interface CommunityModule {
  id: string;
  name: string;
  description: string;
  status: string;
  version: string;
  updatedAt: string;
  developerName?: string;
  companyName?: string;
}

interface BuilderNodeDraft {
  id: string;
  name: string;
  type: string;
  configText: string;
}

interface BuilderModule {
  id: string;
  name: string;
  description: string;
  status: string;
  version: string;
  manifest: {
    nodes: Array<{ id: string; name: string; type: string; config: any }>;
    connections: Array<{ id: string; source: string; target: string }>;
    metadata?: Record<string, any>;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface SandboxRun {
  id: string;
  name: string;
  definition: any;
  result: any;
  status: string;
  durationMs: number;
  createdAt: string;
}

interface BuilderTemplate {
  id: string;
  name: string;
  summary: string;
  nodes: Array<{ id: string; type: string; name: string; config: any }>;
  connections: Array<{ id: string; source: string; target: string }>;
}

type RoleExperienceAction = 'sandbox' | 'builder' | 'workflows' | 'publish' | 'apiKeys' | 'marketplace' | 'docs';
type RoleExperienceIntent = 'primary' | 'secondary' | 'warning';
type RoleExperienceStatus = 'clear' | 'warning' | 'blocked';
type RoleExperienceIcon = 'rocket' | 'sparkles' | 'workflow' | 'shield' | 'store' | 'key' | 'book' | 'zap';

interface RoleExperienceQuickAction {
  id: string;
  label: string;
  description: string;
  action: RoleExperienceAction;
  icon: RoleExperienceIcon;
  intent: RoleExperienceIntent;
  enabled: boolean;
  disabledReason?: string;
}

interface RoleExperienceGuardrail {
  id: string;
  title: string;
  status: RoleExperienceStatus;
  message: string;
  helper?: string;
  icon: RoleExperienceIcon;
}

interface RoleExperienceProgram {
  id: string;
  title: string;
  summary: string;
  action: RoleExperienceAction;
  ctaLabel: string;
  locked: boolean;
  lockedReason?: string;
  stat?: string;
  icon: RoleExperienceIcon;
}

interface RoleExperience {
  role: string;
  headline: string;
  subheading: string;
  quickActions: RoleExperienceQuickAction[];
  guardrails: RoleExperienceGuardrail[];
  programs: RoleExperienceProgram[];
}

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('constructai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SUBSCRIPTION_DETAILS: Record<string, { label: string; limit: number | 'unlimited' }> = {
  free: { label: 'Free', limit: 100 },
  starter: { label: 'Starter', limit: 1000 },
  pro: { label: 'Pro', limit: 10000 },
  enterprise: { label: 'Enterprise', limit: 'unlimited' }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const maskUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname.replace(/(.{10}).*(.{5})/, '$1...$2')}`;
  } catch {
    return url;
  }
};

const ROLE_ICON_MAP: Record<RoleExperienceIcon, LucideIcon> = {
  rocket: Rocket,
  sparkles: Sparkles,
  workflow: Workflow,
  shield: Shield,
  store: Store,
  key: Key,
  book: BookOpen,
  zap: Zap
};

const QUICK_ACTION_INTENT_CLASSES: Record<RoleExperienceIntent, string> = {
  primary: 'border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-900',
  secondary: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800',
  warning: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-slate-800'
};

const QUICK_ACTION_ICON_TONES: Record<RoleExperienceIntent, string> = {
  primary: 'text-emerald-500',
  secondary: 'text-slate-500',
  warning: 'text-amber-500'
};

const GUARDRAIL_STATUS_CLASSES: Record<
  RoleExperienceStatus,
  { badge: string; border: string; icon: string; label: string }
> = {
  clear: {
    badge: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-100',
    icon: 'text-emerald-500',
    label: 'Clear'
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-100',
    icon: 'text-amber-500',
    label: 'Warning'
  },
  blocked: {
    badge: 'bg-rose-100 text-rose-700',
    border: 'border-rose-100',
    icon: 'text-rose-500',
    label: 'Blocked'
  }
};

const DeveloperDashboardScreen: React.FC<DeveloperDashboardScreenProps> = ({ currentUser, navigateTo }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<SdkProfile | null>(null);
  const [apps, setApps] = useState<SdkApp[]>([]);
  const [workflows, setWorkflows] = useState<SdkWorkflow[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [usage, setUsage] = useState<UsageSummary[]>([]);
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [summaryStats, setSummaryStats] = useState<{
    totalApps: number;
    activeApps: number;
    pendingApps: number;
    totalWorkflows: number;
    activeWorkflows: number;
    totalWebhooks: number;
    activeWebhooks: number;
    totalAgents: number;
    runningAgents: number;
    totalRequestsThisMonth: number;
    totalCostThisMonth: number;
    totalTokensThisMonth: number;
  } | null>(null);
  const [communityModules, setCommunityModules] = useState<CommunityModule[]>([]);
  const [builderRuns, setBuilderRuns] = useState<SandboxRun[]>([]);
  const [builderTemplates, setBuilderTemplates] = useState<BuilderTemplate[]>([]);
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [publishBusy, setPublishBusy] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<any | null>(null);
  const [roleExperience, setRoleExperience] = useState<RoleExperience | null>(null);
  const [builderModules, setBuilderModules] = useState<BuilderModule[]>([]);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [builderEditor, setBuilderEditor] = useState<{
    id?: string;
    name: string;
    description: string;
    version: string;
    status: string;
    nodes: BuilderNodeDraft[];
    testPayload: string;
  }>({
    name: 'Untitled Builder Flow',
    description: '',
    version: '1.0.0',
    status: 'draft',
    nodes: [],
    testPayload: '{"example":"value"}'
  });
  const [selectedRun, setSelectedRun] = useState<SandboxRun | null>(null);
  const [builderSaving, setBuilderSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Automation Flow');
  const [workflowNodes, setWorkflowNodes] = useState<Array<{ id: string; type: 'trigger' | 'condition' | 'action'; name: string; description: string }>>([
    { id: 'trigger-1', type: 'trigger', name: 'When project status changes', description: 'Listens for any update to project status fields.' },
    { id: 'condition-1', type: 'condition', name: 'If status equals Approved', description: 'Evaluates the project status before continuing.' },
    { id: 'action-1', type: 'action', name: 'Notify finance team', description: 'Sends a notification with project details to finance.' }
  ]);
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hi! I am your BuilderKit copilot. Tell me what automation or mobile tool you would like to create and I will help.'
    }
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [mobileAppConfig, setMobileAppConfig] = useState({
    name: 'Field Companion',
    theme: 'light',
    offlineSupport: true,
    sections: {
      dailyLogs: true,
      timesheets: true,
      safety: false,
      procurement: false,
      qrScan: false
    }
  });

  const resetBuilderEditor = useCallback(() => {
    setBuilderEditor({
      id: undefined,
      name: 'Untitled Builder Flow',
      description: '',
      version: '1.0.0',
      status: 'draft',
      nodes: [],
      testPayload: '{"example":"value"}'
    });
  }, []);

  const toNodeDrafts = useCallback((nodes: Array<{ id: string; name: string; type: string; config: any }>) => {
    if (!nodes) return [];
    return nodes.map((node, index) => ({
      id: node.id || `node-${index + 1}`,
      name: node.name || `Step ${index + 1}`,
      type: node.type || 'action',
      configText: JSON.stringify(node.config ?? {}, null, 2)
    }));
  }, []);

  const buildManifestFromEditor = useCallback(() => {
    const nodes = builderEditor.nodes.map((node, index) => {
      let parsedConfig: any = {};
      try {
        parsedConfig = node.configText ? JSON.parse(node.configText) : {};
      } catch {
        parsedConfig = { raw: node.configText };
      }
      return {
        id: node.id || `node-${index + 1}`,
        name: node.name || `Step ${index + 1}`,
        type: node.type || 'action',
        config: parsedConfig
      };
    });

    const connections = nodes.length <= 1
      ? []
      : nodes.slice(0, -1).map((node, index) => ({
        id: `conn-${index + 1}`,
        source: node.id,
        target: nodes[index + 1].id
      }));

    let payload: any = {};
    try {
      payload = builderEditor.testPayload ? JSON.parse(builderEditor.testPayload) : {};
    } catch {
      payload = { raw: builderEditor.testPayload };
    }

    return {
      nodes,
      connections,
      metadata: {
        testPayload: payload
      }
    };
  }, [builderEditor]);

  const handleStartNewModule = useCallback((template?: BuilderTemplate) => {
    if (template) {
      setBuilderEditor({
        id: undefined,
        name: `${template.name} Copy`,
        description: template.summary,
        version: '1.0.0',
        status: 'draft',
        nodes: toNodeDrafts(template.nodes),
        testPayload: JSON.stringify({ template: template.id }, null, 2)
      });
    } else {
      resetBuilderEditor();
    }
  }, [resetBuilderEditor, toNodeDrafts]);

  const handleEditModule = useCallback((module: BuilderModule) => {
    setBuilderEditor({
      id: module.id,
      name: module.name,
      description: module.description || '',
      version: module.version || '1.0.0',
      status: module.status || 'draft',
      nodes: toNodeDrafts(module.manifest?.nodes || []),
      testPayload: JSON.stringify(module.manifest?.metadata?.testPayload ?? {}, null, 2)
    });
  }, [toNodeDrafts]);

  const handleNodeChange = useCallback((index: number, field: keyof BuilderNodeDraft, value: string) => {
    setBuilderEditor((prev) => {
      const nodes = [...prev.nodes];
      nodes[index] = { ...nodes[index], [field]: value };
      return { ...prev, nodes };
    });
  }, []);

  const handleAddNode = useCallback(() => {
    setBuilderEditor((prev) => ({
      ...prev,
      nodes: [
        ...prev.nodes,
        {
          id: `node-${prev.nodes.length + 1}`,
          name: `Step ${prev.nodes.length + 1}`,
          type: 'action',
          configText: '{"example":true}'
        }
      ]
    }));
  }, []);

  const handleRemoveNode = useCallback((index: number) => {
    setBuilderEditor((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((_, nodeIndex) => nodeIndex !== index)
    }));
  }, []);

  const handleSaveBuilderModule = useCallback(async () => {
    const manifest = buildManifestFromEditor();
    if (!builderEditor.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!builderEditor.nodes.length) {
      toast.error('Add at least one node to the flow');
      return;
    }

    setBuilderSaving(true);
    try {
      const response = await api.post('/developer/builder/modules', {
        id: builderEditor.id,
        name: builderEditor.name.trim(),
        description: builderEditor.description,
        version: builderEditor.version,
        status: builderEditor.status,
        manifest
      });

      if (response.data?.success) {
        const savedModule: BuilderModule = response.data.module;
        setBuilderModules((prev) => {
          const others = prev.filter((module) => module.id !== savedModule.id);
          return [savedModule, ...others];
        });
        setBuilderEditor((prev) => ({ ...prev, id: savedModule.id }));
        toast.success('Builder module saved');
      } else {
        toast.error(response.data?.error || 'Failed to save module');
      }
    } catch (error: any) {
      console.error('Save builder module failed', error);
      toast.error(error.response?.data?.error || 'Failed to save module');
    } finally {
      setBuilderSaving(false);
    }
  }, [buildManifestFromEditor, builderEditor]);

  const handleRunBuilderModule = useCallback(async (module: BuilderModule) => {
    const payload = module.manifest?.metadata?.testPayload ?? {};
    await handleSandboxRun({ name: module.name, definition: module.manifest, payload });
  }, [handleSandboxRun]);

  const handleRunCurrentBuilder = useCallback(async () => {
    if (!builderEditor.nodes.length) {
      toast.error('Add nodes to the builder before running');
      return;
    }
    const manifest = buildManifestFromEditor();
    const payload = manifest.metadata?.testPayload ?? {};
    await handleSandboxRun({ name: builderEditor.name || 'Builder Flow', definition: manifest, payload });
  }, [buildManifestFromEditor, handleSandboxRun, builderEditor.name, builderEditor.nodes.length]);

  const loadBuilderModules = useCallback(async () => {
    try {
      const response = await api.get('/developer/builder/modules');
      if (response.data?.success) {
        setBuilderModules(response.data.modules || []);
      }
    } catch (error) {
      console.error('Failed to load builder modules', error);
    }
  }, []);

  const loadCommunityModules = useCallback(async () => {
    try {
      const [modulesRes, templatesRes] = await Promise.all([
        api.get('/developer/modules/community'),
        api.get('/developer/builder/templates')
      ]);
      if (modulesRes.data?.success) {
        setCommunityModules(modulesRes.data.modules || []);
      }
      if (templatesRes.data?.success) {
        setBuilderTemplates(templatesRes.data.templates || []);
      }
    } catch (error) {
      console.error('Failed to load community modules', error);
    }
  }, []);

  const loadDashboardData = useCallback(async (withLoader: boolean) => {
    if (withLoader) {
      setLoading(true);
    }

    const loadFallback = async () => {
      try {
        const [profileRes, appsRes, workflowsRes, usageRes, webhooksRes, agentsRes, runsRes] = await Promise.all([
          api.get('/sdk/profile'),
          api.get('/sdk/apps'),
          api.get('/sdk/workflows'),
          api.get('/sdk/analytics/usage'),
          api.get('/integrations/webhooks/list'),
          api.get('/sdk/agents'),
          api.get('/developer/builder/runs')
        ]);

        if (profileRes.data.success) {
          setProfile(profileRes.data.profile);
        }
        if (appsRes.data.success) {
          setApps(appsRes.data.apps || []);
        }
        if (workflowsRes.data.success) {
          setWorkflows(workflowsRes.data.workflows || []);
        }
        if (usageRes.data.success) {
          setUsage(usageRes.data.costSummary || []);
        }
        if (webhooksRes.data.success) {
          setWebhooks(webhooksRes.data.webhooks || []);
        }
        if (agentsRes.data.success) {
          setAgents(agentsRes.data.agents || []);
        }
        if (runsRes.data.success) {
          setBuilderRuns(runsRes.data.runs || []);
        } else {
          setBuilderRuns([]);
        }
        setSummaryStats(null);
        setRoleExperience(null);
        await loadCommunityModules();
        await loadBuilderModules();
        try {
          const capabilitiesRes = await api.get('/developer/capabilities');
          if (capabilitiesRes.data?.success) {
            setCapabilities(capabilitiesRes.data.capabilities || null);
            setRoleExperience(capabilitiesRes.data.roleExperience || null);
          }
        } catch (capError) {
          console.error('Failed to load capabilities', capError);
        }
      } catch (fallbackError) {
        console.error('Failed to load developer dashboard (fallback)', fallbackError);
        toast.error('Unable to load developer dashboard data');
      }
    };

    try {
      const summaryRes = await api.get('/developer/dashboard/summary');
      if (summaryRes.data?.success) {
        const summary = summaryRes.data;
        setProfile(summary.profile || null);
        setApps(summary.apps || []);
        setWorkflows(summary.workflows || []);
        setWebhooks(summary.webhooks || []);
        setUsage(summary.usageSummary || []);
        setAgents(summary.agents || []);
        setSummaryStats(summary.stats || null);
        setBuilderRuns(summary.sandboxRuns || []);
        setBuilderModules(summary.builderModules || []);
        setCapabilities(summary.capabilities || null);
        setRoleExperience(summary.roleExperience || null);
        await loadCommunityModules();

        // Process dashboard data with ML logic
        try {
          const processedData = processDeveloperDashboardData({
            profile: summary.profile,
            apps: summary.apps || [],
            workflows: summary.workflows || [],
            webhooks: summary.webhooks || [],
            usage: summary.usageSummary || [],
            agents: summary.agents || [],
            stats: summary.stats,
            sandboxRuns: summary.sandboxRuns || [],
            capabilities: summary.capabilities
          });
          setDashboardData(processedData);
        } catch (mlError) {
          console.error('Failed to process dashboard data with ML', mlError);
          setDashboardData(null);
        }
      } else {
        await loadFallback();
      }
    } catch (error) {
      console.error('Failed to load developer dashboard summary', error);
      await loadFallback();
    } finally {
      if (withLoader) {
        setLoading(false);
      }
    }
  }, [loadCommunityModules, loadBuilderModules]);

  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData, currentUser.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(false);
    setRefreshing(false);
    toast.success('Developer insights refreshed');
  };

  const handleSandboxRun = useCallback(async (options: { appId?: string; workflowId?: string; definition?: any; name?: string; payload?: any } = {}) => {
    if (sandboxRunning) return;
    setSandboxRunning(true);
    try {
      const endpoint = options.definition ? '/developer/builder/run' : '/developer/sandbox/run';
      const response = await api.post(endpoint, options);
      if (response.data?.success) {
        const resultPayload = response.data.run ?? response.data.simulation ?? null;
        setSandboxResult(resultPayload);
        toast.success('Sandbox simulation completed');
        await loadDashboardData(false);
      } else {
        toast.error(response.data?.error || 'Sandbox simulation failed');
      }
    } catch (error) {
      console.error('Sandbox run failed', error);
      toast.error('Sandbox run failed');
    } finally {
      setSandboxRunning(false);
    }
  }, [sandboxRunning, loadDashboardData]);

  const handleQuickAction = useCallback(
    async (action: RoleExperienceQuickAction) => {
      if (!action.enabled) {
        if (action.disabledReason) {
          toast.error(action.disabledReason);
        }
        return;
      }

      switch (action.action) {
        case 'sandbox':
          await handleSandboxRun();
          break;
        case 'builder':
          navigateTo('sdk-developer', { startTab: 'builder' });
          break;
        case 'workflows':
          navigateTo('sdk-developer', { startTab: 'workflows' });
          break;
        case 'publish':
        case 'marketplace':
          navigateTo('sdk-developer', { startTab: 'marketplace' });
          break;
        case 'apiKeys':
          navigateTo('sdk-developer', { startTab: 'settings' });
          break;
        case 'docs':
          toast('Program guide coming soon — contact your Super Admin for access.');
          break;
        default:
          console.info('Unhandled quick action', action);
      }
    },
    [handleSandboxRun, navigateTo]
  );

  const handlePublishApp = useCallback(async (appId: string, nextStatus: 'pending_review' | 'approved' = 'pending_review') => {
    if (!canPublishModules) {
      toast.error('Publishing is not permitted for your role');
      return;
    }
    setPublishBusy(appId);
    try {
      const response = await api.post(`/developer/modules/${appId}/publish`, {
        targetStatus: nextStatus
      });
      if (response.data?.success) {
        toast.success(`Module status updated to ${nextStatus.replace('_', ' ')}`);
        await loadDashboardData(false);
      } else {
        toast.error(response.data?.error || 'Failed to update module status');
      }
    } catch (error) {
      console.error('Failed to publish module', error);
      toast.error('Failed to update module status');
    } finally {
      setPublishBusy(null);
    }
  }, [canPublishModules, loadDashboardData]);

  const subscriptionInfo = useMemo(() => {
    if (!profile) return null;
    const tierKey = profile.subscriptionTier || 'free';
    return SUBSCRIPTION_DETAILS[tierKey] || SUBSCRIPTION_DETAILS.free;
  }, [profile]);

  const usageStats = useMemo(() => {
    if (summaryStats) {
      return {
        totalRequests: summaryStats.totalRequestsThisMonth,
        totalCost: summaryStats.totalCostThisMonth,
        totalTokens: summaryStats.totalTokensThisMonth,
        activeProviders: usage.length
      };
    }
    const totalRequests = usage.reduce((sum, item) => sum + (item.requestsThisMonth || 0), 0);
    const totalCost = usage.reduce((sum, item) => sum + (item.monthToDateCost || 0), 0);
    const totalTokens = usage.reduce((sum, item) => sum + (item.totalTokens || 0), 0);
    const activeProviders = usage.length;
    return { totalRequests, totalCost, totalTokens, activeProviders };
  }, [usage, summaryStats]);

  const activeApps = useMemo(
    () => summaryStats?.activeApps ?? apps.filter((app) => app.status === 'approved').length,
    [summaryStats?.activeApps, apps]
  );
  const pendingApps = useMemo(
    () => summaryStats?.pendingApps ?? apps.filter((app) => app.status === 'pending_review').length,
    [summaryStats?.pendingApps, apps]
  );
  const activeWorkflows = useMemo(
    () => summaryStats?.activeWorkflows ?? workflows.filter((wf) => wf.isActive).length,
    [summaryStats?.activeWorkflows, workflows]
  );
  const activeWebhooks = useMemo(
    () => summaryStats?.activeWebhooks ?? webhooks.filter((hook) => hook.is_active === 1).length,
    [summaryStats?.activeWebhooks, webhooks]
  );
  const runningAgents = useMemo(
    () => summaryStats?.runningAgents ?? agents.filter((agent) => agent.status === 'running').length,
    [summaryStats?.runningAgents, agents]
  );

  const usagePercent = useMemo(() => {
    if (!profile) return 0;
    if (profile.apiRequestsLimit === -1 || subscriptionInfo?.limit === 'unlimited') {
      return 0;
    }
    const limit = profile.apiRequestsLimit || 0;
    if (limit === 0) return 0;
    return Math.min(Math.round((profile.apiRequestsUsed / limit) * 100), 100);
  }, [profile, subscriptionInfo]);

  const capabilitySummary = useMemo(() => {
    if (!capabilities) return null;
    const runsLimit = capabilities.maxSandboxRunsPerDay ?? -1;
    const usage = capabilities.usage ?? {};
    const runsUsed = usage.sandboxRunsToday ?? 0;
    const runsRemaining = runsLimit < 0 ? Infinity : Math.max(runsLimit - runsUsed, 0);

    return {
      role: capabilities.role ?? currentUser.role,
      runsLimit,
      runsUsed,
      runsRemaining,
      maxApps: capabilities.maxActiveApps ?? -1,
      maxWorkflows: capabilities.maxActiveWorkflows ?? -1,
      usage
    };
  }, [capabilities, currentUser.role]);

  const sandboxLimitReached = useMemo(() => {
    if (!capabilitySummary) return false;
    if (capabilitySummary.runsLimit < 0) return false;
    return capabilitySummary.runsRemaining <= 0;
  }, [capabilitySummary]);

  const canPublishModules = useMemo(() => {
    if (!capabilities) return true;
    return capabilities.canPublishModules !== false;
  }, [capabilities]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500">Preparing developer control center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Developer Focus Widget - Replaces header */}
      {!loading && dashboardData && (
        <DeveloperFocusWidget
          priorityTask={dashboardData.priorityTask}
          metrics={dashboardData.focusMetrics}
          userName={currentUser.name}
        />
      )}

      {!dashboardData && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" />
              Multi-tenant Developer Environment
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Developer Control Center</h1>
            <p className="mt-2 text-sm text-slate-600">
              Company Scope: <span className="font-semibold text-slate-700">{currentUser.companyId}</span> · Sandbox linked to{' '}
              <span className="font-semibold text-slate-700">{currentUser.email}</span>
            </p>
            {roleExperience && (
              <p className="mt-2 text-xs text-slate-500 max-w-2xl">{roleExperience.subheading}</p>
            )}
            {capabilitySummary && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 uppercase">
                  {capabilitySummary.role.replace('_', ' ')} Access
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                  {capabilitySummary.runsLimit < 0
                    ? 'Unlimited sandbox simulations'
                    : `${capabilitySummary.runsRemaining} of ${capabilitySummary.runsLimit} sandbox runs remaining today`}
                </span>
                {capabilitySummary.maxApps >= 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                    App slots {activeApps}/{capabilitySummary.maxApps}
                  </span>
                )}
                {capabilitySummary.maxWorkflows >= 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                    Workflows {activeWorkflows}/{capabilitySummary.maxWorkflows}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigateTo('sdk-developer')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Rocket className="h-4 w-4" />
              Open SDK Workspace
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      )}

      {/* Developer Metrics Widget - ML-Powered */}
      {dashboardData && (
        <DeveloperMetricsWidget
          metrics={dashboardData.metrics}
          trends={dashboardData.trends}
        />
      )}

      {/* Developer Insights Widget - AI-Powered */}
      <div className="grid gap-6 lg:grid-cols-2">
        {dashboardData && (
          <DeveloperInsightsWidget
            insights={dashboardData.insights}
            onAction={(insightId) => {
              console.log('Insight action:', insightId);
              // Handle insight actions
              if (insightId.includes('quota')) {
                navigateTo('sdk-developer', { startTab: 'settings' });
              } else if (insightId.includes('cost')) {
                navigateTo('sdk-developer', { startTab: 'analytics' });
              } else if (insightId.includes('performance')) {
                navigateTo('sdk-developer', { startTab: 'analytics' });
              }
            }}
          />
        )}

        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-sm text-slate-500">
                {roleExperience ? 'Tailored to your role and current guardrails.' : 'Jump straight into the workflows you manage most.'}
              </p>
            </div>
            {roleExperience && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                <Sparkles className="h-3 w-3" />
                Role-aware
              </span>
            )}
          </div>
          <div className={`grid gap-3 ${roleExperience ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}`}>
            {roleExperience ? (
              roleExperience.quickActions.length > 0 ? (
                roleExperience.quickActions.map((action) => {
                  const Icon = ROLE_ICON_MAP[action.icon] ?? Sparkles;
                  const intentClass = QUICK_ACTION_INTENT_CLASSES[action.intent] ?? QUICK_ACTION_INTENT_CLASSES.secondary;
                  const iconTone = QUICK_ACTION_ICON_TONES[action.intent] ?? 'text-slate-500';
                  const helper = action.enabled ? action.description : action.disabledReason ?? action.description;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleQuickAction(action)}
                      disabled={!action.enabled}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${intentClass}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                        <p className={`text-xs ${action.enabled ? 'text-slate-500' : 'text-slate-400'}`}>{helper}</p>
                      </div>
                      <Icon className={`h-5 w-5 ${action.enabled ? iconTone : 'text-slate-400'}`} />
                    </button>
                  );
                })
              ) : (
                <p className="sm:col-span-2 text-sm text-slate-500">No quick actions available for this role.</p>
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSandboxRun()}
                  disabled={sandboxRunning || sandboxLimitReached}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-purple-400 hover:bg-purple-50 transition-colors disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Run Sandbox Test</p>
                    <p className="text-xs text-slate-500">
                      {sandboxLimitReached ? 'Daily sandbox quota reached for your role' : 'Validate modules in isolation'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('sdk-developer', { startTab: 'builder' })}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Generate Module</p>
                    <p className="text-xs text-slate-500">AI builder with live preview</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('sdk-developer', { startTab: 'workflows' })}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Automate Workflow</p>
                    <p className="text-xs text-slate-500">Design and activate pipelines</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('sdk-developer', { startTab: 'marketplace' })}
                  disabled={!canPublishModules}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-amber-400 hover:bg-amber-50 transition-colors disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Publish to Marketplace</p>
                    <p className="text-xs text-slate-500">
                      {canPublishModules ? 'Promote modules to clients' : 'Publishing restricted for this role'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('sdk-developer', { startTab: 'settings' })}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Manage API Keys</p>
                    <p className="text-xs text-slate-500">Rotate secrets and limits</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </button>
              </>
            )}
          </div>
        </Card>
      </div>

      {roleExperience && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Access Guardrails</h3>
              <p className="text-sm text-slate-500">Track sandbox capacity, publishing rights, and quota thresholds.</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Guardrails
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {roleExperience.guardrails.length === 0 ? (
              <p className="text-sm text-slate-500 md:col-span-2">No guardrails detected for this role.</p>
            ) : (
              roleExperience.guardrails.map((guardrail) => {
                const Icon = ROLE_ICON_MAP[guardrail.icon] ?? Shield;
                const statusStyle = GUARDRAIL_STATUS_CLASSES[guardrail.status] ?? GUARDRAIL_STATUS_CLASSES.clear;

                return (
                  <div
                    key={guardrail.id}
                    className={`rounded-lg border ${statusStyle.border} bg-white/70 p-4`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${statusStyle.icon}`} />
                        <p className="text-sm font-semibold text-slate-900">{guardrail.title}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle.badge}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{guardrail.message}</p>
                    {guardrail.helper && (
                      <p className="mt-1 text-xs text-slate-400">{guardrail.helper}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {roleExperience ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roleExperience.programs.map((program) => {
            const Icon = ROLE_ICON_MAP[program.icon] ?? Sparkles;
            const derivedAction: RoleExperienceQuickAction = {
              id: program.id,
              label: program.title,
              description: program.summary,
              action: program.action,
              icon: program.icon,
              intent: 'secondary',
              enabled: !program.locked,
              disabledReason: program.lockedReason
            };

            return (
              <Card
                key={program.id}
                className={`p-5 space-y-3 border ${program.locked ? 'border-slate-200 bg-slate-50' : 'border-slate-200'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <Icon className="h-4 w-4 text-emerald-500" />
                    </span>
                    <p className="text-base font-semibold text-slate-900">{program.title}</p>
                  </div>
                  {program.stat && (
                    <span className="text-xs font-semibold text-slate-500">{program.stat}</span>
                  )}
                </div>
                <p className="text-sm text-slate-600">{program.summary}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAction(derivedAction)}
                    disabled={program.locked}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${program.locked
                      ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {program.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {program.locked && program.lockedReason && (
                    <span className="text-xs text-slate-400">{program.lockedReason}</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Modular Architecture',
              description: 'Independent modules that snap into any tenant in minutes.',
              points: ['Open-source patterns', 'Versioned releases', 'Continuous delivery']
            },
            {
              title: 'Developer Sandbox',
              description: 'Dedicated environment to create, debug, and iterate safely.',
              points: ['AI agent toolkit', 'API blueprinting', 'Realtime logs']
            },
            {
              title: 'Module Marketplace',
              description: 'Share innovations, monetise your expertise, and grow the ecosystem.',
              points: ['Revenue share', 'Community ratings', 'Launch campaigns']
            },
            {
              title: 'Industry Transformation',
              description: 'Contribute to the first open construction developer ecosystem.',
              points: ['Democratise advanced tech', 'Collaborative growth', 'Continuous evolution']
            }
          ].map((highlight) => (
            <Card key={highlight.title} className="p-5 space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">{highlight.title}</h3>
              <p className="text-sm text-slate-600">{highlight.description}</p>
              <ul className="text-xs text-slate-500 space-y-1">
                {highlight.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">BuilderKit Templates</h3>
            <p className="text-sm text-slate-500">Kickstart an automation with prebuilt flows inspired by Zapier-style playbooks.</p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('sdk-developer', { startTab: 'workflows' })}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Open Builder
          </button>
        </div>
        <div className="space-y-3">
          {builderTemplates.length === 0 ? (
            <p className="text-sm text-slate-500">Templates will appear here once your organisation publishes shared blueprints.</p>
          ) : (
            builderTemplates.map((template) => (
              <div key={template.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                  <p className="text-xs text-slate-500 max-w-xl">{template.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSandboxRun({ name: template.name, definition: { nodes: template.nodes, connections: template.connections } })}
                    disabled={sandboxRunning}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1 font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-60"
                  >
                    Simulate
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('sdk-developer', { startTab: 'workflows', templateId: template.id })}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Customise
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">BuilderKit Modules</h3>
            <p className="text-sm text-slate-500">
              Design modular automations, save them as manifests, and promote them to tenants or the marketplace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleStartNewModule()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              New Module
            </button>
            <div className="relative">
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                onChange={(event) => {
                  const template = builderTemplates.find((tmpl) => tmpl.id === event.target.value);
                  if (template) {
                    handleStartNewModule(template);
                  }
                  event.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Start from template...
                </option>
                {builderTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Saved Modules</h4>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {builderModules.length === 0 ? (
                <p className="text-sm text-slate-500">No builder modules yet. Create one to share with your tenant or marketplace.</p>
              ) : (
                builderModules.map((module) => (
                  <div key={module.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{module.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{module.description}</p>
                        <p className="text-xs text-slate-400 mt-1">v{module.version} • {module.status}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditModule(module)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRunBuilderModule(module)}
                          disabled={sandboxRunning || sandboxLimitReached}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-60"
                        >
                          Run
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Builder Editor</h4>
            <div className="space-y-3">
              <div className="grid gap-3">
                <label className="text-xs font-semibold text-slate-500 uppercase">Module Name</label>
                <input
                  type="text"
                  value={builderEditor.name}
                  onChange={(event) => setBuilderEditor((prev) => ({ ...prev, name: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter module name"
                />
              </div>
              <div className="grid gap-3">
                <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                <textarea
                  value={builderEditor.description}
                  onChange={(event) => setBuilderEditor((prev) => ({ ...prev, description: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Version</label>
                  <input
                    type="text"
                    value={builderEditor.version}
                    onChange={(event) => setBuilderEditor((prev) => ({ ...prev, version: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select
                    value={builderEditor.status}
                    onChange={(event) => setBuilderEditor((prev) => ({ ...prev, status: event.target.value }))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="ready">Ready</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Nodes</label>
                  <button
                    type="button"
                    onClick={handleAddNode}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Add Node
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {builderEditor.nodes.length === 0 ? (
                  <p className="text-sm text-slate-500">Add steps to define your automation flow.</p>
                ) : (
                  builderEditor.nodes.map((node, index) => (
                    <div key={node.id} className="rounded-lg border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-slate-500">Step {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNode(index)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <input
                          type="text"
                          value={node.name}
                          onChange={(event) => handleNodeChange(index, 'name', event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Node name"
                        />
                        <select
                          value={node.type}
                          onChange={(event) => handleNodeChange(index, 'type', event.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="trigger">Trigger</option>
                          <option value="action">Action</option>
                          <option value="condition">Condition</option>
                        </select>
                      </div>
                      <textarea
                        value={node.configText}
                        onChange={(event) => handleNodeChange(index, 'configText', event.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={3}
                        placeholder='{"key":"value"}'
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="grid gap-3">
                <label className="text-xs font-semibold text-slate-500 uppercase">Test Payload</label>
                <textarea
                  value={builderEditor.testPayload}
                  onChange={(event) => setBuilderEditor((prev) => ({ ...prev, testPayload: event.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSaveBuilderModule}
                  disabled={builderSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {builderSaving ? 'Saving...' : 'Save Module'}
                </button>
                <button
                  type="button"
                  onClick={handleRunCurrentBuilder}
                  disabled={sandboxRunning || sandboxLimitReached}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-60"
                >
                  {sandboxLimitReached ? 'Limit Reached' : 'Run in Sandbox'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Developer Sandbox</h3>
              <p className="text-sm text-slate-500">Experiment with modules, workflows, and agents without impacting production.</p>
            </div>
            <Zap className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-sm text-slate-600">Kick off a simulation to validate integrations, inspect mock payloads, and ensure your release meets quality standards.</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSandboxRun()}
              disabled={sandboxRunning || sandboxLimitReached}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors disabled:opacity-60"
            >
              <Rocket className={`h-4 w-4 ${sandboxRunning ? 'animate-spin' : ''}`} />
              {sandboxRunning ? 'Running Simulation...' : sandboxLimitReached ? 'Limit Reached' : 'Run Simulation'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('sdk-developer', { startTab: 'builder' })}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Code className="h-4 w-4 text-slate-500" />
              Open Workspace
            </button>
          </div>
          {sandboxResult && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
              <div className="text-sm font-semibold text-slate-800">Last Simulation</div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600">
                {JSON.stringify(sandboxResult, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Community Modules</h3>
              <p className="text-sm text-slate-500">Explore approved modules delivered by peers across the ecosystem.</p>
            </div>
            <Globe className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="space-y-3">
            {communityModules.length === 0 ? (
              <p className="text-sm text-slate-500">No community modules published yet. Be the first to share an innovation.</p>
            ) : (
              communityModules.map((module) => (
                <div key={module.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{module.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{module.description}</p>
                      <p className="text-xs text-slate-400 mt-1">By {module.developerName} • {module.companyName}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full capitalize">{module.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSandboxRun({ appId: module.id })}
                      disabled={sandboxRunning || sandboxLimitReached}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
                    >
                      Clone to Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('sdk-developer', { startTab: 'marketplace' })}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1 font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      View Marketplace
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <Card className="p-6 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Applications</h3>
            <Layers className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {apps.slice(0, 4).map((app) => (
              <div key={app.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{app.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${app.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : app.status === 'pending_review'
                        ? 'bg-amber-100 text-amber-700'
                        : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{app.description}</p>
                <p className="mt-2 text-xs text-slate-400">v{app.version}</p>
                {app.status !== 'approved' && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handlePublishApp(app.id, 'pending_review')}
                      disabled={publishBusy === app.id || !canPublishModules}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
                    >
                      {canPublishModules ? 'Submit for Review' : 'Publishing Locked'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSandboxRun({ appId: app.id })}
                      disabled={sandboxRunning}
                      className="inline-flex items-center gap-1 rounded-lg border border-purple-200 px-3 py-1 font-semibold text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-60"
                    >
                      Test in Sandbox
                    </button>
                  </div>
                )}
              </div>
            ))}
            {apps.length === 0 && <p className="text-sm text-slate-500">No applications yet. Generate your first module to get started.</p>}
          </div>
        </Card>

        <Card className="p-6 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Operational Workflows</h3>
            <Workflow className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {workflows.slice(0, 4).map((workflow) => (
              <div key={workflow.id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{workflow.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${workflow.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {workflow.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Updated {workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleString() : '—'}
                </p>
              </div>
            ))}
            {workflows.length === 0 && <p className="text-sm text-slate-500">You have not published any automations yet.</p>}
          </div>
        </Card>

        <Card className="p-6 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Webhook Activity</h3>
            <Globe className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {webhooks.slice(0, 4).map((hook) => {
              let eventList: string[] = [];
              try {
                eventList = JSON.parse(hook.events) as string[];
              } catch {
                eventList = [];
              }
              return (
                <div key={hook.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{hook.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${hook.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {hook.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 break-all">{maskUrl(hook.url)}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Events: {eventList.slice(0, 3).join(', ')}
                    {eventList.length > 3 ? ` +${eventList.length - 3}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Success {hook.success_count} · Failures {hook.failure_count}
                  </p>
                </div>
              );
            })}
            {webhooks.length === 0 && <p className="text-sm text-slate-500">No webhooks configured yet.</p>}
          </div>
        </Card>

        <Card className="p-6 xl:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Sandbox History</h3>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3">
            {builderRuns.length === 0 ? (
              <p className="text-sm text-slate-500">No sandbox runs yet. Launch a simulation to see results here.</p>
            ) : (
              builderRuns.slice(0, 6).map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => setSelectedRun(run)}
                  className="w-full rounded-lg border border-slate-100 p-3 text-left hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{run.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${run.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {run.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{new Date(run.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Duration {(run.durationMs / 1000).toFixed(2)}s</p>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      {selectedRun && (
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Sandbox Run Details</h3>
              <p className="text-sm text-slate-500">{selectedRun.name} • {new Date(selectedRun.createdAt).toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRun(null)}
              className="text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Close
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Definition</h4>
              <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                {JSON.stringify(selectedRun.definition, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase">Result</h4>
              <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                {JSON.stringify(selectedRun.result, null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Agent Orchestration</h3>
            <p className="text-sm text-slate-500">Track the agents deployed across your tenant. Running agents continue to listen for events.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {runningAgents} running · {agents.length} total
          </div>
        </div>
        {agents.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">You have not created any agents yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agents.slice(0, 6).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{agent.id}</p>
                  <p className="text-xs text-slate-500 uppercase">{agent.status}</p>
                </div>
                <div className={`rounded-full px-2 py-1 text-xs font-semibold ${agent.status === 'running'
                  ? 'bg-emerald-100 text-emerald-700'
                  : agent.status === 'paused'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                  {agent.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Tenant Health</h3>
              <p className="text-sm text-slate-500">
                Monitor usage across your company’s sandboxes to keep environments aligned with production needs.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Requests Month</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{usageStats.totalRequests.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Tokens Consumed</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{usageStats.totalTokens.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Active Automations</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{activeWorkflows}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Agents Online</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{runningAgents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Deployment Readiness</h3>
              <p className="text-sm text-slate-500">
                Validate modules and automations before publishing to the tenant marketplace.
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
              Ensure at least one approved application exists for pilot customers.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
              Maintain a minimum of two active workflows to keep automation coverage high.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-amber-500" />
              Configure webhooks for billing or safety notifications to complete the integration loop.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperDashboardScreen;

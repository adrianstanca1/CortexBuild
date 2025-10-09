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
  XCircle
} from 'lucide-react';

// API Configuration
const API_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('constructai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

interface ProductionSDKDeveloperViewProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const ProductionSDKDeveloperView: React.FC<ProductionSDKDeveloperViewProps> = ({ user, onNavigate }) => {
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
  
  const [profile, setProfile] = useState<SdkProfile | null>(null);
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

  // Load data on mount
  useEffect(() => {
    loadProfile();
    loadApps();
    loadWorkflows();
    loadAgents();
    loadAnalytics();
  }, []);

  // API Functions
  const loadProfile = async () => {
    try {
      const response = await api.get('/sdk/profile');
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load SDK profile');
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

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const encryptValue = async (value: string, userId: string): Promise<string> => {
    // Simple base64 encoding for demo - use proper encryption in production
    return btoa(`${userId}:${value}`);
  };

  const getStorageKey = (userId: string) => `gemini_key_${userId}`;

  // Render usage bar
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
      <Toaster position="top-right" />
      {/* Header and content will be added in next part */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900">Production SDK Developer View</h1>
        <p className="text-slate-600 mt-2">Real backend integration with toast notifications</p>
      </div>
    </div>
  );
};


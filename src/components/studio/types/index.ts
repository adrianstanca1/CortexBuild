/**
 * Studio Types and Interfaces
 */

export interface StudioProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'draft';
  type: 'web-app' | 'api' | 'mobile' | 'desktop' | 'library' | 'other';
  developer_id: string;
  company_id?: string;
  repository_url?: string;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
  settings: ProjectSettings;
  metadata: ProjectMetadata;
}

export interface ProjectSettings {
  is_public: boolean;
  allow_collaboration: boolean;
  auto_deploy: boolean;
  notifications: boolean;
  ai_assistance: boolean;
}

export interface ProjectMetadata {
  version: string;
  last_deployment?: string;
  deployment_count: number;
  collaborator_count: number;
  file_count: number;
  test_coverage?: number;
}

export interface StudioWorkspace {
  id: string;
  name: string;
  description?: string;
  type: 'development' | 'testing' | 'staging' | 'production';
  is_public: boolean;
  developer_id: string;
  company_id?: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joined_at: string;
  status: 'active' | 'inactive';
}

export interface WorkspaceSettings {
  allow_external_collaboration: boolean;
  require_approval_for_changes: boolean;
  auto_save: boolean;
  notifications: boolean;
}

export interface DeploymentConfig {
  id: string;
  project_id: string;
  name: string;
  environment: 'development' | 'staging' | 'production';
  provider: 'vercel' | 'netlify' | 'heroku' | 'aws' | 'gcp' | 'azure' | 'custom';
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'failed';
  last_deployment?: string;
  created_at: string;
  updated_at: string;
}

export interface TestSuite {
  id: string;
  project_id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  framework: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'custom';
  config: Record<string, any>;
  status: 'active' | 'inactive';
  last_run?: string;
  results?: TestResults;
}

export interface TestResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: number;
  timestamp: string;
}

export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
  type: 'component' | 'function' | 'class' | 'api' | 'utility' | 'complete-app';
  complexity: 'simple' | 'medium' | 'complex';
  options: Record<string, any>;
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  suggestions: string[];
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  provider: string;
  model: string;
}

export interface CollaborationSession {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  participants: CollaborationParticipant[];
  settings: CollaborationSettings;
  created_at: string;
  updated_at: string;
}

export interface CollaborationParticipant {
  user_id: string;
  role: 'host' | 'participant' | 'observer';
  status: 'online' | 'offline' | 'away';
  joined_at: string;
  last_activity: string;
  cursor?: {
    file_path: string;
    line: number;
    column: number;
  };
}

export interface CollaborationSettings {
  allow_external_participants: boolean;
  require_approval: boolean;
  max_participants: number;
  features: {
    live_cursors: boolean;
    code_comments: boolean;
    voice_chat: boolean;
    screen_share: boolean;
  };
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    api_calls: number;
    deployments: number;
    test_runs: number;
    collaboration_sessions: number;
    code_generations: number;
    errors: number;
  };
  trends: {
    api_usage: Array<{ date: string; value: number }>;
    deployment_frequency: Array<{ date: string; value: number }>;
    test_success_rate: Array<{ date: string; value: number }>;
    collaboration_activity: Array<{ date: string; value: number }>;
  };
  top_projects: Array<{
    id: string;
    name: string;
    metric: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'failed';
  timestamp: string;
  duration?: number;
}

export interface StudioError {
  id: string;
  type: 'compilation' | 'runtime' | 'deployment' | 'test' | 'collaboration';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  project_id?: string;
  workspace_id?: string;
  timestamp: string;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface StudioNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  read: boolean;
  timestamp: string;
  expires_at?: string;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: 'code-analysis' | 'optimization' | 'documentation' | 'testing' | 'debugging' | 'refactoring';
  provider: 'openai' | 'anthropic' | 'gemini' | 'custom';
  config: Record<string, any>;
  usage_count: number;
  last_used?: string;
}

export interface CodeAnalysisResult {
  quality: {
    score: number;
    issues: string[];
    strengths: string[];
    improvements: string[];
  };
  complexity: {
    cyclomatic: number;
    cognitive: number;
    maintainability: number;
  };
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  suggestions: string[];
}

export interface OptimizationSuggestion {
  type: 'performance' | 'memory' | 'security' | 'maintainability';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  codeExample?: string;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}

// Hook types
export interface UseStudioDataOptions {
  refreshInterval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export interface UseStudioDataReturn<T = any> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

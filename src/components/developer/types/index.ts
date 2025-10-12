/**
 * Developer Console Types and Interfaces
 */

export interface DeveloperWorkspace {
  id: string;
  name: string;
  description?: string;
  type: 'development' | 'testing' | 'staging' | 'production';
  status: 'active' | 'inactive' | 'maintenance';
  developer_id: string;
  company_id?: string;
  settings: WorkspaceSettings;
  members: WorkspaceMember[];
  projects: string[];
  created_at: string;
  updated_at: string;
  metadata: WorkspaceMetadata;
}

export interface WorkspaceSettings {
  allow_external_collaboration: boolean;
  require_approval_for_changes: boolean;
  auto_save: boolean;
  notifications: boolean;
  debugging_enabled: boolean;
  performance_monitoring: boolean;
  error_tracking: boolean;
}

export interface WorkspaceMember {
  user_id: string;
  role: 'owner' | 'admin' | 'developer' | 'observer';
  permissions: string[];
  joined_at: string;
  last_activity: string;
  status: 'online' | 'offline' | 'away';
}

export interface WorkspaceMetadata {
  total_projects: number;
  active_sessions: number;
  total_errors: number;
  performance_score: number;
  last_deployment?: string;
  uptime_percentage: number;
}

export interface DebugSession {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  type: 'api' | 'database' | 'performance' | 'memory' | 'network';
  developer_id: string;
  workspace_id?: string;
  config: DebugConfig;
  logs: DebugLog[];
  metrics: DebugMetrics;
  created_at: string;
  updated_at: string;
}

export interface DebugConfig {
  breakpoints: string[];
  watch_expressions: string[];
  log_level: 'debug' | 'info' | 'warn' | 'error';
  auto_pause_on_error: boolean;
  record_network: boolean;
  record_performance: boolean;
}

export interface DebugLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
  line?: number;
  column?: number;
  stack?: string;
}

export interface DebugMetrics {
  execution_time: number;
  memory_usage: number;
  cpu_usage: number;
  network_requests: number;
  errors_caught: number;
  breakpoints_hit: number;
}

export interface AnalyticsData {
  period: 'hour' | 'day' | 'week' | 'month';
  summary: {
    total_requests: number;
    average_response_time: number;
    error_rate: number;
    uptime_percentage: number;
    total_users: number;
    active_sessions: number;
  };
  endpoints: Array<{
    path: string;
    method: string;
    requests: number;
    avg_response_time: number;
    error_rate: number;
  }>;
  performance: {
    cpu_usage: Array<{ timestamp: string; value: number }>;
    memory_usage: Array<{ timestamp: string; value: number }>;
    disk_usage: Array<{ timestamp: string; value: number }>;
    network_io: Array<{ timestamp: string; value: number }>;
  };
  errors: Array<{
    id: string;
    message: string;
    count: number;
    first_seen: string;
    last_seen: string;
    status: 'new' | 'investigating' | 'resolved' | 'ignored';
  }>;
  top_projects: Array<{
    id: string;
    name: string;
    requests: number;
    errors: number;
    performance_score: number;
  }>;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'percentage' | 'count';
  timestamp: string;
  threshold?: number;
  status: 'normal' | 'warning' | 'critical';
  metadata: Record<string, any>;
}

export interface ErrorRecord {
  id: string;
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  user_id?: string;
  session_id?: string;
  workspace_id?: string;
  project_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  count: number;
  first_seen: string;
  last_seen: string;
  tags: string[];
  context: Record<string, any>;
}

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
  parameters: APIParameter[];
  responses: APIEndpointResponse[];
  status: 'active' | 'deprecated' | 'experimental';
  version: string;
  last_tested?: string;
  success_rate: number;
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  example?: any;
}

export interface APIEndpointResponse {
  status_code: number;
  description?: string;
  schema?: Record<string, any>;
  example?: any;
}

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'redis';
  host: string;
  port: number;
  database: string;
  username?: string;
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  last_connected?: string;
  query_count: number;
  average_query_time: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  settings: WorkflowSettings;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'webhook' | 'event' | 'manual';
  config: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  type: 'api_call' | 'database_query' | 'notification' | 'transformation' | 'condition';
  config: Record<string, any>;
  order: number;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowSettings {
  retry_count: number;
  timeout: number;
  parallel_execution: boolean;
  error_handling: 'stop' | 'continue' | 'retry';
}

export interface AIAgent {
  id: string;
  name: string;
  description?: string;
  type: 'assistant' | 'analyst' | 'debugger' | 'optimizer' | 'documenter';
  status: 'active' | 'inactive' | 'training' | 'error';
  model: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'custom';
  config: AIAgentConfig;
  capabilities: string[];
  usage_count: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgentConfig {
  temperature: number;
  max_tokens: number;
  system_prompt?: string;
  tools?: string[];
  memory_enabled: boolean;
  context_window: number;
}

export interface CollaborationEvent {
  id: string;
  type: 'cursor_move' | 'code_edit' | 'comment' | 'user_join' | 'user_leave' | 'file_open' | 'file_close';
  user_id: string;
  workspace_id: string;
  session_id?: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface LiveCursor {
  user_id: string;
  username: string;
  file_path: string;
  line: number;
  column: number;
  color: string;
  timestamp: string;
}

export interface CodeComment {
  id: string;
  file_path: string;
  line_start: number;
  line_end: number;
  column_start: number;
  column_end: number;
  content: string;
  author_id: string;
  session_id: string;
  resolved: boolean;
  replies: CodeComment[];
  created_at: string;
  updated_at: string;
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
export interface UseDeveloperDataOptions {
  refreshInterval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export interface UseDeveloperDataReturn<T = any> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

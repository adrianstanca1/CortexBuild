-- CortexBuild SDK Developer Environment Database Schema
-- This migration adds all tables needed for the AI-powered SDK environment

-- SDK Developers table (tracks subscription and usage)
CREATE TABLE IF NOT EXISTS sdk_developers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    subscription_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'pro', 'enterprise'
    api_requests_used INTEGER DEFAULT 0,
    api_requests_limit INTEGER DEFAULT 0, -- 0 for free, 100 for starter, 1000 for pro, -1 for unlimited
    monthly_reset_date DATE,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI API Keys (encrypted storage for OpenAI, Gemini, Claude)
CREATE TABLE IF NOT EXISTS ai_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    user_id TEXT,
    provider TEXT NOT NULL, -- 'openai', 'gemini', 'anthropic'
    encrypted_key TEXT NOT NULL,
    key_name TEXT, -- User-friendly name for the key
    is_active INTEGER DEFAULT 1,
    is_company_wide INTEGER DEFAULT 0, -- If 1, available to all users in company
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Request Tracking (for usage monitoring and cost calculation)
CREATE TABLE IF NOT EXISTS ai_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'openai', 'gemini', 'anthropic'
    model TEXT NOT NULL, -- 'gpt-4', 'gemini-pro', 'claude-3-opus', etc.
    request_type TEXT, -- 'code_generation', 'completion', 'chat', 'analysis', etc.
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    estimated_cost REAL DEFAULT 0.0, -- In USD
    status TEXT DEFAULT 'success', -- 'success', 'failed', 'rate_limited'
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- SDK Apps (user-created applications)
CREATE TABLE IF NOT EXISTS sdk_apps (
    id TEXT PRIMARY KEY,
    developer_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'rfi', 'invoice', 'safety', 'reporting', 'workflow', 'custom'
    icon TEXT, -- Emoji or icon name
    code_files TEXT, -- JSON: { "Component.tsx": "code...", "api.ts": "code...", etc. }
    database_schema TEXT, -- JSON: table definitions
    api_routes TEXT, -- JSON: route definitions
    dependencies TEXT, -- JSON: npm packages needed
    status TEXT DEFAULT 'draft', -- 'draft', 'pending_review', 'approved', 'rejected', 'published'
    version TEXT DEFAULT '1.0.0',
    is_template INTEGER DEFAULT 0,
    install_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0.0,
    review_notes TEXT, -- Admin feedback during review
    approved_by TEXT, -- Super admin who approved
    approved_at DATETIME,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES sdk_developers(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- AI Agents (autonomous task executors)
CREATE TABLE IF NOT EXISTS ai_agents (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    agent_type TEXT NOT NULL, -- 'invoice_processor', 'project_monitor', 'document_analyzer', 'client_communicator', 'custom'
    config TEXT, -- JSON: agent-specific configuration
    prompt_template TEXT, -- AI prompt template for this agent
    trigger_type TEXT, -- 'schedule', 'event', 'manual', 'webhook'
    trigger_config TEXT, -- JSON: trigger configuration (cron, event name, etc.)
    is_active INTEGER DEFAULT 1,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_run_at DATETIME,
    last_run_status TEXT, -- 'success', 'failed', 'running'
    next_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Agent Executions (history of agent runs)
CREATE TABLE IF NOT EXISTS agent_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    status TEXT DEFAULT 'running', -- 'running', 'success', 'failed'
    input_data TEXT, -- JSON: input to the agent
    output_data TEXT, -- JSON: agent output
    ai_provider TEXT,
    ai_model TEXT,
    tokens_used INTEGER,
    execution_time_ms INTEGER,
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE
);

-- Workflows (visual automation flows)
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'automation', 'integration', 'notification', 'data_processing'
    definition TEXT NOT NULL, -- JSON: complete workflow definition (nodes, edges, config)
    is_active INTEGER DEFAULT 1,
    is_template INTEGER DEFAULT 0,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_run_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Workflow Executions (history of workflow runs)
CREATE TABLE IF NOT EXISTS workflow_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workflow_id TEXT NOT NULL,
    triggered_by TEXT, -- 'manual', 'schedule', 'event', 'webhook'
    trigger_data TEXT, -- JSON: data that triggered the workflow
    status TEXT DEFAULT 'running', -- 'running', 'success', 'failed', 'partial'
    execution_log TEXT, -- JSON: detailed execution log for each node
    output_data TEXT, -- JSON: final workflow output
    execution_time_ms INTEGER,
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- SDK Templates (pre-built app templates)
CREATE TABLE IF NOT EXISTS sdk_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL, -- 'rfi', 'invoice', 'safety', 'reporting', 'workflow'
    icon TEXT,
    preview_image TEXT, -- URL or base64
    code_files TEXT, -- JSON: template code files
    database_schema TEXT, -- JSON: table definitions
    api_routes TEXT, -- JSON: route definitions
    features TEXT, -- JSON: list of features
    ai_enhanced INTEGER DEFAULT 0, -- Whether template uses AI features
    difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    estimated_time_minutes INTEGER, -- Time to customize and deploy
    install_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0.0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Code Execution Sandbox Logs (security audit trail)
CREATE TABLE IF NOT EXISTS sandbox_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    execution_type TEXT, -- 'app_preview', 'workflow_test', 'agent_test', 'code_validation'
    code_hash TEXT, -- SHA-256 hash of executed code
    code_snippet TEXT, -- First 1000 chars of code (for audit)
    status TEXT, -- 'success', 'failed', 'timeout', 'security_violation'
    output TEXT, -- Execution output (truncated)
    error_message TEXT,
    execution_time_ms INTEGER,
    memory_used_mb REAL,
    security_flags TEXT, -- JSON: any security concerns detected
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- AI Chat History (for SDK chat assistant)
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    context_type TEXT, -- 'code_generation', 'debugging', 'explanation', 'general'
    code_context TEXT, -- JSON: relevant code being discussed
    tokens_used INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sdk_developers_user_id ON sdk_developers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_company_id ON ai_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_sdk_apps_developer_id ON sdk_apps(developer_id);
CREATE INDEX IF NOT EXISTS idx_sdk_apps_status ON sdk_apps(status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_company_id ON ai_agents(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_is_active ON ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_company_id ON workflows(company_id);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_sandbox_executions_user_id ON sandbox_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON ai_chat_history(session_id);


-- Migration: Add Parallel Processing Infrastructure
-- Date: 2025-10-26
-- Description: Adds tables for agent execution queue and worker process tracking

-- ============================================
-- AGENT EXECUTION QUEUE (PARALLEL PROCESSING)
-- ============================================

-- Agent Execution Queue Table
CREATE TABLE IF NOT EXISTS agent_execution_queue (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    payload TEXT NOT NULL, -- JSON string
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
    result TEXT, -- JSON string for execution results
    error TEXT, -- Error message if failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Worker Processes Tracking Table
CREATE TABLE IF NOT EXISTS worker_processes (
    id TEXT PRIMARY KEY,
    worker_type TEXT NOT NULL, -- 'agent-executor', 'data-processor', etc.
    process_id INTEGER, -- PM2 process ID
    status TEXT DEFAULT 'starting' CHECK(status IN ('starting', 'running', 'stopped', 'error')),
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
    jobs_processed INTEGER DEFAULT 0,
    jobs_failed INTEGER DEFAULT 0,
    memory_usage INTEGER, -- Memory usage in MB
    cpu_usage DECIMAL(5,2), -- CPU usage percentage
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agents Table (for agent definitions)
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('ai_assistant', 'data_processor', 'automation', 'custom')),
    description TEXT,
    config TEXT, -- JSON string with agent configuration
    is_active BOOLEAN DEFAULT 1,
    max_concurrent_jobs INTEGER DEFAULT 1,
    timeout_seconds INTEGER DEFAULT 300,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR AGENT EXECUTION QUEUE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agent_queue_status ON agent_execution_queue(status);
CREATE INDEX IF NOT EXISTS idx_agent_queue_priority ON agent_execution_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_agent_queue_user ON agent_execution_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_queue_agent ON agent_execution_queue(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_queue_created ON agent_execution_queue(created_at);

CREATE INDEX IF NOT EXISTS idx_worker_processes_type ON worker_processes(worker_type);
CREATE INDEX IF NOT EXISTS idx_worker_processes_status ON worker_processes(status);
CREATE INDEX IF NOT EXISTS idx_worker_processes_heartbeat ON worker_processes(last_heartbeat);

CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);
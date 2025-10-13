-- Quantum User Management Schema
-- Advanced multi-tenant user system with neural and quantum features

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Users table with quantum-enhanced security
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    quantum_salt VARCHAR(255) NOT NULL,
    neural_fingerprint TEXT,

    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',

    -- Role and Permissions
    role user_role_enum NOT NULL DEFAULT 'operative',
    permissions JSONB DEFAULT '[]'::jsonb,
    feature_flags JSONB DEFAULT '{}'::jsonb,

    -- Company and Tenant Information
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,

    -- Neural Profile
    neural_profile JSONB DEFAULT '{
        "thinking_style": "analytical",
        "expertise": [],
        "learning_rate": 0.5,
        "creativity": 0.5,
        "collaboration": 0.5
    }'::jsonb,

    -- Quantum Identity
    quantum_signature VARCHAR(255) UNIQUE,
    quantum_public_key TEXT,
    quantum_entanglement JSONB DEFAULT '[]'::jsonb,

    -- Status and Metadata
    status user_status_enum DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    -- Advanced Features
    ai_preferences JSONB DEFAULT '{}'::jsonb,
    dashboard_layout JSONB DEFAULT '{}'::jsonb,
    notification_settings JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- User sessions with quantum encryption
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    quantum_token TEXT,
    neural_signature TEXT,

    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,

    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MULTI-TENANT ARCHITECTURE
-- ============================================================================

-- Companies/Tenants
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),

    -- Company Details
    industry VARCHAR(100),
    size company_size_enum,
    founded_date DATE,
    headquarters TEXT,

    -- Subscription and Billing
    plan subscription_plan_enum DEFAULT 'free',
    status company_status_enum DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,

    -- Neural Company Profile
    neural_profile JSONB DEFAULT '{
        "industry_focus": [],
        "ai_maturity": "beginner",
        "data_quality": 0.5,
        "automation_level": 0.3
    }'::jsonb,

    -- Quantum Properties
    quantum_allocation INTEGER DEFAULT 10,
    neural_compute_units INTEGER DEFAULT 100,

    -- Settings
    settings JSONB DEFAULT '{
        "theme": "light",
        "features": ["basic_projects", "basic_tasks"],
        "integrations": []
    }'::jsonb,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company subscriptions with AI agents
CREATE TABLE company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,

    status subscription_status_enum DEFAULT 'active',
    plan_tier VARCHAR(50) DEFAULT 'basic',

    -- Billing
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',

    -- Quantum and Neural Credits
    quantum_credits INTEGER DEFAULT 0,
    neural_tokens INTEGER DEFAULT 0,

    -- Dates
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Auto-renewal
    auto_renew BOOLEAN DEFAULT true,
    stripe_subscription_id VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AI AGENTS AND NEURAL SYSTEMS
-- ============================================================================

-- AI Agents marketplace items
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,

    -- Agent Capabilities
    type agent_type_enum NOT NULL,
    category VARCHAR(100),
    capabilities TEXT[] DEFAULT '{}',

    -- Neural Architecture
    neural_config JSONB DEFAULT '{}'::jsonb,
    quantum_enabled BOOLEAN DEFAULT false,

    -- Author and Ownership
    author_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),

    -- Pricing
    price DECIMAL(10,2) DEFAULT 0,
    pricing_model pricing_model_enum DEFAULT 'free',

    -- Status and Versioning
    version VARCHAR(20) DEFAULT '1.0.0',
    status item_status_enum DEFAULT 'active',
    featured BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,

    -- Metrics
    downloads INTEGER DEFAULT 0,
    installs INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,

    -- Files and Resources
    main_file TEXT,
    config_schema JSONB DEFAULT '{}'::jsonb,
    dependencies TEXT[] DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Neural models and training data
CREATE TABLE neural_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type model_type_enum NOT NULL,

    -- Architecture
    architecture JSONB NOT NULL,
    parameters_count BIGINT,

    -- Training Data
    training_data_size INTEGER,
    training_accuracy DECIMAL(5,4),
    validation_accuracy DECIMAL(5,4),

    -- Performance
    inference_latency INTEGER, -- milliseconds
    throughput INTEGER, -- requests per second

    -- Ownership
    owner_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    is_public BOOLEAN DEFAULT false,

    -- Versioning
    version VARCHAR(20) DEFAULT '1.0.0',
    parent_model_id UUID REFERENCES neural_models(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS AND CONSTRUCTION DATA
-- ============================================================================

-- Construction projects with neural insights
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,

    -- Project Details
    description TEXT,
    type project_type_enum,
    status project_status_enum DEFAULT 'planning',

    -- Location and Scope
    address TEXT,
    coordinates POINT,
    area DECIMAL(10,2), -- square meters
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Timeline
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,

    -- Team
    project_manager_id UUID REFERENCES users(id),
    team_members UUID[] DEFAULT '{}',

    -- Company and Client
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),

    -- Neural Analysis
    neural_insights JSONB DEFAULT '[]'::jsonb,
    risk_score DECIMAL(3,2),
    complexity_score DECIMAL(3,2),

    -- Quantum Properties
    quantum_simulation_required BOOLEAN DEFAULT false,
    neural_monitoring_enabled BOOLEAN DEFAULT true,

    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project milestones with AI predictions
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Timeline
    planned_date DATE NOT NULL,
    actual_date DATE,
    predicted_date DATE,

    -- Status and Progress
    status milestone_status_enum DEFAULT 'pending',
    progress DECIMAL(5,2) DEFAULT 0,

    -- Dependencies
    dependencies UUID[] DEFAULT '{}',
    dependent_on UUID[] DEFAULT '{}',

    -- AI Predictions
    neural_prediction JSONB DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2),

    -- Resources
    budget_allocated DECIMAL(10,2),
    team_assigned UUID[] DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SENSOR NETWORK AND IOT
-- ============================================================================

-- IoT sensor nodes
CREATE TABLE sensor_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type sensor_type_enum NOT NULL,

    -- Location
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    location GEOMETRY(POINT, 4326),
    zone VARCHAR(100),

    -- Sensor Details
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    firmware_version VARCHAR(50),

    -- Capabilities
    measurement_range JSONB DEFAULT '{}'::jsonb,
    accuracy DECIMAL(5,4),
    frequency INTEGER, -- Hz

    -- Quantum and Neural
    quantum_calibrated BOOLEAN DEFAULT false,
    neural_calibration JSONB DEFAULT '{}'::jsonb,

    -- Status
    status sensor_status_enum DEFAULT 'active',
    battery_level DECIMAL(3,2),
    signal_strength DECIMAL(3,2),

    -- Installation
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_maintenance TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor readings with neural validation
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID REFERENCES sensor_nodes(id) ON DELETE CASCADE,

    -- Reading Data
    value DECIMAL(15,6) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quality_score DECIMAL(3,2) DEFAULT 1.0,

    -- Neural Analysis
    neural_validation JSONB DEFAULT '{}'::jsonb,
    anomaly_score DECIMAL(3,2) DEFAULT 0.0,

    -- Quantum Properties
    quantum_signature VARCHAR(255),
    coherence DECIMAL(3,2),

    -- Context
    environmental_conditions JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BLOCKCHAIN AND AUDIT
-- ============================================================================

-- Blockchain transactions for construction records
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Transaction Details
    type transaction_type_enum NOT NULL,
    hash VARCHAR(255) UNIQUE NOT NULL,
    previous_hash VARCHAR(255),

    -- Content
    data JSONB NOT NULL,
    merkle_root VARCHAR(255),

    -- Quantum Properties
    quantum_signature VARCHAR(255),
    neural_proof VARCHAR(255),

    -- Validation
    validators UUID[] DEFAULT '{}',
    consensus_level DECIMAL(3,2) DEFAULT 1.0,

    -- Status
    status tx_status_enum DEFAULT 'pending',
    block_index INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Audit log for all user actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- Action Details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,

    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,

    -- Changes
    old_values JSONB,
    new_values JSONB,
    changes_summary TEXT,

    -- Classification
    severity audit_severity_enum DEFAULT 'info',
    category audit_category_enum,

    -- Neural Analysis
    neural_context JSONB DEFAULT '{}'::jsonb,
    risk_score DECIMAL(3,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS AND COLLABORATION
-- ============================================================================

-- Real-time notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recipient
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- Notification Content
    type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Context
    data JSONB DEFAULT '{}'::jsonb,
    action_url TEXT,

    -- Priority and Status
    priority notification_priority_enum DEFAULT 'medium',
    status notification_status_enum DEFAULT 'unread',

    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Neural Enhancement
    neural_personalization JSONB DEFAULT '{}'::jsonb,
    relevance_score DECIMAL(3,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration sessions
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,

    -- Session Details
    type session_type_enum NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Participants
    participants UUID[] DEFAULT '{}',
    max_participants INTEGER DEFAULT 50,

    -- Quantum and Neural
    quantum_entanglement JSONB DEFAULT '{}'::jsonb,
    neural_synchronization DECIMAL(3,2) DEFAULT 0.0,

    -- Status
    status session_status_enum DEFAULT 'active',
    recording_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- ANALYTICS AND REPORTING
-- ============================================================================

-- User analytics and behavior tracking
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- Activity Metrics
    session_duration INTEGER, -- seconds
    pages_visited TEXT[] DEFAULT '{}',
    features_used TEXT[] DEFAULT '{}',

    -- Performance
    load_times JSONB DEFAULT '{}'::jsonb,
    error_count INTEGER DEFAULT 0,

    -- Neural Profile Updates
    neural_profile JSONB DEFAULT '{}'::jsonb,
    learning_progress DECIMAL(3,2),

    -- Context
    device_info JSONB DEFAULT '{}'::jsonb,
    location_info JSONB DEFAULT '{}'::jsonb,

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company analytics and insights
CREATE TABLE company_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- Business Metrics
    active_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    total_budget DECIMAL(15,2) DEFAULT 0,

    -- AI Usage
    neural_compute_used DECIMAL(10,2) DEFAULT 0,
    quantum_compute_used DECIMAL(10,2) DEFAULT 0,

    -- Performance
    avg_project_duration INTEGER, -- days
    on_time_delivery_rate DECIMAL(3,2),
    budget_variance DECIMAL(3,2),

    -- Neural Insights
    neural_insights JSONB DEFAULT '[]'::jsonb,
    risk_trends JSONB DEFAULT '{}'::jsonb,

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Session indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_active ON user_sessions(is_active, expires_at);

-- Project indexes
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Sensor indexes
CREATE INDEX idx_sensors_project ON sensor_nodes(project_id);
CREATE INDEX idx_sensors_type ON sensor_nodes(type);
CREATE INDEX idx_sensors_status ON sensor_nodes(status);

-- Reading indexes
CREATE INDEX idx_readings_sensor ON sensor_readings(sensor_id);
CREATE INDEX idx_readings_timestamp ON sensor_readings(recorded_at);
CREATE INDEX idx_readings_anomaly ON sensor_readings(anomaly_score);

-- Audit indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(created_at);
CREATE INDEX idx_audit_severity ON audit_logs(severity);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (Row Level Security) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid() = id);

-- Company members can access company data
CREATE POLICY company_data_access ON companies FOR ALL USING (
    auth.jwt() ->> 'company_id' = id::text
);

-- Project access based on company membership
CREATE POLICY project_company_access ON projects FOR ALL USING (
    company_id = (auth.jwt() ->> 'company_id')::uuid
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active users view
CREATE VIEW active_users AS
SELECT
    u.*,
    c.name as company_name,
    c.plan as company_plan,
    COUNT(s.id) as active_sessions
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = true
WHERE u.status = 'active'
GROUP BY u.id, c.name, c.plan;

-- Project summary view
CREATE VIEW project_summary AS
SELECT
    p.*,
    c.name as company_name,
    pm.first_name || ' ' || pm.last_name as project_manager,
    COUNT(m.id) as milestone_count,
    COUNT(s.id) as sensor_count,
    COALESCE(SUM(m.budget_allocated), 0) as allocated_budget
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN users pm ON p.project_manager_id = pm.id
LEFT JOIN project_milestones m ON p.id = m.project_id
LEFT JOIN sensor_nodes s ON p.id = s.project_id
GROUP BY p.id, c.name, pm.first_name, pm.last_name;

-- Neural insights view
CREATE VIEW neural_insights_summary AS
SELECT
    project_id,
    JSONB_ARRAY_LENGTH(neural_insights) as insight_count,
    risk_score,
    complexity_score,
    updated_at as last_analysis
FROM projects
WHERE neural_insights IS NOT NULL AND neural_insights != '[]'::jsonb;

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert sample companies
INSERT INTO companies (name, slug, industry, size, plan) VALUES
('CortexBuild Demo', 'cortexbuild-demo', 'Construction Technology', 'enterprise', 'enterprise'),
('ConstructCo', 'constructco', 'General Construction', 'large', 'professional'),
('BuildTech Solutions', 'buildtech', 'Technology', 'medium', 'professional');

-- Insert sample users
INSERT INTO users (email, password_hash, quantum_salt, first_name, last_name, role, company_id) VALUES
('admin@cortexbuild.com', 'hashed_password', 'quantum_salt_1', 'System', 'Administrator', 'super_admin',
 (SELECT id FROM companies WHERE slug = 'cortexbuild-demo')),

('manager@constructco.com', 'hashed_password', 'quantum_salt_2', 'Project', 'Manager', 'company_admin',
 (SELECT id FROM companies WHERE slug = 'constructco')),

('developer@cortexbuild.com', 'hashed_password', 'quantum_salt_3', 'AI', 'Developer', 'developer',
 (SELECT id FROM companies WHERE slug = 'cortexbuild-demo'));

-- Insert sample projects
INSERT INTO projects (name, code, type, status, company_id, project_manager_id, budget) VALUES
('Quantum Office Complex', 'QOC-001', 'commercial', 'active',
 (SELECT id FROM companies WHERE slug = 'cortexbuild-demo'),
 (SELECT id FROM users WHERE email = 'manager@constructco.com'),
 5000000.00),

('Neural Infrastructure Project', 'NIP-002', 'infrastructure', 'planning',
 (SELECT id FROM companies WHERE slug = 'constructco'),
 (SELECT id FROM users WHERE email = 'manager@constructco.com'),
 10000000.00);

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant specific permissions for different roles
GRANT SELECT ON active_users TO authenticated;
GRANT SELECT ON project_summary TO authenticated;
GRANT SELECT ON neural_insights_summary TO authenticated;
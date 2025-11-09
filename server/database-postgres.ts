/**
 * PostgreSQL Database Setup for Production
 * Cloud-compatible database with connection pooling
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Create connection pool for production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialize database tables
 */
export const initDatabase = async () => {
  console.log('📊 Initializing PostgreSQL database...');

  const client = await pool.connect();

  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        company_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Companies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Clients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        contact_name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        payment_terms INTEGER DEFAULT 30,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        project_number TEXT UNIQUE,
        status TEXT DEFAULT 'planning',
        priority TEXT DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        budget DECIMAL(15, 2),
        actual_cost DECIMAL(15, 2) DEFAULT 0,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        client_id INTEGER,
        project_manager_id TEXT,
        progress INTEGER DEFAULT 0,
        is_archived BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
      )
    `);

    // Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        priority TEXT DEFAULT 'medium',
        assigned_to TEXT,
        due_date DATE,
        estimated_hours DECIMAL(8, 2),
        actual_hours DECIMAL(8, 2) DEFAULT 0,
        progress INTEGER DEFAULT 0,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Milestones table
    await client.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // RFIs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rfis (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        rfi_number TEXT NOT NULL,
        subject TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        status TEXT DEFAULT 'open',
        priority TEXT DEFAULT 'medium',
        submitted_by TEXT NOT NULL,
        assigned_to TEXT,
        due_date DATE,
        answered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        project_id INTEGER,
        client_id INTEGER NOT NULL,
        invoice_number TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'draft',
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        subtotal DECIMAL(15, 2) DEFAULT 0,
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        total DECIMAL(15, 2) DEFAULT 0,
        paid_amount DECIMAL(15, 2) DEFAULT 0,
        balance DECIMAL(15, 2) DEFAULT 0,
        notes TEXT,
        terms TEXT,
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    // Invoice items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity DECIMAL(10, 2) DEFAULT 1,
        unit_price DECIMAL(15, 2) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `);

    // Time entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        project_id INTEGER NOT NULL,
        task_id INTEGER,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        duration_minutes INTEGER,
        is_billable BOOLEAN DEFAULT true,
        hourly_rate DECIMAL(10, 2),
        amount DECIMAL(15, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
      )
    `);

    // Subcontractors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subcontractors (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        contact_name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        trade TEXT,
        license_number TEXT,
        insurance_expiry DATE,
        rating INTEGER,
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Purchase orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        project_id INTEGER,
        vendor_id INTEGER,
        po_number TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'draft',
        issue_date DATE NOT NULL,
        delivery_date DATE,
        subtotal DECIMAL(15, 2) DEFAULT 0,
        tax_amount DECIMAL(15, 2) DEFAULT 0,
        total DECIMAL(15, 2) DEFAULT 0,
        notes TEXT,
        created_by TEXT,
        approved_by TEXT,
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (vendor_id) REFERENCES subcontractors(id) ON DELETE SET NULL
      )
    `);

    // Purchase order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        po_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity DECIMAL(10, 2) DEFAULT 1,
        unit_price DECIMAL(15, 2) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
      )
    `);

    // Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        project_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        file_type TEXT,
        category TEXT,
        uploaded_by TEXT NOT NULL,
        is_public BOOLEAN DEFAULT false,
        version INTEGER DEFAULT 1,
        parent_document_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // Project team assignments
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_team (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        responsibility TEXT,
        hourly_rate DECIMAL(10, 2),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(project_id, user_id)
      )
    `);

    // Smart tools (automation helpers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS smart_tools (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        tool_type TEXT NOT NULL,
        schedule TEXT,
        config JSONB,
        is_active BOOLEAN DEFAULT true,
        last_run_at TIMESTAMP WITH TIME ZONE,
        next_run_at TIMESTAMP WITH TIME ZONE,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS smart_tool_executions (
        id SERIAL PRIMARY KEY,
        tool_id INTEGER NOT NULL,
        status TEXT DEFAULT 'running',
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        output_data JSONB,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tool_id) REFERENCES smart_tools(id) ON DELETE CASCADE
      )
    `);

    // Workflow templates for BuilderKit
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        difficulty TEXT DEFAULT 'intermediate',
        definition JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Company workflows
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        version TEXT DEFAULT '1.0.0',
        definition JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_runs (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        status TEXT DEFAULT 'running',
        trigger TEXT,
        input_payload JSONB,
        output_payload JSONB,
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow_run_steps (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        step_index INTEGER NOT NULL,
        step_type TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'running',
        input_payload JSONB,
        output_payload JSONB,
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY (run_id) REFERENCES workflow_runs(id) ON DELETE CASCADE
      )
    `);

    // Automation rules (BuilderKit)
    await client.query(`
      CREATE TABLE IF NOT EXISTS automation_rules (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        trigger_type TEXT NOT NULL,
        trigger_config JSONB NOT NULL,
        action_type TEXT NOT NULL,
        action_config JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_triggered_at TIMESTAMP WITH TIME ZONE,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS automation_events (
        id TEXT PRIMARY KEY,
        rule_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        payload JSONB,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
      )
    `);

    // Agent catalog & subscriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_agents (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        company_id TEXT,
        developer_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        status TEXT DEFAULT 'inactive',
        is_global BOOLEAN DEFAULT false,
        tags JSONB,
        capabilities JSONB,
        config JSONB,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_subscriptions (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        seats INTEGER DEFAULT 10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE,
        UNIQUE(company_id, agent_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agent_executions (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        triggered_by TEXT,
        input_payload JSONB,
        output_payload JSONB,
        status TEXT DEFAULT 'running',
        duration_ms INTEGER,
        error_message TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Developer console events
    await client.query(`
      CREATE TABLE IF NOT EXISTS developer_console_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT,
        event_type TEXT NOT NULL,
        payload JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // AI requests tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_requests (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        request_type TEXT NOT NULL,
        prompt_tokens INTEGER DEFAULT 0,
        completion_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        estimated_cost DECIMAL(10, 6) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // SDK developers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sdk_developers (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        tier TEXT DEFAULT 'free' CHECK(tier IN ('free', 'starter', 'pro', 'enterprise')),
        api_requests_used INTEGER DEFAULT 0,
        api_requests_limit INTEGER DEFAULT 10,
        modules_published INTEGER DEFAULT 0,
        total_revenue DECIMAL(15, 2) DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // API Keys table for SDK developers
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL,
        key_prefix TEXT NOT NULL,
        scopes TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_used_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Webhooks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        events TEXT NOT NULL,
        secret TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_triggered_at TIMESTAMP WITH TIME ZONE,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Third-party integrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        name TEXT NOT NULL,
        credentials TEXT NOT NULL,
        config JSONB,
        is_active BOOLEAN DEFAULT true,
        last_sync_at TIMESTAMP WITH TIME ZONE,
        sync_status TEXT DEFAULT 'idle',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // OAuth tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        id SERIAL PRIMARY KEY,
        integration_id INTEGER NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_type TEXT DEFAULT 'Bearer',
        expires_at TIMESTAMP WITH TIME ZONE,
        scope TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
      )
    `);

    // Webhook delivery logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id SERIAL PRIMARY KEY,
        webhook_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        response_status INTEGER,
        response_body TEXT,
        error_message TEXT,
        delivered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
      )
    `);

    // Sandbox environments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sandbox_environments (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        config JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Module marketplace ratings/reviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS module_reviews (
        id SERIAL PRIMARY KEY,
        module_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_rfis_project_id ON rfis(project_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subcontractors_company_id ON subcontractors(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_id ON purchase_orders(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sdk_developers_user_id ON sdk_developers(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_webhooks_company_id ON webhooks(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON integrations(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_sandbox_user_id ON sandbox_environments(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_project_team_project ON project_team(project_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_project_team_user ON project_team(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_smart_tools_company ON smart_tools(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_smart_tool_executions_tool ON smart_tool_executions(tool_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_workflows_company ON workflows(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_workflow_runs_company ON workflow_runs(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_automation_rules_company ON automation_rules(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_automation_events_rule ON automation_events(rule_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_ai_agents_company ON ai_agents(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_company ON agent_subscriptions(company_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON agent_executions(agent_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_developer_events_user ON developer_console_events(user_id)');

    console.log('✅ PostgreSQL database initialized');

    // Seed initial data
    await seedInitialData();

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Seed initial data
 */
const seedInitialData = async () => {
  const client = await pool.connect();

  try {
    // Check if company exists
    const companyResult = await client.query('SELECT id FROM companies WHERE id = $1', ['company-1']);

    if (companyResult.rows.length === 0) {
      console.log('🌱 Seeding initial data...');

      // Create companies
      await client.query('INSERT INTO companies (id, name) VALUES ($1, $2)', ['company-1', 'ConstructCo']);
      await client.query('INSERT INTO companies (id, name) VALUES ($1, $2)', ['company-2', 'AS CLADDING AND ROOFING LTD']);

      // Create users
      const users = [
        {
          id: 'user-1',
          email: 'adrian.stanca1@gmail.com',
          password: 'parola123',
          name: 'Adrian Stanca',
          role: 'super_admin',
          companyId: 'company-1'
        },
        {
          id: 'user-4',
          email: 'adrian@ascladdingltd.co.uk',
          password: 'Lolozania1',
          name: 'Adrian Stanca',
          role: 'company_admin',
          companyId: 'company-2'
        },
        {
          id: 'user-2',
          email: 'casey@constructco.com',
          password: 'password123',
          name: 'Casey Johnson',
          role: 'company_admin',
          companyId: 'company-1'
        },
        {
          id: 'user-3',
          email: 'mike@constructco.com',
          password: 'password123',
          name: 'Mike Wilson',
          role: 'supervisor',
          companyId: 'company-1'
        },
        {
          id: 'user-5',
          email: 'dev@constructco.com',
          password: 'parola123',
          name: 'Dev User',
          role: 'developer',
          companyId: 'company-1'
        }
      ];

      for (const user of users) {
        const passwordHash = bcrypt.hashSync(user.password, 10);
        await client.query(
          'INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES ($1, $2, $3, $4, $5, $6)',
          [user.id, user.email, passwordHash, user.name, user.role, user.companyId]
        );
      }

      // Seed clients
      const clientStmt = `
        INSERT INTO clients (company_id, name, contact_name, email, phone, address, city, state, zip_code, payment_terms, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      const clients = [
        {
          key: 'acme',
          companyId: 'company-1',
          name: 'Acme Developments',
          contact: 'Alice Johnson',
          email: 'alice@acme.dev',
          phone: '+1 (415) 555-1010',
          address: '100 Market St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94103',
          terms: 30
        },
        {
          key: 'skyline',
          companyId: 'company-1',
          name: 'Skyline Properties',
          contact: 'Robert Allen',
          email: 'robert@skyline.com',
          phone: '+1 (415) 555-2020',
          address: '200 Mission St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          terms: 45
        },
        {
          key: 'metro',
          companyId: 'company-2',
          name: 'Metropolitan Council',
          contact: 'Sarah Bright',
          email: 'sarah@metro.gov',
          phone: '+44 20 7123 4567',
          address: '1 Civic Plaza',
          city: 'London',
          state: '',
          zip: 'SW1A 1AA',
          terms: 30
        }
      ];

      const clientMap = new Map<string, number>();
      for (const clientData of clients) {
        const result = await client.query(clientStmt, [
          clientData.companyId,
          clientData.name,
          clientData.contact,
          clientData.email,
          clientData.phone,
          clientData.address,
          clientData.city,
          clientData.state,
          clientData.zip,
          clientData.terms,
          true
        ]);
        clientMap.set(clientData.key, parseInt(result.rows[0].id));
      }

      // Seed projects
      const projectStmt = `
        INSERT INTO projects (
          company_id, name, description, project_number, status, priority,
          start_date, end_date, budget, actual_cost, address, city, state,
          zip_code, client_id, project_manager_id, progress, is_archived
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id
      `;

      const projects = [
        {
          key: 'tower',
          companyId: 'company-1',
          name: 'Metropolis Tower',
          description: '32-story mixed use development with retail podium and rooftop amenities.',
          number: 'PRJ-2025-001',
          status: 'active',
          priority: 'high',
          start: '2025-01-15',
          end: '2026-11-30',
          budget: 12500000,
          actual: 4100000,
          address: '500 Market St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          clientKey: 'acme',
          managerId: 'user-2',
          progress: 32,
          archived: false
        },
        {
          key: 'campus',
          companyId: 'company-1',
          name: 'Bayview Innovation Campus',
          description: 'Technology campus with three office buildings and shared facilities.',
          number: 'PRJ-2025-002',
          status: 'planning',
          priority: 'medium',
          start: '2025-03-01',
          end: '2027-02-28',
          budget: 8600000,
          actual: 525000,
          address: '1200 Innovation Way',
          city: 'San Jose',
          state: 'CA',
          zip: '95134',
          clientKey: 'skyline',
          managerId: 'user-2',
          progress: 5,
          archived: false
        },
        {
          key: 'stadium',
          companyId: 'company-2',
          name: 'Greenwich Community Stadium',
          description: 'Redevelopment of community stadium with training facilities and hospitality suites.',
          number: 'PRJ-UK-2025-003',
          status: 'active',
          priority: 'critical',
          start: '2024-09-01',
          end: '2026-05-31',
          budget: 9800000,
          actual: 6120000,
          address: '25 River Road',
          city: 'London',
          state: '',
          zip: 'SE10 0DX',
          clientKey: 'metro',
          managerId: 'user-4',
          progress: 64,
          archived: false
        }
      ];

      const projectMap = new Map<string, number>();
      for (const project of projects) {
        const result = await client.query(projectStmt, [
          project.companyId,
          project.name,
          project.description,
          project.number,
          project.status,
          project.priority,
          project.start,
          project.end,
          project.budget,
          project.actual,
          project.address,
          project.city,
          project.state,
          project.zip,
          clientMap.get(project.clientKey) ?? null,
          project.managerId,
          project.progress,
          project.archived
        ]);
        projectMap.set(project.key, result.rows[0].id);
      }

      // Seed project teams
      const projectTeamStmt = `
        INSERT INTO project_team (project_id, user_id, role, responsibility, hourly_rate)
        VALUES ($1, $2, $3, $4, $5)
      `;

      const teamAssignments: Array<[string, string, string, string, number]> = [
        ['tower', 'user-2', 'Project Manager', 'Overall coordination', 135],
        ['tower', 'user-3', 'Site Supervisor', 'Field supervision', 90],
        ['tower', 'user-5', 'Developer', 'Automation & dashboards', 110],
        ['campus', 'user-2', 'Project Manager', 'Design coordination', 135],
        ['stadium', 'user-4', 'Company Admin', 'Client liaison', 140]
      ];

      for (const [projectKey, userId, role, responsibility, rate] of teamAssignments) {
        const projectId = projectMap.get(projectKey);
        if (projectId) {
          await client.query(projectTeamStmt, [projectId, userId, role, responsibility, rate]);
        }
      }

      // Seed tasks
      const taskStmt = `
        INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, progress, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      const tasks = [
        {
          projectKey: 'tower',
          title: 'Finalize structural drawings',
          description: 'Coordinate with structural engineer for final steel framing package.',
          status: 'in-progress',
          priority: 'high',
          assignee: 'user-3',
          dueDate: '2025-02-10',
          estHours: 120,
          actHours: 48,
          progress: 40,
          createdBy: 'user-2'
        },
        {
          projectKey: 'tower',
          title: 'Issue procurement schedule',
          description: 'Compile long-lead items and issue procurement log.',
          status: 'todo',
          priority: 'medium',
          assignee: 'user-5',
          dueDate: '2025-02-05',
          estHours: 40,
          actHours: 0,
          progress: 0,
          createdBy: 'user-2'
        },
        {
          projectKey: 'campus',
          title: 'Submit planning application',
          description: 'Prepare design package for city planning submission.',
          status: 'in-progress',
          priority: 'high',
          assignee: 'user-2',
          dueDate: '2025-03-20',
          estHours: 200,
          actHours: 36,
          progress: 20,
          createdBy: 'user-2'
        },
        {
          projectKey: 'stadium',
          title: 'Steel reinforcement inspection',
          description: 'Coordinate third-party inspection for west stand reinforcement.',
          status: 'completed',
          priority: 'critical',
          assignee: 'user-4',
          dueDate: '2024-12-18',
          estHours: 32,
          actHours: 30,
          progress: 100,
          createdBy: 'user-4'
        }
      ];

      for (const task of tasks) {
        const projectId = projectMap.get(task.projectKey);
        if (projectId) {
          await client.query(taskStmt, [
            projectId,
            task.title,
            task.description,
            task.status,
            task.priority,
            task.assignee,
            task.dueDate,
            task.estHours,
            task.actHours,
            task.progress,
            task.createdBy
          ]);
        }
      }

      // Seed milestones
      const milestoneStmt = `
        INSERT INTO milestones (project_id, name, description, due_date, status, progress)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const milestones = [
        {
          projectKey: 'tower',
          name: 'Foundation Complete',
          description: 'Mat slab, pile caps, and waterproofing complete.',
          dueDate: '2025-05-15',
          status: 'in-progress',
          progress: 55
        },
        {
          projectKey: 'tower',
          name: 'Structure Topped Out',
          description: 'Structural steel erection completed.',
          dueDate: '2025-12-20',
          status: 'pending',
          progress: 0
        },
        {
          projectKey: 'campus',
          name: 'Planning Approval',
          description: 'Local authority approval secured.',
          dueDate: '2025-06-30',
          status: 'pending',
          progress: 0
        },
        {
          projectKey: 'stadium',
          name: 'West Stand Structural Complete',
          description: 'Reinforcement and concrete pour complete for west stand.',
          dueDate: '2025-03-15',
          status: 'in-progress',
          progress: 60
        }
      ];

      for (const milestone of milestones) {
        const projectId = projectMap.get(milestone.projectKey);
        if (projectId) {
          await client.query(milestoneStmt, [
            projectId,
            milestone.name,
            milestone.description,
            milestone.dueDate,
            milestone.status,
            milestone.progress
          ]);
        }
      }

      console.log('✅ Initial data seeded');
    }

  } catch (error) {
    console.error('❌ Data seeding error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * User operations
 */
export const findUserByEmail = async (email: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserById = async (id: string) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (user: {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  companyId: string;
}) => {
  await pool.query(
    'INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES ($1, $2, $3, $4, $5, $6)',
    [user.id, user.email, user.passwordHash, user.name, user.role, user.companyId]
  );
  return findUserById(user.id);
};

/**
 * Session operations
 */
export const createSession = async (session: {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}) => {
  await pool.query(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
    [session.id, session.userId, session.token, session.expiresAt]
  );
};

export const findSessionByToken = async (token: string) => {
  const result = await pool.query('SELECT * FROM sessions WHERE token = $1', [token]);
  return result.rows[0];
};

export const deleteSession = async (token: string) => {
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
};

export const deleteExpiredSessions = async () => {
  await pool.query('DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP');
};

/**
 * Company operations
 */
export const findCompanyByName = async (name: string) => {
  const result = await pool.query('SELECT * FROM companies WHERE name = $1', [name]);
  return result.rows[0];
};

export const createCompany = async (company: { id: string; name: string }) => {
  await pool.query('INSERT INTO companies (id, name) VALUES ($1, $2)', [company.id, company.name]);
  return findCompanyByName(company.name);
};

// Export pool for direct queries
export { pool };
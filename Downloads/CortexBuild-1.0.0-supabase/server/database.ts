/**
 * SQLite Database Setup
 * Real database with tables for users, sessions, etc.
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./cortexbuild.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize database tables
 */
export const initDatabase = async () => {
    console.log('📊 Initializing database...');

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            avatar TEXT,
            company_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Companies table
    db.exec(`
        CREATE TABLE IF NOT EXISTS companies (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Clients table
    db.exec(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `);

    // Projects table
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            is_archived BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
        )
    `);

    // Tasks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    `);

    // Milestones table
    db.exec(`
        CREATE TABLE IF NOT EXISTS milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            due_date DATE NOT NULL,
            status TEXT DEFAULT 'pending',
            progress INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    `);

    // RFIs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS rfis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            answered_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    `);

    // Invoices table
    db.exec(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            paid_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        )
    `);

    // Invoice items table
    db.exec(`
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            quantity DECIMAL(10, 2) DEFAULT 1,
            unit_price DECIMAL(15, 2) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        )
    `);

    // Time entries table
    db.exec(`
        CREATE TABLE IF NOT EXISTS time_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            project_id INTEGER NOT NULL,
            task_id INTEGER,
            description TEXT,
            start_time DATETIME NOT NULL,
            end_time DATETIME,
            duration_minutes INTEGER,
            is_billable BOOLEAN DEFAULT 1,
            hourly_rate DECIMAL(10, 2),
            amount DECIMAL(15, 2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
        )
    `);

    // Subcontractors table
    db.exec(`
        CREATE TABLE IF NOT EXISTS subcontractors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            is_active BOOLEAN DEFAULT 1,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `);

    // Purchase orders table
    db.exec(`
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            approved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
            FOREIGN KEY (vendor_id) REFERENCES subcontractors(id) ON DELETE SET NULL
        )
    `);

    // Purchase order items table
    db.exec(`
        CREATE TABLE IF NOT EXISTS purchase_order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            po_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            quantity DECIMAL(10, 2) DEFAULT 1,
            unit_price DECIMAL(15, 2) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
        )
    `);

    // Documents table
    db.exec(`
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id TEXT NOT NULL,
            project_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            file_type TEXT,
            category TEXT,
            uploaded_by TEXT NOT NULL,
            is_public BOOLEAN DEFAULT 0,
            version INTEGER DEFAULT 1,
            parent_document_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    `);

    // Project team assignments
    db.exec(`
        CREATE TABLE IF NOT EXISTS project_team (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            responsibility TEXT,
            hourly_rate DECIMAL(10, 2),
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            left_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(project_id, user_id)
        )
    `);

    // Smart tools (automation helpers)
    db.exec(`
        CREATE TABLE IF NOT EXISTS smart_tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            tool_type TEXT NOT NULL,
            schedule TEXT,
            config TEXT,
            is_active BOOLEAN DEFAULT 1,
            last_run_at DATETIME,
            next_run_at DATETIME,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS smart_tool_executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tool_id INTEGER NOT NULL,
            status TEXT DEFAULT 'running',
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            output_data TEXT,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tool_id) REFERENCES smart_tools(id) ON DELETE CASCADE
        )
    `);

    // Workflow templates for BuilderKit
    db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            difficulty TEXT DEFAULT 'intermediate',
            definition TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Company workflows
    db.exec(`
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            version TEXT DEFAULT '1.0.0',
            definition TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_runs (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            company_id TEXT NOT NULL,
            status TEXT DEFAULT 'running',
            trigger TEXT,
            input_payload TEXT,
            output_payload TEXT,
            error_message TEXT,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_run_steps (
            id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            step_index INTEGER NOT NULL,
            step_type TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'running',
            input_payload TEXT,
            output_payload TEXT,
            error_message TEXT,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (run_id) REFERENCES workflow_runs(id) ON DELETE CASCADE
        )
    `);

    // Automation rules (BuilderKit)
    db.exec(`
        CREATE TABLE IF NOT EXISTS automation_rules (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            trigger_type TEXT NOT NULL,
            trigger_config TEXT NOT NULL,
            action_type TEXT NOT NULL,
            action_config TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            last_triggered_at DATETIME,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS automation_events (
            id TEXT PRIMARY KEY,
            rule_id TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            payload TEXT,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
        )
    `);

    // Agent catalog & subscriptions
    db.exec(`
        CREATE TABLE IF NOT EXISTS ai_agents (
            id TEXT PRIMARY KEY,
            slug TEXT NOT NULL UNIQUE,
            company_id TEXT,
            developer_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            status TEXT DEFAULT 'inactive',
            is_global BOOLEAN DEFAULT 0,
            tags TEXT,
            capabilities TEXT,
            config TEXT,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS agent_subscriptions (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            seats INTEGER DEFAULT 10,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
            FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE,
            UNIQUE(company_id, agent_id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS agent_executions (
            id TEXT PRIMARY KEY,
            agent_id TEXT NOT NULL,
            company_id TEXT NOT NULL,
            triggered_by TEXT,
            input_payload TEXT,
            output_payload TEXT,
            status TEXT DEFAULT 'running',
            duration_ms INTEGER,
            error_message TEXT,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `);

    // Developer console events
    db.exec(`
        CREATE TABLE IF NOT EXISTS developer_console_events (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            company_id TEXT,
            event_type TEXT NOT NULL,
            payload TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // AI requests tracking table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ai_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            company_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            model TEXT NOT NULL,
            request_type TEXT NOT NULL,
            prompt_tokens INTEGER DEFAULT 0,
            completion_tokens INTEGER DEFAULT 0,
            total_tokens INTEGER DEFAULT 0,
            estimated_cost DECIMAL(10, 6) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `);

    // SDK developers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sdk_developers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            tier TEXT DEFAULT 'free' CHECK(tier IN ('free', 'starter', 'pro', 'enterprise')),
            api_requests_used INTEGER DEFAULT 0,
            api_requests_limit INTEGER DEFAULT 10,
            modules_published INTEGER DEFAULT 0,
            total_revenue DECIMAL(15, 2) DEFAULT 0,
            is_verified BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // API Keys table for SDK developers
    db.exec(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            key_hash TEXT NOT NULL,
            key_prefix TEXT NOT NULL,
            scopes TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            last_used_at DATETIME,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Webhooks table
    db.exec(`
        CREATE TABLE IF NOT EXISTS webhooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            company_id TEXT NOT NULL,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            events TEXT NOT NULL,
            secret TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            last_triggered_at DATETIME,
            success_count INTEGER DEFAULT 0,
            failure_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `);

    // Third-party integrations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            company_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            name TEXT NOT NULL,
            credentials TEXT NOT NULL,
            config TEXT,
            is_active BOOLEAN DEFAULT 1,
            last_sync_at DATETIME,
            sync_status TEXT DEFAULT 'idle',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
        )
    `);

    // OAuth tokens table
    db.exec(`
        CREATE TABLE IF NOT EXISTS oauth_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            integration_id INTEGER NOT NULL,
            access_token TEXT NOT NULL,
            refresh_token TEXT,
            token_type TEXT DEFAULT 'Bearer',
            expires_at DATETIME,
            scope TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
        )
    `);

    // Webhook delivery logs
    db.exec(`
        CREATE TABLE IF NOT EXISTS webhook_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            webhook_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            payload TEXT NOT NULL,
            response_status INTEGER,
            response_body TEXT,
            error_message TEXT,
            delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
        )
    `);

    // Sandbox environments table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sandbox_environments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            config TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Module marketplace ratings/reviews
    db.exec(`
        CREATE TABLE IF NOT EXISTS module_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            review TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_rfis_project_id ON rfis(project_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_subcontractors_company_id ON subcontractors(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_orders_company_id ON purchase_orders(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_developers_user_id ON sdk_developers(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_webhooks_company_id ON webhooks(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_integrations_company_id ON integrations(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sandbox_user_id ON sandbox_environments(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_project_team_project ON project_team(project_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_project_team_user ON project_team(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_smart_tools_company ON smart_tools(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_smart_tool_executions_tool ON smart_tool_executions(tool_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_workflows_company ON workflows(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_workflow_runs_company ON workflow_runs(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_automation_rules_company ON automation_rules(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_automation_events_rule ON automation_events(rule_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_ai_agents_company ON ai_agents(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_company ON agent_subscriptions(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON agent_executions(agent_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_developer_events_user ON developer_console_events(user_id)');

    // Global Marketplace Tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS sdk_apps (
            id TEXT PRIMARY KEY,
            developer_id TEXT NOT NULL,
            company_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT DEFAULT '📦',
            category TEXT DEFAULT 'productivity',
            code TEXT,
            version TEXT DEFAULT '1.0.0',
            status TEXT DEFAULT 'draft',
            review_status TEXT DEFAULT 'draft',
            is_public INTEGER DEFAULT 0,
            published_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (developer_id) REFERENCES users(id),
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS user_app_installations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            app_id TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (app_id) REFERENCES sdk_apps(id),
            UNIQUE(user_id, app_id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS company_app_installations (
            id TEXT PRIMARY KEY,
            company_id TEXT NOT NULL,
            app_id TEXT NOT NULL,
            installed_by TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id),
            FOREIGN KEY (app_id) REFERENCES sdk_apps(id),
            FOREIGN KEY (installed_by) REFERENCES users(id),
            UNIQUE(company_id, app_id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS app_review_history (
            id TEXT PRIMARY KEY,
            app_id TEXT NOT NULL,
            reviewer_id TEXT NOT NULL,
            previous_status TEXT,
            new_status TEXT NOT NULL,
            feedback TEXT,
            reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (app_id) REFERENCES sdk_apps(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id)
        )
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS app_analytics (
            id TEXT PRIMARY KEY,
            app_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            user_id TEXT,
            company_id TEXT,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (app_id) REFERENCES sdk_apps(id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (company_id) REFERENCES companies(id)
        )
    `);

    db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_apps_developer ON sdk_apps(developer_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sdk_apps_status ON sdk_apps(review_status, is_public)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_user_installations_user ON user_app_installations(user_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_company_installations_company ON company_app_installations(company_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_app_analytics_app ON app_analytics(app_id)');

    // Run enhanced tables migration
    try {
        const fs = await import('fs');
        const path = await import('path');
        const migrationPath = path.join(__dirname, 'migrations', 'add_enhanced_tables.sql');

        if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
            db.exec(migrationSQL);
            console.log('✅ Enhanced tables migration applied');
        }
    } catch (error) {
        console.log('ℹ️ Enhanced tables migration not found or already applied');
    }

    console.log('✅ Database initialized');

    // Seed initial data
    seedInitialData();
};

/**
 * Seed initial data
 */
const seedInitialData = () => {
    // Check if company exists
    const company = db.prepare('SELECT id FROM companies WHERE id = ?').get('company-1');

    if (!company) {
        console.log('🌱 Seeding initial data...');

        // Create company
        db.prepare('INSERT INTO companies (id, name) VALUES (?, ?)').run('company-1', 'ConstructCo');
        db.prepare('INSERT INTO companies (id, name) VALUES (?, ?)').run('company-2', 'AS CLADDING AND ROOFING LTD');

        // Create users
        const users = [
            {
                id: 'user-1',
                email: 'adrian.stanca1@gmail.com',
                password: 'Cumparavinde1',
                name: 'Adrian Stanca',
                role: 'super_admin',
                companyId: 'company-1'
            },
            {
                id: 'user-4',
                email: 'adrian@ascladdingltd.co.uk',
                password: 'lolozania1',
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
                password: 'password123',
                name: 'Dev User',
                role: 'developer',
                companyId: 'company-1'
            }
        ];

        for (const user of users) {
            const passwordHash = bcrypt.hashSync(user.password, 10);
            db.prepare('INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)').run(
                user.id, user.email, passwordHash, user.name, user.role, user.companyId
            );
        }

        // Seed clients
        const clientStmt = db.prepare(`
            INSERT INTO clients (company_id, name, contact_name, email, phone, address, city, state, zip_code, payment_terms, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

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
        for (const client of clients) {
            const result = clientStmt.run(
                client.companyId,
                client.name,
                client.contact,
                client.email,
                client.phone,
                client.address,
                client.city,
                client.state,
                client.zip,
                client.terms,
                1
            );
            clientMap.set(client.key, Number(result.lastInsertRowid));
        }

        // Seed projects
        const projectStmt = db.prepare(`
            INSERT INTO projects (
                company_id, name, description, project_number, status, priority,
                start_date, end_date, budget, actual_cost, address, city, state,
                zip_code, client_id, project_manager_id, progress, is_archived
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

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
                archived: 0
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
                archived: 0
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
                archived: 0
            }
        ];

        const projectMap = new Map<string, number>();
        for (const project of projects) {
            const result = projectStmt.run(
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
            );
            projectMap.set(project.key, Number(result.lastInsertRowid));
        }

        // Seed project teams
        const projectTeamStmt = db.prepare(`
            INSERT INTO project_team (project_id, user_id, role, responsibility, hourly_rate)
            VALUES (?, ?, ?, ?, ?)
        `);

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
                projectTeamStmt.run(projectId, userId, role, responsibility, rate);
            }
        }

        // Seed tasks
        const taskStmt = db.prepare(`
            INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours, progress, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

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
                taskStmt.run(
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
                );
            }
        }

        // Seed milestones
        const milestoneStmt = db.prepare(`
            INSERT INTO milestones (project_id, name, description, due_date, status, progress)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

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
                milestoneStmt.run(
                    projectId,
                    milestone.name,
                    milestone.description,
                    milestone.dueDate,
                    milestone.status,
                    milestone.progress
                );
            }
        }

        // Seed smart tools (automations)
        const smartToolStmt = db.prepare(`
            INSERT INTO smart_tools (company_id, name, description, tool_type, schedule, config, is_active, last_run_at, next_run_at, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const smartTools = [
            {
                companyId: 'company-1',
                name: 'Daily Safety Digest',
                description: 'Aggregates incidents and inspections into a morning digest.',
                toolType: 'scheduled',
                schedule: '0 6 * * *',
                config: JSON.stringify({ channel: 'safety-team', summaryWindowHours: 24 }),
                isActive: 1,
                lastRun: null,
                nextRun: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                createdBy: 'user-3'
            },
            {
                companyId: 'company-1',
                name: 'Budget Variance Monitor',
                description: 'Flags cost codes with variance greater than 10%.',
                toolType: 'event',
                schedule: null,
                config: JSON.stringify({ thresholdPercent: 10, notify: ['user-2', 'user-5'] }),
                isActive: 1,
                lastRun: null,
                nextRun: null,
                createdBy: 'user-5'
            },
            {
                companyId: 'company-2',
                name: 'UK Compliance Checklist',
                description: 'Weekly compliance automation for UK projects.',
                toolType: 'scheduled',
                schedule: '0 7 * * MON',
                config: JSON.stringify({ sendReportTo: 'compliance@ascladdingltd.co.uk' }),
                isActive: 1,
                lastRun: null,
                nextRun: null,
                createdBy: 'user-4'
            }
        ];

        for (const tool of smartTools) {
            smartToolStmt.run(
                tool.companyId,
                tool.name,
                tool.description,
                tool.toolType,
                tool.schedule,
                tool.config,
                tool.isActive,
                tool.lastRun,
                tool.nextRun,
                tool.createdBy
            );
        }

        // Seed workflow templates (BuilderKit)
        const workflowTemplateStmt = db.prepare(`
            INSERT INTO workflow_templates (id, name, category, description, icon, difficulty, definition)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const workflowTemplates = [
            {
                id: 'template-rfi-escalation',
                name: 'RFI Escalation Loop',
                category: 'Project Controls',
                description: 'Automatically escalate overdue RFIs with stakeholder notifications and Slack reminders.',
                icon: '⚠️',
                difficulty: 'intermediate',
                definition: JSON.stringify({
                    trigger: { type: 'rfi.overdue', gracePeriodHours: 12 },
                    actions: [
                        { type: 'notify', channel: 'email', recipients: ['project_manager', 'contract_admin'] },
                        { type: 'notify', channel: 'slack', target: '#project-controls' },
                        { type: 'update', entity: 'rfi', set: { priority: 'high' } }
                    ]
                })
            },
            {
                id: 'template-cost-variance',
                name: 'Cost Variance Alert',
                category: 'Financial',
                description: 'Monitors budget vs actuals and notifies the finance team when thresholds are exceeded.',
                icon: '💰',
                difficulty: 'advanced',
                definition: JSON.stringify({
                    trigger: { type: 'cost_code.updated', variancePercent: 8 },
                    conditions: [
                        { field: 'cost_code.budget_variance_percent', operator: '>=', value: 8 }
                    ],
                    actions: [
                        { type: 'notify', channel: 'email', recipients: ['finance_controller'] },
                        { type: 'create_task', title: 'Review variance', assignTo: 'financial_team' }
                    ]
                })
            },
            {
                id: 'template-handover',
                name: 'Substantial Completion Handover',
                category: 'Closeout',
                description: 'Automates project handover checklist, document packaging, and client notification.',
                icon: '📦',
                difficulty: 'intermediate',
                definition: JSON.stringify({
                    trigger: { type: 'project.status_changed', to: 'substantial_completion' },
                    actions: [
                        { type: 'generate_document', template: 'handover-package' },
                        { type: 'notify', channel: 'email', recipients: ['client_primary'], template: 'handover_notice' },
                        { type: 'create_task', title: 'Schedule client walkthrough', assignTo: 'project_manager' }
                    ]
                })
            }
        ];

        for (const template of workflowTemplates) {
            workflowTemplateStmt.run(
                template.id,
                template.name,
                template.category,
                template.description,
                template.icon,
                template.difficulty,
                template.definition
            );
        }

        // Seed workflows for companies
        const workflowStmt = db.prepare(`
            INSERT INTO workflows (id, company_id, name, description, version, definition, is_active, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const workflows = [
            {
                id: 'wf-quality-daily',
                companyId: 'company-1',
                name: 'Daily Quality Monitor',
                description: 'Collects field observations, flags quality exceptions, and schedules inspections.',
                version: '1.1.0',
                definition: JSON.stringify({
                    trigger: { type: 'scheduled', cron: '0 17 * * MON-FRI' },
                    steps: [
                        { id: 'collect', type: 'aggregate', entity: 'quality_observation', windowHours: 24 },
                        { id: 'score', type: 'ai.analyze', prompt: 'score quality risk' },
                        { id: 'notify', type: 'notify', channel: 'slack', target: '#quality' }
                    ]
                }),
                createdBy: 'user-5'
            },
            {
                id: 'wf-hse-sentinel',
                companyId: 'company-1',
                name: 'HSE Sentinel',
                description: 'Combines incident reports and weather data to predict site safety risks.',
                version: '2.0.0',
                definition: JSON.stringify({
                    trigger: { type: 'event', event: 'incident.reported' },
                    steps: [
                        { id: 'enrich', type: 'data.fetch', source: 'weather', params: { timeframeHours: 12 } },
                        { id: 'analyze', type: 'ai.analyze', agent: 'hse_sentinel' },
                        { id: 'alert', type: 'notify', channel: 'email', recipients: ['safety_officer'] }
                    ]
                }),
                createdBy: 'user-3'
            },
            {
                id: 'wf-uk-compliance',
                companyId: 'company-2',
                name: 'UK Compliance Checklist',
                description: 'Ensures UK regulatory checklists are completed weekly with automatic reminders.',
                version: '1.0.0',
                definition: JSON.stringify({
                    trigger: { type: 'scheduled', cron: '0 8 * * MON' },
                    steps: [
                        { id: 'generate', type: 'document.generate', template: 'uk-compliance' },
                        { id: 'assign', type: 'create_task', assigneeRole: 'health_safety', title: 'Review compliance checklist' },
                        { id: 'log', type: 'record', entity: 'compliance_log' }
                    ]
                }),
                createdBy: 'user-4'
            }
        ];

        for (const workflow of workflows) {
            workflowStmt.run(
                workflow.id,
                workflow.companyId,
                workflow.name,
                workflow.description,
                workflow.version,
                workflow.definition,
                1,
                workflow.createdBy
            );
        }

        // Seed automation rules
        const automationStmt = db.prepare(`
            INSERT INTO automation_rules (id, company_id, name, description, trigger_type, trigger_config, action_type, action_config, is_active, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const automationRules = [
            {
                id: 'auto-rfi-escalation',
                companyId: 'company-1',
                name: 'RFI Escalation Threshold',
                description: 'Escalate RFIs that are overdue by more than 2 days to project executives.',
                triggerType: 'rfi.overdue',
                triggerConfig: JSON.stringify({ thresholdHours: 48 }),
                actionType: 'notification',
                actionConfig: JSON.stringify({ channel: 'email', recipients: ['executive@constructco.com'] }),
                isActive: 1,
                createdBy: 'user-2'
            },
            {
                id: 'auto-cost-alert',
                companyId: 'company-1',
                name: 'Cost Code Alert',
                description: 'Send Slack alert when cost code variance exceeds 12%.',
                triggerType: 'cost_code.updated',
                triggerConfig: JSON.stringify({ variancePercent: 12 }),
                actionType: 'notification',
                actionConfig: JSON.stringify({ channel: 'slack', target: '#finance' }),
                isActive: 1,
                createdBy: 'user-5'
            },
            {
                id: 'auto-uk-inspection',
                companyId: 'company-2',
                name: 'UK Weekly Inspection Reminder',
                description: 'Remind London sites to schedule weekly inspections each Monday at 7am.',
                triggerType: 'scheduled',
                triggerConfig: JSON.stringify({ cron: '0 7 * * MON' }),
                actionType: 'task.create',
                actionConfig: JSON.stringify({ role: 'site_manager', title: 'Schedule weekly inspection' }),
                isActive: 1,
                createdBy: 'user-4'
            }
        ];

        for (const rule of automationRules) {
            automationStmt.run(
                rule.id,
                rule.companyId,
                rule.name,
                rule.description,
                rule.triggerType,
                rule.triggerConfig,
                rule.actionType,
                rule.actionConfig,
                rule.isActive,
                rule.createdBy
            );
        }

        // Seed AI agent catalog
        const agentStmt = db.prepare(`
            INSERT INTO ai_agents (id, slug, company_id, developer_id, name, description, icon, status, is_global, tags, capabilities, config, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const nowIso = new Date().toISOString();
        const agentCatalog = [
            {
                id: 'agent-hse-sentinel',
                slug: 'hse-sentinel-ai',
                companyId: null,
                developerId: 'user-5',
                name: 'HSE Sentinel',
                description: 'Predictive health & safety agent that correlates incidents, weather, and workforce data.',
                icon: '🛡️',
                status: 'active',
                isGlobal: 1,
                tags: JSON.stringify(['safety', 'predictive', 'ai']),
                capabilities: JSON.stringify({ riskScoring: true, recommendsMitigations: true }),
                config: JSON.stringify({ model: 'gpt-4o-mini', riskThreshold: 0.65 }),
                metadata: JSON.stringify({ version: '2.1.0', maintainer: 'CortexBuild Labs' })
            },
            {
                id: 'agent-commercial-guardian',
                slug: 'commercial-guardian',
                companyId: null,
                developerId: 'user-5',
                name: 'Commercial Guardian',
                description: 'Monitors commercial exposure, contract notices, and variation claims.',
                icon: '📊',
                status: 'active',
                isGlobal: 1,
                tags: JSON.stringify(['commercial', 'contracts']),
                capabilities: JSON.stringify({ contractAwareness: true, recommendsNotices: true }),
                config: JSON.stringify({ model: 'gpt-4o', watchContracts: true }),
                metadata: JSON.stringify({ version: '1.4.3' })
            },
            {
                id: 'agent-quality-inspector',
                slug: 'quality-inspector',
                companyId: null,
                developerId: 'user-5',
                name: 'Quality Inspector',
                description: 'Reviews photos, checklists, and reports quality issues automatically.',
                icon: '🧪',
                status: 'active',
                isGlobal: 1,
                tags: JSON.stringify(['quality', 'computer-vision']),
                capabilities: JSON.stringify({ photoAnalysis: true, offersRemediation: true }),
                config: JSON.stringify({ model: 'gemini-1.5-flash', confidence: 0.75 }),
                metadata: JSON.stringify({ version: '0.9.0-beta' })
            }
        ];

        for (const agent of agentCatalog) {
            agentStmt.run(
                agent.id,
                agent.slug,
                agent.companyId,
                agent.developerId,
                agent.name,
                agent.description,
                agent.icon,
                agent.status,
                agent.isGlobal,
                agent.tags,
                agent.capabilities,
                agent.config,
                agent.metadata
            );
        }

        // Subscribe ConstructCo to two agents (cloned instances)
        const subscribeAgent = (baseAgentId: string, companyId: string, createdBy: string) => {
            const baseAgent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(baseAgentId) as any;
            if (!baseAgent) return;

            const instanceId = `${baseAgentId}-${companyId}`;
            agentStmt.run(
                instanceId,
                `${baseAgent.slug}-${companyId}`,
                companyId,
                baseAgent.developer_id,
                baseAgent.name,
                baseAgent.description,
                baseAgent.icon,
                'active',
                0,
                baseAgent.tags,
                baseAgent.capabilities,
                baseAgent.config,
                baseAgent.metadata
            );

            db.prepare(`
                INSERT INTO agent_subscriptions (id, company_id, agent_id, status, seats, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                `sub-${instanceId}`,
                companyId,
                instanceId,
                'active',
                25,
                nowIso,
                nowIso
            );

            // Record initial execution snapshot
            db.prepare(`
                INSERT INTO agent_executions (id, agent_id, company_id, triggered_by, input_payload, output_payload, status, duration_ms, started_at, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                `exec-${instanceId}-seed`,
                instanceId,
                companyId,
                createdBy,
                JSON.stringify({ seed: true }),
                JSON.stringify({ summary: 'Agent initialized and ready.' }),
                'success',
                1200,
                nowIso,
                nowIso
            );
        };

        subscribeAgent('agent-hse-sentinel', 'company-1', 'user-3');
        subscribeAgent('agent-commercial-guardian', 'company-1', 'user-2');
        subscribeAgent('agent-hse-sentinel', 'company-2', 'user-4');

        // Seed Global Marketplace Apps (6 pre-approved apps)
        const marketplaceApps = [
            {
                id: 'app-sample-dashboard',
                name: 'Project Dashboard',
                description: 'Real-time project monitoring and analytics dashboard with charts and KPIs',
                icon: '📊',
                category: 'analytics'
            },
            {
                id: 'app-sample-chat',
                name: 'Team Chat',
                description: 'Instant messaging and collaboration tool for teams with file sharing',
                icon: '💬',
                category: 'communication'
            },
            {
                id: 'app-sample-timetracker',
                name: 'Time Tracker',
                description: 'Track time spent on projects and tasks with detailed reports',
                icon: '⏱️',
                category: 'productivity'
            },
            {
                id: 'app-sample-calendar',
                name: 'Team Calendar',
                description: 'Shared calendar for scheduling meetings and events',
                icon: '📅',
                category: 'productivity'
            },
            {
                id: 'app-sample-tasks',
                name: 'Task Manager',
                description: 'Organize and track tasks with kanban boards and lists',
                icon: '✅',
                category: 'productivity'
            },
            {
                id: 'app-sample-expenses',
                name: 'Expense Tracker',
                description: 'Track project expenses and generate financial reports',
                icon: '💰',
                category: 'finance'
            }
        ];

        const appStmt = db.prepare(`
            INSERT INTO sdk_apps (
                id, developer_id, company_id, name, description, icon, category,
                version, status, review_status, is_public, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        for (const app of marketplaceApps) {
            appStmt.run(
                app.id,
                'user-1', // System/Platform developer
                null, // Global apps don't belong to a specific company
                app.name,
                app.description,
                app.icon,
                app.category,
                '1.0.0',
                'approved',
                'approved',
                1 // is_public = true
            );
        }

        console.log('✅ Initial data seeded (including 6 marketplace apps)');
    }
};

/**
 * User operations
 */
export const findUserByEmail = (email: string) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const findUserById = (id: string) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
};

export const createUser = (user: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    companyId: string;
}) => {
    db.prepare('INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)').run(
        user.id, user.email, user.passwordHash, user.name, user.role, user.companyId
    );
    return findUserById(user.id);
};

/**
 * Session operations
 */
export const createSession = (session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
}) => {
    db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(
        session.id, session.userId, session.token, session.expiresAt.toISOString()
    );
};

export const findSessionByToken = (token: string) => {
    return db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
};

export const deleteSession = (token: string) => {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
};

export const deleteExpiredSessions = () => {
    db.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();
};

/**
 * Company operations
 */
export const findCompanyByName = (name: string) => {
    return db.prepare('SELECT * FROM companies WHERE name = ?').get(name);
};

export const createCompany = (company: { id: string; name: string }) => {
    db.prepare('INSERT INTO companies (id, name) VALUES (?, ?)').run(company.id, company.name);
    return findCompanyByName(company.name);
};

export { db };

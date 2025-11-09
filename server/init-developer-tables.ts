// Initialize Developer Dashboard Tables
import Database from 'better-sqlite3';

export function initDeveloperTables(db: Database.Database) {
  console.log('🔧 Initializing Developer Dashboard tables...');

  try {
    // 1. Activities Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        company_id TEXT,
        action TEXT NOT NULL,
        description TEXT,
        entity_type TEXT,
        entity_id TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC)`);

    // 2. Developer Metrics
    db.exec(`
      CREATE TABLE IF NOT EXISTS developer_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        developer_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        metric_date DATE NOT NULL,
        api_calls INTEGER DEFAULT 0,
        ai_requests INTEGER DEFAULT 0,
        tokens_used INTEGER DEFAULT 0,
        cost_incurred REAL DEFAULT 0.0,
        modules_created INTEGER DEFAULT 0,
        workflows_executed INTEGER DEFAULT 0,
        sandbox_runs INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(developer_id, metric_date)
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_dev_metrics_developer ON developer_metrics(developer_id)`);

    // 3. Developer Projects
    db.exec(`
      CREATE TABLE IF NOT EXISTS developer_projects (
        id TEXT PRIMARY KEY,
        developer_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        version TEXT DEFAULT '1.0.0',
        code TEXT,
        config TEXT,
        install_count INTEGER DEFAULT 0,
        rating REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_dev_projects_developer ON developer_projects(developer_id)`);

    // 4. Sandbox Sessions
    db.exec(`
      CREATE TABLE IF NOT EXISTS sandbox_sessions (
        id TEXT PRIMARY KEY,
        developer_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        code TEXT,
        output TEXT,
        error TEXT,
        execution_time INTEGER,
        memory_used INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (developer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_sandbox_developer ON sandbox_sessions(developer_id)`);

    console.log('✅ Developer Dashboard tables initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Developer Dashboard tables:', error);
    return false;
  }
}

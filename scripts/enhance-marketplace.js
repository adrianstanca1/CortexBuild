/**
 * Marketplace Enhancement Script
 * Safely adds new columns and tables to support global marketplace
 */

import Database from 'better-sqlite3';

const db = new Database('./cortexbuild.db');
db.pragma('foreign_keys = ON');

console.log('🚀 Starting Marketplace Enhancement...\n');

// Helper function to check if column exists
function columnExists(table, column) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    return columns.some(col => col.name === column);
}

// Helper function to check if table exists
function tableExists(tableName) {
    const result = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
    `).get(tableName);
    return !!result;
}

try {
    // 1. Add columns to sdk_apps table
    console.log('📊 Updating sdk_apps table...');
    
    const columnsToAdd = [
        { name: 'review_status', type: 'TEXT DEFAULT "draft"' },
        { name: 'review_feedback', type: 'TEXT' },
        { name: 'reviewed_by', type: 'TEXT' },
        { name: 'reviewed_at', type: 'DATETIME' },
        { name: 'published_at', type: 'DATETIME' },
        { name: 'icon', type: 'TEXT DEFAULT "📦"' },
        { name: 'category', type: 'TEXT DEFAULT "general"' },
        { name: 'is_public', type: 'INTEGER DEFAULT 0' }
    ];

    columnsToAdd.forEach(col => {
        if (!columnExists('sdk_apps', col.name)) {
            db.exec(`ALTER TABLE sdk_apps ADD COLUMN ${col.name} ${col.type}`);
            console.log(`  ✅ Added column: ${col.name}`);
        } else {
            console.log(`  ⏭️  Column already exists: ${col.name}`);
        }
    });

    // 2. Create user_app_installations table
    console.log('\n📱 Creating user_app_installations table...');
    if (!tableExists('user_app_installations')) {
        db.exec(`
            CREATE TABLE user_app_installations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                app_id TEXT NOT NULL,
                installation_type TEXT NOT NULL,
                installed_by TEXT NOT NULL,
                installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1,
                config TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
                FOREIGN KEY (installed_by) REFERENCES users(id),
                UNIQUE(user_id, app_id)
            )
        `);
        console.log('  ✅ Table created');
    } else {
        console.log('  ⏭️  Table already exists');
    }

    // 3. Create company_app_installations table
    console.log('\n🏢 Creating company_app_installations table...');
    if (!tableExists('company_app_installations')) {
        db.exec(`
            CREATE TABLE company_app_installations (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL,
                app_id TEXT NOT NULL,
                installed_by TEXT NOT NULL,
                installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1,
                config TEXT,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
                FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
                FOREIGN KEY (installed_by) REFERENCES users(id),
                UNIQUE(company_id, app_id)
            )
        `);
        console.log('  ✅ Table created');
    } else {
        console.log('  ⏭️  Table already exists');
    }

    // 4. Create app_review_history table
    console.log('\n📝 Creating app_review_history table...');
    if (!tableExists('app_review_history')) {
        db.exec(`
            CREATE TABLE app_review_history (
                id TEXT PRIMARY KEY,
                app_id TEXT NOT NULL,
                reviewer_id TEXT NOT NULL,
                previous_status TEXT,
                new_status TEXT NOT NULL,
                feedback TEXT,
                reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewer_id) REFERENCES users(id)
            )
        `);
        console.log('  ✅ Table created');
    } else {
        console.log('  ⏭️  Table already exists');
    }

    // 5. Create app_analytics table
    console.log('\n📈 Creating app_analytics table...');
    if (!tableExists('app_analytics')) {
        db.exec(`
            CREATE TABLE app_analytics (
                id TEXT PRIMARY KEY,
                app_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                user_id TEXT,
                company_id TEXT,
                metadata TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (app_id) REFERENCES sdk_apps(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        `);
        console.log('  ✅ Table created');
    } else {
        console.log('  ⏭️  Table already exists');
    }

    // 6. Create indexes
    console.log('\n🔍 Creating indexes...');
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_sdk_apps_review_status ON sdk_apps(review_status)',
        'CREATE INDEX IF NOT EXISTS idx_sdk_apps_is_public ON sdk_apps(is_public)',
        'CREATE INDEX IF NOT EXISTS idx_sdk_apps_published_at ON sdk_apps(published_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_user_app_installations_user ON user_app_installations(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_user_app_installations_app ON user_app_installations(app_id)',
        'CREATE INDEX IF NOT EXISTS idx_company_app_installations_company ON company_app_installations(company_id)',
        'CREATE INDEX IF NOT EXISTS idx_company_app_installations_app ON company_app_installations(app_id)',
        'CREATE INDEX IF NOT EXISTS idx_app_review_history_app ON app_review_history(app_id)',
        'CREATE INDEX IF NOT EXISTS idx_app_analytics_app ON app_analytics(app_id)',
        'CREATE INDEX IF NOT EXISTS idx_app_analytics_event ON app_analytics(event_type)'
    ];

    indexes.forEach(indexSql => {
        db.exec(indexSql);
    });
    console.log('  ✅ All indexes created');

    // 7. Update existing apps
    console.log('\n🔄 Updating existing apps...');
    db.exec(`UPDATE sdk_apps SET review_status = 'draft' WHERE review_status IS NULL`);
    db.exec(`UPDATE sdk_apps SET is_public = 0 WHERE is_public IS NULL`);
    console.log('  ✅ Existing apps updated');

    // 8. Create sample published apps
    console.log('\n🎨 Creating sample published apps...');
    const sampleApps = [
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
        }
    ];

    const insertApp = db.prepare(`
        INSERT OR IGNORE INTO sdk_apps (
            id, developer_id, company_id, name, description, version,
            status, review_status, is_public, icon, category, published_at, code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `);

    sampleApps.forEach(app => {
        const sampleCode = `// ${app.name}\nconsole.log('${app.name} is running!');`;
        insertApp.run(
            app.id,
            'user-1', // developer
            'company-1',
            app.name,
            app.description,
            '1.0.0',
            'published',
            'approved',
            1, // is_public
            app.icon,
            app.category,
            sampleCode
        );
        console.log(`  ✅ Created: ${app.name}`);
    });

    console.log('\n✨ Marketplace Enhancement Complete!\n');
    console.log('📊 Summary:');
    console.log('  - sdk_apps table updated with review workflow columns');
    console.log('  - user_app_installations table created');
    console.log('  - company_app_installations table created');
    console.log('  - app_review_history table created');
    console.log('  - app_analytics table created');
    console.log('  - All indexes created');
    console.log(`  - ${sampleApps.length} sample apps published\n`);

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} finally {
    db.close();
}

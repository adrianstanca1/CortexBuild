"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const connection_1 = require("./connection");
async function runMigrations() {
    console.log('🔄 Running database migrations...');
    const db = (0, connection_1.getDatabase)();
    try {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        await db.run('PRAGMA foreign_keys = ON');
        const statements = [];
        let currentStatement = '';
        let inTrigger = false;
        const lines = schema.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('--') || trimmedLine.startsWith('PRAGMA')) {
                continue;
            }
            currentStatement += line + '\n';
            if (trimmedLine.toUpperCase().includes('CREATE TRIGGER')) {
                inTrigger = true;
            }
            if (trimmedLine.endsWith(';')) {
                if (!inTrigger || trimmedLine.toUpperCase().includes('END;')) {
                    statements.push(currentStatement.trim());
                    currentStatement = '';
                    inTrigger = false;
                }
            }
        }
        if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
        }
        console.log(`📝 Executing ${statements.length} SQL statements...`);
        for (const statement of statements) {
            try {
                if (statement.trim()) {
                    await db.run(statement);
                    const preview = statement.replace(/\s+/g, ' ').substring(0, 60);
                    console.log(`✅ Executed: ${preview}...`);
                }
            }
            catch (error) {
                console.error(`❌ Error executing statement: ${statement.substring(0, 200)}...`);
                console.error(error);
                throw error;
            }
        }
        console.log('✅ Database migrations completed successfully!');
        const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
        console.log('📊 Created tables:');
        tables.forEach((table) => {
            console.log(`  - ${table.name}`);
        });
        const stats = await db.getStats();
        console.log(`📈 Database stats: ${stats.tables} tables, ${stats.totalRows} rows, ${Math.round(stats.databaseSize / 1024)} KB`);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    runMigrations()
        .then(() => {
        console.log('🎉 Migration process completed!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Migration process failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=migrate.js.map
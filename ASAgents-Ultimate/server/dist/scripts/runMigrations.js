import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
import { AdminUserService } from '../services/adminUserService.js';
/**
 * Migration Runner
 * Runs database migrations and initializes the admin system
 */
async function runMigrations() {
    try {
        logger.info('Starting database migrations...');
        // Read and execute the simple admin schema migration
        const migrationPath = path.join(process.cwd(), 'migrations', '002_simple_admin_schema.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
        // Split SQL by semicolons and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'SET FOREIGN_KEY_CHECKS = 0' && stmt !== 'SET FOREIGN_KEY_CHECKS = 1');
        // Execute SET FOREIGN_KEY_CHECKS = 0 first
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const statement of statements) {
            try {
                if (statement.trim()) {
                    await pool.query(statement);
                    logger.debug({ statement: statement.substring(0, 100) + '...' }, 'Executed migration statement');
                }
            }
            catch (error) {
                // Ignore errors for statements that might already exist
                if (error instanceof Error &&
                    (error.message.includes('already exists') ||
                        error.message.includes('Duplicate'))) {
                    logger.debug({ statement: statement.substring(0, 100) + '...' }, 'Statement already applied');
                }
                else {
                    logger.error({ error, statement }, 'Failed to execute migration statement');
                    throw error;
                }
            }
        }
        // Execute SET FOREIGN_KEY_CHECKS = 1 at the end
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        logger.info('Migration executed successfully');
        logger.info('Database migrations completed successfully');
        // Create the principal admin user
        logger.info('Creating principal admin user...');
        const admin = await AdminUserService.createPrincipalAdmin();
        logger.info({ adminId: admin.id, email: admin.email }, 'Principal admin user created');
        logger.info('Admin system initialization complete');
    }
    catch (error) {
        logger.error({ error }, 'Migration failed');
        throw error;
    }
    finally {
        await pool.end();
    }
}
// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations()
        .then(() => {
        console.log('✅ Migrations completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
}
export { runMigrations };

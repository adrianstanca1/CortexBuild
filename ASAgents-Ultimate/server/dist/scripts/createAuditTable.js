import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
/**
 * Create Audit Log Table Script
 */
async function createAuditTable() {
    try {
        logger.info('Creating admin_audit_log table...');
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        admin_user_id BIGINT UNSIGNED NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(100) NULL,
        tenant_id BIGINT UNSIGNED NULL,
        details JSON NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
        INDEX idx_audit_admin (admin_user_id),
        INDEX idx_audit_action (action),
        INDEX idx_audit_resource (resource_type, resource_id),
        INDEX idx_audit_created (created_at)
      ) ENGINE=InnoDB
    `;
        await pool.query(createTableSQL);
        logger.info('Admin audit log table created successfully');
    }
    catch (error) {
        logger.error({ error }, 'Failed to create audit table');
        throw error;
    }
    finally {
        await pool.end();
    }
}
// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createAuditTable()
        .then(() => {
        console.log('✅ Audit table created successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Failed to create audit table:', error);
        process.exit(1);
    });
}
export { createAuditTable };

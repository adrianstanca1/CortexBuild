import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
import type { RowDataPacket } from 'mysql2/promise';

/**
 * Create Admin Table Script
 * Creates just the admin_users table for testing
 */

async function createAdminTable() {
  try {
    logger.info('Creating admin_users table...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role ENUM('super_admin', 'platform_admin', 'support_admin') NOT NULL DEFAULT 'platform_admin',
        permissions JSON NULL COMMENT 'Additional granular permissions',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        last_login_at TIMESTAMP NULL,
        failed_login_attempts INT NOT NULL DEFAULT 0,
        locked_until TIMESTAMP NULL,
        mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
        mfa_secret VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_admin_email (email),
        INDEX idx_admin_role (role),
        INDEX idx_admin_active (is_active)
      ) ENGINE=InnoDB
    `;

    await pool.query(createTableSQL);
    logger.info('Admin users table created successfully');

    // Check if table exists
    const [rows] = await pool.query('SHOW TABLES LIKE "admin_users"') as any[];
    logger.info({ tableExists: rows.length > 0 }, 'Table existence check');

    // Show table structure
    const [structure] = await pool.query('DESCRIBE admin_users');
    logger.info({ structure }, 'Table structure');

  } catch (error) {
    logger.error({ error }, 'Failed to create admin table');
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminTable()
    .then(() => {
      console.log('✅ Admin table created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to create admin table:', error);
      process.exit(1);
    });
}

export { createAdminTable };

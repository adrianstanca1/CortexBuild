import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
/**
 * Check Admin User Script
 */
async function checkAdminUser() {
    try {
        logger.info('Checking admin user...');
        const [rows] = await pool.query('SELECT * FROM admin_users WHERE email = ?', ['adrian.stanca1@gmail.com']);
        console.log('Admin user data:', JSON.stringify(rows, null, 2));
        if (Array.isArray(rows) && rows.length > 0) {
            const user = rows[0];
            console.log('Permissions field:', user.permissions);
            console.log('Permissions type:', typeof user.permissions);
            if (user.permissions) {
                try {
                    const parsed = JSON.parse(user.permissions);
                    console.log('Parsed permissions:', parsed);
                }
                catch (error) {
                    console.log('Failed to parse permissions:', error);
                    console.log('Raw permissions value:', JSON.stringify(user.permissions));
                }
            }
        }
    }
    catch (error) {
        logger.error({ error }, 'Failed to check admin user');
        throw error;
    }
    finally {
        await pool.end();
    }
}
// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    checkAdminUser()
        .then(() => {
        console.log('✅ Check completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Check failed:', error);
        process.exit(1);
    });
}
export { checkAdminUser };

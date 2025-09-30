import { pool } from '../services/db.js';
import { logger } from '../utils/logger.js';
import { AdminUserService } from '../services/adminUserService.js';
/**
 * Create Admin User Script
 * Creates the principal admin user
 */
async function createAdminUser() {
    try {
        logger.info('Creating principal admin user...');
        // Create the principal admin user
        const admin = await AdminUserService.createPrincipalAdmin();
        logger.info({
            adminId: admin.id,
            email: admin.email,
            role: admin.role
        }, 'Principal admin user created successfully');
        console.log('✅ Principal admin user created:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   ID: ${admin.id}`);
    }
    catch (error) {
        logger.error({ error }, 'Failed to create admin user');
        throw error;
    }
    finally {
        await pool.end();
    }
}
// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdminUser()
        .then(() => {
        console.log('✅ Admin user creation completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ Failed to create admin user:', error);
        process.exit(1);
    });
}
export { createAdminUser };

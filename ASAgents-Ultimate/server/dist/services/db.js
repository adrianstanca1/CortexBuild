import mysql from 'mysql2/promise';
import { env } from '../utils/env.js';
import { logger } from '../utils/logger.js';
export const pool = mysql.createPool({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    waitForConnections: true,
    connectionLimit: env.dbConnectionLimit,
    decimalNumbers: true
});
export async function healthCheck() {
    try {
        await pool.query('SELECT 1');
        return true;
    }
    catch (error) {
        logger.error({ error }, 'Database health check failed');
        return false;
    }
}

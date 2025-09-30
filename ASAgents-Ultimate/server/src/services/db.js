// Database connection service for MySQL
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'asagents_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Export pool for use in application
module.exports = {
  pool,
  
  // Helper method for raw queries
  async query(sql, params = []) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  // Helper method for transactions
  async getConnection() {
    return await pool.getConnection();
  },
  
  // Close pool (for graceful shutdown)
  async close() {
    await pool.end();
  }
};
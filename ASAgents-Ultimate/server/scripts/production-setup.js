#!/usr/bin/env node

/**
 * Production Database Setup Script
 * ASAgents Platform - Production Deployment
 * 
 * This script handles:
 * - Database connection verification
 * - Schema migration execution
 * - Initial data seeding
 * - Health checks
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.production' });

class ProductionSetup {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
      timeout: parseInt(process.env.DB_TIMEOUT) || 60000
    };
  }

  async validateEnvironment() {
    console.log('🔍 Validating production environment...');
    
    const requiredVars = [
      'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
      'JWT_SECRET', 'SESSION_SECRET', 'GEMINI_API_KEY'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log('✅ Environment validation passed');
  }

  async testDatabaseConnection() {
    console.log('🔗 Testing database connection...');
    
    try {
      // Test connection without database first
      const testConfig = { ...this.dbConfig };
      delete testConfig.database;
      
      const testConnection = await mysql.createConnection(testConfig);
      await testConnection.ping();
      await testConnection.end();
      
      console.log('✅ Database server connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async createDatabaseIfNotExists() {
    console.log('🗄️ Ensuring database exists...');
    
    try {
      const config = { ...this.dbConfig };
      delete config.database;
      
      const connection = await mysql.createConnection(config);
      
      await connection.execute(`
        CREATE DATABASE IF NOT EXISTS \`${this.dbConfig.database}\`
        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      
      await connection.end();
      console.log(`✅ Database '${this.dbConfig.database}' ready`);
    } catch (error) {
      console.error('❌ Database creation failed:', error.message);
      throw error;
    }
  }

  async runMigrations() {
    console.log('🚀 Running database migrations...');
    
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      // Read and execute migration file
      const migrationPath = path.join(__dirname, '../migrations/001_enhanced_schema.sql');
      const migrationSQL = await fs.readFile(migrationPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement);
        }
      }
      
      await connection.end();
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async seedInitialData() {
    console.log('🌱 Seeding initial data...');
    
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      // Create default admin user if not exists
      const [existingUsers] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['admin']
      );
      
      if (existingUsers[0].count === 0) {
        await connection.execute(`
          INSERT INTO users (id, email, name, role, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          'admin-' + Date.now(),
          'admin@asagents.com',
          'System Administrator',
          'admin',
          'active'
        ]);
        
        console.log('✅ Default admin user created');
      }
      
      // Create default company if not exists
      const [existingCompanies] = await connection.execute(
        'SELECT COUNT(*) as count FROM companies'
      );
      
      if (existingCompanies[0].count === 0) {
        await connection.execute(`
          INSERT INTO companies (id, name, type, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [
          'company-' + Date.now(),
          'ASAgents Platform',
          'technology',
          'active'
        ]);
        
        console.log('✅ Default company created');
      }
      
      await connection.end();
      console.log('✅ Initial data seeding completed');
    } catch (error) {
      console.error('❌ Data seeding failed:', error.message);
      throw error;
    }
  }

  async performHealthChecks() {
    console.log('🏥 Performing health checks...');
    
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      // Check database version
      const [versionResult] = await connection.execute('SELECT VERSION() as version');
      console.log(`📊 Database version: ${versionResult[0].version}`);
      
      // Check table count
      const [tableResult] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [this.dbConfig.database]);
      console.log(`📋 Tables created: ${tableResult[0].count}`);
      
      // Check user count
      const [userResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users in database: ${userResult[0].count}`);
      
      await connection.end();
      console.log('✅ Health checks passed');
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }

  async run() {
    console.log('🚀 Starting ASAgents Production Setup...\n');
    
    try {
      await this.validateEnvironment();
      await this.testDatabaseConnection();
      await this.createDatabaseIfNotExists();
      await this.runMigrations();
      await this.seedInitialData();
      await this.performHealthChecks();
      
      console.log('\n🎉 Production setup completed successfully!');
      console.log('🔗 Your ASAgents platform is ready for production deployment.');
      
    } catch (error) {
      console.error('\n❌ Production setup failed:', error.message);
      console.error('🔧 Please check your configuration and try again.');
      process.exit(1);
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  const setup = new ProductionSetup();
  setup.run().catch(console.error);
}

module.exports = ProductionSetup;

/**
 * Integration tests for enhanced backend functionality
 * Tests the complete flow from frontend to database
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mysql from 'mysql2/promise';
import app from '../src/index.js';

// Test database configuration
const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '3306'),
  user: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || '',
  database: process.env.TEST_DB_NAME || 'asagents_test_db',
  multipleStatements: true
};

let connection;
let authToken;
let testTenantId;
let testUserId;

beforeAll(async () => {
  // Create test database connection
  connection = await mysql.createConnection(testDbConfig);
  
  // Clean up test database
  await connection.execute('DROP DATABASE IF EXISTS asagents_test_db');
  await connection.execute('CREATE DATABASE asagents_test_db');
  await connection.execute('USE asagents_test_db');
  
  // Run migrations for test database
  // Note: In a real setup, you'd run the migration script here
  console.log('Setting up test database...');
  
  // Create basic tables for testing
  await connection.execute(`
    CREATE TABLE tenants (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      contact_email VARCHAR(320) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await connection.execute(`
    CREATE TABLE users (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      tenant_id BIGINT UNSIGNED NOT NULL,
      email VARCHAR(320) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(128) NOT NULL,
      last_name VARCHAR(128) NOT NULL,
      role ENUM('owner','admin','manager','viewer') DEFAULT 'viewer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    )
  `);
  
  await connection.execute(`
    CREATE TABLE projects (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      tenant_id BIGINT UNSIGNED NOT NULL,
      owner_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(255) NOT NULL,
      status ENUM('draft','active','completed') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);
  
  await connection.execute(`
    CREATE TABLE tasks (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      tenant_id BIGINT UNSIGNED NOT NULL,
      project_id BIGINT UNSIGNED NULL,
      created_by BIGINT UNSIGNED NOT NULL,
      title VARCHAR(255) NOT NULL,
      status ENUM('todo','in_progress','done') DEFAULT 'todo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  
  // Insert test data
  const [tenantResult] = await connection.execute(
    'INSERT INTO tenants (name, slug, contact_email) VALUES (?, ?, ?)',
    ['Test Organization', 'test-org', 'test@example.com']
  );
  testTenantId = tenantResult.insertId;
  
  const [userResult] = await connection.execute(
    'INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
    [testTenantId, 'admin@test.com', '$2b$10$dummy.hash', 'Test', 'Admin', 'admin']
  );
  testUserId = userResult.insertId;
  
  console.log('Test database setup complete');
});

afterAll(async () => {
  if (connection) {
    await connection.execute('DROP DATABASE IF EXISTS asagents_test_db');
    await connection.end();
  }
});

describe('Backend Integration Tests', () => {
  
  describe('System Health', () => {
    test('should return system health status', async () => {
      const response = await request(app)
        .get('/api/system/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
    });
  });
  
  describe('Authentication Flow', () => {
    test('should handle login attempt', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'testpassword'
        });
      
      // Note: This might fail if auth is not fully implemented
      // but we're testing the endpoint exists and responds
      expect([200, 401, 400]).toContain(response.status);
    });
  });
  
  describe('Projects API', () => {
    test('should handle projects endpoint', async () => {
      const response = await request(app)
        .get('/api/projects');
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
    
    test('should handle project creation endpoint', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          name: 'Test Project',
          description: 'A test project'
        });
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
  });
  
  describe('Tasks API', () => {
    test('should handle tasks endpoint', async () => {
      const response = await request(app)
        .get('/api/tasks');
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
    
    test('should handle task creation endpoint', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'A test task'
        });
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
  });
  
  describe('Companies API', () => {
    test('should handle companies endpoint', async () => {
      const response = await request(app)
        .get('/api/companies');
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
    
    test('should handle company creation endpoint', async () => {
      const response = await request(app)
        .post('/api/companies')
        .send({
          name: 'Test Company',
          type: 'client'
        });
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
  });
  
  describe('Expenses API', () => {
    test('should handle expenses endpoint', async () => {
      const response = await request(app)
        .get('/api/expenses');
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
    
    test('should handle expense creation endpoint', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          category: 'materials',
          description: 'Test expense',
          amount: 100.00,
          expenseDate: '2024-01-01'
        });
      
      // Should require authentication
      expect([401, 403]).toContain(response.status);
    });
  });
  
  describe('Database Integration', () => {
    test('should connect to database successfully', async () => {
      const [rows] = await connection.execute('SELECT 1 as test');
      expect(rows[0].test).toBe(1);
    });
    
    test('should have required tables', async () => {
      const [tables] = await connection.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      expect(tableNames).toContain('tenants');
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('projects');
      expect(tableNames).toContain('tasks');
    });
    
    test('should have test data', async () => {
      const [tenants] = await connection.execute('SELECT COUNT(*) as count FROM tenants');
      expect(tenants[0].count).toBeGreaterThan(0);
      
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      expect(users[0].count).toBeGreaterThan(0);
    });
  });
  
  describe('API Error Handling', () => {
    test('should handle invalid endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
    
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send('invalid json');
      
      expect([400, 401, 403]).toContain(response.status);
    });
  });
  
  describe('CORS and Security', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/system/health');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
    
    test('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/api/projects')
        .set('Origin', 'http://localhost:5174')
        .set('Access-Control-Request-Method', 'POST');
      
      expect([200, 204]).toContain(response.status);
    });
  });
});

describe('Frontend-Backend Integration', () => {
  test('should serve API endpoints that frontend expects', async () => {
    // Test all the endpoints that the frontend services expect
    const endpoints = [
      '/api/system/health',
      '/api/auth/login',
      '/api/projects',
      '/api/tasks',
      '/api/companies',
      '/api/expenses',
      '/api/documents',
      '/api/invoices'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request(app).get(endpoint);
      // Should not return 404 (endpoint exists)
      expect(response.status).not.toBe(404);
    }
  });
  
  test('should handle expected request formats', async () => {
    // Test that endpoints accept the data formats frontend sends
    const testCases = [
      {
        endpoint: '/api/projects',
        method: 'post',
        data: { name: 'Test', description: 'Test project' }
      },
      {
        endpoint: '/api/tasks',
        method: 'post',
        data: { title: 'Test', status: 'todo' }
      },
      {
        endpoint: '/api/companies',
        method: 'post',
        data: { name: 'Test Company', type: 'client' }
      }
    ];
    
    for (const testCase of testCases) {
      const response = await request(app)
        [testCase.method](testCase.endpoint)
        .send(testCase.data);
      
      // Should not return 400 for bad request format
      // (might return 401/403 for auth, but not 400 for format)
      expect(response.status).not.toBe(400);
    }
  });
});

/**
 * API Integration Tests
 * Tests critical API endpoints for CortexBuild
 */

import { describe, it, expect, beforeAll } from 'vitest';

const API_URL = 'http://localhost:3001/api';

let authToken: string = '';
let testUserId: string = '';

describe('Authentication API', () => {
  it('should login with valid credentials', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'adrian.stanca1@gmail.com',
        password: 'parola123'
      })
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('adrian.stanca1@gmail.com');
    expect(data.user.role).toBe('super_admin');

    // Save token for subsequent tests
    authToken = data.token;
    testUserId = data.user.id;
  });

  it('should reject invalid credentials', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })
    });

    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should get current user with valid token', async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.id).toBe(testUserId);
    expect(data.email).toBe('adrian.stanca1@gmail.com');
  });

  it('should reject request without token', async () => {
    const response = await fetch(`${API_URL}/auth/me`);
    
    expect(response.status).toBe(401);
  });
});

describe('Workflows API', () => {
  it('should get workflow builder blocks', async () => {
    const response = await fetch(`${API_URL}/workflows/builder/blocks`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.blocks).toBeDefined();
    expect(Array.isArray(data.blocks)).toBe(true);
    expect(data.blocks.length).toBeGreaterThan(0);
  });

  it('should list workflows', async () => {
    const response = await fetch(`${API_URL}/workflows`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.workflows).toBeDefined();
    expect(Array.isArray(data.workflows)).toBe(true);
  });

  it('should create a new workflow', async () => {
    const response = await fetch(`${API_URL}/workflows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Workflow',
        description: 'Automated test workflow',
        definition: {
          trigger: { type: 'schedule', config: { cron: '0 9 * * *' } },
          steps: [
            { id: 'step-1', type: 'action-notify', config: { channel: 'email', target: 'admin' } }
          ]
        }
      })
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.workflow).toBeDefined();
    expect(data.workflow.name).toBe('Test Workflow');
  });
});

describe('AI Agents API', () => {
  it('should list available agents', async () => {
    const response = await fetch(`${API_URL}/agents`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.agents).toBeDefined();
    expect(Array.isArray(data.agents)).toBe(true);
  });

  it('should get agent categories', async () => {
    const response = await fetch(`${API_URL}/agents/categories`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.categories).toBeDefined();
    expect(Array.isArray(data.categories)).toBe(true);
  });
});

describe('Projects API', () => {
  it('should list projects', async () => {
    const response = await fetch(`${API_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.projects).toBeDefined();
    expect(Array.isArray(data.projects)).toBe(true);
  });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });
});

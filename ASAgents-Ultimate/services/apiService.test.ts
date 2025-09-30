// @ts-nocheck - Test file with type issues
/**
 * API Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { api } from './apiService';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('API Service', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };
    
    mockedAxios.create.mockReturnValue(mockInstance);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Configuration', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          timeout: expect.any(Number),
        })
      );
    });
  });

  describe('Project Endpoints', () => {
    it('should have getProjects method', () => {
      expect(api.getProjects).toBeDefined();
      expect(typeof api.getProjects).toBe('function');
    });

    it('should have createProject method', () => {
      expect(api.createProject).toBeDefined();
      expect(typeof api.createProject).toBe('function');
    });

    it('should have updateProject method', () => {
      expect(api.updateProject).toBeDefined();
      expect(typeof api.updateProject).toBe('function');
    });

    it('should have deleteProject method', () => {
      expect(api.deleteProject).toBeDefined();
      expect(typeof api.deleteProject).toBe('function');
    });
  });

  describe('User Endpoints', () => {
    it('should have getUsers method', () => {
      expect(api.getUsers).toBeDefined();
      expect(typeof api.getUsers).toBe('function');
    });

    it('should have createUser method', () => {
      expect(api.createUser).toBeDefined();
      expect(typeof api.createUser).toBe('function');
    });

    it('should have updateUser method', () => {
      expect(api.updateUser).toBeDefined();
      expect(typeof api.updateUser).toBe('function');
    });
  });

  describe('Task Endpoints', () => {
    it('should have getTasks method', () => {
      expect(api.getTasks).toBeDefined();
      expect(typeof api.getTasks).toBe('function');
    });

    it('should have createTask method', () => {
      expect(api.createTask).toBeDefined();
      expect(typeof api.createTask).toBe('function');
    });

    it('should have updateTask method', () => {
      expect(api.updateTask).toBeDefined();
      expect(typeof api.updateTask).toBe('function');
    });

    it('should have deleteTask method', () => {
      expect(api.deleteTask).toBeDefined();
      expect(typeof api.deleteTask).toBe('function');
    });
  });

  describe('Financial Endpoints', () => {
    it('should have getInvoices method', () => {
      expect(api.getInvoices).toBeDefined();
      expect(typeof api.getInvoices).toBe('function');
    });

    it('should have createInvoice method', () => {
      expect(api.createInvoice).toBeDefined();
      expect(typeof api.createInvoice).toBe('function');
    });

    it('should have getExpenses method', () => {
      expect(api.getExpenses).toBeDefined();
      expect(typeof api.getExpenses).toBe('function');
    });

    it('should have createExpense method', () => {
      expect(api.createExpense).toBeDefined();
      expect(typeof api.createExpense).toBe('function');
    });
  });

  describe('File Upload', () => {
    it('should have uploadFile method', () => {
      expect(api.uploadFile).toBeDefined();
      expect(typeof api.uploadFile).toBe('function');
    });
  });

  describe('Generic Methods', () => {
    it('should have get method', () => {
      expect(api.get).toBeDefined();
      expect(typeof api.get).toBe('function');
    });

    it('should have post method', () => {
      expect(api.post).toBeDefined();
      expect(typeof api.post).toBe('function');
    });

    it('should have put method', () => {
      expect(api.put).toBeDefined();
      expect(typeof api.put).toBe('function');
    });

    it('should have patch method', () => {
      expect(api.patch).toBeDefined();
      expect(typeof api.patch).toBe('function');
    });

    it('should have delete method', () => {
      expect(api.delete).toBeDefined();
      expect(typeof api.delete).toBe('function');
    });
  });
});

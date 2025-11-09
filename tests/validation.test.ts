/**
 * Validation Utilities Tests
 * Tests for form and data validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateProjectData,
  validateTaskData,
  validateUserData
} from '../utils/validation';

describe('Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    expect(validateEmail('user_name@example-domain.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('Password Validation', () => {
  it('should validate strong passwords', () => {
    expect(validatePassword('Password123!')).toBe(true);
    expect(validatePassword('SecureP@ss1')).toBe(true);
    expect(validatePassword('MyP@ssw0rd')).toBe(true);
  });

  it('should reject weak passwords', () => {
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('alllowercase')).toBe(false);
    expect(validatePassword('ALLUPPERCASE')).toBe(false);
    expect(validatePassword('NoNumbers!')).toBe(false);
    expect(validatePassword('12345678')).toBe(false);
  });

  it('should reject passwords without required complexity', () => {
    expect(validatePassword('password123')).toBe(false); // no uppercase
    expect(validatePassword('PASSWORD123')).toBe(false); // no lowercase
    expect(validatePassword('PasswordABC')).toBe(false); // no numbers
  });
});

describe('Phone Validation', () => {
  it('should validate various phone formats', () => {
    expect(validatePhone('123-456-7890')).toBe(true);
    expect(validatePhone('(123) 456-7890')).toBe(true);
    expect(validatePhone('1234567890')).toBe(true);
    expect(validatePhone('+1 123-456-7890')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('abc-def-ghij')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('Project Data Validation', () => {
  it('should validate complete project data', () => {
    const validProject = {
      name: 'Tower Construction',
      location: '123 Main St, City, State',
      description: 'Build a 50-story tower',
      startDate: '2025-01-15',
      endDate: '2027-12-31',
      budget: 50000000,
      clientId: 123
    };

    const result = validateProjectData(validProject);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should reject project with missing required fields', () => {
    const invalidProject = {
      name: '',
      location: '123 Main St',
      description: 'Test',
      startDate: '2025-01-15'
    };

    const result = validateProjectData(invalidProject);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('should validate budget constraints', () => {
    const invalidBudget = {
      name: 'Test Project',
      location: '123 Main St',
      description: 'Test',
      startDate: '2025-01-15',
      endDate: '2026-01-15',
      budget: -1000
    };

    const result = validateProjectData(invalidBudget);
    expect(result.valid).toBe(false);
    expect(result.errors.budget).toBeDefined();
  });

  it('should validate date constraints', () => {
    const invalidDates = {
      name: 'Test Project',
      location: '123 Main St',
      description: 'Test',
      startDate: '2025-12-31',
      endDate: '2025-01-01' // end before start
    };

    const result = validateProjectData(invalidDates);
    expect(result.valid).toBe(false);
    expect(result.errors.endDate).toBeDefined();
  });
});

describe('Task Data Validation', () => {
  it('should validate complete task data', () => {
    const validTask = {
      title: 'Install HVAC System',
      description: 'Install heating and cooling',
      projectId: 123,
      assignedTo: 456,
      dueDate: '2025-06-01',
      priority: 'high',
      status: 'in-progress'
    };

    const result = validateTaskData(validTask);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should reject task with missing title', () => {
    const invalidTask = {
      title: '',
      description: 'Test',
      projectId: 123
    };

    const result = validateTaskData(invalidTask);
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeDefined();
  });

  it('should validate priority values', () => {
    const invalidPriority = {
      title: 'Test Task',
      description: 'Test',
      projectId: 123,
      priority: 'invalid'
    };

    const result = validateTaskData(invalidPriority);
    expect(result.valid).toBe(false);
    expect(result.errors.priority).toBeDefined();
  });
});

describe('User Data Validation', () => {
  it('should validate complete user data', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecureP@ss1',
      role: 'Project Manager',
      companyId: 'comp-1'
    };

    const result = validateUserData(validUser);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should reject user with invalid email', () => {
    const invalidUser = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'SecureP@ss1',
      role: 'Project Manager'
    };

    const result = validateUserData(invalidUser);
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('should reject user with weak password', () => {
    const weakPasswordUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'weak',
      role: 'Project Manager'
    };

    const result = validateUserData(weakPasswordUser);
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  it('should require valid role', () => {
    const invalidRole = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecureP@ss1',
      role: 'InvalidRole'
    };

    const result = validateUserData(invalidRole);
    expect(result.valid).toBe(false);
    expect(result.errors.role).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateCompanyName,
  validateTaskData,
  validateRFIData,
  combineValidations
} from '../utils/validation';

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.co.uk',
      'admin+tag@company.org',
      'name_123@test-domain.com'
    ];

    validEmails.forEach(email => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Email is required');
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com'
    ];

    invalidEmails.forEach(email => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email address');
    });
  });
});

describe('validatePassword', () => {
  it('should accept valid passwords', () => {
    const validPasswords = [
      'password123',
      'SecurePass!',
      'abcdef',
      'Pass@123456'
    ];

    validPasswords.forEach(password => {
      const result = validatePassword(password);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should reject empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password is required');
  });

  it('should reject passwords shorter than 6 characters', () => {
    const shortPasswords = ['abc', '12345', 'Pass1'];

    shortPasswords.forEach(password => {
      const result = validatePassword(password);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
    });
  });

  it('should accept password exactly 6 characters', () => {
    const result = validatePassword('Pass12');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateName', () => {
  it('should accept valid names', () => {
    const validNames = [
      'John Doe',
      'Mary-Jane Smith',
      "O'Connor",
      'Jean-Pierre',
      'Anne Marie'
    ];

    validNames.forEach(name => {
      const result = validateName(name);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should reject empty name', () => {
    const result = validateName('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  it('should reject names shorter than 2 characters', () => {
    const result = validateName('A');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name must be at least 2 characters long');
  });

  it('should reject names with only whitespace', () => {
    const result = validateName('   ');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name must be at least 2 characters long');
  });

  it('should reject names with invalid characters', () => {
    const invalidNames = [
      'John123',
      'Test@Name',
      'User_Name',
      'Name#1'
    ];

    invalidNames.forEach(name => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name can only contain letters, spaces, hyphens, and apostrophes');
    });
  });

  it('should trim whitespace before validation', () => {
    const result = validateName('  John Doe  ');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateCompanyName', () => {
  it('should accept valid company names', () => {
    const validNames = [
      'ABC Corporation',
      'Tech Startup Inc.',
      'Construction Co.',
      'Smith & Associates'
    ];

    validNames.forEach(name => {
      const result = validateCompanyName(name);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should reject empty company name', () => {
    const result = validateCompanyName('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Company name is required');
  });

  it('should reject company names shorter than 2 characters', () => {
    const result = validateCompanyName('A');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Company name must be at least 2 characters long');
  });

  it('should trim whitespace before validation', () => {
    const result = validateCompanyName('  Tech Corp  ');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateTaskData', () => {
  it('should accept valid task data', () => {
    const result = validateTaskData({
      title: 'Fix roof leak',
      description: 'Repair the leak on building A',
      priority: 'High',
      assignee: 'user-123',
      dueDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing title', () => {
    const result = validateTaskData({
      description: 'Some description'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Task title is required');
  });

  it('should reject empty title', () => {
    const result = validateTaskData({
      title: '   ',
      description: 'Some description'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Task title is required');
  });

  it('should reject title longer than 200 characters', () => {
    const longTitle = 'A'.repeat(201);
    const result = validateTaskData({
      title: longTitle
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Task title must be less than 200 characters');
  });

  it('should reject description longer than 1000 characters', () => {
    const longDescription = 'A'.repeat(1001);
    const result = validateTaskData({
      title: 'Valid title',
      description: longDescription
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Task description must be less than 1000 characters');
  });

  it('should reject invalid priority', () => {
    const result = validateTaskData({
      title: 'Valid title',
      priority: 'Invalid'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid priority level');
  });

  it('should accept valid priorities', () => {
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    priorities.forEach(priority => {
      const result = validateTaskData({
        title: 'Valid title',
        priority
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should reject invalid due date format', () => {
    const result = validateTaskData({
      title: 'Valid title',
      dueDate: 'not-a-date'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid due date');
  });

  it('should reject past due date', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
    const result = validateTaskData({
      title: 'Valid title',
      dueDate: pastDate
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Due date cannot be in the past');
  });

  it('should accept task with minimal required fields', () => {
    const result = validateTaskData({
      title: 'Simple task'
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateRFIData', () => {
  it('should accept valid RFI data', () => {
    const result = validateRFIData({
      subject: 'Clarification on specifications',
      question: 'Can you provide more details about the HVAC requirements?',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing subject', () => {
    const result = validateRFIData({
      question: 'Some question'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RFI subject is required');
  });

  it('should reject empty subject', () => {
    const result = validateRFIData({
      subject: '   ',
      question: 'Some question'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RFI subject is required');
  });

  it('should reject subject longer than 200 characters', () => {
    const longSubject = 'A'.repeat(201);
    const result = validateRFIData({
      subject: longSubject,
      question: 'Some question'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RFI subject must be less than 200 characters');
  });

  it('should reject missing question', () => {
    const result = validateRFIData({
      subject: 'Valid subject'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RFI question is required');
  });

  it('should reject empty question', () => {
    const result = validateRFIData({
      subject: 'Valid subject',
      question: '   '
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RFI question is required');
  });

  it('should reject question longer than 2000 characters', () => {
    const longQuestion = 'A'.repeat(2001);
    const result = validateRFIData({
      subject: 'Valid subject',
      question: longQuestion
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('RFI question must be less than 2000 characters');
  });

  it('should reject invalid due date format', () => {
    const result = validateRFIData({
      subject: 'Valid subject',
      question: 'Valid question',
      dueDate: 'invalid-date'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid due date');
  });

  it('should reject past due date', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = validateRFIData({
      subject: 'Valid subject',
      question: 'Valid question',
      dueDate: pastDate
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Due date cannot be in the past');
  });
});

describe('combineValidations', () => {
  it('should combine multiple valid results', () => {
    const result = combineValidations(
      { isValid: true, errors: [] },
      { isValid: true, errors: [] },
      { isValid: true, errors: [] }
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should combine errors from multiple validations', () => {
    const result = combineValidations(
      { isValid: false, errors: ['Error 1'] },
      { isValid: false, errors: ['Error 2'] },
      { isValid: true, errors: [] }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors).toContain('Error 1');
    expect(result.errors).toContain('Error 2');
  });

  it('should return invalid if any validation fails', () => {
    const result = combineValidations(
      { isValid: true, errors: [] },
      { isValid: false, errors: ['Error'] },
      { isValid: true, errors: [] }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Error');
  });

  it('should handle empty validations array', () => {
    const result = combineValidations();

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should combine validations from actual validation functions', () => {
    const emailValidation = validateEmail('invalid-email');
    const passwordValidation = validatePassword('123');
    const nameValidation = validateName('A');

    const result = combineValidations(
      emailValidation,
      passwordValidation,
      nameValidation
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain('Please enter a valid email address');
    expect(result.errors).toContain('Password must be at least 6 characters long');
    expect(result.errors).toContain('Name must be at least 2 characters long');
  });
});

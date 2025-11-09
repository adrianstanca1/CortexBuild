/**
 * Data Validation Utilities
 * Comprehensive validation functions for all data types
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Invalid email format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    // Optional: Add more password requirements
    // if (!/[A-Z]/.test(password)) {
    //   errors.push('Password must contain at least one uppercase letter');
    // }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];
  
  if (!url || typeof url !== 'string') {
    errors.push('URL is required');
  } else {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol');
      }
    } catch {
      errors.push('Invalid URL format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];
  
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
  } else {
    if (value.length < min) {
      errors.push(`${fieldName} must be at least ${min} characters`);
    }
    if (value.length > max) {
      errors.push(`${fieldName} must not exceed ${max} characters`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate number range
 */
export function validateNumber(
  value: number,
  min?: number,
  max?: number,
  fieldName: string = 'Value'
): ValidationResult {
  const errors: string[] = [];
  
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
  } else {
    if (min !== undefined && value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }
    if (max !== undefined && value > max) {
      errors.push(`${fieldName} must not exceed ${max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate date
 */
export function validateDate(dateString: string, fieldName: string = 'Date'): ValidationResult {
  const errors: string[] = [];
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    errors.push(`${fieldName} must be a valid date`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate enum value
 */
export function validateEnum(
  value: string,
  allowedValues: string[],
  fieldName: string
): ValidationResult {
  const errors: string[] = [];
  
  if (!allowedValues.includes(value)) {
    errors.push(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Combine multiple validation results
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate JSON string
 */
export function validateJson(jsonString: string, fieldName: string = 'JSON'): ValidationResult {
  const errors: string[] = [];
  
  try {
    JSON.parse(jsonString);
  } catch {
    errors.push(`${fieldName} must be valid JSON`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate webhook events array
 */
export function validateWebhookEvents(events: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(events)) {
    errors.push('Events must be an array');
  } else if (events.length === 0) {
    errors.push('At least one event must be specified');
  } else {
    const validEvents = [
      'project.created',
      'project.updated',
      'task.created',
      'task.completed',
      'invoice.created',
      'invoice.paid',
      'rfi.created',
      'document.uploaded'
    ];
    
    for (const event of events) {
      if (typeof event !== 'string' || !validEvents.includes(event)) {
        errors.push(`Invalid event: ${event}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits');

export const urlSchema = z.string().url('Invalid URL format');

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema.optional(),
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters')
    .optional(),
  role: z.enum(['owner', 'admin', 'manager', 'user']).optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const userUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  role: z.enum(['owner', 'admin', 'manager', 'user']).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

// Project validation schemas
export const projectSchema = z.object({
  name: z.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(200, 'Project name must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.number()
    .min(0, 'Budget must be a positive number')
    .max(100000000, 'Budget exceeds maximum allowed value'),
  clientId: z.string().uuid('Invalid client ID').optional(),
  managerId: z.string().uuid('Invalid manager ID').optional(),
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Financial validation schemas
export const expenseSchema = z.object({
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0')
    .max(1000000, 'Amount exceeds maximum allowed value'),
  description: z.string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be less than 500 characters'),
  category: z.enum(['materials', 'labor', 'equipment', 'overhead', 'travel', 'other']),
  date: z.date(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  vendor: z.string()
    .max(200, 'Vendor name must be less than 200 characters')
    .optional(),
  paymentMethod: z.enum(['cash', 'check', 'credit-card', 'bank-transfer', 'company-card']),
  receiptUrl: urlSchema.optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
});

export const invoiceSchema = z.object({
  number: z.string()
    .min(1, 'Invoice number is required')
    .max(50, 'Invoice number must be less than 50 characters')
    .regex(/^[A-Z0-9\-]+$/, 'Invoice number contains invalid characters'),
  clientId: z.string().uuid('Invalid client ID'),
  projectId: z.string().uuid('Invalid project ID').optional(),
  amount: z.number()
    .min(0.01, 'Amount must be greater than 0')
    .max(10000000, 'Amount exceeds maximum allowed value'),
  tax: z.number()
    .min(0, 'Tax must be a positive number')
    .max(1000000, 'Tax exceeds maximum allowed value'),
  issueDate: z.date(),
  dueDate: z.date(),
  terms: z.string()
    .max(200, 'Terms must be less than 200 characters')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  items: z.array(z.object({
    description: z.string()
      .min(1, 'Item description is required')
      .max(200, 'Item description must be less than 200 characters'),
    quantity: z.number()
      .min(0.01, 'Quantity must be greater than 0')
      .max(100000, 'Quantity exceeds maximum allowed value'),
    rate: z.number()
      .min(0.01, 'Rate must be greater than 0')
      .max(100000, 'Rate exceeds maximum allowed value'),
    amount: z.number()
      .min(0.01, 'Amount must be greater than 0')
      .max(10000000, 'Amount exceeds maximum allowed value'),
  })).min(1, 'At least one item is required'),
}).refine(data => data.dueDate >= data.issueDate, {
  message: 'Due date must be after issue date',
  path: ['dueDate'],
});

// Settings validation schemas
export const companySettingsSchema = z.object({
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters'),
  companyEmail: emailSchema,
  companyPhone: phoneSchema.optional(),
  companyAddress: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  timezone: z.string(),
  dateFormat: z.string(),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  language: z.string().length(2, 'Language must be a 2-letter code'),
});

export const securitySettingsSchema = z.object({
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(32),
    requireUppercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSymbols: z.boolean(),
  }),
  sessionTimeout: z.number().min(15).max(1440), // 15 minutes to 24 hours
  twoFactorRequired: z.boolean(),
  ipWhitelist: z.array(z.string().regex(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, 'Invalid IP address or CIDR')).optional(),
});

// Input sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
};

export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const sanitizeNumber = (input: any): number | null => {
  const num = parseFloat(input);
  return isNaN(num) ? null : num;
};

export const sanitizeBoolean = (input: any): boolean => {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1';
  }
  return Boolean(input);
};

// Validation helper functions
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.errors.map(err => err.message),
  };
};

export const validateUrl = (url: string): boolean => {
  return urlSchema.safeParse(url).success;
};

// Rate limiting helpers
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true; // Request allowed
  };
};

// CSRF token helpers
export const generateCSRFToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken && token.length === 64;
};

// File upload validation
export const validateFileUpload = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): { valid: boolean; error?: string } => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: `File extension .${extension} is not allowed` };
    }
  }

  return { valid: true };
};

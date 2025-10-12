import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../middleware/errorHandler';

/**
 * Validation Middleware Factory
 * Creates middleware that validates request data against a Joi schema
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new ValidationError(errorMessage);
    }

    next();
  };
};

/**
 * Common Validation Schemas
 */

// Pagination schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// ID parameter schema
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

// Email validation
export const emailSchema = Joi.string().email().lowercase().trim();

// Password validation (minimum 8 characters, at least one uppercase, one lowercase, one number)
export const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .messages({
    'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  });

// Phone number validation
export const phoneSchema = Joi.string()
  .pattern(/^\+?[\d\s\-()]+$/)
  .min(10)
  .max(20)
  .messages({
    'string.pattern.base': 'Invalid phone number format'
  });

// Date validation
export const dateSchema = Joi.string().isoDate();

// URL validation
export const urlSchema = Joi.string().uri();

// Enum validation helpers
export const createEnumSchema = (values: string[]) =>
  Joi.string().valid(...values).messages({
    'any.only': `Must be one of: ${values.join(', ')}`
  });

// Money/decimal validation
export const moneySchema = Joi.number().precision(2).positive();

// Percentage validation
export const percentageSchema = Joi.number().min(0).max(100);

/**
 * Auth Validation Schemas
 */
export const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string().required()
});

export const registerSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
  name: Joi.string().trim().min(1).max(100).required(),
  companyName: Joi.string().trim().min(1).max(100).required()
});

export const refreshTokenSchema = Joi.object({
  token: Joi.string().required()
});

/**
 * Project Validation Schemas
 */
export const createProjectSchema = Joi.object({
  company_id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).allow(''),
  project_number: Joi.string().trim().max(100).allow(''),
  status: createEnumSchema(['planning', 'active', 'on-hold', 'completed', 'cancelled']).default('planning'),
  priority: createEnumSchema(['low', 'medium', 'high', 'critical']).default('medium'),
  start_date: dateSchema.allow(null),
  end_date: dateSchema.allow(null),
  budget: moneySchema.allow(null),
  address: Joi.string().trim().max(255).allow(''),
  city: Joi.string().trim().max(100).allow(''),
  state: Joi.string().trim().max(50).allow(''),
  zip_code: Joi.string().trim().max(20).allow(''),
  client_id: Joi.number().integer().positive().allow(null),
  project_manager_id: Joi.number().integer().positive().allow(null)
}).custom((value, helpers) => {
  // Custom validation: start_date should be before end_date
  if (value.start_date && value.end_date && new Date(value.start_date) > new Date(value.end_date)) {
    return helpers.error('any.custom', { message: 'Start date cannot be after end date' });
  }
  return value;
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255),
  description: Joi.string().trim().max(1000).allow(''),
  project_number: Joi.string().trim().max(100).allow(''),
  status: createEnumSchema(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  priority: createEnumSchema(['low', 'medium', 'high', 'critical']),
  start_date: dateSchema.allow(null),
  end_date: dateSchema.allow(null),
  budget: moneySchema.allow(null),
  address: Joi.string().trim().max(255).allow(''),
  city: Joi.string().trim().max(100).allow(''),
  state: Joi.string().trim().max(50).allow(''),
  zip_code: Joi.string().trim().max(20).allow(''),
  client_id: Joi.number().integer().positive().allow(null),
  project_manager_id: Joi.number().integer().positive().allow(null)
}).min(1).custom((value, helpers) => {
  // Custom validation: start_date should be before end_date
  if (value.start_date && value.end_date && new Date(value.start_date) > new Date(value.end_date)) {
    return helpers.error('any.custom', { message: 'Start date cannot be after end date' });
  }
  return value;
});

export const projectFiltersSchema = Joi.object({
  status: createEnumSchema(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  priority: createEnumSchema(['low', 'medium', 'high', 'critical']),
  client_id: Joi.number().integer().positive(),
  project_manager_id: Joi.number().integer().positive(),
  company_id: Joi.number().integer().positive(),
  search: Joi.string().trim().min(2).max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * Client Validation Schemas
 */
export const createClientSchema = Joi.object({
  company_id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().min(1).max(255).required(),
  contact_name: Joi.string().trim().max(100).allow(''),
  email: emailSchema.allow(''),
  phone: phoneSchema.allow(''),
  address: Joi.string().trim().max(255).allow(''),
  city: Joi.string().trim().max(100).allow(''),
  state: Joi.string().trim().max(50).allow(''),
  zip_code: Joi.string().trim().max(20).allow(''),
  country: Joi.string().trim().max(2).default('US'),
  website: urlSchema.allow(''),
  tax_id: Joi.string().trim().max(50).allow(''),
  payment_terms: Joi.number().integer().min(0).max(365).default(30),
  credit_limit: moneySchema.allow(null),
  notes: Joi.string().trim().max(1000).allow('')
});

export const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255),
  contact_name: Joi.string().trim().max(100).allow(''),
  email: emailSchema.allow(''),
  phone: phoneSchema.allow(''),
  address: Joi.string().trim().max(255).allow(''),
  city: Joi.string().trim().max(100).allow(''),
  state: Joi.string().trim().max(50).allow(''),
  zip_code: Joi.string().trim().max(20).allow(''),
  country: Joi.string().trim().max(2),
  website: urlSchema.allow(''),
  tax_id: Joi.string().trim().max(50).allow(''),
  payment_terms: Joi.number().integer().min(0).max(365),
  credit_limit: moneySchema.allow(null),
  notes: Joi.string().trim().max(1000).allow('')
}).min(1);

export const clientFiltersSchema = Joi.object({
  search: Joi.string().trim().min(2).max(100),
  is_active: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * Task Validation Schemas
 */
export const createTaskSchema = Joi.object({
  project_id: Joi.number().integer().positive().required(),
  milestone_id: Joi.number().integer().positive().allow(null),
  title: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().max(1000).allow(''),
  assigned_to: Joi.number().integer().positive().allow(null),
  status: createEnumSchema(['pending', 'in-progress', 'completed', 'cancelled']).default('pending'),
  priority: createEnumSchema(['low', 'medium', 'high', 'critical']).default('medium'),
  due_date: dateSchema.allow(null),
  estimated_hours: Joi.number().min(0).max(9999).precision(1).allow(null)
});

export const updateTaskSchema = Joi.object({
  milestone_id: Joi.number().integer().positive().allow(null),
  title: Joi.string().trim().min(1).max(255),
  description: Joi.string().trim().max(1000).allow(''),
  assigned_to: Joi.number().integer().positive().allow(null),
  status: createEnumSchema(['pending', 'in-progress', 'completed', 'cancelled']),
  priority: createEnumSchema(['low', 'medium', 'high', 'critical']),
  due_date: dateSchema.allow(null),
  estimated_hours: Joi.number().min(0).max(9999).precision(1).allow(null)
}).min(1);

export const taskFiltersSchema = Joi.object({
  project_id: Joi.number().integer().positive(),
  milestone_id: Joi.number().integer().positive(),
  assigned_to: Joi.number().integer().positive(),
  status: createEnumSchema(['pending', 'in-progress', 'completed', 'cancelled']),
  priority: createEnumSchema(['low', 'medium', 'high', 'critical']),
  search: Joi.string().trim().min(2).max(100),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});

/**
 * File Upload Validation
 */
export const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid(
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ).required(),
  size: Joi.number().max(10 * 1024 * 1024).required(), // 10MB max
  buffer: Joi.binary().required()
});

/**
 * Query Parameter Validation Middleware
 */
export const validateQuery = (schema: Joi.ObjectSchema) => validate(schema, 'query');
export const validateParams = (schema: Joi.ObjectSchema) => validate(schema, 'params');
export const validateBody = (schema: Joi.ObjectSchema) => validate(schema, 'body');

/**
 * Combined Validation Middleware
 */
export const validateRequest = (
  bodySchema?: Joi.ObjectSchema,
  querySchema?: Joi.ObjectSchema,
  paramsSchema?: Joi.ObjectSchema
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (bodySchema) {
      const { error: bodyError } = bodySchema.validate(req.body, { abortEarly: false });
      if (bodyError) {
        errors.push(...bodyError.details.map(detail => `Body: ${detail.message}`));
      }
    }

    if (querySchema) {
      const { error: queryError } = querySchema.validate(req.query, { abortEarly: false });
      if (queryError) {
        errors.push(...queryError.details.map(detail => `Query: ${detail.message}`));
      }
    }

    if (paramsSchema) {
      const { error: paramsError } = paramsSchema.validate(req.params, { abortEarly: false });
      if (paramsError) {
        errors.push(...paramsError.details.map(detail => `Params: ${detail.message}`));
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('; '));
    }

    next();
  };
};

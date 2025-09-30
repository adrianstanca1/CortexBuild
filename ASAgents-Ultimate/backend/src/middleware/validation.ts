import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Generic validation middleware
export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    req.body = value;
    next();
  };
}

// Query parameter validation
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }
    
    req.query = value;
    next();
  };
}

// Common validation schemas
export const schemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  // User schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    role: Joi.string().valid('admin', 'manager', 'worker', 'client').required(),
    company_id: Joi.string().uuid().optional(),
    phone: Joi.string().optional()
  }),
  
  updateUser: Joi.object({
    first_name: Joi.string().min(1).max(50).optional(),
    last_name: Joi.string().min(1).max(50).optional(),
    phone: Joi.string().optional(),
    avatar_url: Joi.string().uri().optional()
  }),
  
  // Company schemas
  createCompany: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    type: Joi.string().valid('general_contractor', 'subcontractor', 'client', 'supplier').required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    website: Joi.string().uri().optional()
  }),
  
  updateCompany: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    type: Joi.string().valid('general_contractor', 'subcontractor', 'client', 'supplier').optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    website: Joi.string().uri().optional()
  }),
  
  // Project schemas
  createProject: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).optional(),
    budget: Joi.number().positive().optional(),
    client_id: Joi.string().uuid().optional(),
    address: Joi.string().optional()
  }),
  
  updateProject: Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    description: Joi.string().optional(),
    status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    budget: Joi.number().positive().optional(),
    progress: Joi.number().integer().min(0).max(100).optional(),
    client_id: Joi.string().uuid().optional(),
    address: Joi.string().optional()
  }),
  
  projectsQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('name', 'status', 'priority', 'start_date', 'end_date', 'budget', 'progress', 'created_at').optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    client_id: Joi.string().uuid().optional(),
    search: Joi.string().optional()
  }),
  
  // Invoice schemas
  createInvoice: Joi.object({
    project_id: Joi.string().uuid().optional(),
    client_id: Joi.string().uuid().required(),
    due_date: Joi.date().iso().min('now').required(),
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().min(1).required(),
        quantity: Joi.number().positive().required(),
        unit_price: Joi.number().positive().required()
      })
    ).min(1).required(),
    notes: Joi.string().optional()
  }),
  
  updateInvoice: Joi.object({
    status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
    due_date: Joi.date().iso().optional(),
    tax_amount: Joi.number().min(0).optional(),
    paid_amount: Joi.number().min(0).optional(),
    notes: Joi.string().optional()
  }),
  
  invoicesQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('invoice_number', 'status', 'issue_date', 'due_date', 'total_amount', 'created_at').optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
    client_id: Joi.string().uuid().optional(),
    project_id: Joi.string().uuid().optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().min(Joi.ref('date_from')).optional()
  }),
  
  // Expense schemas
  createExpense: Joi.object({
    project_id: Joi.string().uuid().optional(),
    category: Joi.string().valid('materials', 'labor', 'equipment', 'permits', 'utilities', 'other').required(),
    description: Joi.string().min(1).required(),
    amount: Joi.number().positive().required(),
    date: Joi.date().iso().max('now').required(),
    vendor: Joi.string().optional(),
    is_billable: Joi.boolean().default(false)
  }),
  
  updateExpense: Joi.object({
    category: Joi.string().valid('materials', 'labor', 'equipment', 'permits', 'utilities', 'other').optional(),
    description: Joi.string().min(1).optional(),
    amount: Joi.number().positive().optional(),
    date: Joi.date().iso().max('now').optional(),
    vendor: Joi.string().optional(),
    is_billable: Joi.boolean().optional()
  }),
  
  expensesQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('date', 'amount', 'category', 'vendor', 'created_at').optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    category: Joi.string().valid('materials', 'labor', 'equipment', 'permits', 'utilities', 'other').optional(),
    project_id: Joi.string().uuid().optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().min(Joi.ref('date_from')).optional(),
    is_billable: Joi.boolean().optional()
  })
};

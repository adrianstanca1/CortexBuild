"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = void 0;
exports.validate = validate;
exports.validateQuery = validateQuery;
const joi_1 = __importDefault(require("joi"));
function validate(schema) {
    return (req, res, next) => {
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
function validateQuery(schema) {
    return (req, res, next) => {
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
exports.schemas = {
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sort: joi_1.default.string().optional(),
        order: joi_1.default.string().valid('asc', 'desc').default('desc')
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required()
    }),
    createUser: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        first_name: joi_1.default.string().min(1).max(50).required(),
        last_name: joi_1.default.string().min(1).max(50).required(),
        role: joi_1.default.string().valid('admin', 'manager', 'worker', 'client').required(),
        company_id: joi_1.default.string().uuid().optional(),
        phone: joi_1.default.string().optional()
    }),
    updateUser: joi_1.default.object({
        first_name: joi_1.default.string().min(1).max(50).optional(),
        last_name: joi_1.default.string().min(1).max(50).optional(),
        phone: joi_1.default.string().optional(),
        avatar_url: joi_1.default.string().uri().optional()
    }),
    createCompany: joi_1.default.object({
        name: joi_1.default.string().min(1).max(100).required(),
        type: joi_1.default.string().valid('general_contractor', 'subcontractor', 'client', 'supplier').required(),
        email: joi_1.default.string().email().optional(),
        phone: joi_1.default.string().optional(),
        address: joi_1.default.string().optional(),
        website: joi_1.default.string().uri().optional()
    }),
    updateCompany: joi_1.default.object({
        name: joi_1.default.string().min(1).max(100).optional(),
        type: joi_1.default.string().valid('general_contractor', 'subcontractor', 'client', 'supplier').optional(),
        email: joi_1.default.string().email().optional(),
        phone: joi_1.default.string().optional(),
        address: joi_1.default.string().optional(),
        website: joi_1.default.string().uri().optional()
    }),
    createProject: joi_1.default.object({
        name: joi_1.default.string().min(1).max(200).required(),
        description: joi_1.default.string().optional(),
        start_date: joi_1.default.date().iso().optional(),
        end_date: joi_1.default.date().iso().min(joi_1.default.ref('start_date')).optional(),
        budget: joi_1.default.number().positive().optional(),
        client_id: joi_1.default.string().uuid().optional(),
        address: joi_1.default.string().optional()
    }),
    updateProject: joi_1.default.object({
        name: joi_1.default.string().min(1).max(200).optional(),
        description: joi_1.default.string().optional(),
        status: joi_1.default.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled').optional(),
        priority: joi_1.default.string().valid('low', 'medium', 'high', 'critical').optional(),
        start_date: joi_1.default.date().iso().optional(),
        end_date: joi_1.default.date().iso().optional(),
        budget: joi_1.default.number().positive().optional(),
        progress: joi_1.default.number().integer().min(0).max(100).optional(),
        client_id: joi_1.default.string().uuid().optional(),
        address: joi_1.default.string().optional()
    }),
    projectsQuery: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sort: joi_1.default.string().valid('name', 'status', 'priority', 'start_date', 'end_date', 'budget', 'progress', 'created_at').optional(),
        order: joi_1.default.string().valid('asc', 'desc').default('desc'),
        status: joi_1.default.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled').optional(),
        priority: joi_1.default.string().valid('low', 'medium', 'high', 'critical').optional(),
        client_id: joi_1.default.string().uuid().optional(),
        search: joi_1.default.string().optional()
    }),
    createInvoice: joi_1.default.object({
        project_id: joi_1.default.string().uuid().optional(),
        client_id: joi_1.default.string().uuid().required(),
        due_date: joi_1.default.date().iso().min('now').required(),
        items: joi_1.default.array().items(joi_1.default.object({
            description: joi_1.default.string().min(1).required(),
            quantity: joi_1.default.number().positive().required(),
            unit_price: joi_1.default.number().positive().required()
        })).min(1).required(),
        notes: joi_1.default.string().optional()
    }),
    updateInvoice: joi_1.default.object({
        status: joi_1.default.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
        due_date: joi_1.default.date().iso().optional(),
        tax_amount: joi_1.default.number().min(0).optional(),
        paid_amount: joi_1.default.number().min(0).optional(),
        notes: joi_1.default.string().optional()
    }),
    invoicesQuery: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sort: joi_1.default.string().valid('invoice_number', 'status', 'issue_date', 'due_date', 'total_amount', 'created_at').optional(),
        order: joi_1.default.string().valid('asc', 'desc').default('desc'),
        status: joi_1.default.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
        client_id: joi_1.default.string().uuid().optional(),
        project_id: joi_1.default.string().uuid().optional(),
        date_from: joi_1.default.date().iso().optional(),
        date_to: joi_1.default.date().iso().min(joi_1.default.ref('date_from')).optional()
    }),
    createExpense: joi_1.default.object({
        project_id: joi_1.default.string().uuid().optional(),
        category: joi_1.default.string().valid('materials', 'labor', 'equipment', 'permits', 'utilities', 'other').required(),
        description: joi_1.default.string().min(1).required(),
        amount: joi_1.default.number().positive().required(),
        date: joi_1.default.date().iso().max('now').required(),
        vendor: joi_1.default.string().optional(),
        is_billable: joi_1.default.boolean().default(false)
    }),
    updateExpense: joi_1.default.object({
        category: joi_1.default.string().valid('materials', 'labor', 'equipment', 'permits', 'utilities', 'other').optional(),
        description: joi_1.default.string().min(1).optional(),
        amount: joi_1.default.number().positive().optional(),
        date: joi_1.default.date().iso().max('now').optional(),
        vendor: joi_1.default.string().optional(),
        is_billable: joi_1.default.boolean().optional()
    }),
    expensesQuery: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sort: joi_1.default.string().valid('date', 'amount', 'category', 'vendor', 'created_at').optional(),
        order: joi_1.default.string().valid('asc', 'desc').default('desc'),
        category: joi_1.default.string().valid('materials', 'labor', 'equipment', 'permits', 'utilities', 'other').optional(),
        project_id: joi_1.default.string().uuid().optional(),
        date_from: joi_1.default.date().iso().optional(),
        date_to: joi_1.default.date().iso().min(joi_1.default.ref('date_from')).optional(),
        is_billable: joi_1.default.boolean().optional()
    })
};
//# sourceMappingURL=validation.js.map
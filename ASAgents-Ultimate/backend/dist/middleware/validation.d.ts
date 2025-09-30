import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare function validate(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function validateQuery(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const schemas: {
    pagination: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    createUser: Joi.ObjectSchema<any>;
    updateUser: Joi.ObjectSchema<any>;
    createCompany: Joi.ObjectSchema<any>;
    updateCompany: Joi.ObjectSchema<any>;
    createProject: Joi.ObjectSchema<any>;
    updateProject: Joi.ObjectSchema<any>;
    projectsQuery: Joi.ObjectSchema<any>;
    createInvoice: Joi.ObjectSchema<any>;
    updateInvoice: Joi.ObjectSchema<any>;
    invoicesQuery: Joi.ObjectSchema<any>;
    createExpense: Joi.ObjectSchema<any>;
    updateExpense: Joi.ObjectSchema<any>;
    expensesQuery: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map
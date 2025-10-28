/**
 * Request Validation Middleware
 */

export interface ValidationRule {
    field: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'email';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
}

export interface ValidationError {
    field: string;
    message: string;
}

export function validate(data: any, rules: ValidationRule[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
        const value = data[rule.field];

        // Check required
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field: rule.field,
                message: `${rule.field} is required`
            });
            continue;
        }

        // Skip further validation if field is not required and empty
        if (!rule.required && (value === undefined || value === null || value === '')) {
            continue;
        }

        // Check type
        if (rule.type) {
            if (rule.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.push({
                        field: rule.field,
                        message: `${rule.field} must be a valid email`
                    });
                }
            } else if (typeof value !== rule.type) {
                errors.push({
                    field: rule.field,
                    message: `${rule.field} must be a ${rule.type}`
                });
            }
        }

        // Check minLength
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
            errors.push({
                field: rule.field,
                message: `${rule.field} must be at least ${rule.minLength} characters`
            });
        }

        // Check maxLength
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
            errors.push({
                field: rule.field,
                message: `${rule.field} must be at most ${rule.maxLength} characters`
            });
        }

        // Check pattern
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
            errors.push({
                field: rule.field,
                message: `${rule.field} format is invalid`
            });
        }

        // Custom validation
        if (rule.custom && !rule.custom(value)) {
            errors.push({
                field: rule.field,
                message: `${rule.field} validation failed`
            });
        }
    }

    return errors;
}

// Common validation rules
export const emailRule: ValidationRule = {
    field: 'email',
    required: true,
    type: 'email',
    maxLength: 255
};

export const passwordRule: ValidationRule = {
    field: 'password',
    required: true,
    type: 'string',
    minLength: 8,
    maxLength: 100
};

export const nameRule: ValidationRule = {
    field: 'name',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
};


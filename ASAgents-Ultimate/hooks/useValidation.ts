import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateAndSanitize, sanitizeString } from '../utils/validation';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseValidationReturn<T> {
  errors: ValidationError[];
  isValid: boolean;
  validate: (data: unknown) => boolean;
  validateField: (field: string, value: unknown) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  getFieldError: (field: string) => string | undefined;
  hasFieldError: (field: string) => boolean;
  sanitizedData: T | null;
}

export function useValidation<T>(schema: z.ZodSchema<T>): UseValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [sanitizedData, setSanitizedData] = useState<T | null>(null);

  const validate = useCallback((data: unknown): boolean => {
    const result = validateAndSanitize(schema, data);
    
    if (result.success) {
      setErrors([]);
      setSanitizedData(result.data);
      return true;
    } else {
      const validationErrors = result.errors.map(error => {
        const [field, ...messageParts] = error.split(': ');
        return {
          field: field || 'general',
          message: messageParts.join(': ') || error,
        };
      });
      setErrors(validationErrors);
      setSanitizedData(null);
      return false;
    }
  }, [schema]);

  const validateField = useCallback((field: string, value: unknown): boolean => {
    try {
      // Try to validate just this field by creating a partial schema
      const fieldSchema = schema.pick({ [field]: true } as any);
      const result = fieldSchema.safeParse({ [field]: value });
      
      if (result.success) {
        // Remove any existing error for this field
        setErrors(prev => prev.filter(error => error.field !== field));
        return true;
      } else {
        // Add or update error for this field
        const fieldError = result.error.errors[0];
        const newError: ValidationError = {
          field,
          message: fieldError.message,
        };
        
        setErrors(prev => {
          const filtered = prev.filter(error => error.field !== field);
          return [...filtered, newError];
        });
        return false;
      }
    } catch {
      // If field validation fails, fall back to full validation
      return validate({ [field]: value });
    }
  }, [schema, validate]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    setSanitizedData(null);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  }, [errors]);

  const hasFieldError = useCallback((field: string): boolean => {
    return errors.some(error => error.field === field);
  }, [errors]);

  const isValid = errors.length === 0;

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
    sanitizedData,
  };
}

// Specialized hooks for common validation scenarios
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const validation = useValidation(schema);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const markFieldTouched = useCallback((field: string) => {
    setTouched(prev => new Set([...prev, field]));
  }, []);

  const markAllTouched = useCallback(() => {
    // Extract field names from schema (simplified)
    const fieldNames = Object.keys(schema.shape || {});
    setTouched(new Set(fieldNames));
  }, [schema]);

  const shouldShowFieldError = useCallback((field: string): boolean => {
    return touched.has(field) && validation.hasFieldError(field);
  }, [touched, validation]);

  const handleFieldChange = useCallback((field: string, value: unknown) => {
    markFieldTouched(field);
    validation.validateField(field, value);
  }, [markFieldTouched, validation]);

  const handleSubmit = useCallback((data: unknown, onSuccess: (validData: T) => void) => {
    markAllTouched();
    if (validation.validate(data)) {
      onSuccess(validation.sanitizedData!);
    }
  }, [markAllTouched, validation]);

  return {
    ...validation,
    touched,
    markFieldTouched,
    markAllTouched,
    shouldShowFieldError,
    handleFieldChange,
    handleSubmit,
  };
}

// Hook for real-time input sanitization
export function useSanitizedInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState(sanitizeString(initialValue));

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setSanitizedValue(sanitizeString(newValue));
  }, []);

  const reset = useCallback((newValue: string = '') => {
    setValue(newValue);
    setSanitizedValue(sanitizeString(newValue));
  }, []);

  return {
    value,
    sanitizedValue,
    handleChange,
    reset,
    isDirty: value !== initialValue,
    isModified: sanitizedValue !== sanitizeString(initialValue),
  };
}

// Hook for password validation with real-time feedback
export function usePasswordValidation() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = useCallback((pwd: string) => {
    const validationErrors: string[] = [];

    if (pwd.length < 8) {
      validationErrors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(pwd)) {
      validationErrors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      validationErrors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      validationErrors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      validationErrors.push('Password must contain at least one special character');
    }

    return validationErrors;
  }, []);

  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword);
    const validationErrors = validatePassword(newPassword);
    
    if (confirmPassword && newPassword !== confirmPassword) {
      validationErrors.push('Passwords do not match');
    }
    
    setErrors(validationErrors);
  }, [confirmPassword, validatePassword]);

  const handleConfirmPasswordChange = useCallback((newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword);
    const validationErrors = validatePassword(password);
    
    if (password && password !== newConfirmPassword) {
      validationErrors.push('Passwords do not match');
    }
    
    setErrors(validationErrors);
  }, [password, validatePassword]);

  const getPasswordStrength = useCallback((): 'weak' | 'medium' | 'strong' => {
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
      password.length >= 12,
    ].filter(Boolean).length;

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }, [password]);

  const isValid = errors.length === 0 && password.length > 0 && confirmPassword.length > 0;

  return {
    password,
    confirmPassword,
    errors,
    isValid,
    passwordStrength: getPasswordStrength(),
    handlePasswordChange,
    handleConfirmPasswordChange,
    reset: () => {
      setPassword('');
      setConfirmPassword('');
      setErrors([]);
    },
  };
}

// Hook for file upload validation
export function useFileUploadValidation(options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  maxFiles?: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = useCallback((file: File): string | null => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

    if (file.size > maxSize) {
      return `File "${file.name}" exceeds ${maxSize / 1024 / 1024}MB size limit`;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type "${file.type}" is not allowed for "${file.name}"`;
    }

    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        return `File extension ".${extension}" is not allowed for "${file.name}"`;
      }
    }

    return null;
  }, [options]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Check max files limit
    const { maxFiles = 10 } = options;
    if (files.length + fileArray.length > maxFiles) {
      validationErrors.push(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(prev => [...prev, ...validationErrors]);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length, options, validateFile]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    files,
    errors,
    isValid: errors.length === 0,
    addFiles,
    removeFile,
    clearFiles,
    clearErrors,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
  };
}

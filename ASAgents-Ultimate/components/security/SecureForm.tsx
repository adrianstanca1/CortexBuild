import React, { useState, useCallback, FormEvent } from 'react';
import { useSecurityContext } from '../../contexts/SecurityContext';
import { useFormValidation } from '../../hooks/useValidation';
import { z } from 'zod';
import { AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';

interface SecureFormProps<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T, csrfToken: string) => Promise<void> | void;
  children: (props: {
    register: (field: keyof T) => {
      value: string;
      onChange: (value: string) => void;
      onBlur: () => void;
      error?: string;
      hasError: boolean;
    };
    errors: Record<string, string>;
    isSubmitting: boolean;
    isValid: boolean;
    csrfToken: string;
  }) => React.ReactNode;
  className?: string;
  requireCSRF?: boolean;
  logAction?: string;
  logResource?: string;
}

export function SecureForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  children,
  className = '',
  requireCSRF = true,
  logAction = 'form_submit',
  logResource = 'form',
}: SecureFormProps<T>) {
  const { csrfToken, validateCSRF, logAction: auditLog } = useSecurityContext();
  const validation = useFormValidation(schema);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>({});

  const register = useCallback((field: keyof T) => {
    return {
      value: (formData[field] as string) || '',
      onChange: (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        validation.handleFieldChange(field as string, value);
      },
      onBlur: () => {
        validation.markFieldTouched(field as string);
      },
      error: validation.shouldShowFieldError(field as string) 
        ? validation.getFieldError(field as string) 
        : undefined,
      hasError: validation.shouldShowFieldError(field as string),
    };
  }, [formData, validation]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate CSRF token if required
      if (requireCSRF && !validateCSRF(csrfToken)) {
        auditLog(logAction, logResource, { error: 'Invalid CSRF token' }, false);
        throw new Error('Security validation failed');
      }

      // Validate form data
      validation.handleSubmit(formData, async (validData) => {
        try {
          await onSubmit(validData, csrfToken);
          auditLog(logAction, logResource, { success: true }, true);
        } catch (error) {
          auditLog(logAction, logResource, { error: error instanceof Error ? error.message : 'Unknown error' }, false);
          throw error;
        }
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    requireCSRF,
    validateCSRF,
    csrfToken,
    auditLog,
    logAction,
    logResource,
    validation,
    formData,
    onSubmit,
  ]);

  const errors = Object.fromEntries(
    validation.errors.map(error => [error.field, error.message])
  );

  return (
    <form onSubmit={handleSubmit} className={`secure-form ${className}`}>
      {requireCSRF && (
        <input type="hidden" name="_csrf" value={csrfToken} />
      )}
      
      {children({
        register,
        errors,
        isSubmitting,
        isValid: validation.isValid,
        csrfToken,
      })}
    </form>
  );
}

// Secure input component with built-in validation and sanitization
interface SecureInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  hasError?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  showPasswordToggle?: boolean;
  maxLength?: number;
  pattern?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hasError = false,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  showPasswordToggle = false,
  maxLength,
  pattern,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Basic sanitization
    if (type === 'email') {
      newValue = newValue.toLowerCase().trim();
    } else if (type === 'tel') {
      newValue = newValue.replace(/[^\d\s\-\(\)\+]/g, '');
    } else if (type === 'number') {
      newValue = newValue.replace(/[^\d\.\-]/g, '');
    }
    
    // Apply max length
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }
    
    onChange(newValue);
  }, [type, maxLength, onChange]);

  const baseClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-border'}
    ${isFocused ? 'ring-2 ring-primary/20' : ''}
  `;

  return (
    <div className="relative">
      <input
        type={inputType}
        value={value}
        onChange={handleChange}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.();
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        className={`${baseClasses} ${className} ${showPasswordToggle && type === 'password' ? 'pr-10' : ''}`}
      />
      
      {showPasswordToggle && type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
      
      {error && (
        <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Security status indicator
interface SecurityStatusProps {
  level: 'low' | 'medium' | 'high';
  message?: string;
  className?: string;
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({
  level,
  message,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (level) {
      case 'high':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          icon: <Shield className="text-green-600" size={16} />,
          defaultMessage: 'High security',
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          icon: <Shield className="text-yellow-600" size={16} />,
          defaultMessage: 'Medium security',
        };
      case 'low':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          icon: <AlertTriangle className="text-red-600" size={16} />,
          defaultMessage: 'Low security',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-lg border
      ${config.bgColor} ${config.borderColor} ${config.color}
      ${className}
    `}>
      {config.icon}
      <span className="text-sm font-medium">
        {message || config.defaultMessage}
      </span>
    </div>
  );
};

// Password strength indicator
interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className = '',
}) => {
  const getStrength = useCallback(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
      password.length >= 12,
    ];

    score = checks.filter(Boolean).length;

    if (score < 3) {
      return { score, label: 'Weak', color: 'bg-red-500' };
    } else if (score < 5) {
      return { score, label: 'Medium', color: 'bg-yellow-500' };
    } else {
      return { score, label: 'Strong', color: 'bg-green-500' };
    }
  }, [password]);

  const strength = getStrength();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength</span>
        <span className={`font-medium ${
          strength.label === 'Strong' ? 'text-green-600' :
          strength.label === 'Medium' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map(level => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full ${
              level <= strength.score ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div className={password.length >= 8 ? 'text-green-600' : ''}>
          ✓ At least 8 characters
        </div>
        <div className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
          ✓ Uppercase letter
        </div>
        <div className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
          ✓ Lowercase letter
        </div>
        <div className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
          ✓ Number
        </div>
        <div className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
          ✓ Special character
        </div>
      </div>
    </div>
  );
};

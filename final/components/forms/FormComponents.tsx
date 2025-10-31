// 🏗️ Comprehensive Form Components
// Reusable form components with validation and error handling

// Form Validation Utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  value: any;
  rules?: ValidationRule;
}

export class FormValidator {
  static validateField(value: any, rules: ValidationRule = {}): string | null {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Must be no more than ${rules.maxLength} characters`;
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);
      if (rules.min !== undefined && numValue < rules.min) {
        return `Must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `Must be no more than ${rules.max}`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    // Email validation
    if (rules.email && typeof value === 'string') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return 'Invalid email address';
      }
    }

    // Phone validation
    if (rules.phone && typeof value === 'string') {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phonePattern.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return 'Invalid phone number';
      }
    }

    // URL validation
    if (rules.url && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        return 'Invalid URL';
      }
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }

  static validateForm(fields: FormField[]): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    fields.forEach(field => {
      const error = this.validateField(field.value, field.rules);
      if (error) {
        errors[field.name] = error;
      }
    });

    return errors;
  }

  static hasErrors(errors: { [key: string]: string }): boolean {
    return Object.keys(errors).length > 0;
  }
}

// Form Hook for managing form state
export const useForm = (initialValues: { [key: string]: any } = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const setError = (name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const setTouched = (name: string, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  };

  const validateField = (name: string, rules: ValidationRule) => {
    const error = FormValidator.validateField(values[name], rules);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    return !error;
  };

  const validateForm = (fields: FormField[]) => {
    const formErrors = FormValidator.validateForm(fields);
    setErrors(formErrors);
    return !FormValidator.hasErrors(formErrors);
  };

  const reset = (newValues: { [key: string]: any } = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (
    onSubmit: (values: { [key: string]: any }) => Promise<void> | void,
    fields: FormField[]
  ) => {
    setIsSubmitting(true);

    // Mark all fields as touched
    const touchedFields: { [key: string]: boolean } = {};
    fields.forEach(field => {
      touchedFields[field.name] = true;
    });
    setTouched(touchedFields);

    // Validate form
    const isValid = validateForm(fields);

    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    setTouched,
    validateField,
    validateForm,
    reset,
    handleSubmit
  };
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock, 
  Upload, 
  X, 
  Plus, 
  Minus,
  Search,
  ChevronDown,
  MapPin,
  User,
  Mail,
  Phone,
  DollarSign,
  Hash,
  FileText,
  Image,
  Paperclip
} from 'lucide-react';

// Base form field props
interface BaseFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

// Text Input Component
export const TextInput: React.FC<BaseFieldProps & {
  type?: 'text' | 'email' | 'tel' | 'url';
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  helpText, 
  className = '',
  type = 'text',
  maxLength,
  pattern,
  autoComplete,
  icon
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Password Input Component
export const PasswordInput: React.FC<BaseFieldProps & {
  showStrength?: boolean;
  autoComplete?: string;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  helpText, 
  className = '',
  showStrength = false,
  autoComplete = 'current-password'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (showStrength && value) {
      // Simple password strength calculation
      let score = 0;
      if (value.length >= 8) score++;
      if (/[a-z]/.test(value)) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      setStrength(score);
    }
  }, [value, showStrength]);

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            pl-3 pr-10 py-2
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-gray-400" />
          ) : (
            <Eye className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Password strength</span>
            <span className={`font-medium ${strength <= 2 ? 'text-red-600' : strength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
              {getStrengthText()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Textarea Component
export const TextArea: React.FC<BaseFieldProps & {
  rows?: number;
  maxLength?: number;
  resize?: boolean;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  helpText, 
  className = '',
  rows = 3,
  maxLength,
  resize = true
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`
          block w-full rounded-lg border-gray-300 shadow-sm
          focus:border-blue-500 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          px-3 py-2
          ${!resize ? 'resize-none' : ''}
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        `}
      />
      {maxLength && (
        <div className="flex justify-between text-xs text-gray-500">
          <span></span>
          <span>{(value || '').length}/{maxLength}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Select Component
export const Select: React.FC<BaseFieldProps & {
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  helpText, 
  className = '',
  options
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            pl-3 pr-10 py-2 appearance-none
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Multi-Select Component
export const MultiSelect: React.FC<BaseFieldProps & {
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}> = ({ 
  label, 
  name, 
  value = [], 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  helpText, 
  className = '',
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v: string) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedLabels = options
    .filter(option => value.includes(option.value))
    .map(option => option.label);

  return (
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            pl-3 pr-10 py-2 text-left
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        >
          {selectedLabels.length > 0 ? (
            <span className="block truncate">
              {selectedLabels.length === 1 
                ? selectedLabels[0] 
                : `${selectedLabels.length} selected`
              }
            </span>
          ) : (
            <span className="text-gray-500">{placeholder || 'Select options...'}</span>
          )}
        </button>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => !option.disabled && handleToggleOption(option.value)}
                  disabled={option.disabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Checkbox Component
export const Checkbox: React.FC<BaseFieldProps & {
  description?: string;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  helpText, 
  className = '',
  description
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className={`
              rounded border-gray-300 text-blue-600 focus:ring-blue-500
              disabled:opacity-50
              ${error ? 'border-red-300 focus:ring-red-500' : ''}
            `}
          />
        </div>
        <div className="ml-3">
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Radio Group Component
export const RadioGroup: React.FC<BaseFieldProps & {
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  direction?: 'horizontal' | 'vertical';
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  helpText, 
  className = '',
  options,
  direction = 'vertical'
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`${direction === 'horizontal' ? 'flex space-x-6' : 'space-y-2'}`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled || option.disabled}
                className={`
                  border-gray-300 text-blue-600 focus:ring-blue-500
                  disabled:opacity-50
                  ${error ? 'border-red-300 focus:ring-red-500' : ''}
                `}
              />
            </div>
            <div className="ml-3">
              <label htmlFor={`${name}-${option.value}`} className="text-sm font-medium text-gray-700">
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Number Input Component
export const NumberInput: React.FC<BaseFieldProps & {
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  showControls?: boolean;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  placeholder, 
  helpText, 
  className = '',
  min,
  max,
  step = 1,
  prefix,
  suffix,
  showControls = true
}) => {
  const handleIncrement = () => {
    const newValue = (parseFloat(value) || 0) + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = (parseFloat(value) || 0) - step;
    if (min === undefined || newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${prefix ? 'pl-8' : 'pl-3'} 
            ${suffix || showControls ? 'pr-16' : 'pr-3'} 
            py-2
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-sm">{suffix}</span>
          </div>
        )}
        {showControls && (
          <div className="absolute inset-y-0 right-0 flex flex-col">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && parseFloat(value) >= max)}
              className="px-2 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || (min !== undefined && parseFloat(value) <= min)}
              className="px-2 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Date Input Component
export const DateInput: React.FC<BaseFieldProps & {
  type?: 'date' | 'datetime-local' | 'time';
  min?: string;
  max?: string;
}> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  required, 
  disabled, 
  helpText, 
  className = '',
  type = 'date',
  min,
  max
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          min={min}
          max={max}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            pl-3 pr-10 py-2
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// File Upload Component
export const FileUpload: React.FC<BaseFieldProps & {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  showPreview?: boolean;
}> = ({ 
  label, 
  name, 
  value = [], 
  onChange, 
  error, 
  required, 
  disabled, 
  helpText, 
  className = '',
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  showPreview = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    let validFiles = fileArray;

    // Validate file size
    if (maxSize) {
      validFiles = validFiles.filter(file => file.size <= maxSize);
    }

    // Validate file count
    if (maxFiles && !multiple) {
      validFiles = validFiles.slice(0, 1);
    } else if (maxFiles && multiple) {
      const currentCount = Array.isArray(value) ? value.length : 0;
      validFiles = validFiles.slice(0, maxFiles - currentCount);
    }

    if (multiple) {
      onChange([...(Array.isArray(value) ? value : []), ...validFiles]);
    } else {
      onChange(validFiles[0] || null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    if (multiple && Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const files = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${error ? 'border-red-300' : ''}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Drop files here or <span className="text-blue-600 font-medium">browse</span>
        </p>
        {maxSize && (
          <p className="text-xs text-gray-500 mt-1">
            Max file size: {formatFileSize(maxSize)}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled}
        className="hidden"
      />

      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {file.type?.startsWith('image/') ? (
                  <Image className="w-4 h-4 text-gray-400" />
                ) : (
                  <Paperclip className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Form Section Component
export const FormSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}> = ({ title, description, children, collapsible = false, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="space-y-4">
      <div 
        className={`${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                expanded ? 'transform rotate-180' : ''
              }`} 
            />
          )}
        </div>
      </div>
      {expanded && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Form Actions Component
export const FormActions: React.FC<{
  onSubmit?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  submitDisabled?: boolean;
  loading?: boolean;
  alignment?: 'left' | 'center' | 'right';
}> = ({ 
  onSubmit, 
  onCancel, 
  onReset,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  resetLabel = 'Reset',
  submitDisabled = false,
  loading = false,
  alignment = 'right'
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex space-x-3 ${alignmentClasses[alignment]}`}>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {resetLabel}
        </button>
      )}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      )}
      {onSubmit && (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={submitDisabled || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {submitLabel}
        </button>
      )}
    </div>
  );
};

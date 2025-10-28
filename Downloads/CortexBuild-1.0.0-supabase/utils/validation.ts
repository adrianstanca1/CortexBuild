export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCompanyName = (companyName: string): ValidationResult => {
  const errors: string[] = [];

  if (!companyName) {
    errors.push('Company name is required');
  } else if (companyName.trim().length < 2) {
    errors.push('Company name must be at least 2 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTaskData = (data: {
  title?: string;
  description?: string;
  priority?: string;
  assignee?: string;
  dueDate?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Task title is required');
  } else if (data.title.length > 200) {
    errors.push('Task title must be less than 200 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Task description must be less than 1000 characters');
  }

  if (data.priority && !['Low', 'Medium', 'High', 'Critical'].includes(data.priority)) {
    errors.push('Invalid priority level');
  }

  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    const now = new Date();
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date');
    } else if (dueDate < now) {
      errors.push('Due date cannot be in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRFIData = (data: {
  subject?: string;
  question?: string;
  dueDate?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push('RFI subject is required');
  } else if (data.subject.length > 200) {
    errors.push('RFI subject must be less than 200 characters');
  }

  if (!data.question || data.question.trim().length === 0) {
    errors.push('RFI question is required');
  } else if (data.question.length > 2000) {
    errors.push('RFI question must be less than 2000 characters');
  }

  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    const now = new Date();
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date');
    } else if (dueDate < now) {
      errors.push('Due date cannot be in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};
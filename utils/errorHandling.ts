export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class APIError extends Error implements AppError {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

export const handleAPIError = (error: any, context: string): AppError => {
  console.error(`Error in ${context}:`, error);

  if (error instanceof APIError) {
    return error;
  }

  if (error?.code) {
    // Supabase error
    switch (error.code) {
      case 'PGRST116':
        return new APIError('Resource not found', 'NOT_FOUND', error);
      case '23505':
        return new APIError('This item already exists', 'DUPLICATE', error);
      case '42501':
        return new APIError('Permission denied', 'PERMISSION_DENIED', error);
      default:
        return new APIError(error.message || 'Database error occurred', error.code, error);
    }
  }

  if (error?.message) {
    return new APIError(error.message, 'UNKNOWN', error);
  }

  return new APIError('An unexpected error occurred', 'UNKNOWN', error);
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const appError = handleAPIError(error, context);
    if (fallback !== undefined) {
      console.warn(`Using fallback value for ${context}:`, appError.message);
      return fallback;
    }
    throw appError;
  }
};
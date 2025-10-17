export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

export class APIError extends Error implements AppError {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

export const handleAPIError = (error: unknown, context: string): AppError => {
  console.error(`Error in ${context}:`, error);

  if (error instanceof APIError) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as { code?: string; message?: string };

    // Supabase errors and other structured errors
    if (candidate.code) {
      switch (candidate.code) {
        case 'PGRST116':
          return new APIError('Resource not found', 'NOT_FOUND', candidate);
        case '23505':
          return new APIError('This item already exists', 'DUPLICATE', candidate);
        case '42501':
          return new APIError('Permission denied', 'PERMISSION_DENIED', candidate);
        default:
          return new APIError(candidate.message || 'Database error occurred', candidate.code, candidate);
      }
    }

    if (candidate.message) {
      return new APIError(candidate.message, 'UNKNOWN', candidate);
    }
  }

  return new APIError('An unexpected error occurred', 'UNKNOWN', error);
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T,
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

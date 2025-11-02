/**
 * API Error Messages
 * User-friendly error messages for API errors
 * Multi-language support (EN/RO)
 */

export interface ErrorMessage {
  en: string;
  ro: string;
  action?: string;
  actionRo?: string;
}

/**
 * HTTP Status Code to User Message Mapping
 */
export const HTTP_ERROR_MESSAGES: Record<number, ErrorMessage> = {
  // Client Errors (4xx)
  400: {
    en: 'Invalid request. Please check your input and try again.',
    ro: 'Cerere invalidă. Verificați datele introduse și încercați din nou.',
    action: 'Review your input and try again',
    actionRo: 'Verificați datele și încercați din nou'
  },
  401: {
    en: 'Your session has expired. Please log in again.',
    ro: 'Sesiunea dvs. a expirat. Vă rugăm să vă autentificați din nou.',
    action: 'Click here to log in',
    actionRo: 'Click aici pentru autentificare'
  },
  403: {
    en: 'You don\'t have permission to perform this action.',
    ro: 'Nu aveți permisiunea să efectuați această acțiune.',
    action: 'Contact your administrator if you need access',
    actionRo: 'Contactați administratorul dacă aveți nevoie de acces'
  },
  404: {
    en: 'The requested resource was not found.',
    ro: 'Resursa solicitată nu a fost găsită.',
    action: 'Try refreshing the page or go back',
    actionRo: 'Încercați să reîmprospătați pagina sau să reveniți'
  },
  408: {
    en: 'Request timeout. The server took too long to respond.',
    ro: 'Timeout cerere. Serverul a luat prea mult timp să răspundă.',
    action: 'Please try again',
    actionRo: 'Vă rugăm să încercați din nou'
  },
  409: {
    en: 'Conflict. This resource already exists or is being modified.',
    ro: 'Conflict. Această resursă există deja sau este în curs de modificare.',
    action: 'Refresh and try again',
    actionRo: 'Reîmprospătați și încercați din nou'
  },
  422: {
    en: 'Validation error. Some fields are invalid.',
    ro: 'Eroare de validare. Unele câmpuri sunt invalide.',
    action: 'Check the highlighted fields',
    actionRo: 'Verificați câmpurile evidențiate'
  },
  429: {
    en: 'Too many requests. Please slow down.',
    ro: 'Prea multe cereri. Vă rugăm să încetiniți.',
    action: 'Wait a moment and try again',
    actionRo: 'Așteptați un moment și încercați din nou'
  },

  // Server Errors (5xx)
  500: {
    en: 'Internal server error. We\'re working on fixing this.',
    ro: 'Eroare internă de server. Lucrăm la rezolvare.',
    action: 'Try again in a few moments',
    actionRo: 'Încercați din nou în câteva momente'
  },
  502: {
    en: 'Bad gateway. The server received an invalid response.',
    ro: 'Gateway invalid. Serverul a primit un răspuns invalid.',
    action: 'This is temporary. Please try again',
    actionRo: 'Aceasta este temporară. Vă rugăm să încercați din nou'
  },
  503: {
    en: 'Service temporarily unavailable. We\'re performing maintenance.',
    ro: 'Serviciu temporar indisponibil. Efectuăm mentenanță.',
    action: 'Please check back in a few minutes',
    actionRo: 'Vă rugăm să reveniți în câteva minute'
  },
  504: {
    en: 'Gateway timeout. The server didn\'t respond in time.',
    ro: 'Timeout gateway. Serverul nu a răspuns la timp.',
    action: 'Please try again',
    actionRo: 'Vă rugăm să încercați din nou'
  }
};

/**
 * Network Error Messages
 */
export const NETWORK_ERROR_MESSAGES: Record<string, ErrorMessage> = {
  NETWORK_ERROR: {
    en: 'Network error. Please check your internet connection.',
    ro: 'Eroare de rețea. Verificați conexiunea la internet.',
    action: 'Check your connection and try again',
    actionRo: 'Verificați conexiunea și încercați din nou'
  },
  TIMEOUT: {
    en: 'Request timed out. The operation took too long.',
    ro: 'Cerere expirată. Operațiunea a durat prea mult.',
    action: 'Try again or contact support',
    actionRo: 'Încercați din nou sau contactați suportul'
  },
  OFFLINE: {
    en: 'You appear to be offline. Your request will be queued.',
    ro: 'Se pare că sunteți offline. Cererea va fi pusă în coadă.',
    action: 'Requests will sync when connection is restored',
    actionRo: 'Cererile se vor sincroniza când conexiunea este restabilită'
  },
  CANCELLED: {
    en: 'Request was cancelled.',
    ro: 'Cererea a fost anulată.',
    action: 'Try again if this was unintentional',
    actionRo: 'Încercați din nou dacă aceasta a fost neintenționată'
  }
};

/**
 * Context-Specific Error Messages
 */
export const CONTEXT_ERROR_MESSAGES: Record<string, Record<string, ErrorMessage>> = {
  auth: {
    login_failed: {
      en: 'Login failed. Please check your email and password.',
      ro: 'Autentificare eșuată. Verificați email-ul și parola.',
      action: 'Forgot password?',
      actionRo: 'Ați uitat parola?'
    },
    token_expired: {
      en: 'Your session has expired. Please log in again.',
      ro: 'Sesiunea dvs. a expirat. Vă rugăm să vă autentificați din nou.',
      action: 'Log in',
      actionRo: 'Autentificare'
    },
    invalid_token: {
      en: 'Invalid authentication token.',
      ro: 'Token de autentificare invalid.',
      action: 'Please log in again',
      actionRo: 'Vă rugăm să vă autentificați din nou'
    }
  },
  project: {
    not_found: {
      en: 'Project not found or you don\'t have access.',
      ro: 'Proiectul nu a fost găsit sau nu aveți acces.',
      action: 'Go back to projects list',
      actionRo: 'Reveniți la lista de proiecte'
    },
    create_failed: {
      en: 'Failed to create project. Please try again.',
      ro: 'Crearea proiectului a eșuat. Vă rugăm să încercați din nou.',
      action: 'Try again',
      actionRo: 'Încercați din nou'
    },
    update_failed: {
      en: 'Failed to update project.',
      ro: 'Actualizarea proiectului a eșuat.',
      action: 'Try again or refresh the page',
      actionRo: 'Încercați din nou sau reîmprospătați pagina'
    }
  },
  task: {
    not_found: {
      en: 'Task not found.',
      ro: 'Task-ul nu a fost găsit.',
      action: 'Go back to tasks list',
      actionRo: 'Reveniți la lista de task-uri'
    },
    create_failed: {
      en: 'Failed to create task.',
      ro: 'Crearea task-ului a eșuat.',
      action: 'Try again',
      actionRo: 'Încercați din nou'
    },
    update_failed: {
      en: 'Failed to update task.',
      ro: 'Actualizarea task-ului a eșuat.',
      action: 'Try again',
      actionRo: 'Încercați din nou'
    }
  },
  file: {
    upload_failed: {
      en: 'File upload failed.',
      ro: 'Încărcarea fișierului a eșuat.',
      action: 'Check file size and format, then try again',
      actionRo: 'Verificați dimensiunea și formatul fișierului, apoi încercați din nou'
    },
    too_large: {
      en: 'File is too large. Maximum size is 10MB.',
      ro: 'Fișierul este prea mare. Dimensiunea maximă este 10MB.',
      action: 'Choose a smaller file',
      actionRo: 'Alegeți un fișier mai mic'
    },
    invalid_format: {
      en: 'Invalid file format.',
      ro: 'Format de fișier invalid.',
      action: 'Only images and PDFs are allowed',
      actionRo: 'Doar imagini și PDF-uri sunt permise'
    }
  }
};

/**
 * Get user-friendly error message
 */
export function getUserMessage(
  statusCode?: number,
  errorCode?: string,
  context?: string,
  language: 'en' | 'ro' = 'en'
): string {
  // Check context-specific messages first
  if (context && errorCode && CONTEXT_ERROR_MESSAGES[context]?.[errorCode]) {
    return CONTEXT_ERROR_MESSAGES[context][errorCode][language];
  }

  // Check network error messages
  if (errorCode && NETWORK_ERROR_MESSAGES[errorCode]) {
    return NETWORK_ERROR_MESSAGES[errorCode][language];
  }

  // Check HTTP status code messages
  if (statusCode && HTTP_ERROR_MESSAGES[statusCode]) {
    return HTTP_ERROR_MESSAGES[statusCode][language];
  }

  // Default message
  return language === 'en'
    ? 'An unexpected error occurred. Please try again.'
    : 'A apărut o eroare neașteptată. Vă rugăm să încercați din nou.';
}

/**
 * Get action message
 */
export function getActionMessage(
  statusCode?: number,
  errorCode?: string,
  context?: string,
  language: 'en' | 'ro' = 'en'
): string | undefined {
  const actionKey = language === 'en' ? 'action' : 'actionRo';

  // Check context-specific messages first
  if (context && errorCode && CONTEXT_ERROR_MESSAGES[context]?.[errorCode]) {
    return CONTEXT_ERROR_MESSAGES[context][errorCode][actionKey];
  }

  // Check network error messages
  if (errorCode && NETWORK_ERROR_MESSAGES[errorCode]) {
    return NETWORK_ERROR_MESSAGES[errorCode][actionKey];
  }

  // Check HTTP status code messages
  if (statusCode && HTTP_ERROR_MESSAGES[statusCode]) {
    return HTTP_ERROR_MESSAGES[statusCode][actionKey];
  }

  return undefined;
}

/**
 * Format complete error message with action
 */
export function formatErrorMessage(
  message: string,
  action?: string
): string {
  if (action) {
    return `${message}\n\n${action}`;
  }
  return message;
}

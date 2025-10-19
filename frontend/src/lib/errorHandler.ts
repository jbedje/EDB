import { toast } from 'sonner';
import { AxiosError } from 'axios';

/**
 * Error types for better error handling
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error messages in French
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  [ErrorType.AUTHENTICATION]: 'Session expirée. Veuillez vous reconnecter.',
  [ErrorType.AUTHORIZATION]: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
  [ErrorType.VALIDATION]: 'Les données fournies sont invalides.',
  [ErrorType.NOT_FOUND]: 'La ressource demandée n\'existe pas.',
  [ErrorType.SERVER]: 'Une erreur serveur s\'est produite. Veuillez réessayer plus tard.',
  [ErrorType.UNKNOWN]: 'Une erreur inattendue s\'est produite.',
};

/**
 * Determine error type from error object
 */
export function getErrorType(error: any): ErrorType {
  if (!error.response) {
    return ErrorType.NETWORK;
  }

  const status = error.response?.status;

  switch (status) {
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.AUTHORIZATION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 422:
    case 400:
      return ErrorType.VALIDATION;
    case 500:
    case 502:
    case 503:
      return ErrorType.SERVER;
    default:
      return ErrorType.UNKNOWN;
  }
}

/**
 * Extract error message from error object
 */
export function getErrorMessage(error: any): string {
  // Check for custom error message from API
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check for validation errors array
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((e: any) => e.message || e).join(', ');
  }

  // Fallback to error type message
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType];
}

/**
 * Handle API errors with toast notifications
 */
export function handleApiError(error: any, customMessage?: string): void {
  const errorType = getErrorType(error);
  const message = customMessage || getErrorMessage(error);

  // Log error in development
  if (import.meta.env.DEV) {
    console.error('API Error:', {
      type: errorType,
      message,
      error,
    });
  }

  // Show toast notification
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
      toast.error(message, {
        description: 'Vous allez être redirigé vers la page de connexion',
        duration: 3000,
      });
      // Redirect to login after delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      break;

    case ErrorType.AUTHORIZATION:
      toast.error(message, {
        description: 'Contactez un administrateur si vous pensez que c\'est une erreur',
      });
      break;

    case ErrorType.VALIDATION:
      toast.error(message, {
        description: 'Veuillez corriger les erreurs et réessayer',
      });
      break;

    case ErrorType.NETWORK:
      toast.error(message, {
        description: 'Vérifiez votre connexion internet et réessayez',
        action: {
          label: 'Réessayer',
          onClick: () => window.location.reload(),
        },
      });
      break;

    default:
      toast.error(message);
  }

  // TODO: Log to external service (Sentry, LogRocket, etc.)
  // logErrorToService(error);
}

/**
 * Wrapper for async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: any, type: ErrorType): boolean {
  return getErrorType(error) === type;
}

/**
 * Format validation errors for form display
 */
export function formatValidationErrors(error: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((err: any) => {
      if (err.field) {
        errors[err.field] = err.message;
      }
    });
  }

  return errors;
}

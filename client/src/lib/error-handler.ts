import { ApiError } from './api';
import { toast } from 'sonner';

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error: unknown, defaultMessage?: string): string {
  if (error instanceof ApiError) {
    // Don't show toast for 401 - it will be handled by redirect
    if (error.status === 401) {
      return error.message;
    }

    // Show user-friendly error message
    const message = error.message || defaultMessage || 'Произошла ошибка';
    toast.error(message);
    return message;
  }

  if (error instanceof Error) {
    const message = error.message || defaultMessage || 'Произошла ошибка';
    toast.error(message);
    return message;
  }

  const message = defaultMessage || 'Произошла неизвестная ошибка';
  toast.error(message);
  return message;
}

/**
 * Get user-friendly error message from error
 */
export function getErrorMessage(error: unknown, defaultMessage?: string): string {
  if (error instanceof ApiError) {
    return error.message || defaultMessage || 'Произошла ошибка';
  }

  if (error instanceof Error) {
    return error.message || defaultMessage || 'Произошла ошибка';
  }

  return defaultMessage || 'Произошла неизвестная ошибка';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 0 || error.code === 'NETWORK_ERROR';
  }
  
  if (error instanceof Error) {
    return error.message.includes('network') || 
           error.message.includes('fetch') ||
           error.name === 'TypeError';
  }
  
  return false;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 400 && error.status < 500;
  }
  return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }
  return false;
}


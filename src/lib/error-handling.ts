/**
 * Centralized error handling utilities for Concierge Transaction Flow
 * Provides consistent error handling patterns across the application
 */

import { logger } from './logger';
import * as Sentry from '@sentry/react';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  stack?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export class ApplicationError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;
  public readonly userId?: string;
  public readonly sessionId?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      details?: Record<string, any>;
      cause?: Error;
      userId?: string;
      sessionId?: string;
    } = {}
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    this.userId = options.userId;
    this.sessionId = options.sessionId;

    if (options.cause) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
  }

  toJSON(): AppError {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
      timestamp: this.timestamp,
      userId: this.userId,
      sessionId: this.sessionId
    };
  }
}

/**
 * Standardized error types for the application
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, { code: 'VALIDATION_ERROR', statusCode: 400, details });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication required', details?: Record<string, any>) {
    super(message, { code: 'AUTH_ERROR', statusCode: 401, details });
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, any>) {
    super(message, { code: 'AUTHORIZATION_ERROR', statusCode: 403, details });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, { code: 'NOT_FOUND', statusCode: 404, details });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, { code: 'CONFLICT', statusCode: 409, details });
    this.name = 'ConflictError';
  }
}

export class NetworkError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, { code: 'NETWORK_ERROR', statusCode: 0, details });
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, { code: 'DATABASE_ERROR', statusCode: 500, details });
    this.name = 'DatabaseError';
  }
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    const error = new ApplicationError('Unhandled JavaScript error', {
      code: 'UNHANDLED_ERROR',
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.error?.message || event.message
      }
    });

    logger.error('Unhandled JavaScript error', event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, 'global-error');

    reportErrorToSentry(error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new ApplicationError('Unhandled Promise rejection', {
      code: 'UNHANDLED_PROMISE_REJECTION',
      details: {
        reason: event.reason,
        type: typeof event.reason
      }
    });

    logger.error('Unhandled Promise rejection', 
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 
      { reason: event.reason }, 
      'global-error'
    );

    reportErrorToSentry(error);
  });
}

/**
 * Report error to Sentry with additional context
 */
export function reportErrorToSentry(error: Error | ApplicationError, context?: Record<string, any>): void {
  Sentry.withScope((scope) => {
    if (error instanceof ApplicationError) {
      scope.setTag('errorType', 'ApplicationError');
      scope.setTag('errorCode', error.code || 'unknown');
      scope.setLevel('error');
      
      if (error.details) {
        scope.setContext('errorDetails', error.details);
      }
      
      if (error.userId) {
        scope.setUser({ id: error.userId });
      }
    }

    if (context) {
      scope.setContext('additionalContext', context);
    }

    scope.setTag('timestamp', new Date().toISOString());
    Sentry.captureException(error);
  });
}

/**
 * Type guard to check if error is a known error type
 */
function isKnownError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely convert unknown error to Error instance
 */
function toSafeError(error: unknown): Error {
  if (isKnownError(error)) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  
  return new Error('Unknown error occurred');
}

/**
 * Async function wrapper that handles errors consistently
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      const safeError = toSafeError(error);
      const appError = error instanceof ApplicationError 
        ? error 
        : new ApplicationError(`Error in ${context || 'unknown function'}`, {
            code: 'FUNCTION_ERROR',
            details: { functionContext: context },
            cause: safeError
          });

      logger.error(`Error in ${context || 'function'}`, safeError, {
        functionContext: context,
        args: args.length > 0 ? 'present' : 'none'
      }, 'error-handling');

      reportErrorToSentry(appError);
      throw appError;
    }
  }) as T;
}

/**
 * Sync function wrapper that handles errors consistently
 */
export function withSyncErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: string
): T {
  return ((...args: unknown[]) => {
    try {
      return fn(...args);
    } catch (error: unknown) {
      const safeError = toSafeError(error);
      const appError = error instanceof ApplicationError 
        ? error 
        : new ApplicationError(`Error in ${context || 'unknown function'}`, {
            code: 'FUNCTION_ERROR',
            details: { functionContext: context },
            cause: safeError
          });

      logger.error(`Error in ${context || 'function'}`, safeError, {
        functionContext: context,
        args: args.length > 0 ? 'present' : 'none'
      }, 'error-handling');

      reportErrorToSentry(appError);
      throw appError;
    }
  }) as T;
}

/**
 * Type guards for different error types
 */
function isSupabaseApiError(error: unknown): error is { code: string; message: string; details?: string; hint?: string } {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

function isHttpApiError(error: unknown): error is { 
  response: { 
    status: number; 
    data?: { message?: string } 
  }; 
  config?: { url?: string; method?: string } 
} {
  return (
    error !== null &&
    typeof error === 'object' &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object' &&
    (error as { response: { status: unknown } }).response !== null &&
    'status' in (error as { response: { status: unknown } }).response
  );
}

function isNetworkApiError(error: unknown): error is { 
  request: unknown; 
  config?: { url?: string; method?: string } 
} {
  return (
    error !== null &&
    typeof error === 'object' &&
    'request' in error &&
    !('response' in error)
  );
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, context: string): never {
  let appError: ApplicationError;

  if (isSupabaseApiError(error)) {
    // Supabase error
    appError = new DatabaseError(error.message, {
      code: error.code,
      details: error.details ? { supabaseDetails: error.details, hint: error.hint } : undefined,
      context
    });
  } else if (isHttpApiError(error)) {
    // HTTP error
    appError = new ApplicationError(error.response.data?.message || 'HTTP error', {
      code: 'HTTP_ERROR',
      statusCode: error.response.status,
      details: {
        url: error.config?.url,
        method: error.config?.method,
        responseData: error.response.data
      }
    });
  } else if (isNetworkApiError(error)) {
    // Network error
    appError = new NetworkError('Network request failed', {
      details: { url: error.config?.url, method: error.config?.method }
    });
  } else {
    // Unknown error
    const safeError = toSafeError(error);
    appError = new ApplicationError('Unknown API error', {
      code: 'UNKNOWN_API_ERROR',
      cause: safeError,
      details: { context }
    });
  }

  const safeErrorForLogging = toSafeError(error);
  logger.error(`API Error in ${context}`, safeErrorForLogging, {
    errorType: appError.name,
    context
  }, 'api-error');

  reportErrorToSentry(appError);
  throw appError;
}

/**
 * Utility to safely execute functions that might throw
 */
export async function safeExecute<T>(
  operation: () => Promise<T> | T,
  fallback?: T,
  context?: string
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logger.warn(`Safe execution failed in ${context || 'unknown context'}`, {
      error: error instanceof Error ? error.message : String(error),
      hasFallback: fallback !== undefined
    }, 'safe-execute');

    if (fallback !== undefined) {
      return fallback;
    }
    
    return undefined;
  }
}

/**
 * Create a retry wrapper for functions
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): T {
  return (async (...args: unknown[]) => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error: unknown) {
        lastError = toSafeError(error);
        
        logger.warn(`Retry attempt ${attempt}/${maxRetries} failed in ${context || 'function'}`, {
          error: lastError.message,
          attempt,
          maxRetries
        }, 'retry-handler');

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }

    // All retries failed
    const finalError = new ApplicationError(`Failed after ${maxRetries} retries`, {
      code: 'RETRY_EXHAUSTED',
      details: { attempts: maxRetries, context },
      cause: lastError!
    });

    logger.error(`All retries exhausted in ${context || 'function'}`, lastError!, {
      attempts: maxRetries,
      context
    }, 'retry-handler');

    throw finalError;
  }) as T;
}

/**
 * Initialize error handling system
 */
export function initializeErrorHandling(): void {
  setupGlobalErrorHandling();
  logger.info('Error handling system initialized', {}, 'error-handling');
}
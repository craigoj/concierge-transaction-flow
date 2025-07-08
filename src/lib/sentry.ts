/**
 * Sentry Configuration for Concierge Transaction Flow
 * Comprehensive error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';
import { logger } from './logger';

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

/**
 * Initialize Sentry with comprehensive configuration
 */
export function initializeSentry(): void {
  const config: SentryConfig = {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.VITE_VERCEL_ENV || import.meta.env.MODE || 'development',
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    profilesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
  };

  // Only initialize if DSN is provided
  if (!config.dsn) {
    logger.warn('Sentry DSN not provided. Error tracking disabled.', {
      environment: config.environment,
      sentryEnabled: false
    }, 'sentry');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    
    // Performance monitoring
    tracesSampleRate: config.tracesSampleRate,
    profilesSampleRate: config.profilesSampleRate,
    
    // Session replay
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
    
    // React Router integration
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: import.meta.env.PROD, // Mask sensitive data in production
        blockAllMedia: import.meta.env.PROD,
      }),
    ],
    
    // Error filtering
    beforeSend(event, hint) {
      // Log development errors
      if (config.environment === 'development') {
        logger.error('Sentry Error Captured', 
          hint.originalException as Error || hint.syntheticException as Error, 
          { 
            event: event,
            fingerprint: event.fingerprint,
            level: event.level 
          }, 
          'sentry'
        );
      }
      
      // Filter out specific errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip ResizeObserver errors (common browser issue)
        if (error.message.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }
        
        // Skip non-actionable network errors
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Add user context automatically
    initialScope: {
      tags: {
        component: 'concierge-transaction-flow',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      },
    },
  });

  // Set up global error boundary
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason, {
      tags: { type: 'unhandled_promise_rejection' },
    });
  });
}

/**
 * Utility functions for manual error tracking
 */
export const sentryUtils = {
  /**
   * Track user actions and feature usage
   */
  trackFeatureUsage: (feature: string, metadata?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      message: `Feature used: ${feature}`,
      category: 'user_action',
      data: metadata,
      level: 'info',
    });
  },

  /**
   * Track API calls and responses
   */
  trackApiCall: (endpoint: string, method: string, status: number, duration?: number) => {
    Sentry.addBreadcrumb({
      message: `API Call: ${method} ${endpoint}`,
      category: 'http',
      data: {
        url: endpoint,
        method,
        status_code: status,
        duration,
      },
      level: status >= 400 ? 'error' : 'info',
    });
  },

  /**
   * Track database operations
   */
  trackDatabaseOperation: (operation: string, table: string, success: boolean, duration?: number) => {
    Sentry.addBreadcrumb({
      message: `Database ${operation}: ${table}`,
      category: 'database',
      data: {
        operation,
        table,
        success,
        duration,
      },
      level: success ? 'info' : 'error',
    });
  },

  /**
   * Track performance issues
   */
  trackPerformanceIssue: (metric: string, value: number, threshold: number) => {
    Sentry.captureMessage(`Performance threshold exceeded: ${metric}`, {
      level: 'warning',
      tags: {
        type: 'performance_issue',
        metric,
      },
      extra: {
        value,
        threshold,
        exceedsBy: value - threshold,
        exceedsPercent: Math.round(((value - threshold) / threshold) * 100),
      },
    });
  },

  /**
   * Set user context for better error tracking
   */
  setUserContext: (userId: string, email?: string, role?: string) => {
    Sentry.setUser({
      id: userId,
      email,
      role,
    });
  },

  /**
   * Add custom tags for error categorization
   */
  setContext: (key: string, value: Record<string, any>) => {
    Sentry.setContext(key, value);
  },

  /**
   * Manually capture exceptions with context
   */
  captureException: (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, {
      extra: context,
    });
  },

  /**
   * Start a performance transaction
   */
  startTransaction: (name: string, operation: string) => {
    return Sentry.startSpan({
      name,
      op: operation,
    }, () => {});
  },

  /**
   * Create a span for detailed performance tracking
   */
  createSpan: (operation: string, description: string) => {
    return Sentry.startSpan({
      op: operation,
      name: description,
    }, () => {});
  },
};

// Export Sentry instance for direct access
export { Sentry };
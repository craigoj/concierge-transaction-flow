/**
 * Higher-order component and utilities for easier error boundary usage
 */

import React, { ComponentType, ErrorInfo } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { logger } from '@/lib/logger';

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  contextName?: string;
}

/**
 * Higher-order component that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = React.forwardRef<unknown, P>((props, ref) => {
    const contextName = options.contextName || Component.displayName || Component.name || 'Component';
    
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
      logger.error(`Error in ${contextName}`, error, {
        componentName: contextName,
        componentStack: errorInfo.componentStack
      }, 'component-error');
      
      if (options.onError) {
        options.onError(error, errorInfo);
      }
    };

    return (
      <ErrorBoundary
        fallback={options.fallback}
        onError={handleError}
        showErrorDetails={options.showErrorDetails}
        contextName={contextName}
      >
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    );
  });

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}

/**
 * React hook for error boundary context
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    logger.error('Manual error report', error, { context }, 'error-handler');
    throw error; // Let error boundary catch it
  }, []);

  const safeExecute = React.useCallback(async <T,>(
    operation: () => Promise<T> | T,
    fallback?: T,
    context?: string
  ): Promise<T | undefined> => {
    try {
      return await operation();
    } catch (error) {
      logger.warn(`Safe execution failed: ${context || 'unknown'}`, {
        error: error instanceof Error ? error.message : String(error)
      }, 'error-handler');
      
      return fallback;
    }
  }, []);

  return { handleError, safeExecute };
}

/**
 * Specialized error boundary for route-level errors
 */
export function RouteErrorBoundary({ 
  children, 
  routeName 
}: { 
  children: React.ReactNode; 
  routeName: string;
}) {
  const handleRouteError = (error: Error, errorInfo: ErrorInfo) => {
    logger.error(`Route error in ${routeName}`, error, {
      routeName,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }, 'route-error');
  };

  return (
    <ErrorBoundary
      onError={handleRouteError}
      contextName={`Route: ${routeName}`}
      showErrorDetails={import.meta.env.MODE === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Specialized error boundary for API operations
 */
export function ApiErrorBoundary({ 
  children, 
  apiContext 
}: { 
  children: React.ReactNode; 
  apiContext: string;
}) {
  const handleApiError = (error: Error, errorInfo: ErrorInfo) => {
    logger.error(`API operation error in ${apiContext}`, error, {
      apiContext,
      componentStack: errorInfo.componentStack
    }, 'api-error');
  };

  const fallback = (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-red-800 font-medium mb-2">API Error</h3>
      <p className="text-red-600 text-sm">
        An error occurred while communicating with the server. Please try again.
      </p>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleApiError}
      contextName={`API: ${apiContext}`}
      showErrorDetails={false}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Specialized error boundary for form operations
 */
export function FormErrorBoundary({ 
  children, 
  formName 
}: { 
  children: React.ReactNode; 
  formName: string;
}) {
  const handleFormError = (error: Error, errorInfo: ErrorInfo) => {
    logger.error(`Form error in ${formName}`, error, {
      formName,
      componentStack: errorInfo.componentStack
    }, 'form-error');
  };

  const fallback = (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-yellow-800 font-medium mb-2">Form Error</h3>
      <p className="text-yellow-700 text-sm">
        An error occurred with the form. Please refresh the page and try again.
      </p>
    </div>
  );

  return (
    <ErrorBoundary
      fallback={fallback}
      onError={handleFormError}
      contextName={`Form: ${formName}`}
      showErrorDetails={import.meta.env.MODE === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
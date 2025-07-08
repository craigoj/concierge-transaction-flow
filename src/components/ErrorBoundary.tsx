import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Copy, Mail } from 'lucide-react';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  contextName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({ errorInfo });

    // Log error with our centralized logger
    logger.error('React Error Boundary caught an error', error, {
      contextName: this.props.contextName || 'unknown',
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString()
    }, 'error-boundary');

    // Report to Sentry with additional context
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setTag('contextName', this.props.contextName || 'unknown');
      scope.setContext('errorInfo', errorInfo);
      scope.setContext('errorId', this.state.errorId);
      Sentry.captureException(error);
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReload = () => {
    logger.info('User triggered page reload from error boundary', { errorId: this.state.errorId }, 'error-boundary');
    window.location.reload();
  };

  private handleReset = () => {
    logger.info('User triggered error boundary reset', { errorId: this.state.errorId }, 'error-boundary');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  private handleCopyError = () => {
    const errorDetails = this.getErrorDetails();
    navigator.clipboard.writeText(errorDetails).then(() => {
      logger.info('Error details copied to clipboard', { errorId: this.state.errorId }, 'error-boundary');
      // Could add a toast notification here
    }).catch(() => {
      logger.warn('Failed to copy error details to clipboard', { errorId: this.state.errorId }, 'error-boundary');
    });
  };

  private handleReportError = () => {
    const errorDetails = this.getErrorDetails();
    const subject = `Error Report - ${this.state.errorId}`;
    const body = `Please describe what you were doing when this error occurred:\n\n\n\nError Details:\n${errorDetails}`;
    const mailtoUrl = `mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    logger.info('User initiated error reporting', { errorId: this.state.errorId }, 'error-boundary');
    window.open(mailtoUrl, '_blank');
  };

  private getErrorDetails = (): string => {
    const { error, errorInfo, errorId } = this.state;
    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    
    return `
Error ID: ${errorId}
Timestamp: ${timestamp}
URL: ${url}
User Agent: ${userAgent}
Context: ${this.props.contextName || 'unknown'}

Error Message: ${error?.message || 'Unknown error'}

Stack Trace:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}
    `.trim();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const showDetails = this.props.showErrorDetails ?? import.meta.env.MODE === 'development';

      return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
              {errorId && (
                <p className="text-sm text-gray-500 font-mono">
                  Error ID: {errorId}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                <p className="text-sm text-gray-500">
                  The error has been automatically reported to our team.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={this.handleReset} variant="outline">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                <Button onClick={this.handleCopyError} variant="outline" className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Error
                </Button>
                <Button onClick={this.handleReportError} variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Report Issue
                </Button>
              </div>
              
              {/* Error Details (Development or when explicitly enabled) */}
              {showDetails && error && (
                <details className="text-sm text-left bg-gray-50 p-4 rounded-lg border">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-3 hover:text-gray-900">
                    Technical Details
                  </summary>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Error Message:</h4>
                      <p className="text-red-600 font-mono text-xs bg-red-50 p-2 rounded">
                        {error.message}
                      </p>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Stack Trace:</h4>
                        <pre className="whitespace-pre-wrap text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Component Stack:</h4>
                        <pre className="whitespace-pre-wrap text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Help Text */}
              <div className="text-center text-xs text-gray-500">
                <p>If this problem persists, please contact support with the Error ID above.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
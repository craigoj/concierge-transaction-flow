/**
 * Production-ready logging infrastructure for Concierge Transaction Flow
 * Provides structured logging with appropriate handling for different environments
 */

import * as Sentry from '@sentry/react';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  category?: string;
  userId?: string;
  sessionId?: string;
  source?: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  categories: string[];
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private sessionId: string;
  private isProduction: boolean;
  private isDevelopment: boolean;
  
  private constructor() {
    this.isProduction = import.meta.env.MODE === 'production';
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.sessionId = this.generateSessionId();
    
    this.config = {
      level: this.isDevelopment ? 'debug' : 'info',
      enableConsole: this.isDevelopment,
      enableSentry: this.isProduction,
      enableStorage: false,
      maxStorageEntries: 100,
      categories: ['all']
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Configure logger settings
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Main logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>, category = 'general'): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      category,
      sessionId: this.sessionId,
      source: this.getSource()
    };

    // Console logging (development only)
    if (this.config.enableConsole && this.isDevelopment) {
      this.logToConsole(entry);
    }

    // Sentry logging (production)
    if (this.config.enableSentry && this.isProduction) {
      this.logToSentry(entry);
    }

    // Storage logging (if enabled)
    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }
  }

  /**
   * Public logging methods
   */
  public trace(message: string, context?: Record<string, any>, category?: string): void {
    this.log('trace', message, context, category);
  }

  public debug(message: string, context?: Record<string, any>, category?: string): void {
    this.log('debug', message, context, category);
  }

  public info(message: string, context?: Record<string, any>, category?: string): void {
    this.log('info', message, context, category);
  }

  public warn(message: string, context?: Record<string, any>, category?: string): void {
    this.log('warn', message, context, category);
  }

  public error(message: string, error?: Error, context?: Record<string, any>, category?: string): void {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    this.log('error', message, errorContext, category);
  }

  /**
   * Structured logging methods for specific use cases
   */
  public logApiRequest(method: string, url: string, data?: any): void {
    this.info(`API Request: ${method} ${url}`, {
      method,
      url,
      data,
      timestamp: Date.now()
    }, 'api');
  }

  public logApiResponse(method: string, url: string, status: number, data?: any, duration?: number): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this.log(level, `API Response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      data,
      duration,
      timestamp: Date.now()
    }, 'api');
  }

  public logUserAction(action: string, userId?: string, context?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      action,
      userId,
      ...context,
      timestamp: Date.now()
    }, 'user');
  }

  public logPerformance(name: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${name}`, {
      name,
      duration,
      ...context,
      timestamp: Date.now()
    }, 'performance');
  }

  public logDatabaseQuery(operation: string, table: string, query?: any, duration?: number): void {
    this.debug(`DB Query: ${operation} on ${table}`, {
      operation,
      table,
      query,
      duration,
      timestamp: Date.now()
    }, 'database');
  }

  public logSecurityEvent(event: string, context?: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, {
      event,
      ...context,
      timestamp: Date.now()
    }, 'security');
  }

  public logBusinessEvent(event: string, context?: Record<string, any>): void {
    this.info(`Business Event: ${event}`, {
      event,
      ...context,
      timestamp: Date.now()
    }, 'business');
  }

  /**
   * Private helper methods
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, context, category, timestamp } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
    
    const style = this.getConsoleStyle(level);
    
    if (context && Object.keys(context).length > 0) {
      console.groupCollapsed(`%c${prefix} ${message}`, style);
      console.log('Context:', context);
      console.groupEnd();
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }
  }

  private logToSentry(entry: LogEntry): void {
    const { level, message, context, category } = entry;
    
    // Add context to Sentry scope
    Sentry.withScope((scope) => {
      scope.setTag('category', category);
      scope.setTag('sessionId', this.sessionId);
      scope.setLevel(level as any);
      
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setContext(key, context[key]);
        });
      }
      
      if (level === 'error') {
        Sentry.captureException(new Error(message));
      } else {
        Sentry.captureMessage(message, level as any);
      }
    });
  }

  private logToStorage(entry: LogEntry): void {
    try {
      const storageKey = 'app-logs';
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      existingLogs.push(entry);
      
      // Keep only the most recent entries
      if (existingLogs.length > this.config.maxStorageEntries) {
        existingLogs.splice(0, existingLogs.length - this.config.maxStorageEntries);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existingLogs));
    } catch (error) {
      // Silently fail if storage is not available
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      trace: 'color: #999999;',
      debug: 'color: #0088ff;',
      info: 'color: #00aa00;',
      warn: 'color: #ff8800; font-weight: bold;',
      error: 'color: #ff0000; font-weight: bold;'
    };
    return styles[level] || styles.debug;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSource(): string {
    const error = new Error();
    const stack = error.stack;
    if (stack) {
      const lines = stack.split('\n');
      // Try to get the calling file and line
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('src/') && !line.includes('logger.ts')) {
          const match = line.match(/src\/(.+?):\d+/);
          if (match) return match[1];
        }
      }
    }
    return 'unknown';
  }

  /**
   * Utility methods
   */
  public setUserId(userId: string): void {
    if (this.config.enableSentry) {
      Sentry.setUser({ id: userId });
    }
  }

  public addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    if (this.config.enableSentry) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        timestamp: Date.now() / 1000
      });
    }
  }

  public exportLogs(): string {
    try {
      const logs = localStorage.getItem('app-logs');
      return logs || '[]';
    } catch {
      return '[]';
    }
  }

  public clearLogs(): void {
    try {
      localStorage.removeItem('app-logs');
    } catch {
      // Silently fail
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience methods
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logDebug = logger.debug.bind(logger);

export default logger;
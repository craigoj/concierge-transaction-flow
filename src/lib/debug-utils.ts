/**
 * Enhanced Debugging Utilities for Concierge Transaction Flow
 * Provides comprehensive debugging tools for development
 */

interface DebugConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  categories: string[];
  persist: boolean;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class DebugUtility {
  private static instance: DebugUtility;
  private config: DebugConfig;
  private performanceEntries: Map<string, PerformanceEntry> = new Map();
  private logHistory: Array<{
    timestamp: string;
    level: string;
    message: string;
    data?: unknown;
    category: string;
    stack?: string;
  }> = [];
  private maxHistorySize = 1000;

  private constructor() {
    this.config = {
      enabled: import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.MODE === 'development',
      level: 'debug',
      categories: ['all'],
      persist: false
    };

    this.initializeDebugPanel();
    this.setupGlobalErrorHandling();
  }

  public static getInstance(): DebugUtility {
    if (!DebugUtility.instance) {
      DebugUtility.instance = new DebugUtility();
    }
    return DebugUtility.instance;
  }

  /**
   * Configure debug settings
   */
  public configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('debug', 'Debug configuration updated', config);
  }

  /**
   * Enhanced logging with categorization and persistence
   */
  public log(level: string, message: string, data?: unknown, category = 'general'): void {
    if (!this.config.enabled) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      category,
      stack: new Error().stack
    };

    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Console output with styling
    const style = this.getLogStyle(level);
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
    
    if (data) {
      console.groupCollapsed(`%c${prefix} ${message}`, style);
      console.log('Data:', data);
      console.log('Stack:', logEntry.stack);
      console.groupEnd();
    } else {
      console.log(`%c${prefix} ${message}`, style);
    }

    // Persist to localStorage if enabled
    if (this.config.persist) {
      this.persistLog(logEntry);
    }
  }

  /**
   * Performance timing utilities
   */
  public startTimer(name: string, metadata?: Record<string, unknown>): void {
    const entry: PerformanceEntry = {
      name,
      startTime: performance.now(),
      metadata
    };
    this.performanceEntries.set(name, entry);
    this.log('debug', `Started timer: ${name}`, metadata, 'performance');
  }

  public endTimer(name: string): number | null {
    const entry = this.performanceEntries.get(name);
    if (!entry) {
      this.log('warn', `Timer not found: ${name}`, null, 'performance');
      return null;
    }

    entry.endTime = performance.now();
    entry.duration = entry.endTime - entry.startTime;

    this.log('info', `Timer completed: ${name}`, {
      duration: entry.duration,
      ...entry.metadata
    }, 'performance');

    return entry.duration;
  }

  /**
   * Component debugging utilities
   */
  public logComponentRender(componentName: string, props?: unknown, state?: unknown): void {
    this.log('debug', `Component render: ${componentName}`, {
      props,
      state,
      timestamp: Date.now()
    }, 'react');
  }

  public logComponentLifecycle(componentName: string, lifecycle: string, data?: unknown): void {
    this.log('debug', `${componentName} - ${lifecycle}`, data, 'react');
  }

  /**
   * API debugging utilities
   */
  public logApiRequest(method: string, url: string, data?: unknown): void {
    this.log('info', `API Request: ${method} ${url}`, {
      method,
      url,
      data,
      timestamp: Date.now()
    }, 'api');
  }

  public logApiResponse(method: string, url: string, status: number, data?: unknown, duration?: number): void {
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

  /**
   * Database debugging utilities
   */
  public logDatabaseQuery(operation: string, table: string, query?: unknown): void {
    this.log('debug', `DB Query: ${operation} on ${table}`, {
      operation,
      table,
      query,
      timestamp: Date.now()
    }, 'database');
  }

  public logDatabaseResult(operation: string, table: string, result: unknown, duration?: number): void {
    this.log('info', `DB Result: ${operation} on ${table}`, {
      operation,
      table,
      result: Array.isArray(result) ? `${result.length} rows` : result,
      duration,
      timestamp: Date.now()
    }, 'database');
  }

  /**
   * State debugging utilities
   */
  public logStateChange(component: string, oldState: unknown, newState: unknown): void {
    this.log('debug', `State change: ${component}`, {
      component,
      oldState,
      newState,
      diff: this.getStateDiff(oldState, newState),
      timestamp: Date.now()
    }, 'state');
  }

  /**
   * Error debugging utilities
   */
  public logError(error: Error, context?: unknown): void {
    this.log('error', `Error: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: Date.now()
    }, 'error');
  }

  /**
   * Memory debugging utilities
   */
  public logMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      this.log('info', 'Memory Usage', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        unit: 'MB'
      }, 'performance');
    }
  }

  /**
   * Network debugging utilities
   */
  public logNetworkRequest(url: string, options?: RequestInit): void {
    this.log('debug', `Network Request: ${url}`, {
      url,
      method: options?.method || 'GET',
      headers: options?.headers,
      timestamp: Date.now()
    }, 'network');
  }

  /**
   * Debug panel utilities
   */
  public showDebugPanel(): void {
    if (!this.config.enabled) return;

    const panel = document.getElementById('debug-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  public exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  public clearLogs(): void {
    this.logHistory = [];
    this.performanceEntries.clear();
    localStorage.removeItem('debug-logs');
    this.log('info', 'Debug logs cleared', null, 'system');
  }

  /**
   * Utility functions
   */
  public dumpComponentTree(): void {
    if (!this.config.enabled) return;

    const react = (window as { React?: unknown }).React;
    if (react) {
      console.log('React Fiber Tree:', react);
    } else {
      console.warn('React not found in global scope');
    }
  }

  public inspectElement(selector: string): void {
    const element = document.querySelector(selector);
    if (element) {
      console.log('Element:', element);
      console.log('Styles:', getComputedStyle(element));
      console.log('Attributes:', Array.from(element.attributes));
      console.log('Event listeners:', (element as Element & { getEventListeners?: () => unknown }).getEventListeners?.());
    } else {
      console.warn(`Element not found: ${selector}`);
    }
  }

  public measureLayoutShift(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift') {
            this.log('warn', 'Layout Shift detected', {
              value: (entry as PerformanceEntry & { value?: number }).value,
              sources: (entry as PerformanceEntry & { sources?: unknown }).sources
            }, 'performance');
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Private utility methods
   */
  private getLogStyle(level: string): string {
    const styles = {
      error: 'color: #ff4444; font-weight: bold;',
      warn: 'color: #ffaa00; font-weight: bold;',
      info: 'color: #0088ff; font-weight: bold;',
      debug: 'color: #888888;',
      trace: 'color: #cccccc;'
    };
    return styles[level as keyof typeof styles] || styles.debug;
  }

  private persistLog(logEntry: { timestamp: string; level: string; message: string; data?: unknown; category: string; stack?: string }): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('debug-logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries in localStorage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('debug-logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.warn('Failed to persist debug log:', error);
    }
  }

  private getStateDiff(oldState: unknown, newState: unknown): Record<string, { old: unknown; new: unknown }> {
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    
    if (typeof oldState !== 'object' || typeof newState !== 'object' || oldState === null || newState === null) {
      return { root: { old: oldState, new: newState } };
    }

    const oldObj = oldState as Record<string, unknown>;
    const newObj = newState as Record<string, unknown>;

    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        diff[key] = { old: oldObj[key], new: newObj[key] };
      }
    }

    return diff;
  }

  private initializeDebugPanel(): void {
    if (!this.config.enabled || typeof window === 'undefined') return;

    // Create debug panel UI
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      font-family: monospace;
      font-size: 12px;
      border-radius: 8px;
      padding: 10px;
      z-index: 9999;
      overflow: auto;
      display: none;
    `;

    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <strong>Debug Panel</strong>
        <button onclick="window.debugUtils.showDebugPanel()" style="background: none; border: none; color: white; cursor: pointer;">×</button>
      </div>
      <div id="debug-content">
        <button onclick="window.debugUtils.logMemoryUsage()" style="margin: 2px; padding: 4px; font-size: 10px;">Memory</button>
        <button onclick="window.debugUtils.clearLogs()" style="margin: 2px; padding: 4px; font-size: 10px;">Clear</button>
        <button onclick="console.log(window.debugUtils.exportLogs())" style="margin: 2px; padding: 4px; font-size: 10px;">Export</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Add keyboard shortcut to toggle panel
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.showDebugPanel();
      }
    });

    // Expose to global scope for console access
    (window as Window & { debugUtils?: DebugUtility }).debugUtils = this;
  }

  private setupGlobalErrorHandling(): void {
    if (!this.config.enabled || typeof window === 'undefined') return;

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.logError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), {
        type: 'unhandled_promise_rejection'
      });
    });
  }
}

// Export singleton instance
export const debugUtils = DebugUtility.getInstance();

// React debugging hooks
export const useDebugRender = (componentName: string, props?: unknown) => {
  if (import.meta.env.MODE === 'development') {
    React.useEffect(() => {
      debugUtils.logComponentRender(componentName, props);
    });
  }
};

export const useDebugState = <T>(componentName: string, state: T) => {
  const prevState = React.useRef<T>(state);
  
  if (import.meta.env.MODE === 'development') {
    React.useEffect(() => {
      if (prevState.current !== state) {
        debugUtils.logStateChange(componentName, prevState.current, state);
        prevState.current = state;
      }
    }, [state]);
  }
};

// Performance debugging utilities
export const withPerformanceLogging = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  name: string
): T => {
  return ((...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      debugUtils.startTimer(name);
      const result = fn(...args);
      debugUtils.endTimer(name);
      return result;
    }
    return fn(...args);
  }) as T;
};

// API debugging utilities
export const debugFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  if (import.meta.env.MODE === 'development') {
    debugUtils.logApiRequest(options?.method || 'GET', url, options?.body);
    debugUtils.startTimer(`fetch-${url}`);
  }

  try {
    const response = await fetch(url, options);
    
    if (import.meta.env.MODE === 'development') {
      const duration = debugUtils.endTimer(`fetch-${url}`);
      debugUtils.logApiResponse(
        options?.method || 'GET',
        url,
        response.status,
        null,
        duration || undefined
      );
    }

    return response;
  } catch (error) {
    if (import.meta.env.MODE === 'development') {
      debugUtils.endTimer(`fetch-${url}`);
      debugUtils.logError(error as Error, { url, options });
    }
    throw error;
  }
};

export default DebugUtility;
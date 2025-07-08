/**
 * Supabase Monitoring and Performance Tracking
 * Monitors database operations, query performance, and connection health
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sentryUtils } from './sentry';

export interface DatabaseMetrics {
  connectionTime: number;
  queryTime: number;
  operation: string;
  table?: string;
  success: boolean;
  errorMessage?: string;
  rowsAffected?: number;
  timestamp: number;
}

export interface DatabaseHealthCheck {
  connectionStatus: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: number;
  error?: string;
}

class SupabaseMonitor {
  private static instance: SupabaseMonitor;
  private client: SupabaseClient;
  private metrics: DatabaseMetrics[] = [];
  private healthHistory: DatabaseHealthCheck[] = [];
  private monitoringInterval: number | null = null;

  private readonly thresholds = {
    connectionTime: 1000, // 1 second
    queryTime: 2000, // 2 seconds
    healthCheckInterval: 60000, // 1 minute
    maxMetricsHistory: 1000,
    maxHealthHistory: 100
  };

  private constructor() {
    this.client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    this.setupClientMonitoring();
  }

  public static getInstance(): SupabaseMonitor {
    if (!SupabaseMonitor.instance) {
      SupabaseMonitor.instance = new SupabaseMonitor();
    }
    return SupabaseMonitor.instance;
  }

  /**
   * Start comprehensive database monitoring
   */
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      console.warn('Supabase monitoring already running');
      return;
    }

    console.log('🟢 Starting Supabase monitoring...');

    // Initial health check
    this.performHealthCheck();

    // Schedule regular health checks
    this.monitoringInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.thresholds.healthCheckInterval);

    sentryUtils.trackFeatureUsage('supabase_monitoring_started', {
      healthCheckInterval: this.thresholds.healthCheckInterval
    });
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🔴 Supabase monitoring stopped');
    }
  }

  /**
   * Setup client monitoring hooks
   */
  private setupClientMonitoring(): void {
    // We'll monkey-patch common Supabase operations to track performance
    const originalFrom = this.client.from.bind(this.client);
    
    this.client.from = (table: string) => {
      const queryBuilder = originalFrom(table);
      return this.wrapQueryBuilder(queryBuilder, table);
    };
  }

  /**
   * Wrap query builder to track performance
   */
  private wrapQueryBuilder(queryBuilder: any, table: string): any {
    const originalSelect = queryBuilder.select?.bind(queryBuilder);
    const originalInsert = queryBuilder.insert?.bind(queryBuilder);
    const originalUpdate = queryBuilder.update?.bind(queryBuilder);
    const originalDelete = queryBuilder.delete?.bind(queryBuilder);

    if (originalSelect) {
      queryBuilder.select = (...args: any[]) => {
        const result = originalSelect(...args);
        return this.wrapPromise(result, 'SELECT', table);
      };
    }

    if (originalInsert) {
      queryBuilder.insert = (...args: any[]) => {
        const result = originalInsert(...args);
        return this.wrapPromise(result, 'INSERT', table);
      };
    }

    if (originalUpdate) {
      queryBuilder.update = (...args: any[]) => {
        const result = originalUpdate(...args);
        return this.wrapPromise(result, 'UPDATE', table);
      };
    }

    if (originalDelete) {
      queryBuilder.delete = (...args: any[]) => {
        const result = originalDelete(...args);
        return this.wrapPromise(result, 'DELETE', table);
      };
    }

    return queryBuilder;
  }

  /**
   * Wrap database promises to track performance
   */
  private wrapPromise(promise: any, operation: string, table: string): any {
    const startTime = performance.now();
    
    return promise.then(
      (result: any) => {
        const queryTime = performance.now() - startTime;
        
        const metrics: DatabaseMetrics = {
          connectionTime: 0, // We can't easily measure connection time with Supabase client
          queryTime,
          operation,
          table,
          success: !result.error,
          rowsAffected: result.data?.length || (result.count !== null ? result.count : undefined),
          timestamp: Date.now()
        };

        if (result.error) {
          metrics.success = false;
          metrics.errorMessage = result.error.message;
        }

        this.recordMetrics(metrics);
        return result;
      },
      (error: any) => {
        const queryTime = performance.now() - startTime;
        
        const metrics: DatabaseMetrics = {
          connectionTime: 0,
          queryTime,
          operation,
          table,
          success: false,
          errorMessage: error.message || 'Unknown database error',
          timestamp: Date.now()
        };

        this.recordMetrics(metrics);
        throw error;
      }
    );
  }

  /**
   * Record database operation metrics
   */
  private recordMetrics(metrics: DatabaseMetrics): void {
    this.metrics.push(metrics);

    // Maintain metrics history size
    if (this.metrics.length > this.thresholds.maxMetricsHistory) {
      this.metrics.splice(0, this.metrics.length - this.thresholds.maxMetricsHistory);
    }

    // Log slow queries
    if (metrics.queryTime > this.thresholds.queryTime) {
      console.warn(`⚠️ Slow database query: ${metrics.operation} on ${metrics.table} took ${metrics.queryTime.toFixed(2)}ms`);
      
      sentryUtils.trackPerformanceIssue(
        `database_query_time_${metrics.operation.toLowerCase()}`,
        metrics.queryTime,
        this.thresholds.queryTime
      );
    }

    // Log database errors
    if (!metrics.success) {
      console.error(`❌ Database operation failed: ${metrics.operation} on ${metrics.table}:`, metrics.errorMessage);
      
      sentryUtils.captureException(new Error(`Database ${metrics.operation} failed: ${metrics.errorMessage}`), {
        operation: metrics.operation,
        table: metrics.table,
        queryTime: metrics.queryTime
      });
    }

    // Track successful operations
    sentryUtils.trackDatabaseOperation(metrics.operation, metrics.table || 'unknown', metrics.success, metrics.queryTime);
  }

  /**
   * Perform database health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Simple health check query
      const { data, error } = await this.client
        .from('profiles') // Using a table that should exist
        .select('count')
        .limit(1);

      const responseTime = performance.now() - startTime;
      
      let status: DatabaseHealthCheck['connectionStatus'] = 'healthy';
      
      if (error) {
        status = 'unhealthy';
      } else if (responseTime > this.thresholds.connectionTime) {
        status = 'degraded';
      }

      const healthCheck: DatabaseHealthCheck = {
        connectionStatus: status,
        responseTime,
        timestamp: Date.now(),
        error: error?.message
      };

      this.recordHealthCheck(healthCheck);

    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      const healthCheck: DatabaseHealthCheck = {
        connectionStatus: 'unhealthy',
        responseTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown database error'
      };

      this.recordHealthCheck(healthCheck);
    }
  }

  /**
   * Record health check result
   */
  private recordHealthCheck(healthCheck: DatabaseHealthCheck): void {
    this.healthHistory.push(healthCheck);

    // Maintain health history size
    if (this.healthHistory.length > this.thresholds.maxHealthHistory) {
      this.healthHistory.shift();
    }

    // Log health status changes
    if (this.healthHistory.length > 1) {
      const previousStatus = this.healthHistory[this.healthHistory.length - 2].connectionStatus;
      if (previousStatus !== healthCheck.connectionStatus) {
        console.log(`🔄 Database health status changed: ${previousStatus} → ${healthCheck.connectionStatus}`);
        
        sentryUtils.trackFeatureUsage('database_health_change', {
          from: previousStatus,
          to: healthCheck.connectionStatus,
          responseTime: healthCheck.responseTime
        });
      }
    }

    // Alert on unhealthy status
    if (healthCheck.connectionStatus === 'unhealthy') {
      console.error('🚨 Database health check failed:', healthCheck.error);
      
      sentryUtils.captureException(new Error(`Database unhealthy: ${healthCheck.error}`), {
        responseTime: healthCheck.responseTime,
        timestamp: healthCheck.timestamp
      });
    }
  }

  /**
   * Get database performance metrics
   */
  public getMetrics(): {
    recent: DatabaseMetrics[];
    summary: Record<string, any>;
    health: DatabaseHealthCheck[];
  } {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    
    // Get recent metrics (last 24 hours)
    const recentMetrics = this.metrics.filter(m => m.timestamp >= last24Hours);
    
    // Calculate summary statistics
    const summary = this.calculateMetricsSummary(recentMetrics);
    
    return {
      recent: recentMetrics,
      summary,
      health: this.healthHistory
    };
  }

  /**
   * Calculate metrics summary
   */
  private calculateMetricsSummary(metrics: DatabaseMetrics[]): Record<string, any> {
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageQueryTime: 0,
        operationBreakdown: {}
      };
    }

    const successful = metrics.filter(m => m.success);
    const successRate = (successful.length / metrics.length) * 100;
    
    const totalQueryTime = metrics.reduce((sum, m) => sum + m.queryTime, 0);
    const averageQueryTime = totalQueryTime / metrics.length;

    // Operation breakdown
    const operationBreakdown: Record<string, any> = {};
    const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    
    operations.forEach(op => {
      const opMetrics = metrics.filter(m => m.operation === op);
      if (opMetrics.length > 0) {
        const opSuccessful = opMetrics.filter(m => m.success);
        const opAvgTime = opMetrics.reduce((sum, m) => sum + m.queryTime, 0) / opMetrics.length;
        
        operationBreakdown[op] = {
          count: opMetrics.length,
          successRate: (opSuccessful.length / opMetrics.length) * 100,
          averageTime: opAvgTime,
          slowestQuery: Math.max(...opMetrics.map(m => m.queryTime))
        };
      }
    });

    return {
      totalOperations: metrics.length,
      successRate: parseFloat(successRate.toFixed(2)),
      averageQueryTime: parseFloat(averageQueryTime.toFixed(2)),
      slowestQuery: Math.max(...metrics.map(m => m.queryTime)),
      operationBreakdown
    };
  }

  /**
   * Get current database health status
   */
  public getCurrentHealth(): DatabaseHealthCheck | null {
    return this.healthHistory.length > 0 
      ? this.healthHistory[this.healthHistory.length - 1] 
      : null;
  }

  /**
   * Export metrics for external monitoring
   */
  public exportMetricsForMonitoring(): Record<string, any> {
    const metrics = this.getMetrics();
    const currentHealth = this.getCurrentHealth();
    
    return {
      timestamp: Date.now(),
      health: currentHealth,
      performance: metrics.summary,
      uptime: this.calculateUptime(),
      alerts: this.getActiveAlerts()
    };
  }

  /**
   * Calculate database uptime percentage
   */
  private calculateUptime(): number {
    if (this.healthHistory.length === 0) return 100;
    
    const healthyChecks = this.healthHistory.filter(h => h.connectionStatus === 'healthy').length;
    return (healthyChecks / this.healthHistory.length) * 100;
  }

  /**
   * Get active alerts
   */
  private getActiveAlerts(): string[] {
    const alerts: string[] = [];
    const currentHealth = this.getCurrentHealth();
    const metrics = this.getMetrics();
    
    if (currentHealth?.connectionStatus === 'unhealthy') {
      alerts.push('Database connection unhealthy');
    }
    
    if (currentHealth?.connectionStatus === 'degraded') {
      alerts.push('Database connection degraded');
    }
    
    if (metrics.summary.successRate < 95) {
      alerts.push(`Low success rate: ${metrics.summary.successRate}%`);
    }
    
    if (metrics.summary.averageQueryTime > this.thresholds.queryTime) {
      alerts.push(`High average query time: ${metrics.summary.averageQueryTime}ms`);
    }
    
    return alerts;
  }
}

// Export singleton instance
export const supabaseMonitor = SupabaseMonitor.getInstance();

// Auto-start monitoring in production
if (import.meta.env.PROD) {
  setTimeout(() => {
    supabaseMonitor.startMonitoring();
  }, 5000); // Start after 5 seconds
}

export default SupabaseMonitor;
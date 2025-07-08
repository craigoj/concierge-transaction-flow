/**
 * Uptime Monitoring Configuration for Concierge Transaction Flow
 * Configures external monitoring services and health checks
 */

import { sentryUtils } from './sentry';
import { logger } from './logger';

export interface UptimeMonitoringConfig {
  healthCheckInterval: number; // milliseconds
  endpoints: string[];
  alertThresholds: {
    responseTime: number; // milliseconds
    consecutiveFailures: number;
    uptimePercentage: number;
  };
}

export interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: number;
  error?: string;
}

class UptimeMonitor {
  private static instance: UptimeMonitor;
  private config: UptimeMonitoringConfig;
  private healthHistory: Map<string, HealthCheckResult[]> = new Map();
  private intervalId: number | null = null;

  private constructor() {
    this.config = {
      healthCheckInterval: 5 * 60 * 1000, // 5 minutes
      endpoints: [
        '/api/health',
        '/api/performance-alert'
      ],
      alertThresholds: {
        responseTime: 5000, // 5 seconds
        consecutiveFailures: 3,
        uptimePercentage: 99.5
      }
    };
  }

  public static getInstance(): UptimeMonitor {
    if (!UptimeMonitor.instance) {
      UptimeMonitor.instance = new UptimeMonitor();
    }
    return UptimeMonitor.instance;
  }

  /**
   * Start uptime monitoring
   */
  public startMonitoring(): void {
    if (this.intervalId) {
      logger.warn('Uptime monitoring already running', { isRunning: this.isRunning }, 'uptime-monitoring');
      return;
    }

    logger.info('Starting uptime monitoring', { 
      endpoints: this.config.endpoints,
      interval: this.config.healthCheckInterval 
    }, 'uptime-monitoring');
    
    // Initial health check
    this.performHealthChecks();

    // Schedule regular health checks
    this.intervalId = window.setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);

    // Track monitoring start
    sentryUtils.trackFeatureUsage('uptime_monitoring_started', {
      interval: this.config.healthCheckInterval,
      endpoints: this.config.endpoints.length
    });
  }

  /**
   * Stop uptime monitoring
   */
  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Uptime monitoring stopped', {}, 'uptime-monitoring');
    }
  }

  /**
   * Perform health checks on all configured endpoints
   */
  private async performHealthChecks(): Promise<void> {
    const checks = this.config.endpoints.map(endpoint => this.checkEndpointHealth(endpoint));
    const results = await Promise.allSettled(checks);

    results.forEach((result, index) => {
      const endpoint = this.config.endpoints[index];
      
      if (result.status === 'fulfilled') {
        this.recordHealthCheck(endpoint, result.value);
        this.analyzeHealthTrends(endpoint);
      } else {
        this.recordHealthCheck(endpoint, {
          endpoint,
          status: 'unhealthy',
          responseTime: 0,
          timestamp: Date.now(),
          error: result.reason?.toString() || 'Unknown error'
        });
      }
    });
  }

  /**
   * Check health of a specific endpoint
   */
  private async checkEndpointHealth(endpoint: string): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'X-Health-Check': 'true'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = performance.now() - startTime;
      
      let status: HealthCheckResult['status'] = 'healthy';
      
      if (!response.ok) {
        status = 'unhealthy';
      } else if (responseTime > this.config.alertThresholds.responseTime) {
        status = 'degraded';
      }

      const result: HealthCheckResult = {
        endpoint,
        status,
        responseTime,
        timestamp: Date.now()
      };

      // Log slow responses
      if (status === 'degraded') {
        logger.warn('Slow response detected', {
          endpoint,
          responseTime: parseFloat(responseTime.toFixed(2)),
          threshold: this.config.alertThresholds.responseTime
        }, 'uptime-monitoring');
        sentryUtils.trackPerformanceIssue('endpoint_response_time', responseTime, this.config.alertThresholds.responseTime);
      }

      return result;

    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      logger.error('Health check failed', error as Error, { endpoint }, 'uptime-monitoring');
      
      return {
        endpoint,
        status: 'unhealthy',
        responseTime,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Record health check result and maintain history
   */
  private recordHealthCheck(endpoint: string, result: HealthCheckResult): void {
    if (!this.healthHistory.has(endpoint)) {
      this.healthHistory.set(endpoint, []);
    }

    const history = this.healthHistory.get(endpoint)!;
    history.push(result);

    // Keep only last 100 checks per endpoint
    if (history.length > 100) {
      history.shift();
    }

    // Log health status changes
    if (history.length > 1) {
      const previousStatus = history[history.length - 2].status;
      if (previousStatus !== result.status) {
        logger.info('Health status changed', {
          endpoint,
          previousStatus,
          newStatus: result.status,
          responseTime: result.responseTime
        }, 'uptime-monitoring');
        
        sentryUtils.trackFeatureUsage('health_status_change', {
          endpoint,
          from: previousStatus,
          to: result.status,
          responseTime: result.responseTime
        });
      }
    }
  }

  /**
   * Analyze health trends and trigger alerts
   */
  private analyzeHealthTrends(endpoint: string): void {
    const history = this.healthHistory.get(endpoint);
    if (!history || history.length < this.config.alertThresholds.consecutiveFailures) {
      return;
    }

    // Check for consecutive failures
    const recentChecks = history.slice(-this.config.alertThresholds.consecutiveFailures);
    const allFailed = recentChecks.every(check => check.status === 'unhealthy');

    if (allFailed) {
      this.triggerDowntimeAlert(endpoint, recentChecks);
    }

    // Calculate uptime percentage (last 24 hours worth of checks)
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recent24HourChecks = history.filter(check => check.timestamp >= last24Hours);
    
    if (recent24HourChecks.length > 0) {
      const healthyChecks = recent24HourChecks.filter(check => check.status === 'healthy').length;
      const uptimePercentage = (healthyChecks / recent24HourChecks.length) * 100;

      if (uptimePercentage < this.config.alertThresholds.uptimePercentage) {
        this.triggerUptimeAlert(endpoint, uptimePercentage);
      }
    }
  }

  /**
   * Trigger downtime alert
   */
  private triggerDowntimeAlert(endpoint: string, failedChecks: HealthCheckResult[]): void {
    logger.error('Downtime alert triggered', undefined, {
      endpoint,
      consecutiveFailures: failedChecks.length,
      threshold: this.config.alertThresholds.consecutiveFailures,
      alertLevel: 'critical'
    }, 'uptime-monitoring');
    
    sentryUtils.captureException(new Error(`Service downtime detected: ${endpoint}`), {
      endpoint,
      consecutiveFailures: failedChecks.length,
      failureDetails: failedChecks.map(check => ({
        timestamp: new Date(check.timestamp).toISOString(),
        error: check.error,
        responseTime: check.responseTime
      }))
    });

    // Send to performance alert API
    this.sendDowntimeNotification(endpoint, failedChecks);
  }

  /**
   * Trigger uptime threshold alert
   */
  private triggerUptimeAlert(endpoint: string, uptimePercentage: number): void {
    logger.warn('Uptime threshold alert', {
      endpoint,
      uptimePercentage: parseFloat(uptimePercentage.toFixed(2)),
      threshold: this.config.alertThresholds.uptimePercentage,
      alertLevel: 'warning'
    }, 'uptime-monitoring');
    
    sentryUtils.trackPerformanceIssue('uptime_threshold', uptimePercentage, this.config.alertThresholds.uptimePercentage);
  }

  /**
   * Send downtime notification
   */
  private async sendDowntimeNotification(endpoint: string, failedChecks: HealthCheckResult[]): Promise<void> {
    try {
      await fetch('/api/performance-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'downtime_alert',
          endpoint,
          consecutiveFailures: failedChecks.length,
          timestamp: Date.now(),
          details: failedChecks
        })
      });
    } catch (error) {
      logger.error('Failed to send downtime notification', error as Error, { endpoint }, 'uptime-monitoring');
    }
  }

  /**
   * Get health summary for all endpoints
   */
  public getHealthSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

    for (const [endpoint, history] of this.healthHistory.entries()) {
      if (history.length === 0) continue;

      const latest = history[history.length - 1];
      const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
      const recent = history.filter(check => check.timestamp >= last24Hours);
      
      const healthyCount = recent.filter(check => check.status === 'healthy').length;
      const uptimePercentage = recent.length > 0 ? (healthyCount / recent.length) * 100 : 0;
      
      const avgResponseTime = recent.length > 0 
        ? recent.reduce((sum, check) => sum + check.responseTime, 0) / recent.length 
        : 0;

      summary[endpoint] = {
        currentStatus: latest.status,
        lastChecked: new Date(latest.timestamp).toISOString(),
        responseTime: latest.responseTime,
        uptimePercentage: parseFloat(uptimePercentage.toFixed(2)),
        averageResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        totalChecks: recent.length,
        healthyChecks: healthyCount
      };
    }

    return summary;
  }

  /**
   * Get configuration for external monitoring services
   */
  public getExternalMonitoringConfig(): Record<string, any> {
    const baseUrl = window.location.origin;
    
    return {
      // Uptime Robot configuration
      uptimeRobot: {
        monitors: [
          {
            friendlyName: 'Concierge Transaction Flow - Main Health',
            url: `${baseUrl}/api/health`,
            type: 1, // HTTP
            interval: 300, // 5 minutes
            httpMethod: 1, // GET
            timeout: 30
          },
          {
            friendlyName: 'Concierge Transaction Flow - Performance API',
            url: `${baseUrl}/api/performance-alert`,
            type: 1, // HTTP
            interval: 300, // 5 minutes
            httpMethod: 2, // POST (with test payload)
            timeout: 30
          }
        ],
        alertContacts: [
          // Configure your alert contacts here
          // { type: 2, value: 'your-email@domain.com' },
          // { type: 6, value: 'your-slack-webhook-url' }
        ]
      },

      // Pingdom configuration
      pingdom: {
        checks: [
          {
            name: 'Concierge Transaction Flow Health Check',
            hostname: baseUrl.replace(/https?:\/\//, ''),
            url: '/api/health',
            resolution: 5, // 5 minutes
            type: {
              http: {
                encryption: true,
                port: 443,
                shouldContain: 'healthy',
                shouldNotContain: 'error'
              }
            }
          }
        ]
      },

      // StatusCake configuration
      statusCake: {
        tests: [
          {
            TestURL: `${baseUrl}/api/health`,
            TestType: 'HTTP',
            CheckRate: 300, // 5 minutes
            Timeout: 30,
            FindString: 'healthy',
            DoNotFind: false
          }
        ]
      }
    };
  }
}

// Export singleton instance
export const uptimeMonitor = UptimeMonitor.getInstance();

// Auto-start monitoring in production
if (import.meta.env.PROD) {
  // Start monitoring after a short delay to ensure app is fully loaded
  setTimeout(() => {
    uptimeMonitor.startMonitoring();
  }, 10000); // 10 seconds
}

export default UptimeMonitor;
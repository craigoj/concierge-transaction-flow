/**
 * Health Check System for Concierge Transaction Flow
 * Provides comprehensive health monitoring for production deployment
 */

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  responseTime?: number;
  details?: Record<string, unknown>;
  error?: string;
}

interface HealthCheckConfig {
  timeout: number;
  retries: number;
  interval: number;
}

class HealthChecker {
  private config: HealthCheckConfig;
  private checks: Map<string, () => Promise<HealthCheckResult>>;

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = {
      timeout: 5000,
      retries: 3,
      interval: 30000,
      ...config
    };
    this.checks = new Map();
    this.initializeChecks();
  }

  private initializeChecks(): void {
    this.checks.set('database', this.checkDatabase.bind(this));
    this.checks.set('api', this.checkAPI.bind(this));
    this.checks.set('auth', this.checkAuth.bind(this));
    this.checks.set('storage', this.checkStorage.bind(this));
    this.checks.set('realtime', this.checkRealtime.bind(this));
  }

  /**
   * Database connectivity and basic operations check
   */
  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This would be implemented with your actual Supabase client
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: 'database',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime,
          details: {
            url: process.env.VITE_SUPABASE_URL,
            connectionPool: 'active'
          }
        };
      } else {
        throw new Error(`Database check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * API endpoints health check
   */
  private async checkAPI(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: this.config.timeout
      } as RequestInit);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: 'api',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime,
          details: {
            endpoint: '/api/health',
            status: response.status
          }
        };
      } else {
        throw new Error(`API check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        service: 'api',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Authentication system check
   */
  private async checkAuth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: 'auth',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime,
          details: {
            provider: 'supabase',
            endpoint: '/auth/v1/settings'
          }
        };
      } else {
        throw new Error(`Auth check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        service: 'auth',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Storage system check
   */
  private async checkStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/storage/v1/bucket`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: 'storage',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime,
          details: {
            provider: 'supabase',
            endpoint: '/storage/v1/bucket'
          }
        };
      } else {
        throw new Error(`Storage check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        service: 'storage',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Real-time functionality check
   */
  private async checkRealtime(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // This is a simplified check - in production you'd test actual WebSocket connection
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/realtime/v1/`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: 'realtime',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          responseTime,
          details: {
            provider: 'supabase',
            endpoint: '/realtime/v1/'
          }
        };
      } else {
        throw new Error(`Realtime check failed: ${response.status}`);
      }
    } catch (error) {
      return {
        service: 'realtime',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run a specific health check with retry logic
   */
  async runCheck(serviceName: string): Promise<HealthCheckResult> {
    const checkFunction = this.checks.get(serviceName);
    
    if (!checkFunction) {
      return {
        service: serviceName,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Unknown service'
      };
    }

    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const result = await checkFunction();
        
        if (result.status === 'healthy') {
          return result;
        }
        
        lastError = result.error;
        
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      service: serviceName,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: lastError || 'All retry attempts failed'
    };
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    for (const serviceName of this.checks.keys()) {
      const result = await this.runCheck(serviceName);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get overall system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: HealthCheckResult[];
    summary: {
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
  }> {
    const services = await this.runAllChecks();
    
    const summary = {
      healthy: services.filter(s => s.status === 'healthy').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      unhealthy: services.filter(s => s.status === 'unhealthy').length
    };

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      summary
    };
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(callback?: (results: HealthCheckResult[]) => void): void {
    const runMonitoring = async () => {
      const results = await this.runAllChecks();
      
      if (callback) {
        callback(results);
      }
      
      // Log unhealthy services
      const unhealthyServices = results.filter(r => r.status === 'unhealthy');
      if (unhealthyServices.length > 0) {
        console.error('Unhealthy services detected:', unhealthyServices);
      }
    };

    // Run immediately
    runMonitoring();
    
    // Set up interval
    setInterval(runMonitoring, this.config.interval);
  }
}

// Export singleton instance
export const healthChecker = new HealthChecker();

// Export for API endpoint usage
export async function handleHealthCheck(): Promise<Response> {
  try {
    const healthStatus = await healthChecker.getSystemHealth();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return new Response(JSON.stringify(healthStatus), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

export default HealthChecker;
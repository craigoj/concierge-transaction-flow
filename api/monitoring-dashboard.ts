import type { VercelRequest, VercelResponse } from '@vercel/node';

interface MonitoringDashboard {
  timestamp: string;
  environment: string;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  systems: {
    application: SystemStatus;
    database: SystemStatus;
    performance: SystemStatus;
    uptime: SystemStatus;
    backups: SystemStatus;
  };
  alerts: Alert[];
  metrics: {
    performance: PerformanceMetrics;
    database: DatabaseMetrics;
    uptime: UptimeMetrics;
  };
}

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: string;
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  system: string;
  message: string;
  timestamp: string;
  resolved?: boolean;
}

interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number;
    inp: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  bundleSize: number;
  responseTime: number;
}

interface DatabaseMetrics {
  connectionHealth: string;
  averageQueryTime: number;
  successRate: number;
  totalOperations: number;
  slowQueries: number;
}

interface UptimeMetrics {
  uptime: number;
  availability: number;
  avgResponseTime: number;
  totalRequests: number;
  errors: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const dashboard = await generateMonitoringDashboard();
    res.status(200).json(dashboard);

  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Generate comprehensive monitoring dashboard
 */
async function generateMonitoringDashboard(): Promise<MonitoringDashboard> {
  const timestamp = new Date().toISOString();
  const environment = process.env.VERCEL_ENV || 'development';

  // Collect system statuses
  const applicationStatus = await checkApplicationHealth();
  const databaseStatus = await checkDatabaseHealth();
  const performanceStatus = await checkPerformanceHealth();
  const uptimeStatus = await checkUptimeHealth();
  const backupStatus = await checkBackupHealth();

  // Determine overall status
  const systemStatuses = [
    applicationStatus.status,
    databaseStatus.status,
    performanceStatus.status,
    uptimeStatus.status,
    backupStatus.status
  ];

  let overallStatus: MonitoringDashboard['overallStatus'] = 'healthy';
  if (systemStatuses.includes('unhealthy')) {
    overallStatus = 'unhealthy';
  } else if (systemStatuses.includes('degraded')) {
    overallStatus = 'degraded';
  }

  // Collect alerts
  const alerts = await collectActiveAlerts();

  // Collect metrics
  const performanceMetrics = await collectPerformanceMetrics();
  const databaseMetrics = await collectDatabaseMetrics();
  const uptimeMetrics = await collectUptimeMetrics();

  const dashboard: MonitoringDashboard = {
    timestamp,
    environment,
    overallStatus,
    systems: {
      application: applicationStatus,
      database: databaseStatus,
      performance: performanceStatus,
      uptime: uptimeStatus,
      backups: backupStatus
    },
    alerts,
    metrics: {
      performance: performanceMetrics,
      database: databaseMetrics,
      uptime: uptimeMetrics
    }
  };

  // Log dashboard generation
  console.log('📊 Monitoring Dashboard Generated:', {
    overallStatus,
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.type === 'critical').length,
    systems: Object.keys(dashboard.systems).map(key => ({
      system: key,
      status: dashboard.systems[key as keyof typeof dashboard.systems].status
    }))
  });

  return dashboard;
}

/**
 * Check application health
 */
async function checkApplicationHealth(): Promise<SystemStatus> {
  try {
    const startTime = Date.now();
    
    // Check main health endpoint
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:5173'}/api/health`, {
      method: 'GET',
      headers: { 'User-Agent': 'monitoring-dashboard' },
      signal: AbortSignal.timeout(5000)
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        lastChecked: new Date().toISOString(),
        responseTime,
        message: data.status === 'healthy' ? 'Application is running normally' : 'Application has issues',
        details: data
      };
    } else {
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        responseTime,
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }

  } catch (error) {
    return {
      status: 'unhealthy',
      lastChecked: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown application error'
    };
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<SystemStatus> {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        message: 'Database configuration missing'
      };
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        responseTime,
        message: `Database error: ${error.message}`
      };
    }

    return {
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      lastChecked: new Date().toISOString(),
      responseTime,
      message: 'Database is responsive',
      details: { connectionTime: responseTime }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      lastChecked: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

/**
 * Check performance health
 */
async function checkPerformanceHealth(): Promise<SystemStatus> {
  try {
    // In a real implementation, this would check recent performance metrics
    // For now, we'll simulate based on reasonable thresholds
    
    const mockMetrics = {
      lcp: 1800, // Good: < 2500ms
      inp: 150,  // Good: < 200ms
      cls: 0.05, // Good: < 0.1
      bundleSize: 1200 * 1024 // 1.2MB
    };

    let status: SystemStatus['status'] = 'healthy';
    const issues: string[] = [];

    if (mockMetrics.lcp > 2500) {
      status = 'degraded';
      issues.push('LCP above threshold');
    }
    
    if (mockMetrics.inp > 200) {
      status = 'degraded';
      issues.push('INP above threshold');
    }
    
    if (mockMetrics.cls > 0.1) {
      status = 'degraded';
      issues.push('CLS above threshold');
    }

    if (mockMetrics.bundleSize > 2 * 1024 * 1024) { // 2MB
      status = 'degraded';
      issues.push('Bundle size too large');
    }

    return {
      status,
      lastChecked: new Date().toISOString(),
      message: issues.length > 0 ? `Performance issues: ${issues.join(', ')}` : 'Performance is optimal',
      details: mockMetrics
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      lastChecked: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown performance error'
    };
  }
}

/**
 * Check uptime health
 */
async function checkUptimeHealth(): Promise<SystemStatus> {
  try {
    // Simulate uptime metrics - in real implementation would check uptime monitoring service
    const uptimePercentage = 99.8; // Good: > 99.5%
    const avgResponseTime = 450; // Good: < 1000ms
    
    let status: SystemStatus['status'] = 'healthy';
    const issues: string[] = [];

    if (uptimePercentage < 99.5) {
      status = 'degraded';
      issues.push('Uptime below 99.5%');
    }

    if (avgResponseTime > 2000) {
      status = 'degraded';
      issues.push('High response times');
    }

    return {
      status,
      lastChecked: new Date().toISOString(),
      message: issues.length > 0 ? `Uptime issues: ${issues.join(', ')}` : 'Uptime is excellent',
      details: {
        uptimePercentage,
        avgResponseTime,
        lastIncident: null
      }
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      lastChecked: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown uptime error'
    };
  }
}

/**
 * Check backup health
 */
async function checkBackupHealth(): Promise<SystemStatus> {
  try {
    // Check backup verification endpoint
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:5173'}/api/backup-verification`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const backupData = await response.json();
      
      let status: SystemStatus['status'] = 'healthy';
      if (backupData.status === 'error') {
        status = 'unhealthy';
      } else if (backupData.status === 'warning') {
        status = 'degraded';
      }

      return {
        status,
        lastChecked: new Date().toISOString(),
        message: `Backup ${backupData.status}: ${backupData.details.tablesVerified} tables verified`,
        details: backupData.details
      };
    } else {
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        message: `Backup verification failed: HTTP ${response.status}`
      };
    }

  } catch (error) {
    return {
      status: 'degraded',
      lastChecked: new Date().toISOString(),
      message: 'Backup verification unavailable'
    };
  }
}

/**
 * Collect active alerts
 */
async function collectActiveAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // In a real implementation, this would collect from various monitoring systems
  // For now, we'll generate sample alerts based on system status

  // Check for critical system failures
  const systems = await Promise.all([
    checkApplicationHealth(),
    checkDatabaseHealth(),
    checkPerformanceHealth()
  ]);

  systems.forEach((system, index) => {
    const systemNames = ['application', 'database', 'performance'];
    const systemName = systemNames[index];

    if (system.status === 'unhealthy') {
      alerts.push({
        id: `${systemName}_${Date.now()}`,
        type: 'critical',
        system: systemName,
        message: system.message || `${systemName} is unhealthy`,
        timestamp: system.lastChecked
      });
    } else if (system.status === 'degraded') {
      alerts.push({
        id: `${systemName}_${Date.now()}`,
        type: 'warning',
        system: systemName,
        message: system.message || `${systemName} is degraded`,
        timestamp: system.lastChecked
      });
    }
  });

  return alerts;
}

/**
 * Collect performance metrics
 */
async function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  // In a real implementation, this would collect from performance monitoring system
  return {
    coreWebVitals: {
      lcp: 1800,
      inp: 150,
      cls: 0.05,
      fcp: 1200,
      ttfb: 400
    },
    bundleSize: 1200 * 1024, // 1.2MB
    responseTime: 450
  };
}

/**
 * Collect database metrics
 */
async function collectDatabaseMetrics(): Promise<DatabaseMetrics> {
  // In a real implementation, this would collect from database monitoring
  return {
    connectionHealth: 'healthy',
    averageQueryTime: 180,
    successRate: 99.7,
    totalOperations: 1247,
    slowQueries: 3
  };
}

/**
 * Collect uptime metrics
 */
async function collectUptimeMetrics(): Promise<UptimeMetrics> {
  // In a real implementation, this would collect from uptime monitoring service
  return {
    uptime: 99.8,
    availability: 99.95,
    avgResponseTime: 450,
    totalRequests: 15420,
    errors: 12
  };
}
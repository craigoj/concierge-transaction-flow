import { logger } from './logger';
import { SecurityUtils } from './security-utils';

export interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  outcome: 'success' | 'failure' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details?: string;
}

export interface AuditConfig {
  enabledActions: string[];
  sensitiveFields: string[];
  retentionDays: number;
  encryptSensitiveData: boolean;
  realTimeAlerting: boolean;
}

export class AuditLogger {
  private config: AuditConfig;
  private eventBuffer: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = {
      enabledActions: [
        'auth.login',
        'auth.logout',
        'auth.password_change',
        'auth.password_reset',
        'data.create',
        'data.read',
        'data.update',
        'data.delete',
        'admin.user_create',
        'admin.user_delete',
        'admin.user_modify',
        'admin.permission_change',
        'file.upload',
        'file.download',
        'file.delete',
        'transaction.create',
        'transaction.update',
        'transaction.delete',
        'financial.payment_process',
        'financial.refund_process',
        'security.failed_login',
        'security.suspicious_activity',
        'security.rate_limit_exceeded'
      ],
      sensitiveFields: [
        'password',
        'ssn',
        'tax_id',
        'credit_card',
        'bank_account',
        'social_security',
        'driver_license',
        'passport',
        'api_key',
        'token',
        'secret'
      ],
      retentionDays: 2555, // 7 years for compliance
      encryptSensitiveData: true,
      realTimeAlerting: true,
      ...config
    };

    // Flush buffer every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushBuffer();
    }, 30000);
  }

  public async logEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    if (!this.config.enabledActions.includes(event.action)) {
      return;
    }

    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date(),
      metadata: this.sanitizeMetadata(event.metadata || {}),
      details: event.details ? SecurityUtils.sanitizeInput(event.details) : undefined
    };

    // Add to buffer
    this.eventBuffer.push(auditEvent);

    // Log immediately for high-risk events
    if (auditEvent.riskLevel === 'critical' || auditEvent.riskLevel === 'high') {
      await this.logCriticalEvent(auditEvent);
    }

    // Log to standard logger
    this.logToStandardLogger(auditEvent);

    // Flush buffer if it's getting large
    if (this.eventBuffer.length >= 100) {
      await this.flushBuffer();
    }
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      
      // Check if field is sensitive
      const isSensitive = this.config.sensitiveFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitive) {
        if (this.config.encryptSensitiveData) {
          sanitized[key] = SecurityUtils.hashForLogging(String(value));
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof value === 'string') {
        sanitized[key] = SecurityUtils.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMetadata(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private async logCriticalEvent(event: AuditEvent): Promise<void> {
    logger.error('Critical audit event', {
      auditEvent: event,
      context: 'audit_logging'
    });

    // Send real-time alerts for critical events
    if (this.config.realTimeAlerting) {
      await this.sendRealTimeAlert(event);
    }
  }

  private async sendRealTimeAlert(event: AuditEvent): Promise<void> {
    // This would integrate with your alerting system (email, Slack, etc.)
    logger.warn('Real-time security alert triggered', {
      event: {
        action: event.action,
        userId: event.userId,
        outcome: event.outcome,
        riskLevel: event.riskLevel,
        timestamp: event.timestamp.toISOString()
      },
      context: 'security_alert'
    });
  }

  private logToStandardLogger(event: AuditEvent): void {
    const logLevel = this.getLogLevel(event.riskLevel, event.outcome);
    
    const logData = {
      audit: {
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        outcome: event.outcome,
        riskLevel: event.riskLevel,
        userId: event.userId,
        timestamp: event.timestamp.toISOString(),
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent ? event.userAgent.substring(0, 200) : undefined,
        metadata: event.metadata,
        details: event.details
      },
      context: 'audit_logging'
    };

    switch (logLevel) {
      case 'error':
        logger.error('Audit event', logData);
        break;
      case 'warn':
        logger.warn('Audit event', logData);
        break;
      case 'info':
        logger.info('Audit event', logData);
        break;
      default:
        logger.debug('Audit event', logData);
    }
  }

  private getLogLevel(riskLevel: string, outcome: string): 'error' | 'warn' | 'info' | 'debug' {
    if (riskLevel === 'critical' || outcome === 'blocked') {
      return 'error';
    }
    if (riskLevel === 'high' || outcome === 'failure') {
      return 'warn';
    }
    if (riskLevel === 'medium') {
      return 'info';
    }
    return 'debug';
  }

  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // In a real implementation, you would send these to a secure audit log store
      // For now, we'll just log them in batches
      logger.info('Audit events batch', {
        events: eventsToFlush.map(event => ({
          action: event.action,
          resource: event.resource,
          outcome: event.outcome,
          riskLevel: event.riskLevel,
          timestamp: event.timestamp.toISOString()
        })),
        count: eventsToFlush.length,
        context: 'audit_logging'
      });
    } catch (error) {
      logger.error('Failed to flush audit events', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventCount: eventsToFlush.length,
        context: 'audit_logging'
      });

      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  public async getAuditTrail(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    outcome?: string;
    riskLevel?: string;
  }): Promise<AuditEvent[]> {
    // In a real implementation, this would query your audit log store
    // For now, return empty array as this is a client-side implementation
    logger.info('Audit trail requested', {
      filters,
      context: 'audit_logging'
    });
    
    return [];
  }

  public async exportAuditLog(format: 'json' | 'csv' = 'json'): Promise<string> {
    // In a real implementation, this would export from your audit log store
    logger.info('Audit log export requested', {
      format,
      context: 'audit_logging'
    });
    
    return format === 'json' ? '[]' : '';
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush remaining events
    this.flushBuffer();
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger();

// Convenience functions for common audit events
export const auditAuth = {
  login: (userId: string, outcome: 'success' | 'failure', metadata?: Record<string, any>) => {
    auditLogger.logEvent({
      userId,
      action: 'auth.login',
      resource: 'authentication',
      outcome,
      riskLevel: outcome === 'failure' ? 'medium' : 'low',
      metadata
    });
  },

  logout: (userId: string) => {
    auditLogger.logEvent({
      userId,
      action: 'auth.logout',
      resource: 'authentication',
      outcome: 'success',
      riskLevel: 'low'
    });
  },

  passwordChange: (userId: string, outcome: 'success' | 'failure') => {
    auditLogger.logEvent({
      userId,
      action: 'auth.password_change',
      resource: 'user_account',
      outcome,
      riskLevel: 'medium'
    });
  },

  failedLogin: (userId: string, ipAddress?: string, userAgent?: string) => {
    auditLogger.logEvent({
      userId,
      action: 'security.failed_login',
      resource: 'authentication',
      outcome: 'blocked',
      riskLevel: 'medium',
      ipAddress,
      userAgent
    });
  }
};

export const auditData = {
  create: (userId: string, resource: string, resourceId: string, metadata?: Record<string, any>) => {
    auditLogger.logEvent({
      userId,
      action: 'data.create',
      resource,
      resourceId,
      outcome: 'success',
      riskLevel: 'low',
      metadata
    });
  },

  read: (userId: string, resource: string, resourceId: string, metadata?: Record<string, any>) => {
    auditLogger.logEvent({
      userId,
      action: 'data.read',
      resource,
      resourceId,
      outcome: 'success',
      riskLevel: 'low',
      metadata
    });
  },

  update: (userId: string, resource: string, resourceId: string, metadata?: Record<string, any>) => {
    auditLogger.logEvent({
      userId,
      action: 'data.update',
      resource,
      resourceId,
      outcome: 'success',
      riskLevel: 'low',
      metadata
    });
  },

  delete: (userId: string, resource: string, resourceId: string, metadata?: Record<string, any>) => {
    auditLogger.logEvent({
      userId,
      action: 'data.delete',
      resource,
      resourceId,
      outcome: 'success',
      riskLevel: 'medium',
      metadata
    });
  }
};

export const auditSecurity = {
  suspiciousActivity: (userId: string, details: string, metadata?: Record<string, any>) => {
    auditLogger.logEvent({
      userId,
      action: 'security.suspicious_activity',
      resource: 'security',
      outcome: 'blocked',
      riskLevel: 'high',
      details,
      metadata
    });
  },

  rateLimitExceeded: (userId: string, action: string, metadata?: Record<string, any>) => {
    auditLogger.logEvent({
      userId,
      action: 'security.rate_limit_exceeded',
      resource: 'rate_limiting',
      outcome: 'blocked',
      riskLevel: 'medium',
      details: `Rate limit exceeded for action: ${action}`,
      metadata
    });
  }
};

export const auditFile = {
  upload: (userId: string, fileName: string, fileSize: number, outcome: 'success' | 'failure' | 'blocked') => {
    auditLogger.logEvent({
      userId,
      action: 'file.upload',
      resource: 'file_system',
      resourceId: fileName,
      outcome,
      riskLevel: outcome === 'blocked' ? 'high' : 'low',
      metadata: {
        fileName,
        fileSize
      }
    });
  },

  download: (userId: string, fileName: string) => {
    auditLogger.logEvent({
      userId,
      action: 'file.download',
      resource: 'file_system',
      resourceId: fileName,
      outcome: 'success',
      riskLevel: 'low',
      metadata: {
        fileName
      }
    });
  },

  delete: (userId: string, fileName: string) => {
    auditLogger.logEvent({
      userId,
      action: 'file.delete',
      resource: 'file_system',
      resourceId: fileName,
      outcome: 'success',
      riskLevel: 'medium',
      metadata: {
        fileName
      }
    });
  }
};
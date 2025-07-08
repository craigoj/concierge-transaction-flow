import { logger } from './logger';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (userId: string, action: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (userId: string, action: string) => void;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private config: RateLimitConfig) {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.store.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug('Rate limiter cleanup completed', {
        removedEntries: expiredKeys.length,
        remainingEntries: this.store.size,
        context: 'rate_limiting'
      });
    }
  }

  public checkLimit(userId: string, action: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(userId, action)
      : `${userId}:${action}`;

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const resetTime = now + this.config.windowMs;
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime,
        firstRequest: now
      };
      
      this.store.set(key, newEntry);
      
      logger.debug('Rate limit check: new window started', {
        userId,
        action,
        resetTime: new Date(resetTime).toISOString(),
        context: 'rate_limiting'
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      };
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      logger.warn('Rate limit exceeded', {
        userId,
        action,
        count: entry.count,
        maxRequests: this.config.maxRequests,
        retryAfter,
        context: 'rate_limiting'
      });

      if (this.config.onLimitReached) {
        this.config.onLimitReached(userId, action);
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    logger.debug('Rate limit check: request allowed', {
      userId,
      action,
      count: entry.count,
      remaining: this.config.maxRequests - entry.count,
      context: 'rate_limiting'
    });

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  public recordSuccess(userId: string, action: string): void {
    if (this.config.skipSuccessfulRequests) {
      const key = this.config.keyGenerator 
        ? this.config.keyGenerator(userId, action)
        : `${userId}:${action}`;
      
      const entry = this.store.get(key);
      if (entry && entry.count > 0) {
        entry.count--;
        this.store.set(key, entry);
        
        logger.debug('Rate limit: successful request removed from count', {
          userId,
          action,
          newCount: entry.count,
          context: 'rate_limiting'
        });
      }
    }
  }

  public recordFailure(userId: string, action: string): void {
    if (this.config.skipFailedRequests) {
      const key = this.config.keyGenerator 
        ? this.config.keyGenerator(userId, action)
        : `${userId}:${action}`;
      
      const entry = this.store.get(key);
      if (entry && entry.count > 0) {
        entry.count--;
        this.store.set(key, entry);
        
        logger.debug('Rate limit: failed request removed from count', {
          userId,
          action,
          newCount: entry.count,
          context: 'rate_limiting'
        });
      }
    }
  }

  public getStats(): {
    totalEntries: number;
    activeUsers: number;
    topActions: Array<{ action: string; count: number }>;
  } {
    const actionCounts = new Map<string, number>();
    const activeUsers = new Set<string>();

    for (const [key, entry] of this.store.entries()) {
      const [userId, action] = key.split(':');
      activeUsers.add(userId);
      
      const currentCount = actionCounts.get(action) || 0;
      actionCounts.set(action, currentCount + entry.count);
    }

    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEntries: this.store.size,
      activeUsers: activeUsers.size,
      topActions
    };
  }

  public reset(userId?: string, action?: string): void {
    if (userId && action) {
      const key = this.config.keyGenerator 
        ? this.config.keyGenerator(userId, action)
        : `${userId}:${action}`;
      
      this.store.delete(key);
      
      logger.info('Rate limit reset for specific user and action', {
        userId,
        action,
        context: 'rate_limiting'
      });
    } else if (userId) {
      // Reset all actions for a specific user
      const keysToDelete: string[] = [];
      
      for (const key of this.store.keys()) {
        if (key.startsWith(`${userId}:`)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.store.delete(key));
      
      logger.info('Rate limit reset for user', {
        userId,
        resetCount: keysToDelete.length,
        context: 'rate_limiting'
      });
    } else {
      // Reset everything
      const previousSize = this.store.size;
      this.store.clear();
      
      logger.info('Rate limit reset for all users', {
        resetCount: previousSize,
        context: 'rate_limiting'
      });
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Pre-configured rate limiters for common use cases
export const createStandardRateLimiter = (): RateLimiter => {
  return new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    onLimitReached: (userId, action) => {
      logger.warn('Standard rate limit exceeded', {
        userId,
        action,
        context: 'rate_limiting'
      });
    }
  });
};

export const createStrictRateLimiter = (): RateLimiter => {
  return new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
    onLimitReached: (userId, action) => {
      logger.warn('Strict rate limit exceeded', {
        userId,
        action,
        context: 'rate_limiting'
      });
    }
  });
};

export const createFormSubmissionRateLimiter = (): RateLimiter => {
  return new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    skipSuccessfulRequests: true, // Don't count successful submissions
    onLimitReached: (userId, action) => {
      logger.warn('Form submission rate limit exceeded', {
        userId,
        action,
        context: 'rate_limiting'
      });
    }
  });
};

export const createAuthenticationRateLimiter = (): RateLimiter => {
  return new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: true, // Don't count successful logins
    onLimitReached: (userId, action) => {
      logger.warn('Authentication rate limit exceeded', {
        userId,
        action,
        context: 'rate_limiting'
      });
    }
  });
};

// Global rate limiter instances
export const standardRateLimiter = createStandardRateLimiter();
export const strictRateLimiter = createStrictRateLimiter();
export const formSubmissionRateLimiter = createFormSubmissionRateLimiter();
export const authenticationRateLimiter = createAuthenticationRateLimiter();

// Utility function to check rate limits in components
export const checkRateLimit = (
  userId: string,
  action: string,
  rateLimiter: RateLimiter = standardRateLimiter
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}> => {
  return Promise.resolve(rateLimiter.checkLimit(userId, action));
};

// Higher-order function to wrap API calls with rate limiting
export const withRateLimit = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  rateLimiter: RateLimiter = standardRateLimiter
) => {
  return async (userId: string, action: string, ...args: T): Promise<R> => {
    const limitCheck = rateLimiter.checkLimit(userId, action);
    
    if (!limitCheck.allowed) {
      const error = new Error('Rate limit exceeded');
      (error as any).rateLimitInfo = limitCheck;
      throw error;
    }

    try {
      const result = await fn(...args);
      rateLimiter.recordSuccess(userId, action);
      return result;
    } catch (error) {
      rateLimiter.recordFailure(userId, action);
      throw error;
    }
  };
};
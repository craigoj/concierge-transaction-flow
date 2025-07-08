import { SecurityUtils } from './security-utils';
import { logger } from './logger';
import { auditSecurity } from './audit-logging';

export interface CSRFConfig {
  tokenName: string;
  tokenLength: number;
  sessionStorageKey: string;
  expirationMinutes: number;
  sameSitePolicy: 'strict' | 'lax' | 'none';
  secureOnly: boolean;
}

export interface CSRFToken {
  token: string;
  expiresAt: number;
  createdAt: number;
  userId?: string;
  sessionId?: string;
}

export class CSRFProtection {
  private config: CSRFConfig;
  private tokens: Map<string, CSRFToken> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = {
      tokenName: 'csrf_token',
      tokenLength: 32,
      sessionStorageKey: 'csrf_tokens',
      expirationMinutes: 60,
      sameSitePolicy: 'strict',
      secureOnly: true,
      ...config
    };

    // Clean up expired tokens every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 10 * 60 * 1000);

    // Load existing tokens from session storage
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    try {
      const storedTokens = sessionStorage.getItem(this.config.sessionStorageKey);
      if (storedTokens) {
        const parsed = JSON.parse(storedTokens);
        for (const [key, token] of Object.entries(parsed)) {
          this.tokens.set(key, token as CSRFToken);
        }
        
        logger.debug('CSRF tokens loaded from session storage', {
          tokenCount: this.tokens.size,
          context: 'csrf_protection'
        });
      }
    } catch (error) {
      logger.warn('Failed to load CSRF tokens from session storage', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'csrf_protection'
      });
    }
  }

  private saveTokensToStorage(): void {
    try {
      const tokensObject = Object.fromEntries(this.tokens);
      sessionStorage.setItem(this.config.sessionStorageKey, JSON.stringify(tokensObject));
    } catch (error) {
      logger.warn('Failed to save CSRF tokens to session storage', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'csrf_protection'
      });
    }
  }

  private cleanupExpiredTokens(): void {
    const now = Date.now();
    const expiredTokens: string[] = [];

    for (const [tokenId, token] of this.tokens.entries()) {
      if (now > token.expiresAt) {
        expiredTokens.push(tokenId);
      }
    }

    expiredTokens.forEach(tokenId => this.tokens.delete(tokenId));

    if (expiredTokens.length > 0) {
      logger.debug('Expired CSRF tokens cleaned up', {
        expiredCount: expiredTokens.length,
        remainingCount: this.tokens.size,
        context: 'csrf_protection'
      });
      
      this.saveTokensToStorage();
    }
  }

  public generateToken(userId?: string, sessionId?: string): string {
    const token = SecurityUtils.generateSecureToken(this.config.tokenLength);
    const now = Date.now();
    const expiresAt = now + (this.config.expirationMinutes * 60 * 1000);

    const csrfToken: CSRFToken = {
      token,
      expiresAt,
      createdAt: now,
      userId,
      sessionId
    };

    this.tokens.set(token, csrfToken);
    this.saveTokensToStorage();

    logger.debug('CSRF token generated', {
      tokenId: SecurityUtils.hashForLogging(token),
      userId,
      sessionId,
      expiresAt: new Date(expiresAt).toISOString(),
      context: 'csrf_protection'
    });

    return token;
  }

  public validateToken(
    token: string,
    userId?: string,
    sessionId?: string
  ): {
    isValid: boolean;
    reason?: string;
    token?: CSRFToken;
  } {
    if (!token || typeof token !== 'string') {
      logger.warn('CSRF validation failed: missing or invalid token', {
        tokenProvided: !!token,
        context: 'csrf_protection'
      });
      
      return {
        isValid: false,
        reason: 'Missing or invalid token'
      };
    }

    const csrfToken = this.tokens.get(token);
    if (!csrfToken) {
      logger.warn('CSRF validation failed: token not found', {
        tokenId: SecurityUtils.hashForLogging(token),
        context: 'csrf_protection'
      });
      
      if (userId) {
        auditSecurity.suspiciousActivity(
          userId,
          'Invalid CSRF token used',
          { tokenId: SecurityUtils.hashForLogging(token) }
        );
      }
      
      return {
        isValid: false,
        reason: 'Token not found or expired'
      };
    }

    const now = Date.now();
    if (now > csrfToken.expiresAt) {
      logger.warn('CSRF validation failed: token expired', {
        tokenId: SecurityUtils.hashForLogging(token),
        expiresAt: new Date(csrfToken.expiresAt).toISOString(),
        context: 'csrf_protection'
      });
      
      // Remove expired token
      this.tokens.delete(token);
      this.saveTokensToStorage();
      
      return {
        isValid: false,
        reason: 'Token expired'
      };
    }

    // Validate user association if provided
    if (userId && csrfToken.userId && csrfToken.userId !== userId) {
      logger.warn('CSRF validation failed: user mismatch', {
        tokenId: SecurityUtils.hashForLogging(token),
        expectedUserId: userId,
        tokenUserId: csrfToken.userId,
        context: 'csrf_protection'
      });
      
      auditSecurity.suspiciousActivity(
        userId,
        'CSRF token user mismatch',
        { 
          tokenId: SecurityUtils.hashForLogging(token),
          expectedUserId: userId,
          tokenUserId: csrfToken.userId
        }
      );
      
      return {
        isValid: false,
        reason: 'Token user mismatch'
      };
    }

    // Validate session association if provided
    if (sessionId && csrfToken.sessionId && csrfToken.sessionId !== sessionId) {
      logger.warn('CSRF validation failed: session mismatch', {
        tokenId: SecurityUtils.hashForLogging(token),
        expectedSessionId: sessionId,
        tokenSessionId: csrfToken.sessionId,
        context: 'csrf_protection'
      });
      
      if (userId) {
        auditSecurity.suspiciousActivity(
          userId,
          'CSRF token session mismatch',
          { 
            tokenId: SecurityUtils.hashForLogging(token),
            expectedSessionId: sessionId,
            tokenSessionId: csrfToken.sessionId
          }
        );
      }
      
      return {
        isValid: false,
        reason: 'Token session mismatch'
      };
    }

    logger.debug('CSRF token validated successfully', {
      tokenId: SecurityUtils.hashForLogging(token),
      userId,
      sessionId,
      context: 'csrf_protection'
    });

    return {
      isValid: true,
      token: csrfToken
    };
  }

  public refreshToken(oldToken: string, userId?: string, sessionId?: string): string | null {
    const validation = this.validateToken(oldToken, userId, sessionId);
    
    if (!validation.isValid) {
      return null;
    }

    // Remove old token
    this.tokens.delete(oldToken);
    
    // Generate new token
    const newToken = this.generateToken(userId, sessionId);
    
    logger.debug('CSRF token refreshed', {
      oldTokenId: SecurityUtils.hashForLogging(oldToken),
      newTokenId: SecurityUtils.hashForLogging(newToken),
      userId,
      sessionId,
      context: 'csrf_protection'
    });

    return newToken;
  }

  public revokeToken(token: string): void {
    const removed = this.tokens.delete(token);
    
    if (removed) {
      this.saveTokensToStorage();
      
      logger.debug('CSRF token revoked', {
        tokenId: SecurityUtils.hashForLogging(token),
        context: 'csrf_protection'
      });
    }
  }

  public revokeAllTokens(userId?: string, sessionId?: string): void {
    const tokensToRevoke: string[] = [];

    for (const [tokenId, token] of this.tokens.entries()) {
      let shouldRevoke = false;

      if (userId && token.userId === userId) {
        shouldRevoke = true;
      } else if (sessionId && token.sessionId === sessionId) {
        shouldRevoke = true;
      } else if (!userId && !sessionId) {
        shouldRevoke = true;
      }

      if (shouldRevoke) {
        tokensToRevoke.push(tokenId);
      }
    }

    tokensToRevoke.forEach(tokenId => this.tokens.delete(tokenId));

    if (tokensToRevoke.length > 0) {
      this.saveTokensToStorage();
      
      logger.info('CSRF tokens revoked', {
        revokedCount: tokensToRevoke.length,
        userId,
        sessionId,
        context: 'csrf_protection'
      });
    }
  }

  public getTokenStats(): {
    totalTokens: number;
    activeTokens: number;
    expiredTokens: number;
    tokensByUser: Record<string, number>;
  } {
    const now = Date.now();
    let activeTokens = 0;
    let expiredTokens = 0;
    const tokensByUser: Record<string, number> = {};

    for (const token of this.tokens.values()) {
      if (now > token.expiresAt) {
        expiredTokens++;
      } else {
        activeTokens++;
      }

      if (token.userId) {
        tokensByUser[token.userId] = (tokensByUser[token.userId] || 0) + 1;
      }
    }

    return {
      totalTokens: this.tokens.size,
      activeTokens,
      expiredTokens,
      tokensByUser
    };
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.tokens.clear();
    
    try {
      sessionStorage.removeItem(this.config.sessionStorageKey);
    } catch (error) {
      logger.warn('Failed to clear CSRF tokens from session storage', {
        error: error instanceof Error ? error.message : 'Unknown error',
        context: 'csrf_protection'
      });
    }
  }
}

// Global CSRF protection instance
export const csrfProtection = new CSRFProtection();

// React hook for CSRF protection
export const useCSRFProtection = () => {
  const generateToken = (userId?: string, sessionId?: string): string => {
    return csrfProtection.generateToken(userId, sessionId);
  };

  const validateToken = (
    token: string,
    userId?: string,
    sessionId?: string
  ): { isValid: boolean; reason?: string } => {
    return csrfProtection.validateToken(token, userId, sessionId);
  };

  const refreshToken = (
    oldToken: string,
    userId?: string,
    sessionId?: string
  ): string | null => {
    return csrfProtection.refreshToken(oldToken, userId, sessionId);
  };

  const revokeToken = (token: string): void => {
    csrfProtection.revokeToken(token);
  };

  return {
    generateToken,
    validateToken,
    refreshToken,
    revokeToken
  };
};

// Higher-order component for CSRF protection
export const withCSRFProtection = <T extends Record<string, any>>(
  Component: React.ComponentType<T>
) => {
  return React.forwardRef<any, T>((props, ref) => {
    const csrfMethods = useCSRFProtection();
    
    return (
      <Component
        {...props}
        ref={ref}
        csrf={csrfMethods}
      />
    );
  });
};

// Utility functions for form protection
export const addCSRFTokenToForm = (
  formData: FormData,
  token: string,
  tokenName: string = 'csrf_token'
): void => {
  formData.append(tokenName, token);
};

export const addCSRFTokenToHeaders = (
  headers: Record<string, string>,
  token: string,
  headerName: string = 'X-CSRF-Token'
): Record<string, string> => {
  return {
    ...headers,
    [headerName]: token
  };
};

export const validateCSRFFromRequest = (
  request: Request,
  userId?: string,
  sessionId?: string
): { isValid: boolean; reason?: string } => {
  // Try to get token from header first
  let token = request.headers.get('X-CSRF-Token');
  
  // If not in header, try to get from form data
  if (!token && request.body) {
    // This would need to be implemented based on your specific request handling
    // For now, we'll assume the token is passed via header
  }

  if (!token) {
    return {
      isValid: false,
      reason: 'CSRF token not found in request'
    };
  }

  return csrfProtection.validateToken(token, userId, sessionId);
};
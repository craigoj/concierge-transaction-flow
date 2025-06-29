import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useAuth } from '@/integrations/supabase/auth';
import { FormRateLimiter, CSRFTokenManager, FieldEncryption } from '@/lib/validation/securityUtils';

interface ValidationCache {
  [key: string]: {
    result: string | null;
    timestamp: number;
    ttl: number;
  };
}

interface ValidationMetrics {
  totalValidations: number;
  errorRate: number;
  averageValidationTime: number;
  popularErrors: Record<string, number>;
}

interface BatchValidationRequest {
  field: string;
  value: any;
  schema: z.ZodSchema<any>;
  priority: 'high' | 'medium' | 'low';
}

export const useAdvancedFormValidation = (formId: string) => {
  const { user } = useAuth();
  const [validationCache, setValidationCache] = useState<ValidationCache>({});
  const [metrics, setMetrics] = useState<ValidationMetrics>({
    totalValidations: 0,
    errorRate: 0,
    averageValidationTime: 0,
    popularErrors: {}
  });
  const [isRateLimited, setIsRateLimited] = useState(false);
  const batchQueue = useRef<BatchValidationRequest[]>([]);
  const batchTimer = useRef<NodeJS.Timeout>();

  // Progressive validation with caching
  const validateFieldProgressive = useCallback(async (
    field: string,
    value: any,
    schema: z.ZodSchema<any>,
    options: {
      cache?: boolean;
      ttl?: number;
      encrypt?: boolean;
    } = {}
  ) => {
    const startTime = Date.now();
    const cacheKey = `${field}_${JSON.stringify(value)}_${user?.id}`;
    
    // Check cache first
    if (options.cache !== false) {
      const cached = validationCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < (cached.ttl || 60000)) {
        return cached.result;
      }
    }

    // Rate limiting check
    if (!FormRateLimiter.canSubmit(`${formId}_${field}`)) {
      setIsRateLimited(true);
      return 'Rate limit exceeded. Please slow down.';
    }

    try {
      // Client-side validation
      const processedValue = options.encrypt && FieldEncryption.shouldEncrypt(field) 
        ? FieldEncryption.encrypt(String(value))
        : value;

      schema.parse(processedValue);

      // Cache successful validation
      if (options.cache !== false) {
        setValidationCache(prev => ({
          ...prev,
          [cacheKey]: {
            result: null,
            timestamp: Date.now(),
            ttl: options.ttl || 60000
          }
        }));
      }

      // Update metrics
      const validationTime = Date.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        totalValidations: prev.totalValidations + 1,
        averageValidationTime: (prev.averageValidationTime + validationTime) / 2
      }));

      return null;
    } catch (error) {
      const errorMessage = error instanceof z.ZodError 
        ? error.errors[0]?.message || 'Validation failed'
        : 'Validation error';

      // Cache error result
      if (options.cache !== false) {
        setValidationCache(prev => ({
          ...prev,
          [cacheKey]: {
            result: errorMessage,
            timestamp: Date.now(),
            ttl: options.ttl || 30000 // Shorter TTL for errors
          }
        }));
      }

      // Update error metrics
      setMetrics(prev => ({
        ...prev,
        totalValidations: prev.totalValidations + 1,
        errorRate: (prev.errorRate + 1) / prev.totalValidations,
        popularErrors: {
          ...prev.popularErrors,
          [errorMessage]: (prev.popularErrors[errorMessage] || 0) + 1
        }
      }));

      return errorMessage;
    }
  }, [formId, user?.id, validationCache]);

  // Batch validation for performance
  const addToBatch = useCallback((request: BatchValidationRequest) => {
    batchQueue.current.push(request);

    // Clear existing timer
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    // Process batch after delay or when queue is full
    batchTimer.current = setTimeout(() => {
      processBatch();
    }, batchQueue.current.length >= 5 ? 100 : 500);
  }, []);

  const processBatch = useCallback(async () => {
    if (batchQueue.current.length === 0) return;

    const batch = [...batchQueue.current];
    batchQueue.current = [];

    // Sort by priority
    batch.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Process in parallel with concurrency limit
    const concurrencyLimit = 3;
    for (let i = 0; i < batch.length; i += concurrencyLimit) {
      const chunk = batch.slice(i, i + concurrencyLimit);
      await Promise.all(
        chunk.map(request => 
          validateFieldProgressive(request.field, request.value, request.schema)
        )
      );
    }
  }, [validateFieldProgressive]);

  // Smart validation suggestions based on local storage (simplified)
  const getValidationSuggestions = useCallback(async (field: string, value: string) => {
    if (!user?.id || value.length < 2) return [];

    try {
      // Use local storage for suggestions since form_analytics table doesn't exist
      const storageKey = `validation_suggestions_${user.id}_${field}`;
      const stored = localStorage.getItem(storageKey);
      const suggestions = stored ? JSON.parse(stored) : [];
      
      return suggestions
        .filter((s: string) => s.toLowerCase().includes(value.toLowerCase()) && s !== value)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting validation suggestions:', error);
      return [];
    }
  }, [user?.id]);

  // Store successful values for future suggestions
  const storeSuccessfulValue = useCallback((field: string, value: string) => {
    if (!user?.id || !value) return;

    try {
      const storageKey = `validation_suggestions_${user.id}_${field}`;
      const stored = localStorage.getItem(storageKey);
      const suggestions = stored ? JSON.parse(stored) : [];
      
      if (!suggestions.includes(value)) {
        suggestions.push(value);
        // Keep only last 10 suggestions
        const limited = suggestions.slice(-10);
        localStorage.setItem(storageKey, JSON.stringify(limited));
      }
    } catch (error) {
      console.error('Error storing validation suggestion:', error);
    }
  }, [user?.id]);

  // Contextual validation based on user role and location
  const getContextualValidation = useCallback((field: string, value: any) => {
    const context = {
      userRole: user?.user_metadata?.role,
      userLocation: user?.user_metadata?.location,
      formType: formId,
      timestamp: new Date()
    };

    // Role-based validation rules
    const roleBasedRules: Record<string, (value: any) => string | null> = {
      agent: (val) => {
        if (field === 'commission_rate' && (val < 0.01 || val > 0.06)) {
          return 'Commission rate should be between 1% and 6% for agents';
        }
        return null;
      },
      coordinator: (val) => {
        if (field === 'priority' && val === 'critical' && context.userRole !== 'coordinator') {
          return 'Only coordinators can set critical priority';
        }
        return null;
      }
    };

    const roleRule = roleBasedRules[context.userRole];
    return roleRule ? roleRule(value) : null;
  }, [user, formId]);

  // CSRF protection
  const getCSRFToken = useCallback(() => {
    return CSRFTokenManager.getToken() || CSRFTokenManager.generateToken();
  }, []);

  const validateCSRFToken = useCallback((token: string) => {
    return CSRFTokenManager.validateToken(token);
  }, []);

  // Clear cache when user changes or form unmounts
  useEffect(() => {
    return () => {
      setValidationCache({});
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }
    };
  }, [user?.id]);

  return {
    validateFieldProgressive,
    addToBatch,
    getValidationSuggestions,
    getContextualValidation,
    getCSRFToken,
    validateCSRFToken,
    storeSuccessfulValue,
    metrics,
    isRateLimited,
    remainingAttempts: FormRateLimiter.getRemainingAttempts(formId),
    timeUntilReset: FormRateLimiter.getTimeUntilReset(formId),
    clearCache: () => setValidationCache({})
  };
};

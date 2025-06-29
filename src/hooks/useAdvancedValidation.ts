
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/validation/validators';

interface ValidationRule {
  field: string;
  schema: z.ZodSchema<any>;
  serverValidator?: (value: any, context?: Record<string, any>) => Promise<string | null>;
  crossFieldDependencies?: string[];
}

interface ValidationOptions {
  rules: ValidationRule[];
  debounceMs?: number;
  enableServerValidation?: boolean;
  enableCaching?: number; // Cache TTL in milliseconds
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  isValidating: Record<string, boolean>;
}

export const useAdvancedValidation = (options: ValidationOptions) => {
  const { user } = useAuth();
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    warnings: {},
    isValidating: {}
  });

  const validationCache = useRef<Map<string, { result: string | null; timestamp: number }>>(new Map());
  const rateLimitTracker = useRef<Map<string, number[]>>(new Map());
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const checkRateLimit = useCallback((field: string): boolean => {
    if (!options.rateLimitConfig) return true;

    const now = Date.now();
    const { maxRequests, windowMs } = options.rateLimitConfig;
    const requests = rateLimitTracker.current.get(field) || [];
    
    // Clean old requests
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    rateLimitTracker.current.set(field, validRequests);
    return true;
  }, [options.rateLimitConfig]);

  const getCachedResult = useCallback((key: string): string | null | undefined => {
    if (!options.enableCaching) return undefined;

    const cached = validationCache.current.get(key);
    if (cached && Date.now() - cached.timestamp < options.enableCaching) {
      return cached.result;
    }
    return undefined;
  }, [options.enableCaching]);

  const setCachedResult = useCallback((key: string, result: string | null) => {
    if (!options.enableCaching) return;
    
    validationCache.current.set(key, {
      result,
      timestamp: Date.now()
    });
  }, [options.enableCaching]);

  const validateField = useCallback(async (
    field: string, 
    value: any, 
    context?: Record<string, any>
  ): Promise<void> => {
    const rule = options.rules.find(r => r.field === field);
    if (!rule) return;

    // Clear existing timer
    const existingTimer = debounceTimers.current.get(field);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set validating state
    setResult(prev => ({
      ...prev,
      isValidating: { ...prev.isValidating, [field]: true }
    }));

    const validateAsync = async () => {
      try {
        let error: string | null = null;
        let warning: string | null = null;

        // Client-side validation with sanitization
        const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
        
        try {
          rule.schema.parse(sanitizedValue);
        } catch (zodError) {
          if (zodError instanceof z.ZodError) {
            error = zodError.errors[0]?.message || 'Validation failed';
          }
        }

        // Server-side validation if enabled and no client errors
        if (!error && options.enableServerValidation && rule.serverValidator && user) {
          if (!checkRateLimit(field)) {
            warning = 'Too many validation requests. Please slow down.';
          } else {
            const cacheKey = `${field}_${JSON.stringify(sanitizedValue)}_${user.id}`;
            const cachedResult = getCachedResult(cacheKey);
            
            if (cachedResult !== undefined) {
              error = cachedResult;
            } else {
              try {
                const serverError = await rule.serverValidator(sanitizedValue, context);
                error = serverError;
                setCachedResult(cacheKey, serverError);
              } catch (serverValidationError) {
                console.error('Server validation error:', serverValidationError);
                warning = 'Unable to validate with server. Please check your connection.';
              }
            }
          }
        }

        // Update validation result
        setResult(prev => ({
          ...prev,
          errors: { ...prev.errors, [field]: error || '' },
          warnings: { ...prev.warnings, [field]: warning || '' },
          isValidating: { ...prev.isValidating, [field]: false },
          isValid: Object.values({ ...prev.errors, [field]: error || '' })
            .every(err => !err)
        }));

      } catch (validationError) {
        console.error('Validation error:', validationError);
        setResult(prev => ({
          ...prev,
          errors: { ...prev.errors, [field]: 'Validation failed' },
          isValidating: { ...prev.isValidating, [field]: false },
          isValid: false
        }));
      }
    };

    // Debounce validation
    const timer = setTimeout(validateAsync, options.debounceMs || 300);
    debounceTimers.current.set(field, timer);
  }, [options, user, checkRateLimit, getCachedResult, setCachedResult]);

  const validateAllFields = useCallback(async (data: Record<string, any>): Promise<boolean> => {
    const validationPromises = options.rules.map(rule => 
      validateField(rule.field, data[rule.field], data)
    );
    
    await Promise.all(validationPromises);
    
    // Wait for all validations to complete
    return new Promise((resolve) => {
      const checkComplete = () => {
        const isValidating = Object.values(result.isValidating).some(Boolean);
        if (!isValidating) {
          resolve(result.isValid);
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });
  }, [options.rules, validateField, result]);

  const clearValidation = useCallback((field?: string) => {
    if (field) {
      setResult(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: '' },
        warnings: { ...prev.warnings, [field]: '' },
        isValidating: { ...prev.isValidating, [field]: false }
      }));
    } else {
      setResult({
        isValid: true,
        errors: {},
        warnings: {},
        isValidating: {}
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
      debounceTimers.current.clear();
    };
  }, []);

  return {
    ...result,
    validateField,
    validateAllFields,
    clearValidation,
    hasErrors: Object.values(result.errors).some(Boolean),
    hasWarnings: Object.values(result.warnings).some(Boolean),
    isValidatingAny: Object.values(result.isValidating).some(Boolean)
  };
};

// Server validation functions
export const createUniqueValidation = (table: string, field: string) => {
  return async (value: any, context?: Record<string, any>): Promise<string | null> => {
    if (!value) return null;

    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .eq(field, value)
        .limit(1);

      if (error) {
        console.error('Unique validation error:', error);
        return null; // Don't fail validation due to server errors
      }

      return data && data.length > 0 ? `This ${field} is already in use` : null;
    } catch (error) {
      console.error('Unique validation error:', error);
      return null;
    }
  };
};

export const createBusinessRuleValidation = (
  rule: (value: any, context?: Record<string, any>) => boolean,
  errorMessage: string
) => {
  return async (value: any, context?: Record<string, any>): Promise<string | null> => {
    try {
      return rule(value, context) ? null : errorMessage;
    } catch (error) {
      console.error('Business rule validation error:', error);
      return null;
    }
  };
};

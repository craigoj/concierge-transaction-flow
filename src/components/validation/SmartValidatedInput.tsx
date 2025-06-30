
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, CheckCircle, Loader2, Lightbulb, Shield } from 'lucide-react';
import { useAdvancedFormValidation } from '@/hooks/useAdvancedFormValidation';
import { cn } from '@/lib/utils';
import { z } from 'zod';

interface SmartValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  schema: z.ZodSchema<any>;
  formId: string;
  enableSuggestions?: boolean;
  enableContextualValidation?: boolean;
  enableProgressiveValidation?: boolean;
  priority?: 'high' | 'medium' | 'low';
  securityLevel?: 'basic' | 'enhanced' | 'maximum';
  required?: boolean;
  description?: string;
}

export const SmartValidatedInput = ({
  name,
  label,
  value,
  onChange,
  schema,
  formId,
  enableSuggestions = true,
  enableContextualValidation = true,
  enableProgressiveValidation = true,
  priority = 'medium',
  securityLevel = 'enhanced',
  required = false,
  description,
  className,
  ...props
}: SmartValidatedInputProps) => {
  const {
    validateFieldProgressive,
    addToBatch,
    getValidationSuggestions,
    getContextualValidation,
    storeSuccessfulValue,
    metrics
  } = useAdvancedFormValidation(formId);

  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [validationHistory, setValidationHistory] = useState<string[]>([]);

  // Progressive validation as user types
  useEffect(() => {
    if (!enableProgressiveValidation || !hasBeenTouched || !value) return;

    const validateAsync = async () => {
      setIsValidating(true);
      
      try {
        // Client-side validation first
        const clientError = await validateFieldProgressive(name, value, schema, {
          cache: true,
          ttl: 60000,
          encrypt: securityLevel === 'maximum'
        });

        // Contextual validation
        let contextError = null;
        if (enableContextualValidation) {
          contextError = getContextualValidation(name, value);
        }

        const finalError = clientError || contextError;
        setError(finalError);

        // Store successful validation for suggestions
        if (!finalError) {
          storeSuccessfulValue(name, value);
        }

        // Track validation history for analytics
        setValidationHistory(prev => [...prev.slice(-4), finalError || 'success']);
        
      } catch (validationError) {
        console.error('Validation error:', validationError);
        setError('Validation failed');
      } finally {
        setIsValidating(false);
      }
    };

    const debounceTimer = setTimeout(validateAsync, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, name, schema, hasBeenTouched, enableProgressiveValidation, enableContextualValidation, validateFieldProgressive, getContextualValidation, storeSuccessfulValue, securityLevel]);

  // Get smart suggestions
  useEffect(() => {
    if (!enableSuggestions || !value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    const getSuggestions = async () => {
      try {
        const suggestions = await getValidationSuggestions(name, value);
        setSuggestions(suggestions.filter(s => s !== value));
      } catch (error) {
        console.error('Error getting suggestions:', error);
      }
    };

    const suggestionTimer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(suggestionTimer);
  }, [value, name, enableSuggestions, getValidationSuggestions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!hasBeenTouched) {
      setHasBeenTouched(true);
    }

    // Add to batch validation queue for non-critical fields
    if (priority !== 'high' && newValue) {
      addToBatch({
        field: name,
        value: newValue,
        schema,
        priority
      });
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (hasBeenTouched && value && !error) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return null;
  };

  const getSecurityIndicator = () => {
    if (securityLevel === 'maximum') {
      return <Shield className="h-3 w-3 text-green-600" />;
    }
    if (securityLevel === 'enhanced') {
      return <Shield className="h-3 w-3 text-blue-600" />;
    }
    return null;
  };

  const validationQuality = useMemo(() => {
    const recentValidations = validationHistory.slice(-3);
    const successRate = recentValidations.filter(v => v === 'success').length / recentValidations.length;
    
    if (successRate >= 0.8) return 'excellent';
    if (successRate >= 0.6) return 'good';
    if (successRate >= 0.4) return 'fair';
    return 'poor';
  }, [validationHistory]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
          {label} {required && <span className="text-red-500">*</span>}
          {getSecurityIndicator()}
        </Label>
        <div className="flex items-center gap-2">
          {getValidationIcon()}
          {validationHistory.length > 0 && (
            <Badge variant="outline" className={cn(
              'text-xs',
              validationQuality === 'excellent' && 'border-green-500 text-green-700',
              validationQuality === 'good' && 'border-blue-500 text-blue-700',
              validationQuality === 'fair' && 'border-yellow-500 text-yellow-700',
              validationQuality === 'poor' && 'border-red-500 text-red-700'
            )}>
              {validationQuality}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Popover open={showSuggestions && suggestions.length > 0}>
          <PopoverTrigger asChild>
            <Input
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              onFocus={() => {
                setHasBeenTouched(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className={cn(
                'font-brand-body transition-all duration-200',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                !error && hasBeenTouched && value && 'border-green-500 focus:border-green-500 focus:ring-green-500',
                isValidating && 'border-blue-500',
                className
              )}
              aria-invalid={!!error}
              aria-describedby={`${name}-description`}
              {...props}
            />
          </PopoverTrigger>
          
          {suggestions.length > 0 && (
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>No suggestions found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSuggestionSelect(suggestion)}
                        className="flex items-center gap-2"
                      >
                        <Lightbulb className="h-3 w-3 text-yellow-500" />
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      </div>
      
      {(error || description) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
          {description && !error && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}

      {/* Validation Analytics (dev mode only) */}
      {process.env.NODE_ENV === 'development' && metrics.totalValidations > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Validations: {metrics.totalValidations}</div>
          <div>Error Rate: {(metrics.errorRate * 100).toFixed(1)}%</div>
          <div>Avg Time: {metrics.averageValidationTime.toFixed(0)}ms</div>
        </div>
      )}
    </div>
  );
};

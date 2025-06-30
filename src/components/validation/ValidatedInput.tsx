
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useValidationContext } from './ValidationProvider';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  context?: Record<string, any>;
  required?: boolean;
  description?: string;
  showValidationStatus?: boolean;
}

export const ValidatedInput = ({
  name,
  label,
  value,
  onChange,
  context,
  required = false,
  description,
  showValidationStatus = true,
  className,
  ...props
}: ValidatedInputProps) => {
  const { validateField, errors, warnings, isValidating, clearValidation } = useValidationContext();
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  const error = errors[name];
  const warning = warnings[name];
  const isFieldValidating = isValidating[name];
  const hasError = hasBeenTouched && !!error;
  const hasWarning = hasBeenTouched && !!warning && !error;
  const isValid = hasBeenTouched && !error && !warning && !isFieldValidating;

  useEffect(() => {
    if (hasBeenTouched && value !== undefined) {
      validateField(name, value, context);
    }
  }, [name, value, context, validateField, hasBeenTouched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!hasBeenTouched) {
      setHasBeenTouched(true);
    }
  };

  const handleBlur = () => {
    if (!hasBeenTouched) {
      setHasBeenTouched(true);
    }
  };

  const handleFocus = () => {
    if (error || warning) {
      clearValidation(name);
    }
  };

  const getValidationIcon = () => {
    if (!showValidationStatus || !hasBeenTouched) return null;
    
    if (isFieldValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (hasError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (hasWarning) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    
    if (isValid && value) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return null;
  };

  const getValidationMessage = () => {
    if (!hasBeenTouched) return description;
    
    if (error) return error;
    if (warning) return warning;
    
    return description;
  };

  const getValidationMessageColor = () => {
    if (hasError) return 'text-red-600';
    if (hasWarning) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {getValidationIcon()}
      </div>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={cn(
            'font-brand-body transition-colors',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            hasWarning && 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
            isValid && 'border-green-500 focus:border-green-500 focus:ring-green-500',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={`${name}-description`}
          {...props}
        />
      </div>
      
      {getValidationMessage() && (
        <p 
          id={`${name}-description`} 
          className={cn('text-sm', getValidationMessageColor())}
        >
          {getValidationMessage()}
        </p>
      )}
    </div>
  );
};

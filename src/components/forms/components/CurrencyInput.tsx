
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DollarSign, AlertCircle } from 'lucide-react';

interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  id?: string;
}

export const CurrencyInput = ({
  label,
  value,
  onChange,
  placeholder = "0.00",
  error,
  required = false,
  disabled = false,
  className,
  min = 0,
  max,
  id
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number to currency display
  const formatCurrency = (num: number): string => {
    if (isNaN(num) || num === 0) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Parse currency string to number
  const parseCurrency = (str: string): number => {
    if (!str) return 0;
    // Remove all non-digit and non-decimal characters
    const cleaned = str.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const numericValue = parseCurrency(inputValue);
    
    // Validate range
    if (numericValue < min) {
      onChange(min);
    } else if (max && numericValue > max) {
      onChange(max);
    } else {
      onChange(numericValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number for easier editing
    if (value > 0) {
      setDisplayValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format back to currency display
    setDisplayValue(formatCurrency(value));
  };

  const hasError = !!error;
  const isValidValue = value >= min && (!max || value <= max);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={id}
          className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <DollarSign className={cn(
            "h-4 w-4 transition-colors",
            hasError ? "text-red-500" : "text-brand-charcoal/60"
          )} />
        </div>
        
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pl-10 font-mono text-right",
            hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
            !isValidValue && "border-orange-300 focus:border-orange-500 focus:ring-orange-500"
          )}
          aria-describedby={
            hasError ? `${id}-error` : 
            !isValidValue ? `${id}-warning` : undefined
          }
          aria-invalid={hasError}
        />
        
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {hasError && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      
      {!hasError && !isValidValue && (
        <p id={`${id}-warning`} className="text-sm text-orange-600">
          {value < min && `Amount must be at least $${formatCurrency(min)}`}
          {max && value > max && `Amount cannot exceed $${formatCurrency(max)}`}
        </p>
      )}

      {/* Accessibility helper text */}
      <p className="text-xs text-brand-charcoal/60">
        Enter amount in dollars (e.g., 50000 for $50,000.00)
      </p>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface SmartValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  fieldName: string;
  formContext?: Record<string, any>;
  className?: string;
  placeholder?: string;
  type?: string;
}

export const SmartValidatedInput: React.FC<SmartValidatedInputProps> = ({
  value,
  onChange,
  fieldName,
  formContext = {},
  className = '',
  placeholder,
  type = 'text'
}) => {
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const validateField = async () => {
      if (!value) {
        setValidationState('idle');
        setErrorMessage('');
        return;
      }

      setValidationState('validating');
      
      // Simple validation logic
      setTimeout(() => {
        if (value.length < 2) {
          setValidationState('invalid');
          setErrorMessage('Value must be at least 2 characters');
        } else {
          setValidationState('valid');
          setErrorMessage('');
        }
      }, 500);
    };

    const debounceTimer = setTimeout(validateField, 500);
    return () => clearTimeout(debounceTimer);
  }, [value, fieldName, formContext]);

  const getInputClassName = () => {
    const baseClasses = className;
    switch (validationState) {
      case 'validating':
        return `${baseClasses} border-yellow-300`;
      case 'valid':
        return `${baseClasses} border-green-300`;
      case 'invalid':
        return `${baseClasses} border-red-300`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={getInputClassName()}
        />
        
        {validationState === 'validating' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
          </div>
        )}
        
        {validationState === 'valid' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              ✓
            </Badge>
          </div>
        )}
      </div>
      
      {errorMessage && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

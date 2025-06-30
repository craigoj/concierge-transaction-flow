
import React, { createContext, useContext, ReactNode } from 'react';
import { useAdvancedValidation } from '@/hooks/useAdvancedValidation';
import { ValidationRule } from '@/hooks/useAdvancedValidation';

interface ValidationContextType {
  validateField: (field: string, value: any, context?: Record<string, any>) => Promise<void>;
  validateAllFields: (data: Record<string, any>) => Promise<boolean>;
  clearValidation: (field?: string) => void;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  isValidating: Record<string, boolean>;
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  isValidatingAny: boolean;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

interface ValidationProviderProps {
  children: ReactNode;
  rules: ValidationRule[];
  debounceMs?: number;
  enableServerValidation?: boolean;
  enableCaching?: number;
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
  };
}

export const ValidationProvider = ({ 
  children, 
  rules,
  debounceMs = 300,
  enableServerValidation = true,
  enableCaching = 60000, // 1 minute
  rateLimitConfig = { maxRequests: 10, windowMs: 60000 }
}: ValidationProviderProps) => {
  const validation = useAdvancedValidation({
    rules,
    debounceMs,
    enableServerValidation,
    enableCaching,
    rateLimitConfig
  });

  return (
    <ValidationContext.Provider value={validation}>
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidationContext = () => {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error('useValidationContext must be used within a ValidationProvider');
  }
  return context;
};

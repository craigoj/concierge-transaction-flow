
import React, { createContext, useContext, ReactNode, useState } from 'react';

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
}

export const ValidationProvider = ({ children }: ValidationProviderProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

  const validateField = async (field: string, value: any, context?: Record<string, any>) => {
    setIsValidating(prev => ({ ...prev, [field]: true }));
    
    try {
      // Simple validation logic
      if (!value || value.toString().length < 2) {
        setErrors(prev => ({ ...prev, [field]: 'Field must be at least 2 characters' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateAllFields = async (data: Record<string, any>) => {
    const fieldValidations = Object.keys(data).map(field => 
      validateField(field, data[field])
    );
    
    await Promise.all(fieldValidations);
    return Object.keys(errors).length === 0;
  };

  const clearValidation = (field?: string) => {
    if (field) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[field];
        return newWarnings;
      });
    } else {
      setErrors({});
      setWarnings({});
    }
  };

  const contextValue: ValidationContextType = {
    validateField,
    validateAllFields,
    clearValidation,
    errors,
    warnings,
    isValidating,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
    hasWarnings: Object.keys(warnings).length > 0,
    isValidatingAny: Object.values(isValidating).some(Boolean),
  };

  return (
    <ValidationContext.Provider value={contextValue}>
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


import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';

interface ValidationRule {
  field: string;
  validator: (value: any, allData?: Record<string, any>) => Promise<string | null>;
}

interface LiveValidationOptions {
  rules: ValidationRule[];
  debounceMs?: number;
}

export const useLiveValidation = ({ rules, debounceMs = 500 }: LiveValidationOptions) => {
  const { user } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

  const validateField = useCallback(async (field: string, value: any, allData?: Record<string, any>) => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return;

    setIsValidating(prev => ({ ...prev, [field]: true }));

    try {
      const error = await rule.validator(value, allData);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    } catch (error) {
      console.error(`Validation error for field ${field}:`, error);
      setErrors(prev => ({ ...prev, [field]: 'Validation failed' }));
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }
  }, [rules]);

  const validateAllFields = useCallback(async (data: Record<string, any>) => {
    const validationPromises = rules.map(rule => 
      validateField(rule.field, data[rule.field], data)
    );
    
    await Promise.all(validationPromises);
  }, [rules, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValidating({});
  }, []);

  const hasErrors = useMemo(() => 
    Object.values(errors).some(error => error && error.length > 0),
    [errors]
  );

  return {
    errors,
    isValidating,
    validateField,
    validateAllFields,
    clearErrors,
    hasErrors
  };
};

// Common validation functions
export const createEmailValidator = () => async (email: string): Promise<string | null> => {
  if (!email) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

export const createPhoneValidator = () => async (phone: string): Promise<string | null> => {
  if (!phone) return null;
  
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone format';
  }
  
  return null;
};

export const createDuplicateVendorValidator = (userId: string) => async (
  vendorData: any,
  allData?: Record<string, any>
): Promise<string | null> => {
  if (!vendorData?.company_name || !vendorData?.vendor_type) return null;

  try {
    const { data, error } = await supabase
      .from('agent_vendors')
      .select('id')
      .eq('agent_id', userId)
      .eq('vendor_type', vendorData.vendor_type)
      .eq('company_name', vendorData.company_name)
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      return 'This vendor is already in your list';
    }

    return null;
  } catch (error) {
    console.error('Duplicate vendor validation error:', error);
    return null;
  }
};

export const createTransactionConflictValidator = (userId: string) => async (
  propertyAddress: string,
  allData?: Record<string, any>
): Promise<string | null> => {
  if (!propertyAddress) return null;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('agent_id', userId)
      .eq('property_address', propertyAddress)
      .in('status', ['active', 'intake'])
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      return 'An active transaction already exists for this property';
    }

    return null;
  } catch (error) {
    console.error('Transaction conflict validation error:', error);
    return null;
  }
};

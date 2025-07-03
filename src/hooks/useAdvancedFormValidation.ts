import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ValidationOptions {
  debounceTime?: number;
  initialDelay?: number;
}

export const useAdvancedFormValidation = <T>(
  tableName: string,
  formId: string,
  options: ValidationOptions = {}
) => {
  const { debounceTime = 500, initialDelay = 1000 } = options;
  const { user } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

  const validateForm = useCallback(async (formData: T) => {
    if (!user?.id) {
      console.warn('User not authenticated, skipping validation.');
      return null;
    }

    setIsValidating(true);
    setValidationErrors(null);

    // Debounce and initial delay
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    try {
      const { data, error } = await supabase.functions.invoke('validate-form-data', {
        body: {
          table_name: tableName,
          form_id: formId,
          form_data: formData,
          user_id: user.id,
        },
      });

      if (error) {
        console.error('Validation function error:', error);
        setValidationErrors({ general: `Validation failed: ${error.message}` });
        return null;
      }

      if (data?.errors) {
        setValidationErrors(data.errors as Record<string, string>);
        return data.errors as Record<string, string>;
      }

      return null; // No errors
    } catch (err: any) {
      console.error('Unexpected validation error:', err);
      setValidationErrors({ general: `Unexpected error: ${err.message}` });
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [tableName, formId, user, initialDelay, supabase]);

  return {
    isValidating,
    validationErrors,
    validateForm,
  };
};

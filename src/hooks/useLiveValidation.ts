
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean | null;
  message: string | null;
  isLoading: boolean;
}

export const useLiveValidation = (
  tableName: string,
  columnName: string,
  value: string,
  debounceTime: number = 500
): ValidationResult => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const validate = useCallback(
    async (currentValue: string) => {
      if (!currentValue || !user?.id) {
        setIsValid(null);
        setMessage(null);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from(tableName as any)
          .select(columnName)
          .eq(columnName, currentValue);

        setIsLoading(false);

        if (error) {
          setIsValid(false);
          setMessage(`Validation error: ${error.message}`);
        } else {
          const isUnique = data === null || data.length === 0;
          setIsValid(isUnique);
          setMessage(isUnique ? 'Value is unique' : 'Value already exists');
        }
      } catch (error: any) {
        setIsLoading(false);
        setIsValid(false);
        setMessage(`Validation error: ${error.message}`);
      }
    },
    [tableName, columnName, user?.id]
  );

  return { isValid, message, isLoading };
};

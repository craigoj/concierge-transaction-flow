
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean | null;
  message: string | null;
  isLoading: boolean;
}

type TableName = 'profiles' | 'transactions' | 'clients' | 'agent_vendors' | 'agent_branding';

export const useLiveValidation = (
  tableName: TableName,
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
          .from(tableName)
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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (value) {
      timeoutId = setTimeout(() => {
        validate(value);
      }, debounceTime);
    } else {
      setIsValid(null);
      setMessage(null);
    }

    return () => clearTimeout(timeoutId);
  }, [value, debounceTime, validate]);

  return { isValid, message, isLoading };
};

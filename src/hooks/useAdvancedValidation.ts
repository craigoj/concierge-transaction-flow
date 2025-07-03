import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ValidationOptions<T extends z.ZodTypeAny> {
  schema: T;
  tableName: string;
  columnName: string;
  debounce?: number;
  initialValue?: any;
}

export const useAdvancedValidation = <T extends z.ZodTypeAny>(
  options: ValidationOptions<T>
) => {
  const { schema, tableName, columnName, debounce = 500, initialValue } = options;
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isDirty, setIsDirty] = useState(false);
  const { user } = useAuth();

  // Debounce the value
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, debounce);

    return () => clearTimeout(timerId);
  }, [value, debounce]);

  // Validate the debounced value against the schema
  useEffect(() => {
    const validate = async () => {
      try {
        schema.parse(debouncedValue);
        setIsValid(true);
        setErrorMessage(null);

        // Check for uniqueness against the database
        if (debouncedValue) {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq(columnName, debouncedValue)
            .not('id', 'eq', user?.id)
            .maybeSingle();

          if (error) {
            setIsValid(false);
            setErrorMessage('Error validating uniqueness.');
          } else if (data) {
            setIsValid(false);
            setErrorMessage('This value is already taken.');
          }
        }
      } catch (error: any) {
        setIsValid(false);
        setErrorMessage(error.errors?.[0]?.message || 'Validation failed.');
      }
    };

    validate();
  }, [debouncedValue, schema, tableName, columnName, user?.id]);

  // Function to update the value
  const onChange = useCallback((newValue: any) => {
    setValue(newValue);
		setIsDirty(true);
  }, []);

  return {
    value,
    onChange,
    isValid,
    errorMessage,
		isDirty
  };
};

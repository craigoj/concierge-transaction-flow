
import { useState, useCallback } from 'react';
import { z } from 'zod';

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
  const { schema, initialValue } = options;
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const onChange = useCallback((newValue: any) => {
    setValue(newValue);
    setIsDirty(true);
    
    try {
      schema.parse(newValue);
      setIsValid(true);
      setErrorMessage(null);
    } catch (error: any) {
      setIsValid(false);
      setErrorMessage(error.errors?.[0]?.message || 'Validation failed.');
    }
  }, [schema]);

  return {
    value,
    onChange,
    isValid,
    errorMessage,
    isDirty
  };
};

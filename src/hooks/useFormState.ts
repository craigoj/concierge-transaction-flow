
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  SafeError, 
  SupabaseResponse, 
  isSupabaseError, 
  hasErrorMessage 
} from '@/types/common';

interface FormStateOptions<T = Record<string, unknown>> {
  tableName: string;
  recordId?: string;
  initialData?: T;
  userId?: string;
  debounceTime?: number;
  onChange?: (data: T) => void;
}

interface FormStateResult<T = Record<string, unknown>> {
  data: T;
  loading: boolean;
  error: SafeError | null;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  setData: (data: T) => void;
  saveData: () => Promise<void>;
  fetchData: () => Promise<void>;
}

export const useFormState = <T = Record<string, unknown>>(
  options: FormStateOptions<T>
): FormStateResult<T> => {
  const { tableName, recordId, initialData, userId: controlledUserId, debounceTime = 500, onChange } = options;
  const { user } = useAuth();
  const userId = controlledUserId || user?.id;
  const [data, setData] = useState<T>(initialData || ({} as T));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SafeError | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    if (!tableName || !recordId || !userId) {
      return;
    }

    setLoading(true);
    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setData((fetchedData as T) || ({} as T));
      setError(null);
    } catch (e: unknown) {
      const safeError = e as SafeError;
      setError(safeError);
    } finally {
      setLoading(false);
    }
  }, [tableName, recordId, userId]);

  const saveData = useCallback(async (): Promise<void> => {
    if (!tableName || !userId) {
      return;
    }

    setLoading(true);
    try {
      let result: T;

      if (recordId) {
        const { data: updateResult, error: updateError } = await supabase
          .from(tableName)
          .update(data as Record<string, unknown>)
          .eq('id', recordId)
          .select()
          .single();
        
        if (updateError) {
          throw updateError;
        }
        result = updateResult as T;
      } else {
        const { data: insertResult, error: insertError } = await supabase
          .from(tableName)
          .insert(data as Record<string, unknown>)
          .select()
          .single();
        
        if (insertError) {
          throw insertError;
        }
        result = insertResult as T;
      }

      setData(result || ({} as T));
      setError(null);
    } catch (e: unknown) {
      const safeError = e as SafeError;
      setError(safeError);
    } finally {
      setLoading(false);
    }
  }, [data, tableName, recordId, userId]);

  // Debounce save
  useEffect(() => {
    if (!onChange) return;

    const timer = setTimeout(() => {
      onChange(data);
      saveData();
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [data, debounceTime, onChange, saveData]);

  // Initial fetch
  useEffect(() => {
    if (recordId) {
      fetchData();
    } else if (initialData) {
      setData(initialData);
    }
  }, [recordId, fetchData, initialData]);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]): void => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const setDataHandler = useCallback((newData: T): void => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    updateField,
    setData: setDataHandler,
    saveData,
    fetchData,
  };
};

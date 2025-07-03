
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FormStateOptions<T> {
  tableName: 'profiles' | 'transactions' | 'clients' | 'agent_vendors' | 'agent_branding';
  recordId?: string;
  initialData?: T;
  userId?: string;
  debounceTime?: number;
  onChange?: (data: T) => void;
}

export const useFormState = <T>(options: FormStateOptions<T>) => {
  const { tableName, recordId, initialData, userId: controlledUserId, debounceTime = 500, onChange } = options;
  const { user } = useAuth();
  const userId = controlledUserId || user?.id;
  const [data, setData] = useState<T>(initialData || {} as T);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!tableName || !recordId || !userId) return;

    setLoading(true);
    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError) throw fetchError;

      setData(fetchedData as T);
      setError(null);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [tableName, recordId, userId]);

  const saveData = useCallback(async () => {
    if (!tableName || !userId) return;

    setLoading(true);
    try {
      const payload = { ...data };
      let upsert;

      if (recordId) {
        upsert = await supabase
          .from(tableName)
          .update(payload)
          .eq('id', recordId)
          .select()
          .single();
      } else {
        upsert = await supabase
          .from(tableName)
          .insert(payload)
          .select()
          .single();
      }

      if (upsert.error) throw upsert.error;

      setData(upsert.data as T);
      setError(null);
    } catch (e: any) {
      setError(e);
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

  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    data,
    loading,
    error,
    updateField,
    setData,
    saveData,
  };
};

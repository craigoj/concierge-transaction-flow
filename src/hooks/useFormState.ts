
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface FormStateOptions {
  tableName: string;
  recordId?: string;
  initialData?: Record<string, any>;
  userId?: string;
  debounceTime?: number;
  onChange?: (data: Record<string, any>) => void;
}

export const useFormState = (options: FormStateOptions) => {
  const { tableName, recordId, initialData, userId: controlledUserId, debounceTime = 500, onChange } = options;
  const { user } = useAuth();
  const userId = controlledUserId || user?.id;
  const [data, setData] = useState<Record<string, any>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!tableName || !recordId || !userId) return;

    setLoading(true);
    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('id', recordId)
        .single();

      if (fetchError) throw fetchError;

      setData(fetchedData || {});
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
      let result;

      if (recordId) {
        const { data: updateResult, error: updateError } = await supabase
          .from(tableName as any)
          .update(data)
          .eq('id', recordId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        result = updateResult;
      } else {
        const { data: insertResult, error: insertError } = await supabase
          .from(tableName as any)
          .insert(data)
          .select()
          .single();
        
        if (insertError) throw insertError;
        result = insertResult;
      }

      setData(result || {});
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

  const updateField = useCallback((field: string, value: any) => {
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

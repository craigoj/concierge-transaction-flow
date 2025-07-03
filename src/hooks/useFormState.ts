
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Specific table row types
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];
type AgentVendorRow = Database['public']['Tables']['agent_vendors']['Row'];
type AgentBrandingRow = Database['public']['Tables']['agent_branding']['Row'];

type TableRowTypes = {
  'profiles': ProfileRow;
  'transactions': TransactionRow;
  'clients': ClientRow;
  'agent_vendors': AgentVendorRow;
  'agent_branding': AgentBrandingRow;
};

interface FormStateOptions<T extends keyof TableRowTypes> {
  tableName: T;
  recordId?: string;
  initialData?: Partial<TableRowTypes[T]>;
  userId?: string;
  debounceTime?: number;
  onChange?: (data: Partial<TableRowTypes[T]>) => void;
}

export const useFormState = <T extends keyof TableRowTypes>(options: FormStateOptions<T>) => {
  const { tableName, recordId, initialData, userId: controlledUserId, debounceTime = 500, onChange } = options;
  const { user } = useAuth();
  const userId = controlledUserId || user?.id;
  const [data, setData] = useState<Partial<TableRowTypes[T]>>(initialData || {} as Partial<TableRowTypes[T]>);
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

      setData(fetchedData as Partial<TableRowTypes[T]>);
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
        result = await supabase
          .from(tableName)
          .update(data as any)
          .eq('id', recordId)
          .select()
          .single();
      } else {
        result = await supabase
          .from(tableName)
          .insert(data as any)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setData(result.data as Partial<TableRowTypes[T]>);
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

  const updateField = useCallback((field: keyof TableRowTypes[T], value: any) => {
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

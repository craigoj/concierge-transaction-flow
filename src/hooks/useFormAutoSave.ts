
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type FormData = {
  [key: string]: any;
};

type TableName = 'profiles' | 'transactions' | 'clients' | 'agent_vendors' | 'agent_branding';

export const useFormAutoSave = <T extends FormData>(
  tableName: TableName,
  recordId: string | undefined,
  formData: T,
  enabled: boolean = true,
  debounceDelay: number = 1000
) => {
  const { user } = useAuth();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !user || !recordId) {
      return;
    }

    // Debounce the save operation
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from(tableName)
          .upsert(
            {
              id: recordId,
              ...formData,
              updated_at: new Date().toISOString(),
            } as any,
            { onConflict: 'id' }
          );

        if (error) {
          console.error(`Autosave failed for ${tableName} (ID: ${recordId}):`, error);
        } else {
          console.log(`Autosaved ${tableName} (ID: ${recordId})`);
        }
      } catch (err) {
        console.error(`Autosave error for ${tableName} (ID: ${recordId}):`, err);
      }
    }, debounceDelay);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [tableName, recordId, formData, user, enabled, debounceDelay]);
};


import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Generic type for form data
type FormData = {
  [key: string]: any;
};

// Hook for automatically saving form data to Supabase
export const useFormAutoSave = <T extends FormData>(
  tableName: 'profiles' | 'transactions' | 'clients' | 'agent_vendors' | 'agent_branding',
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
        // Upsert the form data
        const { error } = await supabase
          .from(tableName)
          .upsert(
            {
              id: recordId,
              ...formData,
              updated_at: new Date().toISOString(),
            },
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

    // Cleanup on unmount or when dependencies change
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [tableName, recordId, formData, user, enabled, debounceDelay]);
};

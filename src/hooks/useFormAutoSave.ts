
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  table: string;
  data: Record<string, any>;
  interval?: number; // milliseconds
  enabled?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useFormAutoSave = ({
  table,
  data,
  interval = 30000, // 30 seconds default
  enabled = true,
  onSave,
  onError
}: AutoSaveOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const lastSavedData = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const hasChanges = JSON.stringify(data) !== lastSavedData.current;

  const saveData = async () => {
    if (!user?.id || !hasChanges || !enabled) return;

    setSaveStatus('saving');
    try {
      const { error } = await supabase
        .from(table)
        .upsert({
          ...data,
          agent_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      lastSavedData.current = JSON.stringify(data);
      setSaveStatus('saved');
      onSave?.(data);

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      onError?.(error);
      
      toast({
        title: 'Auto-save failed',
        description: 'Your changes could not be saved automatically.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (!enabled || !hasChanges) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveData, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, hasChanges, interval]);

  // Manual save function
  const forceSave = () => saveData();

  return {
    saveStatus,
    hasChanges,
    forceSave
  };
};

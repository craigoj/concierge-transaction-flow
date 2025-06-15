
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface UseRealtimeOptions {
  table: string;
  queryKeys: string[][];
  filter?: {
    column: string;
    value: string;
  };
}

export const useRealtime = ({ table, queryKeys, filter }: UseRealtimeOptions) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Create channel for real-time updates
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` })
        },
        (payload) => {
          console.log(`Real-time update for ${table}:`, payload);
          
          // Invalidate relevant queries
          queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, queryKeys, filter, queryClient]);

  return channelRef.current;
};

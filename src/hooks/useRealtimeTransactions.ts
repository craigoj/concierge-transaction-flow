
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransactionWithProgress, ProgressFilters, SortBy } from '@/types/progress';

interface UseRealtimeTransactionsProps {
  agentId?: string;
  filters?: ProgressFilters;
  sortBy?: SortBy;
}

export const useRealtimeTransactions = ({ 
  agentId, 
  filters = {}, 
  sortBy = 'created_at' 
}: UseRealtimeTransactionsProps) => {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');

  const queryKey = ['transactions-progress', agentId, filters, sortBy];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<TransactionWithProgress[]> => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*),
          phaseProgress:transaction_phase_progress (
            *,
            phase:transaction_phases (*)
          ),
          currentPhase:transaction_phases (*)
        `);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      // Apply filters
      if (filters.statusFilter?.length) {
        query = query.in('status', filters.statusFilter);
      }

      if (filters.serviceFilter?.length) {
        query = query.in('service_tier', filters.serviceFilter);
      }

      if (filters.riskFilter?.length) {
        query = query.in('risk_level', filters.riskFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case 'closing_date':
          query = query.order('closing_date', { ascending: true, nullsFirst: false });
          break;
        case 'risk_level':
          query = query.order('risk_level', { ascending: false });
          break;
        case 'priority':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data as TransactionWithProgress[];

      // Apply search filter client-side
      if (filters.searchQuery) {
        const searchTerm = filters.searchQuery.toLowerCase();
        results = results.filter(transaction =>
          transaction.property_address?.toLowerCase().includes(searchTerm) ||
          transaction.clients?.some(client =>
            client.full_name?.toLowerCase().includes(searchTerm)
          )
        );
      }

      return results;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!agentId) return;

    setConnectionStatus('connected');

    const channel = supabase
      .channel('transaction-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_phase_progress'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Transaction update:', payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, queryClient, queryKey]);

  return {
    data,
    isLoading,
    error,
    refetch,
    connectionStatus
  };
};

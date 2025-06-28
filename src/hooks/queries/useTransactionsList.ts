
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { transactionKeys } from './useTransactionData';

type Transaction = Tables<'transactions'> & {
  clients?: Tables<'clients'>[];
  tasks?: Tables<'tasks'>[];
};

interface TransactionFilters {
  status?: string;
  agentId?: string;
  dateRange?: { from: Date; to: Date };
  search?: string;
}

export const useTransactionsList = (filters: TransactionFilters = {}) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (id, is_completed)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }

      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString());
      }

      if (filters.search) {
        query = query.or(`property_address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error loading transactions",
        description: error.message,
      });
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newTransaction: Omit<Tables<'transactions'>, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

      // Optimistically add to all relevant lists
      const optimisticTransaction = {
        ...newTransaction,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clients: [],
        tasks: [],
      };

      // Update all matching list queries
      queryClient.setQueriesData(
        { queryKey: transactionKeys.lists() },
        (old: Transaction[] | undefined) => 
          old ? [optimisticTransaction, ...old] : [optimisticTransaction]
      );

      return { optimisticTransaction };
    },
    onError: (error: any, variables, context) => {
      // Remove optimistic update on error
      if (context?.optimisticTransaction) {
        queryClient.setQueriesData(
          { queryKey: transactionKeys.lists() },
          (old: Transaction[] | undefined) =>
            old?.filter(t => t.id !== context.optimisticTransaction.id) || []
        );
      }
      toast({
        variant: "destructive",
        title: "Error creating transaction",
        description: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic update with real data
      if (context?.optimisticTransaction) {
        queryClient.setQueriesData(
          { queryKey: transactionKeys.lists() },
          (old: Transaction[] | undefined) =>
            old?.map(t => t.id === context.optimisticTransaction.id ? data : t) || []
        );
      }

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.stats() });
      
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
    },
  });
};

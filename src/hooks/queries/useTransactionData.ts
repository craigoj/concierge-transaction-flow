
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  clients: Database['public']['Tables']['clients']['Row'][];
  tasks: Database['public']['Tables']['tasks']['Row'][];
  documents: Database['public']['Tables']['documents']['Row'][];
};

// Query key factory
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  stats: () => [...transactionKeys.all, 'stats'] as const,
};

export const useTransactionData = (transactionId: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: async (): Promise<Transaction> => {
      // Fetch the transaction with related data
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*),
          documents (*)
        `)
        .eq('id', transactionId)
        .maybeSingle();

      if (error) {
        // Provide more specific error messages
        if (error.code === 'PGRST116') {
          throw new Error(`Transaction not found: ${transactionId}`);
        } else if (error.message.includes('row-level security')) {
          throw new Error(`Access denied: You don't have permission to view this transaction.`);
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      if (!data) {
        throw new Error(`Transaction not found: ${transactionId}`);
      }

      return data as Transaction;
    },
    enabled: !!transactionId,
    retry: (failureCount, error) => {
      // Don't retry on authentication or permission errors
      if (error.message.includes('Authentication') || 
          error.message.includes('Access denied') || 
          error.message.includes('not found')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useTransactionTasks = (transactionId: string) => {
  return useQuery({
    queryKey: ['transaction-tasks', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!transactionId,
  });
};

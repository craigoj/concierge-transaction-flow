
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transactionKeys } from './useTransactionData';
import { Database } from '@/integrations/supabase/types';

type TransactionStatus = Database['public']['Enums']['transaction_status'];
type ServiceTier = Database['public']['Enums']['service_tier_type'];
type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  clients: Database['public']['Tables']['clients']['Row'][];
};

interface TransactionFilters extends Record<string, unknown> {
  status?: string;
  serviceTier?: string;
  search?: string;
}

export const useAgentTransactions = () => {
  return useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });
};

export const useTransactionsList = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          clients (*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters with proper type casting
      if (filters?.status) {
        query = query.eq('status', filters.status as TransactionStatus);
      }

      if (filters?.serviceTier) {
        query = query.eq('service_tier', filters.serviceTier as ServiceTier);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply search filter client-side for simplicity
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        return (data as Transaction[])?.filter(transaction => 
          transaction.property_address?.toLowerCase().includes(searchTerm) ||
          transaction.clients?.some(client => 
            client.full_name?.toLowerCase().includes(searchTerm)
          )
        ) || [];
      }

      return (data as Transaction[]) || [];
    },
  });
};

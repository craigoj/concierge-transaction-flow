
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAgentTransactions = () => {
  return useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async () => {
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
      return data;
    },
  });
};

export const useTransactionsList = (filters?: {
  status?: string;
  serviceTier?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['transactions-list', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          clients (*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.serviceTier) {
        query = query.eq('service_tier', filters.serviceTier);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply search filter client-side for simplicity
      if (filters?.search) {
        return data?.filter(transaction => 
          transaction.property_address?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          transaction.clients?.some(client => 
            client.full_name?.toLowerCase().includes(filters.search!.toLowerCase())
          )
        ) || [];
      }

      return data || [];
    },
  });
};

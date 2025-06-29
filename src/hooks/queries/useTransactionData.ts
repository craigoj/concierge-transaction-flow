
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTransactionData = (transactionId: string) => {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*),
          documents (*)
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!transactionId,
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

      if (error) throw error;
      return data;
    },
    enabled: !!transactionId,
  });
};

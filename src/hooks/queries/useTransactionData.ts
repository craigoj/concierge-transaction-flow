
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  clients?: Tables<'clients'>[];
  tasks?: Tables<'tasks'>[];
  documents?: Tables<'documents'>[];
};

// Query key factory for consistent caching
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  stats: () => [...transactionKeys.all, 'stats'] as const,
};

export const useTransactionData = (id: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: async (): Promise<Transaction> => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*),
          documents (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry for auth errors or not found
      if (error?.code === 'PGRST116' || error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error loading transaction",
        description: error.message,
      });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.detail(id) });

      // Snapshot previous value
      const previousTransaction = queryClient.getQueryData(transactionKeys.detail(id));

      // Optimistically update
      queryClient.setQueryData(transactionKeys.detail(id), (old: Transaction | undefined) => 
        old ? { ...old, ...updates } : undefined
      );

      return { previousTransaction };
    },
    onError: (error: any, { id }, context) => {
      // Rollback on error
      if (context?.previousTransaction) {
        queryClient.setQueryData(transactionKeys.detail(id), context.previousTransaction);
      }
      toast({
        variant: "destructive",
        title: "Error updating transaction",
        description: error.message,
      });
    },
    onSuccess: (data, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(transactionKeys.detail(id), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.stats() });
      
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
  });
};

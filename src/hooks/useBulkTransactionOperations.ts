
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TransactionStatus = Database['public']['Enums']['transaction_status'];

export const useBulkTransactionOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkStatusUpdate = useMutation({
    mutationFn: async ({ 
      transactionIds, 
      status 
    }: { 
      transactionIds: string[], 
      status: TransactionStatus 
    }) => {
      const { data, error } = await supabase.rpc('bulk_update_transaction_status', {
        transaction_ids: transactionIds,
        new_status: status
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedCount, variables) => {
      toast({
        title: "Bulk Update Successful",
        description: `Updated ${updatedCount} transactions to ${variables.status}`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-progress'] });
      queryClient.invalidateQueries({ queryKey: ['agent-transactions'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Bulk Update Failed",
        description: error.message,
      });
    }
  });

  const reassignTransaction = useMutation({
    mutationFn: async ({ 
      transactionId, 
      newAgentId 
    }: { 
      transactionId: string, 
      newAgentId: string 
    }) => {
      const { data, error } = await supabase.rpc('reassign_transaction', {
        transaction_id: transactionId,
        new_agent_id: newAgentId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Transaction Reassigned",
        description: "Transaction has been reassigned successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-progress'] });
      queryClient.invalidateQueries({ queryKey: ['agent-transactions'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Reassignment Failed",
        description: error.message,
      });
    }
  });

  return {
    bulkStatusUpdate,
    reassignTransaction,
    isLoading: bulkStatusUpdate.isPending || reassignTransaction.isPending
  };
};

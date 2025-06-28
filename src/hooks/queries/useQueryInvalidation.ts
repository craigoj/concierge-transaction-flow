
import { useQueryClient } from '@tanstack/react-query';
import { transactionKeys } from './useTransactionData';
import { taskKeys } from './useTasksList';
import { documentKeys } from './useDocumentsList';
import { clientKeys } from './useClientData';

// Centralized query invalidation patterns
export const useQueryInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateTransaction = (transactionId: string) => {
    // Invalidate specific transaction
    queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
    
    // Invalidate all transaction lists (they might contain this transaction)
    queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    
    // Invalidate related entities
    queryClient.invalidateQueries({ queryKey: taskKeys.list(transactionId) });
    queryClient.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
    queryClient.invalidateQueries({ queryKey: clientKeys.list(transactionId) });
  };

  const invalidateAllTransactions = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
  };

  const invalidateTransactionStats = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.stats() });
  };

  const invalidateTasksForTransaction = (transactionId: string) => {
    queryClient.invalidateQueries({ queryKey: taskKeys.list(transactionId) });
    // Also invalidate the transaction since it includes task counts
    queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
  };

  const invalidateDocumentsForTransaction = (transactionId: string) => {
    queryClient.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
    queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
  };

  const invalidateClientsForTransaction = (transactionId: string) => {
    queryClient.invalidateQueries({ queryKey: clientKeys.list(transactionId) });
    queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
  };

  // Bulk invalidation for real-time updates
  const invalidateAllUserData = () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: taskKeys.all });
    queryClient.invalidateQueries({ queryKey: documentKeys.all });
    queryClient.invalidateQueries({ queryKey: clientKeys.all });
  };

  return {
    invalidateTransaction,
    invalidateAllTransactions,
    invalidateTransactionStats,
    invalidateTasksForTransaction,
    invalidateDocumentsForTransaction,
    invalidateClientsForTransaction,
    invalidateAllUserData,
  };
};

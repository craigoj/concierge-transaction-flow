
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQueryInvalidation } from './useQueryInvalidation';

// Real-time synchronization hook
export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const {
    invalidateTransaction,
    invalidateAllTransactions,
    invalidateTasksForTransaction,
    invalidateDocumentsForTransaction,
    invalidateClientsForTransaction,
  } = useQueryInvalidation();

  useEffect(() => {
    // Transaction changes
    const transactionChannel = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('Transaction change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            invalidateAllTransactions();
          } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            const transactionId = payload.old?.id || payload.new?.id;
            if (transactionId) {
              invalidateTransaction(transactionId);
            }
          }
        }
      )
      .subscribe();

    // Task changes
    const taskChannel = supabase
      .channel('task-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Task change detected:', payload);
          
          const transactionId = payload.old?.transaction_id || payload.new?.transaction_id;
          if (transactionId) {
            invalidateTasksForTransaction(transactionId);
          }
        }
      )
      .subscribe();

    // Document changes
    const documentChannel = supabase
      .channel('document-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document change detected:', payload);
          
          const transactionId = payload.old?.transaction_id || payload.new?.transaction_id;
          if (transactionId) {
            invalidateDocumentsForTransaction(transactionId);
          }
        }
      )
      .subscribe();

    // Client changes
    const clientChannel = supabase
      .channel('client-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          console.log('Client change detected:', payload);
          
          const transactionId = payload.old?.transaction_id || payload.new?.transaction_id;
          if (transactionId) {
            invalidateClientsForTransaction(transactionId);
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(transactionChannel);
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(documentChannel);
      supabase.removeChannel(clientChannel);
    };
  }, []);

  return null; // This hook only sets up subscriptions
};

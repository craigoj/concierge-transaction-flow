
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { AgentTransaction, AgentDataContextType } from '@/types/agent';

const AgentDataContext = createContext<AgentDataContextType | undefined>(undefined);

interface SecureAgentDataProviderProps {
  children: React.ReactNode;
}

export const SecureAgentDataProvider = ({ children }: SecureAgentDataProviderProps) => {
  const [transactions, setTransactions] = useState<AgentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTransactions([]);
        return;
      }

      // With RLS policies in place, this query will automatically 
      // only return transactions where auth.uid() = agent_id
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*),
          tasks (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agent transactions:', error);
        toast({
          variant: "destructive",
          title: "Data Access Error",
          description: "Unable to load your transactions. Please try again.",
        });
        return;
      }

      setTransactions(transactionsData as AgentTransaction[] || []);
    } catch (error: unknown) {
      console.error('Error in fetchAgentData:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading your data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await fetchAgentData();
  };

  const hasAccess = (transactionId: string): boolean => {
    return transactions.some(transaction => transaction.id === transactionId);
  };

  useEffect(() => {
    fetchAgentData();

    // Set up real-time subscription for agent's transactions
    const channel = supabase
      .channel('agent-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          console.log('Transaction data changed, refreshing...');
          fetchAgentData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          console.log('Task data changed, refreshing...');
          fetchAgentData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        () => {
          console.log('Client data changed, refreshing...');
          fetchAgentData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const contextValue: AgentDataContextType = {
    transactions,
    isLoading,
    refreshData,
    hasAccess,
  };

  return (
    <AgentDataContext.Provider value={contextValue}>
      {children}
    </AgentDataContext.Provider>
  );
};

export const useAgentData = () => {
  const context = useContext(AgentDataContext);
  if (context === undefined) {
    throw new Error('useAgentData must be used within a SecureAgentDataProvider');
  }
  return context;
};


import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/integrations/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import type { AgentData, ServiceError } from '@/types';

interface AgentDataContextType {
  agentData: AgentData | null;
  isLoading: boolean;
  error: ServiceError | null;
  refreshData: () => Promise<void>;
}

const AgentDataContext = createContext<AgentDataContextType | undefined>(undefined);

interface SecureAgentDataProviderProps {
  children: ReactNode;
}

export const SecureAgentDataProvider = ({ children }: SecureAgentDataProviderProps) => {
  const { user } = useAuth();
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ServiceError | null>(null);

  const fetchAgentData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setAgentData(data as AgentData);
    } catch (err) {
      console.error('Error fetching agent data:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch agent data',
        code: 'FETCH_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]); // Added user?.id to dependencies

  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]); // Added fetchAgentData to dependencies

  const contextValue: AgentDataContextType = {
    agentData,
    isLoading,
    error,
    refreshData: fetchAgentData
  };

  return (
    <AgentDataContext.Provider value={contextValue}>
      {children}
    </AgentDataContext.Provider>
  );
};

export const useSecureAgentData = () => {
  const context = useContext(AgentDataContext);
  if (context === undefined) {
    throw new Error('useSecureAgentData must be used within a SecureAgentDataProvider');
  }
  return context;
};

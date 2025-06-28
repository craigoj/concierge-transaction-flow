
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AutomationRule, WorkflowExecution, TriggerContext } from '@/types/automation';

// Query keys for automation-related data
export const automationKeys = {
  all: ['automation'] as const,
  rules: () => [...automationKeys.all, 'rules'] as const,
  executions: () => [...automationKeys.all, 'executions'] as const,
  execution: (id: string) => [...automationKeys.executions(), id] as const,
  auditLogs: (executionId: string) => [...automationKeys.all, 'audit', executionId] as const,
};

export const useAutomationRules = (filters: { isActive?: boolean } = {}) => {
  return useQuery({
    queryKey: [...automationKeys.rules(), filters],
    queryFn: async (): Promise<AutomationRule[]> => {
      let query = supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWorkflowExecutions = (transactionId?: string) => {
  return useQuery({
    queryKey: [...automationKeys.executions(), { transactionId }],
    queryFn: async (): Promise<WorkflowExecution[]> => {
      let query = supabase
        .from('workflow_executions')
        .select('*')
        .order('executed_at', { ascending: false });

      if (transactionId) {
        query = query.eq('transaction_id', transactionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!transactionId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useExecuteAutomation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ruleId, context }: { ruleId: string; context: TriggerContext }) => {
      const { data, error } = await supabase.functions.invoke('execute-automation', {
        body: { ruleId, context }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: automationKeys.executions() });
      
      toast({
        title: "Automation Executed",
        description: `Workflow automation has been triggered successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Automation Failed",
        description: error.message || "Failed to execute automation rule",
      });
    },
  });
};

export const useRetryExecution = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (executionId: string) => {
      const { data, error } = await supabase.functions.invoke('retry-automation', {
        body: { executionId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationKeys.executions() });
      
      toast({
        title: "Execution Retried",
        description: "The failed automation execution has been retried.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Retry Failed",
        description: error.message || "Failed to retry execution",
      });
    },
  });
};

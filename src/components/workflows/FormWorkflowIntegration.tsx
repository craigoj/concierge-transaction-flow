
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowTrigger {
  event: string;
  transactionId?: string;
  serviceTier?: string;
  metadata?: any;
}

export const useWorkflowIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const triggerWorkflow = async ({ 
    event, 
    transactionId, 
    serviceTier, 
    metadata 
  }: WorkflowTrigger) => {
    try {
      if (!user?.id) return;

      // Find matching automation rules
      const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('trigger_event', event)
        .eq('is_active', true);

      if (error) throw error;

      // Filter rules by service tier if provided
      const applicableRules = rules?.filter(rule => {
        if (!serviceTier) return true;
        const condition = rule.trigger_condition as any;
        return !condition?.service_tier || condition.service_tier === serviceTier;
      }) || [];

      // Create workflow executions
      for (const rule of applicableRules) {
        const { error: executionError } = await supabase
          .from('workflow_executions')
          .insert({
            rule_id: rule.id,
            transaction_id: transactionId || '',
            status: 'pending',
            metadata: {
              ...metadata,
              triggered_by: user.id,
              service_tier: serviceTier
            }
          });

        if (executionError) {
          console.error('Failed to create workflow execution:', executionError);
        }
      }

      if (applicableRules.length > 0) {
        toast({
          title: 'Workflows Triggered',
          description: `${applicableRules.length} automation(s) have been started`,
        });
      }

    } catch (error: any) {
      console.error('Workflow trigger error:', error);
      toast({
        variant: 'destructive',
        title: 'Workflow Error',
        description: 'Failed to trigger some automations',
      });
    }
  };

  return { triggerWorkflow };
};

// Component for automatically triggering workflows based on form events
export const FormWorkflowIntegration: React.FC<{
  children: React.ReactNode;
  onIntakeComplete?: (data: any) => void;
  onOfferSubmit?: (data: any) => void;
  onServiceTierSelect?: (data: any) => void;
}> = ({ 
  children, 
  onIntakeComplete, 
  onOfferSubmit, 
  onServiceTierSelect 
}) => {
  const { triggerWorkflow } = useWorkflowIntegration();

  // Enhanced event handlers that trigger workflows
  const handleIntakeComplete = async (data: any) => {
    await triggerWorkflow({
      event: 'agent_intake_completed',
      metadata: { intake_data: data }
    });
    onIntakeComplete?.(data);
  };

  const handleOfferSubmit = async (data: any) => {
    await triggerWorkflow({
      event: 'offer_request_submitted',
      transactionId: data.transaction_id,
      metadata: { offer_data: data }
    });
    onOfferSubmit?.(data);
  };

  const handleServiceTierSelect = async (data: any) => {
    await triggerWorkflow({
      event: 'service_tier_selected',
      transactionId: data.transaction_id,
      serviceTier: data.service_tier,
      metadata: { tier_data: data }
    });
    onServiceTierSelect?.(data);
  };

  return (
    <div>
      {React.cloneElement(children as React.ReactElement, {
        onIntakeComplete: handleIntakeComplete,
        onOfferSubmit: handleOfferSubmit,
        onServiceTierSelect: handleServiceTierSelect
      })}
    </div>
  );
};

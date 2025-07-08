
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceTierType } from '@/types/serviceTiers';
import { getFeaturesByTier, getTierPricing, calculateTotalCost } from '@/data/serviceTierConfig';
import { logger } from '@/lib/logger';

// Define the interface for the raw Supabase response
interface RawTransactionServiceDetails {
  id: string;
  transaction_id: string;
  selected_features: any; // Json type from Supabase
  base_service_fee: number;
  total_service_cost: number;
  add_ons: any; // Json type from Supabase
  created_at: string;
  updated_at: string;
}

// Define the processed interface for our application
interface TransactionServiceDetails {
  id: string;
  transaction_id: string;
  selected_features: string[];
  base_service_fee: number;
  total_service_cost: number;
  add_ons: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Trigger automation workflows based on service tier changes
 */
const triggerServiceTierAutomation = async (
  transactionId: string, 
  serviceTier: ServiceTierType
): Promise<void> => {
  try {
    logger.info('Triggering service tier automation workflows', {
      transactionId,
      serviceTier,
      timestamp: new Date().toISOString()
    }, 'service-tier-automation');

    // Call the automation scheduler edge function
    const { data, error } = await supabase.functions.invoke('automation-scheduler', {
      body: {
        trigger_event: 'service_tier_updated',
        transaction_id: transactionId,
        trigger_data: {
          service_tier: serviceTier,
          triggered_at: new Date().toISOString()
        }
      }
    });

    if (error) {
      logger.error('Failed to trigger service tier automation', error, {
        transactionId,
        serviceTier
      }, 'service-tier-automation');
      throw error;
    }

    logger.info('Service tier automation triggered successfully', {
      transactionId,
      serviceTier,
      automationData: data
    }, 'service-tier-automation');

    // Also check for existing automation rules that should be triggered
    const { data: automationRules, error: rulesError } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_event', 'service_tier_updated')
      .eq('is_active', true);

    if (rulesError) {
      logger.warn('Failed to fetch automation rules for service tier update', rulesError, {
        transactionId,
        serviceTier
      }, 'service-tier-automation');
    } else if (automationRules && automationRules.length > 0) {
      logger.info('Found matching automation rules for service tier update', {
        transactionId,
        serviceTier,
        rulesCount: automationRules.length,
        rules: automationRules.map(rule => ({ id: rule.id, name: rule.name }))
      }, 'service-tier-automation');
    }

  } catch (error) {
    logger.error('Error in service tier automation workflow', error as Error, {
      transactionId,
      serviceTier
    }, 'service-tier-automation');
    
    // Don't throw the error here to avoid breaking the main service tier update
    // Just log it for monitoring purposes
  }
};

export const useServiceTierSelection = (transactionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: serviceDetails, isLoading } = useQuery({
    queryKey: ['transaction-service-details', transactionId],
    queryFn: async (): Promise<TransactionServiceDetails | null> => {
      const { data, error } = await supabase
        .from('transaction_service_details')
        .select('*')
        .eq('transaction_id', transactionId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Transform the raw data to match our interface
      return {
        ...data,
        selected_features: Array.isArray(data.selected_features) ? data.selected_features : [],
        add_ons: Array.isArray(data.add_ons) ? data.add_ons : []
      } as TransactionServiceDetails;
    },
    enabled: !!transactionId,
  });

  const updateServiceTier = useMutation({
    mutationFn: async ({ 
      selectedTier, 
      addOns = [] 
    }: { 
      selectedTier: ServiceTierType; 
      addOns?: string[] 
    }) => {
      // First, update the transaction service tier
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .update({ service_tier: selectedTier })
        .eq('id', transactionId)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Then, upsert the service details record
      const selectedFeatures = getFeaturesByTier(selectedTier);
      const baseFee = getTierPricing(selectedTier);
      const totalCost = calculateTotalCost(selectedTier, addOns);

      const { data: serviceDetails, error: detailsError } = await supabase
        .from('transaction_service_details')
        .upsert({
          transaction_id: transactionId,
          selected_features: selectedFeatures,
          base_service_fee: baseFee,
          total_service_cost: totalCost,
          add_ons: addOns
        })
        .select()
        .single();

      if (detailsError) throw detailsError;

      return { transaction, serviceDetails };
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transaction-service-details', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      toast({
        title: "Service Tier Updated",
        description: "Transaction service tier has been successfully updated.",
      });

      // Trigger automation workflows based on service tier change
      triggerServiceTierAutomation(transactionId, data.transaction.service_tier);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error updating service tier",
        description: error.message,
      });
    },
  });

  return {
    serviceDetails,
    isLoading,
    updateServiceTier: updateServiceTier.mutate,
    isUpdating: updateServiceTier.isPending,
  };
};

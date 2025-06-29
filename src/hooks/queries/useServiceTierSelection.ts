
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceTierType, TransactionServiceDetails } from '@/types/serviceTiers';
import { getFeaturesByTier, getTierPricing, calculateTotalCost } from '@/data/serviceTierConfig';

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
      return data;
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

      // TODO: Trigger automation workflows based on service tier
      // This could be implemented as a separate function or webhook
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

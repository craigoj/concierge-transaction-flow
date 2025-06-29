
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useToast } from '@/hooks/use-toast';

export const useProfileSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sync agent vendors with transaction creation
  const syncVendorsToTransaction = useMutation({
    mutationFn: async ({ transactionId, vendors }: { 
      transactionId: string; 
      vendors: any[] 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update transaction with preferred vendors
      const preferredVendors = {
        lender: vendors.find(v => v.vendor_type === 'lender' && v.is_primary),
        settlement: vendors.find(v => v.vendor_type === 'settlement' && v.is_primary),
        home_inspection: vendors.find(v => v.vendor_type === 'home_inspection' && v.is_primary)
      };

      const { error } = await supabase
        .from('transactions')
        .update({ 
          preferred_vendors: preferredVendors,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;
      return { transactionId, preferredVendors };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Vendors Synced',
        description: 'Transaction updated with your preferred vendors',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Sync Error',
        description: error.message,
      });
    }
  });

  // Update transaction status based on form submissions
  const updateTransactionStatus = useMutation({
    mutationFn: async ({ 
      transactionId, 
      status, 
      metadata 
    }: { 
      transactionId: string; 
      status: string; 
      metadata?: any 
    }) => {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;
      return { transactionId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', data.transactionId] });
    }
  });

  // Create offer request linked to transaction
  const createLinkedOfferRequest = useMutation({
    mutationFn: async (offerData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get agent's vendor preferences for auto-population
      const { data: vendors } = await supabase
        .from('agent_vendors')
        .select('*')
        .eq('agent_id', user.id);

      const preferredLender = vendors?.find(v => v.vendor_type === 'lender' && v.is_primary);
      const preferredSettlement = vendors?.find(v => v.vendor_type === 'settlement' && v.is_primary);

      const enhancedOfferData = {
        ...offerData,
        agent_id: user.id,
        lending_company: offerData.lending_company || preferredLender?.company_name || '',
        settlement_company: offerData.settlement_company || preferredSettlement?.company_name || '',
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('offer_requests')
        .insert(enhancedOfferData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['offer_requests'] });
      if (data.transaction_id) {
        queryClient.invalidateQueries({ queryKey: ['transaction', data.transaction_id] });
      }
      toast({
        title: 'Offer Request Created',
        description: 'Auto-populated with your preferred vendors',
      });
    }
  });

  // Activate service tier automations
  const activateServiceTierAutomations = useMutation({
    mutationFn: async ({ 
      transactionId, 
      serviceTier 
    }: { 
      transactionId: string; 
      serviceTier: string 
    }) => {
      // Update transaction service tier
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({ 
          service_tier: serviceTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (transactionError) throw transactionError;

      // Create service details record
      const { error: detailsError } = await supabase
        .from('transaction_service_details')
        .insert({
          transaction_id: transactionId,
          selected_features: [],
          base_service_fee: 0,
          total_service_cost: 0
        });

      if (detailsError) throw detailsError;

      // Trigger automation workflows for this service tier
      const { error: automationError } = await supabase
        .from('automation_rules')
        .select('id')
        .eq('trigger_event', 'service_tier_selected')
        .eq('is_active', true);

      if (automationError) throw automationError;

      return { transactionId, serviceTier };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Service Tier Activated',
        description: 'Automation workflows have been triggered',
      });
    }
  });

  return {
    syncVendorsToTransaction: syncVendorsToTransaction.mutateAsync,
    updateTransactionStatus: updateTransactionStatus.mutateAsync,
    createLinkedOfferRequest: createLinkedOfferRequest.mutateAsync,
    activateServiceTierAutomations: activateServiceTierAutomations.mutateAsync,
    isLoading: syncVendorsToTransaction.isPending || 
               updateTransactionStatus.isPending || 
               createLinkedOfferRequest.isPending ||
               activateServiceTierAutomations.isPending
  };
};

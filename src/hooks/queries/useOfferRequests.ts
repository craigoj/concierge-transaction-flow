
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';

export interface OfferRequest {
  id: string;
  agent_id: string;
  transaction_id?: string;
  property_address: string;
  buyer_names: string;
  buyer_contacts: {
    phones: string[];
    emails: string[];
  };
  purchase_price: number;
  loan_type: string;
  lending_company: string;
  emd_amount: number;
  exchange_fee: number;
  settlement_company: string;
  closing_cost_assistance?: string;
  projected_closing_date: string;
  wdi_inspection_details: {
    period?: number;
    period_unit?: string;
    provider?: string;
    notes?: string;
  };
  fica_details: {
    required: boolean;
    inspection_period?: number;
  };
  extras?: string;
  lead_eifs_survey?: string;
  occupancy_notes?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'processed';
  created_at: string;
  updated_at: string;
}

export const offerRequestKeys = {
  all: ['offer_requests'] as const,
  lists: () => [...offerRequestKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...offerRequestKeys.lists(), { filters }] as const,
  details: () => [...offerRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...offerRequestKeys.details(), id] as const,
  byAgent: (agentId: string) => [...offerRequestKeys.all, 'by_agent', agentId] as const,
  byTransaction: (transactionId: string) => [...offerRequestKeys.all, 'by_transaction', transactionId] as const,
};

export const useOfferRequests = (filters?: { status?: string; agent_id?: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: offerRequestKeys.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('offer_requests')
        .select(`
          *,
          transaction:transactions(property_address, status),
          agent:profiles!offer_requests_agent_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.agent_id) {
        query = query.eq('agent_id', filters.agent_id);
      } else if (user) {
        // Default to current user's requests if no agent filter specified
        query = query.eq('agent_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as OfferRequest[];
    },
    enabled: !!user,
  });
};

export const useOfferRequest = (id: string) => {
  return useQuery({
    queryKey: offerRequestKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offer_requests')
        .select(`
          *,
          transaction:transactions(property_address, status),
          agent:profiles!offer_requests_agent_id_fkey(first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as OfferRequest;
    },
    enabled: !!id,
  });
};

export const useUpdateOfferRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('offer_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: offerRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: offerRequestKeys.detail(data.id) });
    },
  });
};

export const useDeleteOfferRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('offer_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offerRequestKeys.all });
    },
  });
};

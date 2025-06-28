
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { transactionKeys } from './useTransactionData';

type Client = Tables<'clients'>;

// Query key factory
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (transactionId: string) => [...clientKeys.lists(), transactionId] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

export const useClientData = (id: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: async (): Promise<Client> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error loading client",
        description: error.message,
      });
    },
  });
};

export const useClientsForTransaction = (transactionId: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: clientKeys.list(transactionId),
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!transactionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error loading clients",
        description: error.message,
      });
    },
  });
};

export const useCreateClient = (transactionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newClient: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newClient) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.list(transactionId) });

      const previousClients = queryClient.getQueryData(clientKeys.list(transactionId));

      const optimisticClient = {
        ...newClient,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(clientKeys.list(transactionId), (old: Client[] | undefined) =>
        old ? [optimisticClient, ...old] : [optimisticClient]
      );

      return { previousClients, optimisticClient };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(clientKeys.list(transactionId), context.previousClients);
      }
      toast({
        variant: "destructive",
        title: "Error creating client",
        description: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData(clientKeys.list(transactionId), (old: Client[] | undefined) =>
        old?.map(client => client.id === context?.optimisticClient.id ? data : client) || []
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
  });
};

export const useUpdateClient = (transactionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.list(transactionId) });
      await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });

      const previousClients = queryClient.getQueryData(clientKeys.list(transactionId));
      const previousClient = queryClient.getQueryData(clientKeys.detail(id));

      // Update in list
      queryClient.setQueryData(clientKeys.list(transactionId), (old: Client[] | undefined) =>
        old?.map(client => client.id === id ? { ...client, ...updates } : client) || []
      );

      // Update individual client
      queryClient.setQueryData(clientKeys.detail(id), (old: Client | undefined) =>
        old ? { ...old, ...updates } : undefined
      );

      return { previousClients, previousClient };
    },
    onError: (error: any, { id }, context) => {
      // Rollback changes
      if (context?.previousClients) {
        queryClient.setQueryData(clientKeys.list(transactionId), context.previousClients);
      }
      if (context?.previousClient) {
        queryClient.setQueryData(clientKeys.detail(id), context.previousClient);
      }
      toast({
        variant: "destructive",
        title: "Error updating client",
        description: error.message,
      });
    },
    onSuccess: (data, { id }) => {
      // Update with server response
      queryClient.setQueryData(clientKeys.list(transactionId), (old: Client[] | undefined) =>
        old?.map(client => client.id === id ? data : client) || []
      );
      queryClient.setQueryData(clientKeys.detail(id), data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
  });
};

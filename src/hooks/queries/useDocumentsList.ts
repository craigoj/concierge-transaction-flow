
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { transactionKeys } from './useTransactionData';

type Document = Tables<'documents'>;

// Query key factory
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (transactionId: string) => [...documentKeys.lists(), transactionId] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
};

export const useDocumentsList = (transactionId: string) => {
  return useQuery({
    queryKey: documentKeys.list(transactionId),
    queryFn: async (): Promise<Document[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!transactionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateDocument = (transactionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newDocument: Omit<Document, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('documents')
        .insert(newDocument)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newDocument) => {
      await queryClient.cancelQueries({ queryKey: documentKeys.list(transactionId) });

      const previousDocuments = queryClient.getQueryData(documentKeys.list(transactionId));

      const optimisticDocument = {
        ...newDocument,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(documentKeys.list(transactionId), (old: Document[] | undefined) =>
        old ? [optimisticDocument, ...old] : [optimisticDocument]
      );

      return { previousDocuments, optimisticDocument };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentKeys.list(transactionId), context.previousDocuments);
      }
      toast({
        variant: "destructive",
        title: "Error uploading document",
        description: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData(documentKeys.list(transactionId), (old: Document[] | undefined) =>
        old?.map(doc => doc.id === context?.optimisticDocument.id ? data : doc) || []
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
  });
};

export const useDeleteDocument = (transactionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      return documentId;
    },
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey: documentKeys.list(transactionId) });

      const previousDocuments = queryClient.getQueryData(documentKeys.list(transactionId));

      queryClient.setQueryData(documentKeys.list(transactionId), (old: Document[] | undefined) =>
        old?.filter(doc => doc.id !== documentId) || []
      );

      return { previousDocuments, documentId };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentKeys.list(transactionId), context.previousDocuments);
      }
      toast({
        variant: "destructive",
        title: "Error deleting document",
        description: error.message,
      });
    },
    onSuccess: (documentId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
  });
};

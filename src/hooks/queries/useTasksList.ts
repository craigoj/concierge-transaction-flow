
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { transactionKeys } from './useTransactionData';

type Task = Tables<'tasks'>;

// Query key factory
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (transactionId: string) => [...taskKeys.lists(), transactionId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

export const useTasksList = (transactionId: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: taskKeys.list(transactionId),
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!transactionId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error loading tasks",
        description: error.message,
      });
    },
  });
};

export const useCreateTask = (transactionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list(transactionId) });

      const previousTasks = queryClient.getQueryData(taskKeys.list(transactionId));

      const optimisticTask = {
        ...newTask,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(taskKeys.list(transactionId), (old: Task[] | undefined) =>
        old ? [optimisticTask, ...old] : [optimisticTask]
      );

      return { previousTasks, optimisticTask };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(transactionId), context.previousTasks);
      }
      toast({
        variant: "destructive",
        title: "Error creating task",
        description: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData(taskKeys.list(transactionId), (old: Task[] | undefined) =>
        old?.map(t => t.id === context?.optimisticTask.id ? data : t) || []
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
  });
};

export const useUpdateTask = (transactionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list(transactionId) });

      const previousTasks = queryClient.getQueryData(taskKeys.list(transactionId));

      queryClient.setQueryData(taskKeys.list(transactionId), (old: Task[] | undefined) =>
        old?.map(task => task.id === id ? { ...task, ...updates } : task) || []
      );

      return { previousTasks };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(transactionId), context.previousTasks);
      }
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: error.message,
      });
    },
    onSuccess: (data) => {
      // Update with server response
      queryClient.setQueryData(taskKeys.list(transactionId), (old: Task[] | undefined) =>
        old?.map(task => task.id === data.id ? data : task) || []
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
  });
};

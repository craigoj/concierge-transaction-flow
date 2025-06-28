
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AutomationNotification {
  id: string;
  message: string;
  transaction_id: string;
  created_at: string;
  is_read: boolean;
}

export const useRealtimeNotifications = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time notifications for user:', userId);

    // Listen for new notifications
    const notificationChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          
          const notification = payload.new as AutomationNotification;
          
          // Show toast notification
          toast({
            title: "Automation Triggered",
            description: notification.message,
            duration: 6000,
          });
          
          // Invalidate notifications query to refresh the list
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    // Listen for workflow execution updates
    const executionChannel = supabase
      .channel('workflow-executions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workflow_executions'
        },
        (payload) => {
          console.log('Workflow execution updated:', payload);
          
          const execution = payload.new as any;
          
          // Show notification for completed or failed executions
          if (execution.status === 'completed') {
            toast({
              title: "Automation Completed",
              description: `Workflow automation has completed successfully.`,
              variant: "default",
            });
          } else if (execution.status === 'failed') {
            toast({
              title: "Automation Failed",
              description: `Workflow automation failed: ${execution.error_message}`,
              variant: "destructive",
            });
          }
          
          // Invalidate execution queries
          queryClient.invalidateQueries({ queryKey: ['automation', 'executions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(executionChannel);
    };
  }, [userId, toast, queryClient]);
};

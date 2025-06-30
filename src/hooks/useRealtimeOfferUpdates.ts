
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { offerRequestKeys } from '@/hooks/queries/useOfferRequests';

export const useRealtimeOfferUpdates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time offer updates for user:', user.id);

    const subscription = supabase
      .channel('offer_updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'offer_requests',
          filter: `agent_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Offer request updated:', payload);
          const updatedOffer = payload.new as any;
          
          // Update the query cache
          queryClient.invalidateQueries({ queryKey: offerRequestKeys.all });
          queryClient.invalidateQueries({ queryKey: offerRequestKeys.detail(updatedOffer.id) });
          
          // Show status notification
          const statusMessages = {
            'pending': 'Your offer request is pending review',
            'under_review': 'Your offer request is being reviewed',
            'approved': 'Your offer request has been approved! 🎉',
            'rejected': 'Your offer request needs revisions',
            'processed': 'Your offer has been processed and sent'
          };

          const message = statusMessages[updatedOffer.status as keyof typeof statusMessages];
          if (message) {
            toast({
              title: 'Offer Status Update',
              description: message,
              variant: updatedOffer.status === 'approved' ? 'default' : 'default'
            });
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offer_requests',
          filter: `agent_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New offer request created:', payload);
          queryClient.invalidateQueries({ queryKey: offerRequestKeys.all });
          
          toast({
            title: 'Offer Request Created',
            description: 'Your offer request has been submitted successfully',
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up offer updates subscription');
      supabase.removeChannel(subscription);
    };
  }, [user?.id, queryClient, toast]);

  return null;
};

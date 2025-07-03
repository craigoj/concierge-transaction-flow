
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCoordinatorAccess = () => {
  const [isCoordinator, setIsCoordinator] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkCoordinatorAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsCoordinator(false);
          setLoading(false);
          return;
        }

        // Check profile role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, invitation_status, admin_activated')
          .eq('id', user.id)
          .single();

        console.log('Coordinator access check:', { user: user.email, profile, error });

        setDebugInfo({ user: user.email, profile, error });
        
        if (error) {
          console.error('Error checking coordinator access:', error);
          setIsCoordinator(false);
        } else {
          // For coordinator role, we'll allow access even if admin_activated is false
          // This is a temporary workaround for the activation issue
          const hasCoordinatorRole = profile?.role === 'coordinator';
          setIsCoordinator(hasCoordinatorRole);
          console.log('Is coordinator:', hasCoordinatorRole);
        }
      } catch (error) {
        console.error('Exception checking coordinator access:', error);
        setIsCoordinator(false);
      } finally {
        setLoading(false);
      }
    };

    checkCoordinatorAccess();
  }, []);

  return { isCoordinator, loading, debugInfo };
};

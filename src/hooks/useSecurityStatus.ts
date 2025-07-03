
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SecurityStatus {
  isSecure: boolean;
  isOnline: boolean;
  hasValidSession: boolean;
  rateLimitStatus: 'ok' | 'warning' | 'blocked';
  lastValidation: Date | null;
}

export const useSecurityStatus = () => {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<SecurityStatus>({
    isSecure: false,
    isOnline: navigator.onLine,
    hasValidSession: false,
    rateLimitStatus: 'ok',
    lastValidation: null
  });

  const checkSecurityStatus = useCallback(async () => {
    try {
      // Check if we have a valid session
      const hasValidSession = !!(user && session && !session.expires_at || 
        (session?.expires_at && new Date(session.expires_at * 1000) > new Date()));

      // Test connection with a simple query
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const isOnline = !error;

      // Update status
      setStatus(prev => ({
        ...prev,
        isSecure: hasValidSession && isOnline,
        isOnline,
        hasValidSession,
        lastValidation: new Date()
      }));

    } catch (error) {
      console.error('Security status check failed:', error);
      setStatus(prev => ({
        ...prev,
        isSecure: false,
        isOnline: false,
        lastValidation: new Date()
      }));
    }
  }, [user, session]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkSecurityStatus();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false, isSecure: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkSecurityStatus]);

  // Initial check and periodic updates
  useEffect(() => {
    checkSecurityStatus();
    const interval = setInterval(checkSecurityStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkSecurityStatus]);

  const updateRateLimitStatus = useCallback((newStatus: 'ok' | 'warning' | 'blocked') => {
    setStatus(prev => ({ ...prev, rateLimitStatus: newStatus }));
  }, []);

  return {
    status,
    checkSecurityStatus,
    updateRateLimitStatus
  };
};

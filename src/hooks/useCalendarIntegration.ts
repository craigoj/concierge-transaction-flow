
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCalendarIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectGoogleCalendar = async () => {
    try {
      setIsConnecting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to connect your calendar.",
          variant: "destructive",
        });
        return;
      }

      // Create Google OAuth URL using the actual Google Client ID
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.append('client_id', '2044a8b6c3f708992d480240b149dc5f39f50e0b48c658031bc525dce98e92a2');
      googleAuthUrl.searchParams.append('redirect_uri', 'https://tdupublcyigkgdlobzqi.supabase.co/functions/v1/google-calendar-auth');
      googleAuthUrl.searchParams.append('response_type', 'code');
      googleAuthUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar');
      googleAuthUrl.searchParams.append('access_type', 'offline');
      googleAuthUrl.searchParams.append('prompt', 'consent');
      googleAuthUrl.searchParams.append('state', user.id);

      // Open OAuth flow in new window
      window.open(googleAuthUrl.toString(), '_blank', 'width=500,height=600');
      
      toast({
        title: "Calendar connection initiated",
        description: "Please complete the authorization in the new window.",
      });
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkCalendarConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.log('No calendar integration found');
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      return false;
    }
  };

  const disconnectCalendar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('calendar_integrations')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Calendar disconnected",
        description: "Your Google Calendar has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    connectGoogleCalendar,
    checkCalendarConnection,
    disconnectCalendar,
    isConnecting,
  };
};

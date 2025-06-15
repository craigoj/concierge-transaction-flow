
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, Calendar, Mail } from 'lucide-react';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { sendWelcomeEmail } from '@/utils/emailUtils';
import { createCalendarEvent } from '@/utils/calendarUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const IntegrationTestPanel = () => {
  const [testing, setTesting] = useState({ calendar: false, email: false });
  const { connectGoogleCalendar, checkCalendarConnection } = useCalendarIntegration();
  const { toast } = useToast();

  const testCalendarIntegration = async () => {
    setTesting(prev => ({ ...prev, calendar: true }));
    
    try {
      // First check if calendar is connected
      const isConnected = await checkCalendarConnection();
      
      if (!isConnected) {
        toast({
          title: "Calendar not connected",
          description: "Please connect your Google Calendar first.",
          variant: "destructive",
        });
        return;
      }

      // Create a test calendar event
      const testEvent = {
        transactionId: 'test-transaction-id',
        eventType: 'contract' as const,
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        title: 'Test Calendar Event',
        description: 'This is a test event created by The Agent Concierge Co.',
      };

      await createCalendarEvent(testEvent);
      
      toast({
        title: "Calendar test successful!",
        description: "Test event created in your Google Calendar.",
      });
    } catch (error) {
      console.error('Calendar test failed:', error);
      toast({
        title: "Calendar test failed",
        description: "Failed to create test calendar event. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, calendar: false }));
    }
  };

  const testEmailIntegration = async () => {
    setTesting(prev => ({ ...prev, email: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        toast({
          title: "Authentication required",
          description: "Please log in to test email functionality.",
          variant: "destructive",
        });
        return;
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const agentName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Agent';

      await sendWelcomeEmail(user.email, agentName);
      
      toast({
        title: "Email test successful!",
        description: `Test welcome email sent to ${user.email}`,
      });
    } catch (error) {
      console.error('Email test failed:', error);
      toast({
        title: "Email test failed",
        description: "Failed to send test email. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, email: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Integration Testing
        </CardTitle>
        <CardDescription>
          Test your Google Calendar and email integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <span className="font-medium">Google Calendar</span>
              <p className="text-sm text-gray-600">Test calendar event creation</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={testCalendarIntegration}
            disabled={testing.calendar}
          >
            {testing.calendar ? 'Testing...' : 'Test Calendar'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium">Email (Resend)</span>
              <p className="text-sm text-gray-600">Test email sending functionality</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={testEmailIntegration}
            disabled={testing.email}
          >
            {testing.email ? 'Testing...' : 'Test Email'}
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> Calendar testing requires an active Google Calendar connection. 
          Email testing will send a welcome email to your account email address.
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationTestPanel;

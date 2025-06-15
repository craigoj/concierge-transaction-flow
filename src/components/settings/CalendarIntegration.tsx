
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';

const CalendarIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { connectGoogleCalendar, checkCalendarConnection, disconnectCalendar, isConnecting } = useCalendarIntegration();

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      const connected = await checkCalendarConnection();
      setIsConnected(connected);
      setIsLoading(false);
    };

    checkConnection();
  }, [checkCalendarConnection]);

  const handleConnect = async () => {
    await connectGoogleCalendar();
    // Recheck connection status after a delay to account for OAuth flow
    setTimeout(async () => {
      const connected = await checkCalendarConnection();
      setIsConnected(connected);
    }, 2000);
  };

  const handleDisconnect = async () => {
    await disconnectCalendar();
    setIsConnected(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar Integration
          </CardTitle>
          <CardDescription>
            Loading calendar connection status...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Automatically sync transaction deadlines to your Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">Google Calendar</span>
            </div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <div className="flex gap-2">
            {isConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                disabled={isConnecting}
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>
        
        {isConnected && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            ✓ Your transaction deadlines will automatically appear in your Google Calendar
          </div>
        )}
        
        {!isConnected && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            Connect your Google Calendar to automatically sync important dates like contract deadlines, inspections, and closing dates.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration;

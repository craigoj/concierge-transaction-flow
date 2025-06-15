
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Mail, Calendar, Bell } from 'lucide-react';
import CalendarIntegration from '@/components/settings/CalendarIntegration';
import IntegrationTestPanel from '@/components/settings/IntegrationTestPanel';

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2 mb-8">
        <SettingsIcon className="h-8 w-8 text-brand-charcoal" />
        <h1 className="text-3xl font-brand-heading font-semibold text-brand-charcoal uppercase tracking-brand-wide">
          Settings
        </h1>
      </div>

      <div className="grid gap-6">
        {/* Integration Testing */}
        <IntegrationTestPanel />

        {/* Calendar Integration */}
        <CalendarIntegration />

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Manage your email notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Completions</p>
                  <p className="text-sm text-gray-600">Get notified when tasks are completed</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Action Required</p>
                  <p className="text-sm text-gray-600">Get notified when your action is needed</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Summaries</p>
                  <p className="text-sm text-gray-600">Receive weekly transaction summaries</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications in the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-gray-600">Show notifications in your browser</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Alerts</p>
                  <p className="text-sm text-gray-600">Play sound for important notifications</p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

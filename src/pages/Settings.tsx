
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Bell, Shield, Palette, Download, Key, Moon, Sun } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    deadlines: true,
    newTransactions: true,
    taskAssignments: true
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showLastSeen: true,
    allowDataExport: true
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success('Notification preferences updated');
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast.success('Privacy settings updated');
  };

  const handleDataExport = () => {
    toast.success('Data export started. You will receive an email when ready.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Notification Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Deadline Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get notified about upcoming deadlines</p>
                    </div>
                    <Switch
                      checked={notifications.deadlines}
                      onCheckedChange={(checked) => handleNotificationChange('deadlines', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Transactions</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new transactions are created</p>
                    </div>
                    <Switch
                      checked={notifications.newTransactions}
                      onCheckedChange={(checked) => handleNotificationChange('newTransactions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Task Assignments</Label>
                      <p className="text-sm text-muted-foreground">Get notified when tasks are assigned to you</p>
                    </div>
                    <Switch
                      checked={notifications.taskAssignments}
                      onCheckedChange={(checked) => handleNotificationChange('taskAssignments', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={privacy.profilePublic}
                  onCheckedChange={(checked) => handlePrivacyChange('profilePublic', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Last Seen</Label>
                  <p className="text-sm text-muted-foreground">Allow others to see when you were last active</p>
                </div>
                <Switch
                  checked={privacy.showLastSeen}
                  onCheckedChange={(checked) => handlePrivacyChange('showLastSeen', checked)}
                />
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <Button variant="outline" className="w-full">
                Enable Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Data Export</Label>
                  <p className="text-sm text-muted-foreground">Enable the ability to export your data</p>
                </div>
                <Switch
                  checked={privacy.allowDataExport}
                  onCheckedChange={(checked) => handlePrivacyChange('allowDataExport', checked)}
                />
              </div>

              {privacy.allowDataExport && (
                <div className="pt-4 border-t">
                  <Button onClick={handleDataExport} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will create a zip file containing all your transaction data, contacts, and documents.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Integration Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with external services like CRM systems, MLS, and email providers.
                </p>
                <Button variant="outline" disabled>
                  Manage Integrations (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

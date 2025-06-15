
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Bell, Shield, Palette, Download, Key, Moon, Sun } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import Breadcrumb from '@/components/navigation/Breadcrumb';
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
    <>
      <AppSidebar />
      <SidebarInset className="flex-1">
        <AppHeader />
        
        <main className="p-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Breadcrumb />
          </div>

          {/* Premium Header Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
                  Settings
                </h1>
                <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
                  Customize your experience with precision and control
                </p>
              </div>
            </div>
            <div className="w-24 h-px bg-brand-taupe"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Appearance Settings */}
            <Card className="hover:shadow-brand-elevation transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-brand-heading tracking-wide text-brand-charcoal uppercase">
                  <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
                    <Palette className="h-6 w-6 text-brand-taupe" />
                  </div>
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-brand-heading tracking-wide text-brand-charcoal">Theme</Label>
                    <p className="text-sm font-brand-body text-brand-charcoal/60">Choose your preferred theme</p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
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
            <Card className="hover:shadow-brand-elevation transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-brand-heading tracking-wide text-brand-charcoal uppercase">
                  <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
                    <Bell className="h-6 w-6 text-brand-taupe" />
                  </div>
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h4 className="font-brand-heading font-medium text-brand-charcoal tracking-wide uppercase mb-6">Notification Methods</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-brand-heading tracking-wide text-brand-charcoal">Email Notifications</Label>
                        <p className="text-sm font-brand-body text-brand-charcoal/60">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-brand-heading tracking-wide text-brand-charcoal">SMS Notifications</Label>
                        <p className="text-sm font-brand-body text-brand-charcoal/60">Receive notifications via text message</p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-brand-heading tracking-wide text-brand-charcoal">Push Notifications</Label>
                        <p className="text-sm font-brand-body text-brand-charcoal/60">Receive browser push notifications</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-brand-heading font-medium text-brand-charcoal tracking-wide uppercase mb-6">Notification Types</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-brand-heading tracking-wide text-brand-charcoal">Deadline Reminders</Label>
                        <p className="text-sm font-brand-body text-brand-charcoal/60">Get notified about upcoming deadlines</p>
                      </div>
                      <Switch
                        checked={notifications.deadlines}
                        onCheckedChange={(checked) => handleNotificationChange('deadlines', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-brand-heading tracking-wide text-brand-charcoal">New Transactions</Label>
                        <p className="text-sm font-brand-body text-brand-charcoal/60">Get notified when new transactions are created</p>
                      </div>
                      <Switch
                        checked={notifications.newTransactions}
                        onCheckedChange={(checked) => handleNotificationChange('newTransactions', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-brand-heading tracking-wide text-brand-charcoal">Task Assignments</Label>
                        <p className="text-sm font-brand-body text-brand-charcoal/60">Get notified when tasks are assigned to you</p>
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
            <Card className="hover:shadow-brand-elevation transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-brand-heading tracking-wide text-brand-charcoal uppercase">
                  <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-brand-taupe" />
                  </div>
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-brand-heading tracking-wide text-brand-charcoal">Public Profile</Label>
                    <p className="text-sm font-brand-body text-brand-charcoal/60">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={privacy.profilePublic}
                    onCheckedChange={(checked) => handlePrivacyChange('profilePublic', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-brand-heading tracking-wide text-brand-charcoal">Show Last Seen</Label>
                    <p className="text-sm font-brand-body text-brand-charcoal/60">Allow others to see when you were last active</p>
                  </div>
                  <Switch
                    checked={privacy.showLastSeen}
                    onCheckedChange={(checked) => handlePrivacyChange('showLastSeen', checked)}
                  />
                </div>

                <div className="pt-6 border-t border-brand-taupe/30 space-y-4">
                  <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl hover:bg-brand-taupe/10">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>

                  <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl hover:bg-brand-taupe/10">
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="hover:shadow-brand-elevation transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-brand-heading tracking-wide text-brand-charcoal uppercase">
                  <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
                    <Download className="h-6 w-6 text-brand-taupe" />
                  </div>
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-brand-heading tracking-wide text-brand-charcoal">Allow Data Export</Label>
                    <p className="text-sm font-brand-body text-brand-charcoal/60">Enable the ability to export your data</p>
                  </div>
                  <Switch
                    checked={privacy.allowDataExport}
                    onCheckedChange={(checked) => handlePrivacyChange('allowDataExport', checked)}
                  />
                </div>

                {privacy.allowDataExport && (
                  <div className="pt-6 border-t border-brand-taupe/30">
                    <Button 
                      onClick={handleDataExport} 
                      variant="outline" 
                      className="w-full bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl hover:bg-brand-taupe/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                    <p className="text-xs font-brand-body text-brand-charcoal/60 mt-3">
                      This will create a zip file containing all your transaction data, contacts, and documents.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Integration Settings */}
            <Card className="hover:shadow-brand-elevation transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-brand-heading tracking-wide text-brand-charcoal uppercase">
                  <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
                    <SettingsIcon className="h-6 w-6 text-brand-taupe" />
                  </div>
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-brand-taupe/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <SettingsIcon className="h-10 w-10 text-brand-taupe" />
                  </div>
                  <h3 className="text-xl font-brand-heading tracking-wide text-brand-charcoal uppercase mb-4">Integration Settings</h3>
                  <p className="text-brand-charcoal/60 font-brand-body mb-6 max-w-md mx-auto">
                    Connect with external services like CRM systems, MLS, and email providers.
                  </p>
                  <Button 
                    variant="outline" 
                    disabled
                    className="bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl"
                  >
                    Manage Integrations (Coming Soon)
                  </Button>
                  <div className="w-16 h-px bg-brand-taupe mx-auto mt-6"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </>
  );
};

export default Settings;

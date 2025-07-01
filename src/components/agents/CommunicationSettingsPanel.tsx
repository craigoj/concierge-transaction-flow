
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Bell, Settings, Phone } from "lucide-react";

interface CommunicationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  notification_types: string[];
  template_preferences: Record<string, any>;
}

export const CommunicationSettingsPanel = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ['agents-for-communication'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'agent')
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['communication-settings', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null;
      
      const { data, error } = await supabase
        .from('communication_settings')
        .select('*')
        .eq('user_id', selectedUser)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as CommunicationSettings | null;
    },
    enabled: !!selectedUser
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<CommunicationSettings>) => {
      const { data, error } = await supabase
        .from('communication_settings')
        .upsert({
          user_id: selectedUser,
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Communication settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['communication-settings'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update settings",
        description: error.message,
      });
    }
  });

  const handleToggleSetting = (setting: keyof Pick<CommunicationSettings, 'email_enabled' | 'sms_enabled'>, value: boolean) => {
    if (!selectedUser) return;
    
    updateSettingsMutation.mutate({
      [setting]: value
    });
  };

  const handleNotificationTypeToggle = (type: string, enabled: boolean) => {
    if (!selectedUser || !settings) return;
    
    const currentTypes = settings.notification_types || [];
    const newTypes = enabled 
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    
    updateSettingsMutation.mutate({
      notification_types: newTypes
    });
  };

  const renderGlobalSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Global Communication Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Default Email Notifications</Label>
            <p className="text-sm text-gray-600">Enable email notifications by default for new agents</p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>SMS Service Integration</Label>
            <p className="text-sm text-gray-600">Enable SMS notifications (requires Twilio setup)</p>
          </div>
          <Switch />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label>Bulk Communication Controls</Label>
            <p className="text-sm text-gray-600">Allow bulk email/SMS to all agents</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );

  const renderUserSettings = () => {
    if (!selectedUser) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select an agent to manage their communication settings</p>
          </CardContent>
        </Card>
      );
    }

    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const selectedAgent = agents?.find(a => a.id === selectedUser);

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Communication Settings for {selectedAgent?.first_name} {selectedAgent?.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={settings?.email_enabled ?? true}
                  onCheckedChange={(checked) => handleToggleSetting('email_enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={settings?.sms_enabled ?? false}
                  onCheckedChange={(checked) => handleToggleSetting('sms_enabled', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Notification Types</Label>
              {[
                { id: 'account_updates', label: 'Account Updates' },
                { id: 'transaction_updates', label: 'Transaction Updates' },
                { id: 'task_reminders', label: 'Task Reminders' },
                { id: 'system_announcements', label: 'System Announcements' },
                { id: 'training_updates', label: 'Training Updates' }
              ].map((type) => (
                <div key={type.id} className="flex items-center justify-between">
                  <Label className="text-sm">{type.label}</Label>
                  <Switch
                    checked={settings?.notification_types?.includes(type.id) ?? false}
                    onCheckedChange={(checked) => handleNotificationTypeToggle(type.id, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Email Template Preferences</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue placeholder="Select preferred email template style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Templates</SelectItem>
                <SelectItem value="minimal">Minimal Style</SelectItem>
                <SelectItem value="professional">Professional Style</SelectItem>
                <SelectItem value="branded">Branded Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Custom Notes</Label>
            <Textarea
              placeholder="Add any special communication preferences or notes..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Settings</h2>
          <p className="text-gray-600">Manage communication preferences and settings</p>
        </div>
      </div>

      {renderGlobalSettings()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <Label>Select Agent</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an agent..." />
            </SelectTrigger>
            <SelectContent>
              {agents?.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.first_name} {agent.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="lg:col-span-2">
          {renderUserSettings()}
        </div>
      </div>
    </div>
  );
};

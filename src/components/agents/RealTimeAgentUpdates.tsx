
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  User, 
  UserCheck, 
  UserX, 
  Clock,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";

interface RealtimeUpdate {
  id: string;
  user_id: string;
  action: string;
  description: string;
  timestamp: string;
  agent_name?: string;
}

export const RealTimeAgentUpdates = () => {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Set up realtime subscription for agent profile changes
    const profilesChannel = supabase
      .channel('agent-profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.agent'
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          
          // Invalidate agent queries
          queryClient.invalidateQueries({ queryKey: ['agents'] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-agents'] });
          
          // Add to updates feed
          if (payload.eventType === 'UPDATE') {
            const newUpdate: RealtimeUpdate = {
              id: `profile-${payload.new.id}-${Date.now()}`,
              user_id: payload.new.id,
              action: 'profile_update',
              description: `Agent profile updated: ${payload.new.first_name} ${payload.new.last_name}`,
              timestamp: new Date().toISOString(),
              agent_name: `${payload.new.first_name} ${payload.new.last_name}`
            };
            
            setUpdates(prev => [newUpdate, ...prev.slice(0, 49)]); // Keep last 50 updates
            
            // Show toast for significant changes
            if (payload.old.invitation_status !== payload.new.invitation_status) {
              toast({
                title: "Agent Status Updated",
                description: `${payload.new.first_name} ${payload.new.last_name} status changed to ${payload.new.invitation_status}`,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Profiles subscription status:', status);
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    // Set up realtime subscription for activity logs
    const activityChannel = supabase
      .channel('agent-activity-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enhanced_activity_logs',
          filter: 'category=eq.agent_management'
        },
        async (payload) => {
          console.log('Activity log detected:', payload);
          
          // Fetch agent name for the update
          let agentName = 'Unknown Agent';
          if (payload.new.target_user_id) {
            const { data: agent } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', payload.new.target_user_id)
              .single();
            
            if (agent) {
              agentName = `${agent.first_name} ${agent.last_name}`;
            }
          }
          
          const newUpdate: RealtimeUpdate = {
            id: `activity-${payload.new.id}`,
            user_id: payload.new.target_user_id || payload.new.user_id,
            action: payload.new.action,
            description: payload.new.description,
            timestamp: payload.new.created_at,
            agent_name: agentName
          };
          
          setUpdates(prev => [newUpdate, ...prev.slice(0, 49)]);
          
          // Show toast for important actions
          if (['account_lock', 'account_unlock', 'status_change'].includes(payload.new.action)) {
            toast({
              title: "Agent Management Action",
              description: payload.new.description,
            });
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for agent invitations
    const invitationsChannel = supabase
      .channel('agent-invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_invitations'
        },
        async (payload) => {
          console.log('Invitation change detected:', payload);
          
          // Invalidate invitation queries
          queryClient.invalidateQueries({ queryKey: ['agent-invitations'] });
          
          // Fetch agent name
          let agentName = 'Unknown Agent';
          if (payload.new?.agent_id) {
            const { data: agent } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', payload.new.agent_id)
              .single();
            
            if (agent) {
              agentName = `${agent.first_name} ${agent.last_name}`;
            }
          }
          
          const getActionFromInvitationChange = (eventType: string, newStatus?: string, oldStatus?: string) => {
            if (eventType === 'INSERT') return 'invitation_sent';
            if (newStatus !== oldStatus) return 'invitation_status_change';
            return 'invitation_update';
          };
          
          const newUpdate: RealtimeUpdate = {
            id: `invitation-${payload.new?.id || payload.old?.id}-${Date.now()}`,
            user_id: payload.new?.agent_id || payload.old?.agent_id,
            action: getActionFromInvitationChange(payload.eventType, payload.new?.status, payload.old?.status),
            description: payload.eventType === 'INSERT' 
              ? `Invitation sent to ${agentName}`
              : `Invitation status updated for ${agentName}${payload.new?.status ? ` to ${payload.new.status}` : ''}`,
            timestamp: new Date().toISOString(),
            agent_name: agentName
          };
          
          setUpdates(prev => [newUpdate, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      profilesChannel.unsubscribe();
      activityChannel.unsubscribe();
      invitationsChannel.unsubscribe();
    };
  }, [queryClient, toast]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'profile_update':
        return <User className="h-4 w-4" />;
      case 'status_change':
        return <RefreshCw className="h-4 w-4" />;
      case 'account_lock':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'account_unlock':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'invitation_sent':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const colors = {
      profile_update: 'bg-blue-100 text-blue-800',
      status_change: 'bg-yellow-100 text-yellow-800',
      account_lock: 'bg-red-100 text-red-800',
      account_unlock: 'bg-green-100 text-green-800',
      invitation_sent: 'bg-purple-100 text-purple-800',
      invitation_status_change: 'bg-orange-100 text-orange-800',
    };
    
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Real-time Agent Updates
          </CardTitle>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span className="text-xs">Connected</span>
              </div>
            ) : connectionStatus === 'disconnected' ? (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span className="text-xs">Disconnected</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-xs">Connecting...</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {updates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent updates</p>
              <p className="text-xs">Agent activity will appear here in real-time</p>
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getActionIcon(update.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getActionBadge(update.action)}>
                      {update.action.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(update.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{update.description}</p>
                  {update.agent_name && (
                    <p className="text-xs text-gray-600 mt-1">Agent: {update.agent_name}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

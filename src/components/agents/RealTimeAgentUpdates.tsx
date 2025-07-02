
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Users, Activity, TrendingUp, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RealtimeUpdate {
  id: string;
  timestamp: string;
  type: 'agent_created' | 'agent_updated' | 'agent_deleted' | 'status_changed';
  agentName: string;
  details: string;
  priority: 'low' | 'medium' | 'high';
}

export const RealTimeAgentUpdates = () => {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    pendingAgents: 0,
    recentActivity: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('agent-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.agent'
        },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          toast({
            title: "Real-time Updates Active",
            description: "You'll receive live updates for agent changes.",
          });
        }
      });

    // Load initial statistics
    loadStatistics();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    let updateType: RealtimeUpdate['type'] = 'agent_updated';
    let details = '';
    let priority: RealtimeUpdate['priority'] = 'medium';

    switch (eventType) {
      case 'INSERT':
        updateType = 'agent_created';
        details = `New agent ${newRecord.first_name} ${newRecord.last_name} has been created`;
        priority = 'high';
        break;
      case 'UPDATE':
        if (oldRecord.invitation_status !== newRecord.invitation_status) {
          updateType = 'status_changed';
          details = `Agent status changed from ${oldRecord.invitation_status} to ${newRecord.invitation_status}`;
          priority = newRecord.invitation_status === 'completed' ? 'high' : 'medium';
        } else {
          details = `Agent ${newRecord.first_name} ${newRecord.last_name} has been updated`;
        }
        break;
      case 'DELETE':
        updateType = 'agent_deleted';
        details = `Agent ${oldRecord.first_name} ${oldRecord.last_name} has been deleted`;
        priority = 'high';
        break;
    }

    const newUpdate: RealtimeUpdate = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: updateType,
      agentName: `${newRecord?.first_name || oldRecord?.first_name} ${newRecord?.last_name || oldRecord?.last_name}`,
      details,
      priority
    };

    setUpdates(prev => [newUpdate, ...prev.slice(0, 9)]); // Keep last 10 updates
    loadStatistics(); // Refresh stats

    // Show toast notification for high priority updates
    if (priority === 'high') {
      toast({
        title: "Agent Update",
        description: details,
        variant: updateType === 'agent_deleted' ? 'destructive' : 'default',
      });
    }
  };

  const loadStatistics = async () => {
    try {
      const { data: agents, error } = await supabase
        .from('profiles')
        .select('invitation_status, created_at')
        .eq('role', 'agent');

      if (error) throw error;

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      setStats({
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.invitation_status === 'completed').length,
        pendingAgents: agents.filter(a => a.invitation_status === 'pending').length,
        recentActivity: agents.filter(a => new Date(a.created_at) > yesterday).length
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const getPriorityColor = (priority: RealtimeUpdate['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpdateIcon = (type: RealtimeUpdate['type']) => {
    switch (type) {
      case 'agent_created': return <Users className="h-4 w-4 text-green-600" />;
      case 'agent_updated': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'agent_deleted': return <Users className="h-4 w-4 text-red-600" />;
      case 'status_changed': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={isConnected ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        <Activity className={`h-4 w-4 ${isConnected ? 'text-green-600' : 'text-yellow-600'}`} />
        <AlertDescription>
          Real-time updates are {isConnected ? 'connected' : 'connecting...'}
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">All registered agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">Fully activated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Bell className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAgents}</div>
            <p className="text-xs text-muted-foreground">Awaiting setup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Updates Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStatistics}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity. Updates will appear here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    {getUpdateIcon(update.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {update.agentName}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(update.priority)}>
                          {update.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(update.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {update.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

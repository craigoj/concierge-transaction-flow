
import { useState } from "react";
import { StreamlinedCreateAgentDialog } from "@/components/agents/StreamlinedCreateAgentDialog";
import { SimplifiedAgentsList } from "@/components/agents/SimplifiedAgentsList";
import { Users, Settings, BarChart3, UserCog, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Agents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAgentCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch agents data for stats
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents-stats', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.admin_activated).length,
    inactive: agents.filter(a => !a.admin_activated).length,
    thisMonth: agents.filter(a => {
      const createdDate = new Date(a.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-charcoal rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
                Agent Management
              </h1>
              <p className="text-brand-charcoal/60 font-brand-body mt-1">
                Manage your white glove service agents with simplified status controls
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-brand-taupe/30">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <StreamlinedCreateAgentDialog onAgentCreated={handleAgentCreated} />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All agents in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCog className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently active agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Activity className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Inactive agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">New agents added</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <SimplifiedAgentsList 
        refreshTrigger={refreshTrigger} 
        onRefresh={handleAgentCreated}
      />
    </div>
  );
};

export default Agents;


import { useState } from "react";
import { EnhancedCreateAgentDialog } from "@/components/agents/EnhancedCreateAgentDialog";
import { EnhancedAgentsList } from "@/components/agents/EnhancedAgentsList";
import { AgentOnboardingManager } from "@/components/agents/AgentOnboardingManager";
import { EmailTemplateManager } from "@/components/agents/EmailTemplateManager";
import { AgentProfileTemplateManager } from "@/components/agents/AgentProfileTemplateManager";
import { CommunicationSettingsPanel } from "@/components/agents/CommunicationSettingsPanel";
import { RealTimeAgentUpdates } from "@/components/agents/RealTimeAgentUpdates";
import { Users, Settings, UserPlus, Download, BarChart3, Mail, Template, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Agents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAgentCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch agents data for the onboarding manager
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', refreshTrigger],
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
    active: agents.filter(a => a.invitation_status === 'completed').length,
    pending: agents.filter(a => a.invitation_status === 'sent').length,
    invited: agents.filter(a => a.invitation_status === 'pending').length,
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
                Enhanced Agent Management
              </h1>
              <p className="text-brand-charcoal/60 font-brand-body mt-1">
                Complete agent lifecycle management with advanced controls
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-brand-taupe/30">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" className="border-brand-taupe/30">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <EnhancedCreateAgentDialog onAgentCreated={handleAgentCreated} />
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
            <p className="text-xs text-muted-foreground">All registered agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Fully activated accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting setup</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {agents.filter(a => {
                const createdDate = new Date(a.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && 
                       createdDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">New this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="list">Agent List</TabsTrigger>
          <TabsTrigger value="management">Onboarding</TabsTrigger>
          <TabsTrigger value="templates">Profile Templates</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="activity">Real-time Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <EnhancedAgentsList refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="management">
          {!isLoading && (
            <AgentOnboardingManager 
              agents={agents} 
              onRefresh={handleAgentCreated} 
            />
          )}
        </TabsContent>

        <TabsContent value="templates">
          <AgentProfileTemplateManager />
        </TabsContent>

        <TabsContent value="email-templates">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationSettingsPanel />
        </TabsContent>

        <TabsContent value="activity">
          <RealTimeAgentUpdates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agents;

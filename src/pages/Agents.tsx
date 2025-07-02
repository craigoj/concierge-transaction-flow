import { useState } from "react";
import { StreamlinedCreateAgentDialog } from "@/components/agents/StreamlinedCreateAgentDialog";
import { EnhancedAgentAccountController } from "@/components/agents/EnhancedAgentAccountController";
import { AgentOnboardingManager } from "@/components/agents/AgentOnboardingManager";
import { EmailTemplateManager } from "@/components/agents/EmailTemplateManager";
import { AgentProfileTemplateManager } from "@/components/agents/AgentProfileTemplateManager";
import { CommunicationSettingsPanel } from "@/components/agents/CommunicationSettingsPanel";
import { RealTimeAgentUpdates } from "@/components/agents/RealTimeAgentUpdates";
import { AgentCreationTest } from "@/components/agents/AgentCreationTest";
import { AdminDashboardHub } from "@/components/agents/AdminDashboardHub";
import { CommunicationHistoryViewer } from "@/components/agents/CommunicationHistoryViewer";
import { ProgressCheckpointOverride } from "@/components/agents/ProgressCheckpointOverride";
import { AgentAnalyticsDashboard } from "@/components/agents/AgentAnalyticsDashboard";
import { Users, Settings, Download, BarChart3, Mail, MessageSquare, TestTube, UserCog, Activity, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BulkAgentImporter } from "@/components/agents/BulkAgentImporter";
import { AutomatedOnboardingWorkflow } from "@/components/agents/AutomatedOnboardingWorkflow";
import { Import, Workflow } from "lucide-react";

const Agents = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const handleAgentCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Fetch agents data for stats
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
                Advanced Agent Management Suite
              </h1>
              <p className="text-brand-charcoal/60 font-brand-body mt-1">
                Complete agent lifecycle management with real-time analytics and advanced automation
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="border-brand-taupe/30"
              onClick={() => setBulkImportOpen(true)}
            >
              <Import className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
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
            <p className="text-xs text-muted-foreground">All registered agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCog className="h-4 w-4 text-green-600" />
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

      <Tabs defaultValue="management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-1" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="realtime">
            <Activity className="h-4 w-4 mr-1" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="testing">
            <TestTube className="h-4 w-4 mr-1" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="h-4 w-4 mr-1" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="import">
            <Import className="h-4 w-4 mr-1" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <EnhancedAgentAccountController 
            refreshTrigger={refreshTrigger} 
            onRefresh={handleAgentCreated}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AgentAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeAgentUpdates />
        </TabsContent>

        <TabsContent value="dashboard">
          <AdminDashboardHub />
        </TabsContent>

        <TabsContent value="onboarding">
          {!isLoading && (
            <div className="space-y-6">
              <AgentOnboardingManager 
                agents={agents} 
                onRefresh={handleAgentCreated} 
              />
              
              {selectedAgentId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ProgressCheckpointOverride
                    agentId={selectedAgentId}
                    agentName={agents.find(a => a.id === selectedAgentId)?.first_name + ' ' + agents.find(a => a.id === selectedAgentId)?.last_name || 'Agent'}
                    onProgressUpdate={handleAgentCreated}
                  />
                  <CommunicationHistoryViewer
                    agentId={selectedAgentId}
                    agentName={agents.find(a => a.id === selectedAgentId)?.first_name + ' ' + agents.find(a => a.id === selectedAgentId)?.last_name || 'Agent'}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="email-templates">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationSettingsPanel />
        </TabsContent>

        <TabsContent value="testing">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Agent Creation System Testing</h2>
              <p className="text-gray-600 mb-6">
                Use this panel to test and debug the agent creation functionality
              </p>
            </div>
            <AgentCreationTest />
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <AutomatedOnboardingWorkflow />
        </TabsContent>

        <TabsContent value="import">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Bulk Agent Import</h2>
              <p className="text-gray-600 mb-6">
                Import multiple agents at once using CSV upload or manual entry
              </p>
            </div>
            <BulkAgentImporter 
              open={bulkImportOpen}
              onClose={() => setBulkImportOpen(false)}
              onSuccess={handleAgentCreated}
            />
            {!bulkImportOpen && (
              <div className="text-center">
                <Button onClick={() => setBulkImportOpen(true)} size="lg">
                  <Import className="h-5 w-5 mr-2" />
                  Start Bulk Import
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Agents;

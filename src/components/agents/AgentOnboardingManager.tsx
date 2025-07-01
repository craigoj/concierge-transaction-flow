
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Link, 
  Settings,
  Download,
  Upload,
  Eye
} from "lucide-react";
import { BulkAgentImporter } from "./BulkAgentImporter";
import { AgentAccountController } from "./AgentAccountController";

interface AgentOnboardingManagerProps {
  agents: any[];
  onRefresh: () => void;
}

export const AgentOnboardingManager = ({ agents, onRefresh }: AgentOnboardingManagerProps) => {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBulkImporter, setShowBulkImporter] = useState(false);
  const [showAccountController, setShowAccountController] = useState(false);
  const { toast } = useToast();

  // Calculate statistics
  const stats = {
    total: agents.length,
    active: agents.filter(a => a.invitation_status === 'completed').length,
    pending: agents.filter(a => a.invitation_status === 'sent').length,
    invited: agents.filter(a => a.invitation_status === 'pending').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedAgents.length === 0) {
      toast({
        variant: "destructive",
        title: "No agents selected",
        description: "Please select agents to update their status.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('bulk_update_agent_status', {
        p_agent_ids: selectedAgents,
        p_new_status: newStatus,
      });

      if (error) throw error;

      toast({
        title: "Bulk update successful",
        description: `Updated ${data} agent(s) to ${newStatus} status.`,
      });

      setSelectedAgents([]);
      onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Bulk update failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSetupLinks = async () => {
    if (selectedAgents.length === 0) {
      toast({
        variant: "destructive",
        title: "No agents selected",
        description: "Please select agents to generate setup links.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const links = [];
      
      for (const agentId of selectedAgents) {
        const { data, error } = await supabase.functions.invoke('generate-setup-link', {
          body: { agentId, expiresHours: 72 }
        });

        if (error) throw error;
        
        if (data?.success) {
          const agent = agents.find(a => a.id === agentId);
          links.push({
            name: `${agent?.first_name} ${agent?.last_name}`,
            email: agent?.email,
            link: data.setupLink,
          });
        }
      }

      // Create downloadable text file with links
      const linkText = links
        .map(l => `${l.name} (${l.email}): ${l.link}`)
        .join('\n');
      
      const blob = new Blob([linkText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-setup-links-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Setup links generated",
        description: `Generated ${links.length} setup links and downloaded them as a file.`,
      });

      setSelectedAgents([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate setup links",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const selectAllAgents = () => {
    setSelectedAgents(agents.map(a => a.id));
  };

  const clearSelection = () => {
    setSelectedAgents([]);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Fully onboarded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting setup</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowBulkImporter(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
        
        <Button onClick={() => setShowAccountController(true)} variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Account Manager
        </Button>
        
        <Button onClick={selectAllAgents} variant="outline">
          Select All ({agents.length})
        </Button>
        
        <Button onClick={clearSelection} variant="outline">
          Clear Selection
        </Button>
        
        {selectedAgents.length > 0 && (
          <>
            <Badge variant="secondary" className="px-3 py-1">
              {selectedAgents.length} selected
            </Badge>
            
            <Button 
              onClick={() => handleBulkStatusUpdate('completed')} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Activate Selected
            </Button>
            
            <Button 
              onClick={handleGenerateSetupLinks} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Generate Setup Links
            </Button>
          </>
        )}
      </div>

      {/* Agent List with Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  selectedAgents.includes(agent.id) 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes(agent.id)}
                    onChange={() => toggleAgentSelection(agent.id)}
                    className="rounded"
                  />
                  <div>
                    <p className="font-medium">{agent.first_name} {agent.last_name}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                    {agent.brokerage && (
                      <p className="text-xs text-gray-400">{agent.brokerage}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      agent.invitation_status === 'completed' ? 'default' :
                      agent.invitation_status === 'sent' ? 'secondary' : 'outline'
                    }
                  >
                    {agent.invitation_status}
                  </Badge>
                  
                  {agent.setup_method === 'manual_creation' && (
                    <Badge variant="outline" className="text-xs">
                      Manual
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showBulkImporter && (
        <BulkAgentImporter
          open={showBulkImporter}
          onClose={() => setShowBulkImporter(false)}
          onSuccess={onRefresh}
        />
      )}
      
      {showAccountController && (
        <AgentAccountController
          agents={agents}
          open={showAccountController}
          onClose={() => setShowAccountController(false)}
          onUpdate={onRefresh}
        />
      )}
    </div>
  );
};

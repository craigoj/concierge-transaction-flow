
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Link, 
  Key,
  Eye,
  Settings
} from "lucide-react";
import { 
  AgentProfile, 
  InvitationStatus, 
  SetupMethod,
  SetupLinkResponse,
  ApiError
} from "@/types/agent";

interface AgentAccountControllerProps {
  agents: AgentProfile[];
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const AgentAccountController = ({ agents, open, onClose, onUpdate }: AgentAccountControllerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [setupMethodFilter, setSetupMethodFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.brokerage?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.invitation_status === statusFilter;
    const matchesSetupMethod = setupMethodFilter === 'all' || agent.setup_method === setupMethodFilter;
    
    return matchesSearch && matchesStatus && matchesSetupMethod;
  });

  const handleStatusChange = async (agentId: string, newStatus: InvitationStatus) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          invitation_status: newStatus,
          admin_activated: newStatus === 'completed'
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Agent status has been updated successfully.",
      });

      onUpdate();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSetupLink = async (agentId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-setup-link', {
        body: { agentId, expiresHours: 72 }
      });

      if (error) throw error;

      const response = data as SetupLinkResponse;
      if (response?.success && response.setup_link) {
        // Copy to clipboard
        await navigator.clipboard.writeText(response.setup_link);
        
        toast({
          title: "Setup link generated",
          description: "Setup link has been copied to clipboard.",
        });
      } else {
        throw new Error(response?.error || 'Failed to generate setup link');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Failed to generate setup link",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (agentId: string) => {
    setIsLoading(true);
    try {
      const agent = agents.find(a => a.id === agentId);
      if (!agent?.email) {
        throw new Error("Agent email not found");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(agent.email, {
        redirectTo: `${window.location.origin}/agent/setup`,
      });

      if (error) throw error;

      toast({
        title: "Password reset sent",
        description: `Password reset email sent to ${agent.email}`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: InvitationStatus | null | undefined) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'sent': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'expired': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: InvitationStatus | null | undefined) => {
    switch (status) {
      case 'completed': return <UserCheck className="h-4 w-4" />;
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'pending': return <Mail className="h-4 w-4" />;
      case 'expired': return <UserX className="h-4 w-4" />;
      case 'cancelled': return <UserX className="h-4 w-4" />;
      default: return <UserX className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agent Account Controller</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Account Management</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Agents</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or brokerage..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Status Filter</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Setup Method</Label>
                <Select value={setupMethodFilter} onValueChange={setSetupMethodFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="email_invitation">Email Invitation</SelectItem>
                    <SelectItem value="manual_creation">Manual Creation</SelectItem>
                    <SelectItem value="assisted_setup">Assisted Setup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Agent List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Agents ({filteredAgents.length})</Label>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {filteredAgents.length} of {agents.length} agents
                  </span>
                </div>
              </div>
              
              <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.invitation_status)}`} />
                        <div>
                          <p className="font-medium">
                            {agent.first_name} {agent.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                          {agent.brokerage && (
                            <p className="text-xs text-gray-400">{agent.brokerage}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getStatusIcon(agent.invitation_status)}
                          {agent.invitation_status}
                        </Badge>
                        
                        {agent.setup_method && (
                          <Badge variant="secondary" className="text-xs">
                            {agent.setup_method.replace('_', ' ')}
                          </Badge>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            {selectedAgent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Managing: {selectedAgent.first_name} {selectedAgent.last_name}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAgent(null)}
                  >
                    Back to List
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Current Status</Label>
                      <Select
                        value={selectedAgent.invitation_status}
                        onValueChange={(value) => handleStatusChange(selectedAgent.id, value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleGenerateSetupLink(selectedAgent.id)}
                        disabled={isLoading}
                        className="w-full flex items-center gap-2"
                      >
                        <Link className="h-4 w-4" />
                        Generate Setup Link
                      </Button>
                      
                      <Button
                        onClick={() => handlePasswordReset(selectedAgent.id)}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <Key className="h-4 w-4" />
                        Send Password Reset
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Agent Information</Label>
                      <div className="space-y-1 text-sm">
                        <p><strong>Email:</strong> {selectedAgent.email}</p>
                        <p><strong>Phone:</strong> {selectedAgent.phone_number || 'Not provided'}</p>
                        <p><strong>Brokerage:</strong> {selectedAgent.brokerage || 'Not provided'}</p>
                        <p><strong>Setup Method:</strong> {selectedAgent.setup_method || 'email_invitation'}</p>
                        <p><strong>Invited:</strong> {selectedAgent.invited_at ? new Date(selectedAgent.invited_at).toLocaleDateString() : 'Not invited'}</p>
                        <p><strong>Onboarded:</strong> {selectedAgent.onboarding_completed_at ? new Date(selectedAgent.onboarding_completed_at).toLocaleDateString() : 'Not completed'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select an agent from the Overview tab to manage their account</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Progress Statistics */}
              <div className="space-y-4">
                <h3 className="font-medium">Onboarding Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="text-sm font-medium">
                      {agents.filter(a => a.invitation_status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">In Progress</span>
                    <span className="text-sm font-medium">
                      {agents.filter(a => a.invitation_status === 'sent').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Not Started</span>
                    <span className="text-sm font-medium">
                      {agents.filter(a => a.invitation_status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="col-span-2 space-y-4">
                <h3 className="font-medium">Recent Activity</h3>
                <div className="space-y-2">
                  {agents
                    .filter(a => a.invited_at || a.onboarding_completed_at)
                    .sort((a, b) => {
                      const dateA = new Date(a.onboarding_completed_at || a.invited_at);
                      const dateB = new Date(b.onboarding_completed_at || b.invited_at);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 10)
                    .map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">
                            {agent.first_name} {agent.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {agent.onboarding_completed_at 
                              ? `Completed onboarding on ${new Date(agent.onboarding_completed_at).toLocaleDateString()}`
                              : `Invited on ${new Date(agent.invited_at).toLocaleDateString()}`
                            }
                          </p>
                        </div>
                        <Badge variant={agent.onboarding_completed_at ? 'default' : 'secondary'}>
                          {agent.onboarding_completed_at ? 'Completed' : 'Invited'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

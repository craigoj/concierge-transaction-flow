
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { 
  Search, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Mail, 
  Key, 
  Eye,
  RefreshCw,
  Users,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickActionsMenu } from "./QuickActionsMenu";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface Agent extends Profile {
  // Additional computed fields if needed
}

interface EnhancedAgentsListProps {
  refreshTrigger: number;
}

export const EnhancedAgentsList = ({ refreshTrigger }: EnhancedAgentsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [setupMethodFilter, setSetupMethodFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
  } = useBulkSelection();

  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['enhanced-agents', refreshTrigger, searchTerm, statusFilter, setupMethodFilter],
    queryFn: async (): Promise<Agent[]> => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          brokerage,
          invitation_status,
          setup_method,
          admin_activated,
          manual_setup,
          onboarding_method,
          created_at,
          invited_at
        `)
        .eq('role', 'agent')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('invitation_status', statusFilter);
      }

      if (setupMethodFilter !== 'all') {
        query = query.eq('setup_method', setupMethodFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Agent[];
    }
  });

  const bulkStatusUpdateMutation = useMutation({
    mutationFn: async ({ agentIds, newStatus }: { agentIds: string[], newStatus: string }) => {
      const { data, error } = await supabase.rpc('bulk_update_agent_status', {
        p_agent_ids: agentIds,
        p_new_status: newStatus
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedCount) => {
      toast({
        title: "Bulk Update Successful",
        description: `Updated ${updatedCount} agents`,
      });
      queryClient.invalidateQueries({ queryKey: ['enhanced-agents'] });
      clearSelection();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Bulk Update Failed",
        description: error.message,
      });
    }
  });

  const generateSetupLinkMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const { data, error } = await supabase.rpc('generate_agent_setup_link', {
        p_agent_id: agentId,
        p_expires_hours: 24
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (setupToken) => {
      const setupUrl = `${window.location.origin}/agent/setup/${setupToken}`;
      navigator.clipboard.writeText(setupUrl);
      toast({
        title: "Setup Link Generated",
        description: "Link copied to clipboard. Valid for 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Generate Link",
        description: error.message,
      });
    }
  });

  const getStatusBadge = (agent: Agent) => {
    if (agent.admin_activated) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    
    switch (agent.invitation_status) {
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-800">Invited</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{agent.invitation_status}</Badge>;
    }
  };

  const getSetupMethodBadge = (method: string | null) => {
    switch (method) {
      case 'manual_creation':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Manual</Badge>;
      case 'assisted_setup':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Assisted</Badge>;
      case 'email_invitation':
      default:
        return <Badge variant="outline" className="bg-green-50 text-green-700">Email</Badge>;
    }
  };

  const filteredAgents = agents || [];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error loading agents: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Invited</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={setupMethodFilter} onValueChange={setSetupMethodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="email_invitation">Email</SelectItem>
            <SelectItem value="manual_creation">Manual</SelectItem>
            <SelectItem value="assisted_setup">Assisted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedIds.length} agent{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => bulkStatusUpdateMutation.mutate({ 
                  agentIds: selectedIds, 
                  newStatus: 'completed' 
                })}
                disabled={bulkStatusUpdateMutation.isPending}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Activate All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkStatusUpdateMutation.mutate({ 
                  agentIds: selectedIds, 
                  newStatus: 'pending' 
                })}
                disabled={bulkStatusUpdateMutation.isPending}
              >
                <UserX className="h-4 w-4 mr-1" />
                Set Pending
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={isAllSelected(filteredAgents.map(a => a.id))}
                onCheckedChange={() => toggleAll(filteredAgents.map(a => a.id))}
              />
              <span className="text-sm text-gray-600">
                Select all ({filteredAgents.length})
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-brand-elevation transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected(agent.id)}
                        onCheckedChange={() => toggleSelection(agent.id)}
                      />
                      <div>
                        <CardTitle className="text-lg">
                          {agent.first_name} {agent.last_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{agent.email}</p>
                      </div>
                    </div>
                    <QuickActionsMenu
                      agentId={agent.id}
                      agentName={`${agent.first_name} ${agent.last_name}`}
                      currentStatus={agent.invitation_status || 'pending'}
                      onRefresh={() => queryClient.invalidateQueries({ queryKey: ['enhanced-agents'] })}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(agent)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Method:</span>
                      {getSetupMethodBadge(agent.setup_method)}
                    </div>
                    {agent.brokerage && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Brokerage:</span>
                        <span className="text-sm font-medium">{agent.brokerage}</span>
                      </div>
                    )}
                    {agent.phone_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm">{agent.phone_number}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Created: {new Date(agent.created_at).toLocaleDateString()}
                      {agent.invited_at && (
                        <><br />Invited: {new Date(agent.invited_at).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {filteredAgents.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || setupMethodFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Create your first agent to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

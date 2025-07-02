import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone,
  Building,
  User,
  Users,
  Filter,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteAgentDialog } from "./DeleteAgentDialog";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SimplifiedAgentsListProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export const SimplifiedAgentsList = ({ refreshTrigger, onRefresh }: SimplifiedAgentsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [deleteAgent, setDeleteAgent] = useState<Profile | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['simplified-agents', refreshTrigger, searchTerm, statusFilter],
    queryFn: async (): Promise<Profile[]> => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter === 'active') {
        query = query.eq('admin_activated', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('admin_activated', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    }
  });

  const handleBulkStatusUpdate = async (newStatus: boolean) => {
    if (selectedAgents.length === 0) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          admin_activated: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedAgents);

      if (error) throw error;

      toast({
        title: "Bulk Update Successful",
        description: `${newStatus ? 'Activated' : 'Deactivated'} ${selectedAgents.length} agent${selectedAgents.length > 1 ? 's' : ''}`,
      });

      setSelectedAgents([]);
      // Invalidate and refetch query
      await queryClient.invalidateQueries({ queryKey: ['simplified-agents'] });
      await refetch();
      onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Bulk Update Failed",
        description: error.message,
      });
    }
  };

  const handleSingleAgentStatusUpdate = async (agentId: string, newStatus: boolean) => {
    try {
      console.log(`Updating agent ${agentId} to ${newStatus ? 'active' : 'inactive'}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          admin_activated: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update successful');

      toast({
        title: "Status Updated",
        description: `Agent ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });

      // Force refresh with multiple strategies
      await queryClient.invalidateQueries({ queryKey: ['simplified-agents'] });
      await queryClient.refetchQueries({ queryKey: ['simplified-agents'] });
      await refetch();
      onRefresh();
    } catch (error: any) {
      console.error('Status update failed:', error);
      toast({
        variant: "destructive",
        title: "Status Update Failed",
        description: error.message,
      });
    }
  };

  const handleToggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleToggleAll = () => {
    if (selectedAgents.length === filteredAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(filteredAgents.map(agent => agent.id));
    }
  };

  const getStatusBadge = (agent: Profile) => {
    console.log(`Agent ${agent.email}: admin_activated = ${agent.admin_activated}`);
    if (agent.admin_activated) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
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
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAgents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAgents([])}
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleBulkStatusUpdate(true)}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusUpdate(false)}
              >
                <UserX className="h-4 w-4 mr-1" />
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Agents List */}
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
                checked={selectedAgents.length === filteredAgents.length && filteredAgents.length > 0}
                onCheckedChange={handleToggleAll}
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
                        checked={selectedAgents.includes(agent.id)}
                        onCheckedChange={() => handleToggleAgent(agent.id)}
                      />
                      <div>
                        <CardTitle className="text-lg">
                          {agent.first_name} {agent.last_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{agent.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleSingleAgentStatusUpdate(agent.id, !agent.admin_activated)}
                        >
                          {agent.admin_activated ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteAgent(agent)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(agent)}
                    </div>
                    {agent.brokerage && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{agent.brokerage}</span>
                      </div>
                    )}
                    {agent.phone_number && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{agent.phone_number}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Created: {new Date(agent.created_at).toLocaleDateString()}
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
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Create your first agent to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {deleteAgent && (
        <DeleteAgentDialog
          agent={deleteAgent}
          open={!!deleteAgent}
          onClose={() => setDeleteAgent(null)}
          onAgentDeleted={() => {
            setDeleteAgent(null);
            queryClient.invalidateQueries({ queryKey: ['simplified-agents'] });
            refetch();
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

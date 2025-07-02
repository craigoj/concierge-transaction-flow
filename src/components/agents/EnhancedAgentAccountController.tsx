import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditAgentDialog } from "./EditAgentDialog";
import { DeleteAgentDialog } from "./DeleteAgentDialog";
import { BulkActionsDialog } from "./BulkActionsDialog";
import { AdvancedAgentSearch } from "./AdvancedAgentSearch";

interface SearchFilters {
  searchTerm: string;
  status: string;
  brokerage: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  experience: string;
  location: string;
}

interface EnhancedAgentAccountControllerProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export const EnhancedAgentAccountController = ({ refreshTrigger, onRefresh }: EnhancedAgentAccountControllerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    status: 'all',
    brokerage: 'all',
    dateRange: { from: null, to: null },
    experience: 'all',
    location: ''
  });
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [deletingAgent, setDeletingAgent] = useState<any>(null);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const { toast } = useToast();

  const { data: agents = [], isLoading, refetch } = useQuery({
    queryKey: ['enhanced-agents', refreshTrigger],
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

  // Get unique brokerages for filter options
  const availableBrokerages = useMemo(() => {
    const brokerages = agents
      .map(agent => agent.brokerage)
      .filter((brokerage, index, arr) => brokerage && arr.indexOf(brokerage) === index);
    return brokerages;
  }, [agents]);

  // Apply advanced filtering
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      // Basic search
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = `${agent.first_name} ${agent.last_name}`.toLowerCase().includes(searchLower);
        const matchesEmail = agent.email?.toLowerCase().includes(searchLower);
        const matchesPhone = agent.phone_number?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && agent.invitation_status !== filters.status) {
        return false;
      }

      // Brokerage filter
      if (filters.brokerage !== 'all' && agent.brokerage !== filters.brokerage) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const agentDate = new Date(agent.created_at);
        if (filters.dateRange.from && agentDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && agentDate > filters.dateRange.to) {
          return false;
        }
      }

      // Experience filter
      if (filters.experience !== 'all' && agent.years_experience) {
        const experience = agent.years_experience;
        switch (filters.experience) {
          case '0-2':
            if (experience > 2) return false;
            break;
          case '3-5':
            if (experience < 3 || experience > 5) return false;
            break;
          case '6-10':
            if (experience < 6 || experience > 10) return false;
            break;
          case '10+':
            if (experience < 10) return false;
            break;
        }
      }

      return true;
    });
  }, [agents, filters]);

  const selectedAgentObjects = filteredAgents.filter(agent => selectedAgents.includes(agent.id));

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          invitation_status: newStatus,
          admin_activated: newStatus === 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Agent status changed to ${newStatus}`,
      });

      refetch();
      onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedAgents.length === filteredAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(filteredAgents.map(agent => agent.id));
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleEditAgent = (agent: any) => {
    setEditingAgent(agent);
  };

  const handleDeleteAgent = (agent: any) => {
    setDeletingAgent(agent);
  };

  const handleBulkActions = () => {
    setBulkActionsOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    onRefresh();
    setSelectedAgents([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'pending': return <XCircle className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Agents...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Enhanced Agent Management</span>
            <div className="flex items-center space-x-2">
              {selectedAgents.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedAgents.length} selected
                  </span>
                  <Button
                    onClick={handleBulkActions}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Bulk Actions
                  </Button>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Advanced Search Component */}
          <AdvancedAgentSearch
            onFiltersChange={setFilters}
            availableBrokerages={availableBrokerages}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between my-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Showing {filteredAgents.length} of {agents.length} agents
              {filters.searchTerm && (
                <span className="ml-2 font-medium">
                  matching "{filters.searchTerm}"
                </span>
              )}
            </div>
            {filteredAgents.length > 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedAgents.length === filteredAgents.length && filteredAgents.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">
                  Select All
                </span>
              </div>
            )}
          </div>

          {/* Agent List */}
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(agent.id)}
                      onChange={() => handleSelectAgent(agent.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-lg">
                          {agent.first_name} {agent.last_name}
                        </h3>
                        <Badge className={getStatusColor(agent.invitation_status || 'pending')}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(agent.invitation_status || 'pending')}
                            <span>{agent.invitation_status || 'pending'}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        {agent.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{agent.email}</span>
                          </div>
                        )}
                        {agent.phone_number && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{agent.phone_number}</span>
                          </div>
                        )}
                        {agent.brokerage && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{agent.brokerage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select
                      value={agent.invitation_status || 'pending'}
                      onValueChange={(value) => handleStatusChange(agent.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Active</SelectItem>
                        <SelectItem value="sent">Invited</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => handleEditAgent(agent)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteAgent(agent)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-500">
                {filters.searchTerm || Object.values(filters).some(f => f !== 'all' && f !== '' && f !== null)
                  ? "No agents match your current filters." 
                  : "No agents have been created yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Agent Dialog */}
      <EditAgentDialog
        agent={editingAgent}
        open={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        onAgentUpdated={handleRefresh}
      />

      {/* Delete Agent Dialog */}
      <DeleteAgentDialog
        agent={deletingAgent}
        open={!!deletingAgent}
        onClose={() => setDeletingAgent(null)}
        onAgentDeleted={handleRefresh}
      />

      {/* Bulk Actions Dialog */}
      <BulkActionsDialog
        selectedAgents={selectedAgentObjects}
        open={bulkActionsOpen}
        onClose={() => setBulkActionsOpen(false)}
        onActionCompleted={() => {
          handleRefresh();
          setSelectedAgents([]);
        }}
      />
    </>
  );
};

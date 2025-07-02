
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Filter
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EnhancedAgentAccountControllerProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export const EnhancedAgentAccountController = ({ refreshTrigger, onRefresh }: EnhancedAgentAccountControllerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
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

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || agent.invitation_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (agentId: string, newStatus: string) => {
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
        title: "Status Updated",
        description: `Agent status changed to ${newStatus}`,
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          invitation_status: newStatus,
          admin_activated: newStatus === 'completed'
        })
        .in('id', selectedAgents);

      if (error) throw error;

      toast({
        title: "Bulk Update Complete",
        description: `Updated ${selectedAgents.length} agents to ${newStatus}`,
      });

      setSelectedAgents([]);
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Agent Account Management</span>
          <div className="flex items-center space-x-2">
            {selectedAgents.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedAgents.length} selected
                </span>
                <Select onValueChange={handleBulkStatusChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Bulk Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Activate</SelectItem>
                    <SelectItem value="pending">Deactivate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agents by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Active</SelectItem>
                <SelectItem value="sent">Invited</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAgents([...selectedAgents, agent.id]);
                      } else {
                        setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                      }
                    }}
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Agent
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the agent account for {agent.first_name} {agent.last_name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                // TODO: Implement delete functionality
                                toast({
                                  title: "Delete functionality",
                                  description: "Delete functionality will be implemented in Phase 2",
                                });
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
              {searchTerm || statusFilter !== "all" 
                ? "No agents match your current filters." 
                : "No agents have been created yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

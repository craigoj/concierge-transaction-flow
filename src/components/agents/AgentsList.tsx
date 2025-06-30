
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Building, 
  MoreHorizontal,
  RefreshCw,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface Agent {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  brokerage: string | null;
  invitation_status: string | null;
  invited_at: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
}

interface AgentsListProps {
  refreshTrigger: number;
}

export const AgentsList = ({ refreshTrigger }: AgentsListProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "agent")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAgents(data || []);
    } catch (error: any) {
      console.error("Error fetching agents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch agents",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [refreshTrigger]);

  const handleResendInvitation = async (agent: Agent) => {
    if (!agent.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Agent email is required to resend invitation",
      });
      return;
    }

    setActionLoading(agent.id);
    try {
      const { error } = await supabase.functions.invoke('create-agent-invitation', {
        body: {
          firstName: agent.first_name,
          lastName: agent.last_name,
          email: agent.email,
          phoneNumber: agent.phone_number,
          brokerage: agent.brokerage,
          isResend: true
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Invitation resent successfully",
      });

      fetchAgents(); // Refresh the list
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend invitation",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (!confirm(`Are you sure you want to delete ${agent.first_name} ${agent.last_name}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(agent.id);
    try {
      // Delete the profile record
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', agent.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });

      fetchAgents(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete agent",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (agent: Agent) => {
    if (agent.onboarding_completed_at) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    } else if (agent.invitation_status === "sent") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Invited</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-charcoal" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-brand-taupe mx-auto mb-4" />
        <h3 className="text-lg font-brand-heading text-brand-charcoal mb-2">
          No agents yet
        </h3>
        <p className="text-brand-charcoal/60 font-brand-body">
          Create your first agent account to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-brand-taupe/20 shadow-brand-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-brand-taupe/20 bg-brand-taupe/5">
            <TableHead className="font-brand-heading text-brand-charcoal">Agent</TableHead>
            <TableHead className="font-brand-heading text-brand-charcoal">Contact</TableHead>
            <TableHead className="font-brand-heading text-brand-charcoal">Brokerage</TableHead>
            <TableHead className="font-brand-heading text-brand-charcoal">Status</TableHead>
            <TableHead className="font-brand-heading text-brand-charcoal">Invited</TableHead>
            <TableHead className="font-brand-heading text-brand-charcoal w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id} className="border-brand-taupe/20 hover:bg-brand-taupe/5">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-taupe/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-brand-charcoal" />
                  </div>
                  <div>
                    <div className="font-brand-body font-medium text-brand-charcoal">
                      {agent.first_name} {agent.last_name}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {agent.email && (
                    <div className="flex items-center space-x-2 text-sm text-brand-charcoal/70">
                      <Mail className="h-4 w-4" />
                      <span>{agent.email}</span>
                    </div>
                  )}
                  {agent.phone_number && (
                    <div className="flex items-center space-x-2 text-sm text-brand-charcoal/70">
                      <Phone className="h-4 w-4" />
                      <span>{agent.phone_number}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {agent.brokerage && (
                  <div className="flex items-center space-x-2 text-sm text-brand-charcoal/70">
                    <Building className="h-4 w-4" />
                    <span>{agent.brokerage}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(agent)}</TableCell>
              <TableCell>
                <div className="text-sm text-brand-charcoal/60 font-brand-body">
                  {agent.invited_at ? format(new Date(agent.invited_at), "MMM d, yyyy") : "-"}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      disabled={actionLoading === agent.id}
                    >
                      {actionLoading === agent.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!agent.onboarding_completed_at && (
                      <DropdownMenuItem
                        onClick={() => handleResendInvitation(agent)}
                        className="cursor-pointer"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Invitation
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteAgent(agent)}
                      className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Agent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

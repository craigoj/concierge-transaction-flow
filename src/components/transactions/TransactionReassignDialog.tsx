
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AgentSelector } from '@/components/agents/AgentSelector';
import { useAuth } from '@/integrations/supabase/auth';
import { useQuery } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { User, AlertTriangle } from 'lucide-react';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  assigned_agent?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    brokerage: string | null;
  };
};

interface TransactionReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onSuccess: () => void;
}

export const TransactionReassignDialog = ({
  open,
  onOpenChange,
  transaction,
  onSuccess
}: TransactionReassignDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(transaction.agent_id);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get current user's role to ensure they're a coordinator
  const { data: currentUserProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get current assigned agent details
  const { data: currentAgent } = useQuery({
    queryKey: ['agent', transaction.agent_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, brokerage')
        .eq('id', transaction.agent_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!transaction.agent_id,
  });

  const isCoordinator = currentUserProfile?.role === 'coordinator';

  const handleReassign = async () => {
    if (!selectedAgentId || selectedAgentId === transaction.agent_id) {
      toast({
        variant: "destructive",
        title: "No Change",
        description: "Please select a different agent to reassign the transaction.",
      });
      return;
    }

    setLoading(true);

    try {
      // Use the reassign_transaction database function
      const { error } = await supabase.rpc('reassign_transaction', {
        transaction_id: transaction.id,
        new_agent_id: selectedAgentId,
        reassigned_by: user?.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction has been successfully reassigned.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reassign transaction.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAgentName = (agent: any) => {
    if (!agent) return 'Unknown Agent';
    const name = `${agent.first_name || ''} ${agent.last_name || ''}`.trim();
    return name || agent.email || 'Unknown Agent';
  };

  if (!isCoordinator) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Access Denied
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Only coordinators can reassign transactions.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Transaction</h4>
            <p className="font-semibold">{transaction.property_address}</p>
            <p className="text-sm text-muted-foreground">
              {transaction.city}, {transaction.state} {transaction.zip_code}
            </p>
          </div>

          {/* Current Assignment */}
          <div className="space-y-2">
            <Label>Currently Assigned To</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatAgentName(currentAgent)}</p>
                {currentAgent?.email && (
                  <p className="text-sm text-muted-foreground">{currentAgent.email}</p>
                )}
                {currentAgent?.brokerage && (
                  <p className="text-xs text-muted-foreground">{currentAgent.brokerage}</p>
                )}
              </div>
            </div>
          </div>

          {/* New Assignment */}
          <div className="space-y-2">
            <AgentSelector
              selectedAgentId={selectedAgentId}
              onAgentSelect={setSelectedAgentId}
              label="Reassign To Agent"
              placeholder="Select new agent..."
              currentUserId={user?.id}
              showCurrentUserFirst={false}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReassign} 
            disabled={loading || !selectedAgentId || selectedAgentId === transaction.agent_id}
          >
            {loading ? 'Reassigning...' : 'Reassign Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

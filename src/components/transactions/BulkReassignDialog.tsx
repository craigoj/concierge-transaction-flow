
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AgentSelector } from '@/components/agents/AgentSelector';
import { useAuth } from '@/integrations/supabase/auth';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Users } from 'lucide-react';

interface BulkReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTransactionIds: string[];
  onSuccess: () => void;
}

export const BulkReassignDialog = ({
  open,
  onOpenChange,
  selectedTransactionIds,
  onSuccess
}: BulkReassignDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
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

  const isCoordinator = currentUserProfile?.role === 'coordinator';

  const handleBulkReassign = async () => {
    if (!selectedAgentId) {
      toast({
        variant: "destructive",
        title: "No Agent Selected",
        description: "Please select an agent to assign the transactions to.",
      });
      return;
    }

    setLoading(true);

    try {
      // Perform bulk reassignment using Promise.all for concurrent operations
      const reassignPromises = selectedTransactionIds.map(transactionId =>
        supabase.rpc('reassign_transaction', {
          transaction_id: transactionId,
          new_agent_id: selectedAgentId,
          reassigned_by: user?.id
        })
      );

      const results = await Promise.all(reassignPromises);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to reassign ${errors.length} transactions`);
      }

      toast({
        title: "Success",
        description: `Successfully reassigned ${selectedTransactionIds.length} transactions.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reassign transactions.",
      });
    } finally {
      setLoading(false);
    }
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
              Only coordinators can perform bulk reassignments.
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
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Reassign Transactions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selection Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Selected Transactions</h4>
            <p className="font-semibold">
              {selectedTransactionIds.length} transaction{selectedTransactionIds.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-muted-foreground">
              All selected transactions will be assigned to the chosen agent.
            </p>
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <AgentSelector
              selectedAgentId={selectedAgentId}
              onAgentSelect={setSelectedAgentId}
              label="Assign To Agent"
              placeholder="Select agent for all transactions..."
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
            onClick={handleBulkReassign} 
            disabled={loading || !selectedAgentId}
          >
            {loading ? 'Reassigning...' : `Reassign ${selectedTransactionIds.length} Transactions`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

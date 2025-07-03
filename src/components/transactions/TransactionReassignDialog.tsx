import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { Loader2, UserCheck } from 'lucide-react';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface TransactionReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onSuccess?: () => void;
}

export const TransactionReassignDialog = ({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: TransactionReassignDialogProps) => {
  const [agentId, setAgentId] = useState<string | undefined>(transaction.agent_id || undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: agents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'agent');

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching agents',
          description: error.message,
        });
        return [];
      }

      return data as Profile[];
    },
  });

  const handleReassign = async () => {
    if (!agentId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an agent to reassign to.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ agent_id: agentId })
        .eq('id', transaction.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Transaction Reassigned',
        description: 'Transaction has been successfully reassigned.',
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error reassigning transaction',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Transaction</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="agent" className="text-right">
              Agent
            </label>
            <Select
              value={agentId}
              onValueChange={(value) => setAgentId(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingAgents ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading agents...
                  </SelectItem>
                ) : (
                  agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name} ({agent.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleReassign} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reassigning...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Reassign
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

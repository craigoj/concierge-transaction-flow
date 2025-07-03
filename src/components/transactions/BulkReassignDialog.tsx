import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCheck } from 'lucide-react';

interface BulkReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionIds: string[];
  onSuccess?: () => void;
}

export const BulkReassignDialog: React.FC<BulkReassignDialogProps> = ({
  open,
  onOpenChange,
  transactionIds,
  onSuccess,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [isReassigning, setIsReassigning] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'agent');

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const handleReassign = async () => {
    if (!selectedAgentId) {
      toast({
        title: 'Error',
        description: 'Please select an agent to reassign to.',
        variant: 'destructive',
      });
      return;
    }

    setIsReassigning(true);

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ agent_id: selectedAgentId })
        .in('id', transactionIds);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Transactions reassigned successfully.',
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reassign transactions.',
        variant: 'destructive',
      });
    } finally {
      setIsReassigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reassign Transactions</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="agent" className="text-right font-medium">
              Agent
            </label>
            <div className="col-span-3">
              <Select onValueChange={setSelectedAgentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
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
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleReassign}
            disabled={isReassigning || isLoading || !selectedAgentId}
            className="ml-2"
          >
            {isReassigning ? (
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

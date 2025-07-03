import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Loader2, AlertTriangle, Users, DollarSign, Calendar, Home } from 'lucide-react';

interface EnhancedCreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EnhancedCreateTransactionDialog: React.FC<EnhancedCreateTransactionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [earnestMoney, setEarnestMoney] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');
  const [agentList, setAgentList] = useState<{ value: string; label: string }[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'agent');

        if (error) {
          console.error('Error fetching agents:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch agents.',
          });
          return;
        }

        const formattedAgents = data.map((agent) => ({
          value: agent.id,
          label: `${agent.first_name} ${agent.last_name}`,
        }));
        setAgentList(formattedAgents);
      } catch (error: any) {
        console.error('Error fetching agents:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to fetch agents.',
        });
      }
    };

    fetchAgents();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User ID not found. Please ensure you are logged in.');
      }

      if (!agentId) {
        throw new Error('Please select an agent for this transaction.');
      }

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert([{
          full_name: clientName,
          created_by: user.id,
        }])
        .select()
        .single();

      if (clientError) {
        throw new Error(`Client creation error: ${clientError.message}`);
      }

      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          property_address: propertyAddress,
          client_id: clientData.id,
          agent_id: agentId,
          closing_date: closingDate,
          earnest_money_amount: parseFloat(earnestMoney),
          status: status,
          notes: notes,
          created_by: user.id,
        }])
        .select()
        .single();

      if (transactionError) {
        throw new Error(`Transaction creation error: ${transactionError.message}`);
      }

      toast({
        title: 'Transaction Created',
        description: 'The transaction has been successfully created.',
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create transaction.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create New Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                type="text"
                id="propertyAddress"
                placeholder="123 Main St, Anytown"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                type="text"
                id="clientName"
                placeholder="John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agentId">Assigned Agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agentList.map((agent) => (
                    <SelectItem key={agent.value} value={agent.value}>
                      {agent.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="closingDate">Closing Date</Label>
              <Input
                type="date"
                id="closingDate"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="earnestMoney">Earnest Money Amount</Label>
              <Input
                type="number"
                id="earnestMoney"
                placeholder="5000"
                value={earnestMoney}
                onChange={(e) => setEarnestMoney(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the transaction"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Transaction
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedCreateTransactionDialog;


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Loader2 } from 'lucide-react';

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
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [transactionType, setTransactionType] = useState<'buyer' | 'seller' | 'dual'>('buyer');
  const [status, setStatus] = useState<'intake' | 'active' | 'closed' | 'cancelled'>('intake');
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
          return;
        }

        const formattedAgents = data.map((agent) => ({
          value: agent.id,
          label: `${agent.first_name} ${agent.last_name}`,
        }));
        setAgentList(formattedAgents);
      } catch (error: any) {
        console.error('Error fetching agents:', error);
      }
    };

    if (open) {
      fetchAgents();
    }
  }, [open]);

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

      // First create the transaction with all required fields
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          property_address: propertyAddress,
          city: city,
          state: state,
          zip_code: zipCode,
          agent_id: agentId,
          closing_date: closingDate || null,
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
          transaction_type: transactionType,
          status: status,
        }])
        .select()
        .single();

      if (transactionError) {
        throw new Error(`Transaction creation error: ${transactionError.message}`);
      }

      // Then create the client linked to the transaction
      if (clientName && transactionData) {
        const { error: clientError } = await supabase
          .from('clients')
          .insert([{
            full_name: clientName,
            transaction_id: transactionData.id,
            type: transactionType === 'dual' ? 'buyer' : transactionType,
          }]);

        if (clientError) {
          console.error('Client creation error:', clientError);
          // Don't fail the whole operation if client creation fails
        }
      }

      toast({
        title: 'Transaction Created',
        description: 'The transaction has been successfully created.',
      });
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setPropertyAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setClientName('');
      setAgentId('');
      setClosingDate('');
      setPurchasePrice('');
      setTransactionType('buyer');
      setStatus('intake');
      setNotes('');
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
                placeholder="123 Main St"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                type="text"
                id="city"
                placeholder="Norfolk"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                type="text"
                id="state"
                placeholder="VA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                type="text"
                id="zipCode"
                placeholder="23510"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                type="text"
                id="clientName"
                placeholder="John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="closingDate">Closing Date</Label>
              <Input
                type="date"
                id="closingDate"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                type="number"
                id="purchasePrice"
                placeholder="350000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionType">Transaction Type</Label>
              <Select value={transactionType} onValueChange={(value: 'buyer' | 'seller' | 'dual') => setTransactionType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="dual">Dual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'intake' | 'active' | 'closed' | 'cancelled') => setStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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

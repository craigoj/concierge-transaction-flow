import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  property_address: string;
  city: string;
  state: string;
  zip_code: string;
  purchase_price: number;
  closing_date: string;
  status: string;
  transaction_type?: string;
  service_tier?: string;
}

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSuccess?: () => void;
}

type ServiceTier = 'core' | 'elite' | 'white_glove';
type TransactionType = 'purchase' | 'sale' | 'refinance';
type TransactionStatus = 'pending' | 'active' | 'under_contract' | 'closing' | 'completed' | 'cancelled';

export const EditTransactionDialog = ({ open, onOpenChange, transaction, onSuccess }: EditTransactionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    property_address: '',
    city: '',
    state: '',
    zip_code: '',
    purchase_price: '',
    closing_date: '',
    status: 'active' as TransactionStatus,
    transaction_type: 'purchase' as TransactionType,
    service_tier: 'core' as ServiceTier
  });
  const { toast } = useToast();

  // Pre-populate form with transaction data when dialog opens
  useEffect(() => {
    if (transaction && open) {
      setFormData({
        property_address: transaction.property_address || '',
        city: transaction.city || '',
        state: transaction.state || '',
        zip_code: transaction.zip_code || '',
        purchase_price: transaction.purchase_price?.toString() || '',
        closing_date: transaction.closing_date || '',
        status: (transaction.status as TransactionStatus) || 'active',
        transaction_type: (transaction.transaction_type as TransactionType) || 'purchase',
        service_tier: (transaction.service_tier as ServiceTier) || 'core'
      });
    }
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    setLoading(true);
    try {
      const updateData = {
        property_address: formData.property_address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        closing_date: formData.closing_date,
        status: formData.status,
        transaction_type: formData.transaction_type,
        service_tier: formData.service_tier,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transaction.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update transaction",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="property_address">Property Address</Label>
              <Input
                id="property_address"
                value={formData.property_address}
                onChange={(e) => handleInputChange('property_address', e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Hampton"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="VA"
                maxLength={2}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                placeholder="23666"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                placeholder="450000"
              />
            </div>
            
            <div>
              <Label htmlFor="closing_date">Closing Date</Label>
              <Input
                id="closing_date"
                type="date"
                value={formData.closing_date}
                onChange={(e) => handleInputChange('closing_date', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="under_contract">Under Contract</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select value={formData.transaction_type} onValueChange={(value) => handleInputChange('transaction_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="refinance">Refinance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="service_tier">Service Tier</Label>
              <Select value={formData.service_tier} onValueChange={(value) => handleInputChange('service_tier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                  <SelectItem value="white_glove">White Glove</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ServiceTier = 'buyer_core' | 'buyer_elite' | 'white_glove_buyer' | 'listing_core' | 'listing_elite' | 'white_glove_listing';
type TransactionType = 'buyer_representation' | 'listing' | 'referral';

export const CreateTransactionDialog = ({ open, onOpenChange, onSuccess }: CreateTransactionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    property_address: '',
    city: '',
    state: '',
    zip_code: '',
    purchase_price: '',
    transaction_type: 'buyer_representation' as TransactionType,
    service_tier: 'buyer_core' as ServiceTier
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          agent_id: user.id,
          property_address: formData.property_address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          transaction_type: formData.transaction_type,
          service_tier: formData.service_tier,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction created successfully",
      });

      setFormData({
        property_address: '',
        city: '',
        state: '',
        zip_code: '',
        purchase_price: '',
        transaction_type: 'buyer_representation',
        service_tier: 'buyer_core'
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property_address">Property Address</Label>
            <Input
              id="property_address"
              value={formData.property_address}
              onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">Zip Code</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_price">Purchase Price</Label>
            <Input
              id="purchase_price"
              type="number"
              value={formData.purchase_price}
              onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_type">Transaction Type</Label>
            <Select
              value={formData.transaction_type}
              onValueChange={(value: TransactionType) => setFormData(prev => ({ ...prev, transaction_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer_representation">Buyer Representation</SelectItem>
                <SelectItem value="listing">Listing</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_tier">Service Tier</Label>
            <Select
              value={formData.service_tier}
              onValueChange={(value: ServiceTier) => setFormData(prev => ({ ...prev, service_tier: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer_core">Core Buyer Service</SelectItem>
                <SelectItem value="buyer_elite">Elite Buyer Service</SelectItem>
                <SelectItem value="white_glove_buyer">White Glove Buyer Service</SelectItem>
                <SelectItem value="listing_core">Core Listing Service</SelectItem>
                <SelectItem value="listing_elite">Elite Listing Service</SelectItem>
                <SelectItem value="white_glove_listing">White Glove Listing Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;

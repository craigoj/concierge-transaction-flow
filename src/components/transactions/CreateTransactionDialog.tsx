
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateTransactionDialog = ({ open, onOpenChange, onSuccess }: CreateTransactionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    property_address: '',
    city: '',
    state: '',
    zip_code: '',
    transaction_type: '',
    service_tier: '',
    purchase_price: '',
    closing_date: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_type: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          property_address: formData.property_address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          transaction_type: formData.transaction_type as any,
          service_tier: formData.service_tier as any,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          closing_date: formData.closing_date || null,
          agent_id: user.id,
          status: 'intake'
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create client if provided
      if (formData.client_name) {
        const { error: clientError } = await supabase
          .from('clients')
          .insert({
            transaction_id: transaction.id,
            full_name: formData.client_name,
            email: formData.client_email || null,
            phone: formData.client_phone || null,
            type: formData.client_type as any
          });

        if (clientError) throw clientError;
      }

      onSuccess();
      setFormData({
        property_address: '',
        city: '',
        state: '',
        zip_code: '',
        transaction_type: '',
        service_tier: '',
        purchase_price: '',
        closing_date: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        client_type: ''
      });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="property_address">Property Address *</Label>
                <Input
                  id="property_address"
                  value={formData.property_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="zip_code">Zip Code *</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Transaction Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction_type">Transaction Type *</Label>
                <Select value={formData.transaction_type} onValueChange={(value) => setFormData(prev => ({ ...prev, transaction_type: value }))}>
                  <SelectTrigger>
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
                <Label htmlFor="service_tier">Service Tier</Label>
                <Select value={formData.service_tier} onValueChange={(value) => setFormData(prev => ({ ...prev, service_tier: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer_core">Buyer Core</SelectItem>
                    <SelectItem value="buyer_elite">Buyer Elite</SelectItem>
                    <SelectItem value="white_glove_buyer">White Glove Buyer</SelectItem>
                    <SelectItem value="listing_core">Listing Core</SelectItem>
                    <SelectItem value="listing_elite">Listing Elite</SelectItem>
                    <SelectItem value="white_glove_listing">White Glove Listing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchase_price">Purchase Price</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="closing_date">Closing Date</Label>
                <Input
                  id="closing_date"
                  type="date"
                  value={formData.closing_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, closing_date: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Client Information (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="client_type">Client Type</Label>
                <Select value={formData.client_type} onValueChange={(value) => setFormData(prev => ({ ...prev, client_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_email">Client Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="client_phone">Client Phone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTransactionDialog;

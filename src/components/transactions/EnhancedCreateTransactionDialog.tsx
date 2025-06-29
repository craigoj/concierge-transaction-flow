
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ServiceTierComparison } from '@/components/forms/components/ServiceTierCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfileSync } from '@/hooks/useProfileSync';
import { useAuth } from '@/integrations/supabase/auth';
import { useQuery } from '@tanstack/react-query';
import { ServiceTierType } from '@/types/serviceTiers';

interface EnhancedCreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EnhancedCreateTransactionDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: EnhancedCreateTransactionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState<ServiceTierType | null>(null);
  const [formData, setFormData] = useState({
    property_address: '',
    city: '',
    state: '',
    zip_code: '',
    transaction_type: '',
    purchase_price: '',
    closing_date: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_type: ''
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const { syncVendorsToTransaction, activateServiceTierAutomations } = useProfileSync();

  // Get agent vendors for auto-population
  const { data: agentVendors } = useQuery({
    queryKey: ['agent_vendors', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('agent_vendors')
        .select('*')
        .eq('agent_id', user.id);
      return data || [];
    },
    enabled: !!user?.id && open
  });

  const serviceTiers = [
    {
      id: 'buyer_core' as ServiceTierType,
      name: 'Core Buyer Service',
      description: 'Essential transaction coordination and support',
      price: 500,
      features: [
        { name: 'Transaction coordination', included: true },
        { name: 'Document management', included: true },
        { name: 'Basic communication', included: true },
        { name: 'Timeline tracking', included: true },
        { name: 'Premium marketing', included: false },
        { name: 'Concierge services', included: false }
      ]
    },
    {
      id: 'buyer_elite' as ServiceTierType,
      name: 'Elite Buyer Service',
      description: 'Enhanced service with premium features',
      price: 1200,
      popular: true,
      features: [
        { name: 'Transaction coordination', included: true },
        { name: 'Document management', included: true },
        { name: 'Premium communication', included: true },
        { name: 'Timeline tracking', included: true },
        { name: 'Premium marketing', included: true },
        { name: 'Professional photography', included: true },
        { name: 'Concierge services', included: false }
      ]
    },
    {
      id: 'white_glove_buyer' as ServiceTierType,
      name: 'White Glove Buyer',
      description: 'Ultimate luxury service experience',
      price: 2500,
      premium: true,
      features: [
        { name: 'Transaction coordination', included: true },
        { name: 'Document management', included: true },
        { name: 'Premium communication', included: true },
        { name: 'Timeline tracking', included: true },
        { name: 'Premium marketing', included: true },
        { name: 'Professional photography', included: true },
        { name: 'Concierge services', included: true },
        { name: 'Dedicated support', included: true }
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
          service_tier: selectedTier,
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

      // Sync vendors to transaction
      if (agentVendors && agentVendors.length > 0) {
        await syncVendorsToTransaction({
          transactionId: transaction.id,
          vendors: agentVendors
        });
      }

      // Activate service tier automations
      if (selectedTier) {
        await activateServiceTierAutomations({
          transactionId: transaction.id,
          serviceTier: selectedTier
        });
      }

      onSuccess();
      setFormData({
        property_address: '',
        city: '',
        state: '',
        zip_code: '',
        transaction_type: '',
        purchase_price: '',
        closing_date: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        client_type: ''
      });
      setSelectedTier(null);
      setCurrentStep(1);
      
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

  const canProceedToStep2 = formData.property_address && 
                            formData.city && 
                            formData.state && 
                            formData.zip_code && 
                            formData.transaction_type;

  const canSubmit = canProceedToStep2 && selectedTier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create New Transaction
            <span className="text-sm font-normal text-muted-foreground">
              Step {currentStep} of 2
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <>
              {/* Property Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property & Transaction Details</h3>
                
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
                    <Label htmlFor="purchase_price">Purchase Price</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Client Information */}
                <Separator />
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
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(2)} 
                  disabled={!canProceedToStep2}
                  className="flex-1"
                >
                  Next: Choose Service Tier
                </Button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Select Service Tier</h3>
                <ServiceTierComparison
                  tiers={serviceTiers}
                  selectedTierId={selectedTier}
                  onSelect={(tierId) => setSelectedTier(tierId as ServiceTierType)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading || !canSubmit} className="flex-1">
                  {loading ? 'Creating...' : 'Create Transaction'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

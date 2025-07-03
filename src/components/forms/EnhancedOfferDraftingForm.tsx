
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Save, Send } from 'lucide-react';

interface OfferRequest {
  id?: string;
  agent_id?: string;
  transaction_id?: string;
  property_address?: string;
  buyer_names?: string;
  buyer_contacts?: {
    phones: string[];
    emails: string[];
  };
  purchase_price?: number;
  loan_type?: string;
  lending_company?: string;
  emd_amount?: number;
  exchange_fee?: number;
  settlement_company?: string;
  closing_cost_assistance?: string;
  projected_closing_date?: string;
  wdi_inspection_details?: {
    period?: number;
    period_unit?: string;
    provider?: string;
    notes?: string;
  };
  fica_details?: {
    required: boolean;
    inspection_period?: number;
  };
  extras?: string;
  lead_eifs_survey?: string;
  occupancy_notes?: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'processed';
}

const EnhancedOfferDraftingForm = () => {
  const [offerRequest, setOfferRequest] = useState<OfferRequest>({
    buyer_contacts: { phones: [''], emails: [''] },
    fica_details: { required: false }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleChange = (field: keyof OfferRequest, value: any) => {
    setOfferRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('offer_requests')
        .insert({
          agent_id: user.id,
          property_address: offerRequest.property_address || '',
          buyer_names: offerRequest.buyer_names || '',
          buyer_contacts: offerRequest.buyer_contacts || { phones: [], emails: [] },
          purchase_price: offerRequest.purchase_price || 0,
          loan_type: offerRequest.loan_type || '',
          lending_company: offerRequest.lending_company || '',
          emd_amount: offerRequest.emd_amount || 0,
          exchange_fee: offerRequest.exchange_fee || 0,
          settlement_company: offerRequest.settlement_company || '',
          closing_cost_assistance: offerRequest.closing_cost_assistance,
          projected_closing_date: offerRequest.projected_closing_date || new Date().toISOString().split('T')[0],
          wdi_inspection_details: offerRequest.wdi_inspection_details || {},
          fica_details: offerRequest.fica_details || { required: false },
          extras: offerRequest.extras,
          lead_eifs_survey: offerRequest.lead_eifs_survey,
          occupancy_notes: offerRequest.occupancy_notes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Offer Request Saved",
        description: "Your offer request has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="card-brand border-0 shadow-brand-glass">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal">
          Draft Offer Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property_address" className="font-brand-body text-brand-charcoal">
              Property Address
            </Label>
            <Input
              id="property_address"
              type="text"
              value={offerRequest.property_address || ''}
              onChange={(e) => handleChange('property_address', e.target.value)}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer_names" className="font-brand-body text-brand-charcoal">
              Buyer Names
            </Label>
            <Input
              id="buyer_names"
              type="text"
              value={offerRequest.buyer_names || ''}
              onChange={(e) => handleChange('buyer_names', e.target.value)}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_price" className="font-brand-body text-brand-charcoal">
              Purchase Price
            </Label>
            <Input
              id="purchase_price"
              type="number"
              value={offerRequest.purchase_price || ''}
              onChange={(e) => handleChange('purchase_price', parseFloat(e.target.value) || 0)}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan_type" className="font-brand-body text-brand-charcoal">
              Loan Type
            </Label>
            <Select onValueChange={(value) => handleChange('loan_type', value)}>
              <SelectTrigger className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body">
                <SelectValue placeholder="Select Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conventional">Conventional</SelectItem>
                <SelectItem value="fha">FHA</SelectItem>
                <SelectItem value="va">VA</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              className="btn-brand-secondary text-base py-6"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>

            <Button
              type="button"
              className="btn-brand text-base py-6"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedOfferDraftingForm;

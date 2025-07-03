import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Save, Send, FileText, DollarSign, Calendar, Home, AlertCircle } from 'lucide-react';

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
  created_at?: string;
  updated_at?: string;
}

const EnhancedOfferDraftingForm = () => {
  const [offerRequest, setOfferRequest] = useState<OfferRequest>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch existing offer request if available
    // For now, let's assume we're always creating a new request
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOfferRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleContactsChange = (contacts: { phones: string[]; emails: string[]; }) => {
    setOfferRequest(prev => ({ ...prev, buyer_contacts: contacts }));
  };

  const handleWDIDetailsChange = (details: { period?: number; period_unit?: string; provider?: string; notes?: string; }) => {
    setOfferRequest(prev => ({ ...prev, wdi_inspection_details: details }));
  };

  const handleFICADetailsChange = (details: { required: boolean; inspection_period?: number; }) => {
    setOfferRequest(prev => ({ ...prev, fica_details: details }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const offerData = {
        ...offerRequest,
        agent_id: user.id,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('offer_requests')
        .insert([offerData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setOfferRequest(data);
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

  const handleSend = async () => {
    setSending(true);
    try {
      // Placeholder for sending logic (e.g., email, notification)
      toast({
        title: "Offer Request Sent",
        description: "Your offer request has been sent for review.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Send Error",
        description: error.message,
      });
    } finally {
      setSending(false);
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
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="property_address" className="font-brand-body text-brand-charcoal">Property Address</Label>
            <Input
              id="property_address"
              name="property_address"
              type="text"
              value={offerRequest.property_address || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer_names" className="font-brand-body text-brand-charcoal">Buyer Names</Label>
            <Input
              id="buyer_names"
              name="buyer_names"
              type="text"
              value={offerRequest.buyer_names || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-brand-body text-brand-charcoal">Buyer Contacts</Label>
            {/* Implement a custom component for handling array of contacts */}
            {/* <ContactArrayInput 
              contacts={offerRequest.buyer_contacts || { phones: [], emails: [] }}
              onChange={handleContactsChange}
            /> */}
            <Input
              type="text"
              placeholder="Contact Details"
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_price" className="font-brand-body text-brand-charcoal">Purchase Price</Label>
            <Input
              id="purchase_price"
              name="purchase_price"
              type="number"
              value={offerRequest.purchase_price || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan_type" className="font-brand-body text-brand-charcoal">Loan Type</Label>
            <Select onValueChange={(value) => setOfferRequest(prev => ({ ...prev, loan_type: value }))}>
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

          <div className="space-y-2">
            <Label htmlFor="lending_company" className="font-brand-body text-brand-charcoal">Lending Company</Label>
            <Input
              id="lending_company"
              name="lending_company"
              type="text"
              value={offerRequest.lending_company || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emd_amount" className="font-brand-body text-brand-charcoal">EMD Amount</Label>
            <Input
              id="emd_amount"
              name="emd_amount"
              type="number"
              value={offerRequest.emd_amount || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchange_fee" className="font-brand-body text-brand-charcoal">Exchange Fee</Label>
            <Input
              id="exchange_fee"
              name="exchange_fee"
              type="number"
              value={offerRequest.exchange_fee || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settlement_company" className="font-brand-body text-brand-charcoal">Settlement Company</Label>
            <Input
              id="settlement_company"
              name="settlement_company"
              type="text"
              value={offerRequest.settlement_company || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="closing_cost_assistance" className="font-brand-body text-brand-charcoal">Closing Cost Assistance</Label>
            <Input
              id="closing_cost_assistance"
              name="closing_cost_assistance"
              type="text"
              value={offerRequest.closing_cost_assistance || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projected_closing_date" className="font-brand-body text-brand-charcoal">Projected Closing Date</Label>
            <Input
              id="projected_closing_date"
              name="projected_closing_date"
              type="date"
              value={offerRequest.projected_closing_date || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-brand-body text-brand-charcoal">WDI Inspection Details</Label>
            {/* Implement a custom component for handling nested WDI details */}
            {/* <WDIInspectionDetailsInput 
              details={offerRequest.wdi_inspection_details || {}}
              onChange={handleWDIDetailsChange}
            /> */}
            <Input
              type="text"
              placeholder="WDI Inspection Details"
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-brand-body text-brand-charcoal">FICA Details</Label>
            {/* Implement a custom component for handling nested FICA details */}
            {/* <FICADetailsInput 
              details={offerRequest.fica_details || { required: false }}
              onChange={handleFICADetailsChange}
            /> */}
            <Input
              type="text"
              placeholder="FICA Details"
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extras" className="font-brand-body text-brand-charcoal">Extras</Label>
            <Textarea
              id="extras"
              name="extras"
              value={offerRequest.extras || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_eifs_survey" className="font-brand-body text-brand-charcoal">Lead EIFS Survey</Label>
            <Textarea
              id="lead_eifs_survey"
              name="lead_eifs_survey"
              value={offerRequest.lead_eifs_survey || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupancy_notes" className="font-brand-body text-brand-charcoal">Occupancy Notes</Label>
            <Textarea
              id="occupancy_notes"
              name="occupancy_notes"
              value={offerRequest.occupancy_notes || ''}
              onChange={handleChange}
              className="border-brand-taupe/30 focus:border-brand-taupe bg-white/70 font-brand-body"
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              className="btn-brand-secondary text-base py-6"
              onClick={handleSave}
              disabled={saving || sending}
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
              onClick={handleSend}
              disabled={saving || sending}
            >
              {sending ? (
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
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedOfferDraftingForm;

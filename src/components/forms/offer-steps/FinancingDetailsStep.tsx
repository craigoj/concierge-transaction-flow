
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OfferFormData } from '../OfferDraftingForm';

interface FinancingDetailsStepProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
}

export const FinancingDetailsStep = ({ formData, updateFormData }: FinancingDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
          Financing Details
        </h3>
        <p className="text-brand-charcoal/60">
          Provide information about the buyer and financing
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buyer_names">Buyer Name(s) *</Label>
          <Input
            id="buyer_names"
            value={formData.buyer_names}
            onChange={(e) => updateFormData({ buyer_names: e.target.value })}
            placeholder="First Last, First Last (if multiple buyers)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lending_company">Lending Company *</Label>
          <Input
            id="lending_company"
            value={formData.lending_company}
            onChange={(e) => updateFormData({ lending_company: e.target.value })}
            placeholder="Name of lending institution"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settlement_company">Settlement Company *</Label>
          <Input
            id="settlement_company"
            value={formData.settlement_company}
            onChange={(e) => updateFormData({ settlement_company: e.target.value })}
            placeholder="Name of settlement/title company"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closing_cost_assistance">Closing Cost Assistance</Label>
          <Textarea
            id="closing_cost_assistance"
            value={formData.closing_cost_assistance}
            onChange={(e) => updateFormData({ closing_cost_assistance: e.target.value })}
            placeholder="Details about seller concessions or closing cost assistance"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

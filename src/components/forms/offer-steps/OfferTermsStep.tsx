
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfferFormData } from '../OfferDraftingForm';

interface OfferTermsStepProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
}

export const OfferTermsStep = ({ formData, updateFormData }: OfferTermsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
          Offer Terms
        </h3>
        <p className="text-brand-charcoal/60">
          Specify the financial terms of your offer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="offer_price">Offer Price *</Label>
          <Input
            id="offer_price"
            type="number"
            value={formData.offer_price}
            onChange={(e) => updateFormData({ offer_price: e.target.value })}
            placeholder="$0"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="earnest_money_amount">Earnest Money Amount *</Label>
            <Input
              id="earnest_money_amount"
              type="number"
              value={formData.earnest_money_amount}
              onChange={(e) => updateFormData({ earnest_money_amount: e.target.value })}
              placeholder="$0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="down_payment_percentage">Down Payment %</Label>
            <Input
              id="down_payment_percentage"
              type="number"
              min="0"
              max="100"
              value={formData.down_payment_percentage}
              onChange={(e) => updateFormData({ down_payment_percentage: e.target.value })}
              placeholder="20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financing_type">Financing Type</Label>
          <Select
            value={formData.financing_type}
            onValueChange={(value) => updateFormData({ financing_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select financing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conventional">Conventional</SelectItem>
              <SelectItem value="fha">FHA</SelectItem>
              <SelectItem value="va">VA</SelectItem>
              <SelectItem value="usda">USDA</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="closing_date_preference">Preferred Closing Date</Label>
          <Input
            id="closing_date_preference"
            type="date"
            value={formData.closing_date_preference}
            onChange={(e) => updateFormData({ closing_date_preference: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
};

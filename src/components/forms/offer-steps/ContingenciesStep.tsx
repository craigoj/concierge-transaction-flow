
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { OfferFormData } from '../OfferDraftingForm';

interface ContingenciesStepProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
}

export const ContingenciesStep = ({ formData, updateFormData }: ContingenciesStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
          Contingencies
        </h3>
        <p className="text-brand-charcoal/60">
          Specify the contingencies for this offer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="inspection_period_days">Inspection Period (Days)</Label>
          <Input
            id="inspection_period_days"
            type="number"
            min="0"
            max="30"
            value={formData.inspection_period_days}
            onChange={(e) => updateFormData({ inspection_period_days: e.target.value })}
            placeholder="7"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Contingencies</Label>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="appraisal_contingency"
                checked={formData.appraisal_contingency}
                onCheckedChange={(checked) => updateFormData({ appraisal_contingency: !!checked })}
              />
              <Label htmlFor="appraisal_contingency">Appraisal Contingency</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="financing_contingency"
                checked={formData.financing_contingency}
                onCheckedChange={(checked) => updateFormData({ financing_contingency: !!checked })}
              />
              <Label htmlFor="financing_contingency">Financing Contingency</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sale_contingency"
                checked={formData.sale_contingency}
                onCheckedChange={(checked) => updateFormData({ sale_contingency: !!checked })}
              />
              <Label htmlFor="sale_contingency">Sale of Buyer's Home Contingency</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="other_contingencies">Other Contingencies</Label>
          <Textarea
            id="other_contingencies"
            value={formData.other_contingencies}
            onChange={(e) => updateFormData({ other_contingencies: e.target.value })}
            placeholder="Describe any additional contingencies..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

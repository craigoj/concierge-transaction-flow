
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OfferFormData } from '../OfferDraftingForm';

interface AdditionalTermsStepProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
}

export const AdditionalTermsStep = ({ formData, updateFormData }: AdditionalTermsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
          Additional Terms
        </h3>
        <p className="text-brand-charcoal/60">
          Specify any additional terms and conditions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="personal_property_included">Personal Property Included</Label>
          <Textarea
            id="personal_property_included"
            value={formData.personal_property_included}
            onChange={(e) => updateFormData({ personal_property_included: e.target.value })}
            placeholder="List any personal property to be included with the sale..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seller_concessions_requested">Seller Concessions Requested</Label>
          <Textarea
            id="seller_concessions_requested"
            value={formData.seller_concessions_requested}
            onChange={(e) => updateFormData({ seller_concessions_requested: e.target.value })}
            placeholder="Specify any requested seller concessions..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_terms">Special Terms and Conditions</Label>
          <Textarea
            id="special_terms"
            value={formData.special_terms}
            onChange={(e) => updateFormData({ special_terms: e.target.value })}
            placeholder="Any special terms, conditions, or requests..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline_preferences">Timeline Preferences</Label>
          <Textarea
            id="timeline_preferences"
            value={formData.timeline_preferences}
            onChange={(e) => updateFormData({ timeline_preferences: e.target.value })}
            placeholder="Any specific timeline requirements or preferences..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

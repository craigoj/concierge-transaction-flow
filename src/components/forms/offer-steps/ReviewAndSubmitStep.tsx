
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OfferFormData } from '../OfferDraftingForm';

interface ReviewAndSubmitStepProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
}

export const ReviewAndSubmitStep = ({ formData }: ReviewAndSubmitStepProps) => {
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? '$0' : `$${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
          Review Your Offer Request
        </h3>
        <p className="text-brand-charcoal/60">
          Please review all details before submitting
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Address:</span>
              <p>{formData.property_address || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Property Type:</span>
              <p>{formData.property_type || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Listing Price:</span>
              <p>{formatCurrency(formData.listing_price)}</p>
            </div>
            <div>
              <span className="font-medium">MLS Number:</span>
              <p>{formData.mls_number || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Offer Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Offer Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Offer Price:</span>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(formData.offer_price)}
              </p>
            </div>
            <div>
              <span className="font-medium">Earnest Money:</span>
              <p>{formatCurrency(formData.earnest_money_amount)}</p>
            </div>
            <div>
              <span className="font-medium">Financing:</span>
              <p>{formData.financing_type || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Closing Date:</span>
              <p>{formData.closing_date_preference || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buyer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Buyer Name(s):</span>
              <p>{formData.buyer_names || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium">Lending Company:</span>
              <p>{formData.lending_company || 'Not specified'}</p>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Settlement Company:</span>
              <p>{formData.settlement_company || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contingencies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contingencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Inspection Period:</span>
              <p>{formData.inspection_period_days ? `${formData.inspection_period_days} days` : 'Not specified'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.appraisal_contingency && <Badge variant="secondary">Appraisal</Badge>}
              {formData.financing_contingency && <Badge variant="secondary">Financing</Badge>}
              {formData.sale_contingency && <Badge variant="secondary">Sale of Buyer's Home</Badge>}
              {!formData.appraisal_contingency && !formData.financing_contingency && !formData.sale_contingency && (
                <span className="text-gray-500">No standard contingencies selected</span>
              )}
            </div>
            {formData.other_contingencies && (
              <div>
                <span className="font-medium">Other Contingencies:</span>
                <p className="text-sm text-gray-600">{formData.other_contingencies}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Terms */}
        {(formData.special_terms || formData.personal_property_included || formData.seller_concessions_requested) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {formData.personal_property_included && (
                <div>
                  <span className="font-medium">Personal Property:</span>
                  <p className="text-gray-600">{formData.personal_property_included}</p>
                </div>
              )}
              {formData.seller_concessions_requested && (
                <div>
                  <span className="font-medium">Seller Concessions:</span>
                  <p className="text-gray-600">{formData.seller_concessions_requested}</p>
                </div>
              )}
              {formData.special_terms && (
                <div>
                  <span className="font-medium">Special Terms:</span>
                  <p className="text-gray-600">{formData.special_terms}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>Next Steps:</strong> Once submitted, this offer request will be reviewed by your coordinator. 
          You will receive updates on the status and any additional information needed.
        </p>
      </div>
    </div>
  );
};

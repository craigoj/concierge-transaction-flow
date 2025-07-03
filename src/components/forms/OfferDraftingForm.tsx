
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PropertyDetailsStep } from './offer-steps/PropertyDetailsStep';
import { OfferTermsStep } from './offer-steps/OfferTermsStep';
import { FinancingDetailsStep } from './offer-steps/FinancingDetailsStep';
import { ContingenciesStep } from './offer-steps/ContingenciesStep';
import { AdditionalTermsStep } from './offer-steps/AdditionalTermsStep';
import { ReviewAndSubmitStep } from './offer-steps/ReviewAndSubmitStep';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OfferFormData {
  // Property Information
  property_address: string;
  listing_price: string;
  mls_number: string;
  property_type: string;
  lot_size: string;
  square_footage: string;
  
  // Offer Terms
  offer_price: string;
  earnest_money_amount: string;
  down_payment_percentage: string;
  financing_type: string;
  closing_date_preference: string;
  
  // Contingencies
  inspection_period_days: string;
  appraisal_contingency: boolean;
  financing_contingency: boolean;
  sale_contingency: boolean;
  other_contingencies: string;
  
  // Additional Terms
  personal_property_included: string;
  seller_concessions_requested: string;
  special_terms: string;
  timeline_preferences: string;
  
  // Buyer Information
  buyer_names: string;
  buyer_contacts: {
    phones: string[];
    emails: string[];
  };
  loan_type: string;
  lending_company: string;
  settlement_company: string;
  closing_cost_assistance: string;
  wdi_inspection_details: {
    period: number | null;
    provider: string | null;
    notes: string;
  };
  fica_details: {
    required: boolean;
    inspection_period: number | null;
  };
  extras: string;
  lead_eifs_survey: string;
  occupancy_notes: string;
}

const STEPS = [
  { id: 'property', title: 'Property Details', component: PropertyDetailsStep },
  { id: 'terms', title: 'Offer Terms', component: OfferTermsStep },
  { id: 'financing', title: 'Financing Details', component: FinancingDetailsStep },
  { id: 'contingencies', title: 'Contingencies', component: ContingenciesStep },
  { id: 'additional', title: 'Additional Terms', component: AdditionalTermsStep },
  { id: 'review', title: 'Review & Submit', component: ReviewAndSubmitStep }
];

export const OfferDraftingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OfferFormData>({
    property_address: '',
    listing_price: '',
    mls_number: '',
    property_type: '',
    lot_size: '',
    square_footage: '',
    offer_price: '',
    earnest_money_amount: '',
    down_payment_percentage: '',
    financing_type: '',
    closing_date_preference: '',
    inspection_period_days: '',
    appraisal_contingency: false,
    financing_contingency: false,
    sale_contingency: false,
    other_contingencies: '',
    personal_property_included: '',
    seller_concessions_requested: '',
    special_terms: '',
    timeline_preferences: '',
    buyer_names: '',
    buyer_contacts: { phones: [], emails: [] },
    loan_type: '',
    lending_company: '',
    settlement_company: '',
    closing_cost_assistance: '',
    wdi_inspection_details: { period: null, provider: null, notes: '' },
    fica_details: { required: false, inspection_period: null },
    extras: '',
    lead_eifs_survey: '',
    occupancy_notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-save functionality
  useFormAutoSave('offer_requests', undefined, formData, true, 30000);

  const updateFormData = (updates: Partial<OfferFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('offer_requests')
        .insert({
          agent_id: user.id,
          property_address: formData.property_address,
          buyer_names: formData.buyer_names,
          buyer_contacts: formData.buyer_contacts,
          purchase_price: parseFloat(formData.offer_price) || 0,
          loan_type: formData.loan_type,
          lending_company: formData.lending_company,
          emd_amount: parseFloat(formData.earnest_money_amount) || 0,
          exchange_fee: 0, // Will be calculated
          settlement_company: formData.settlement_company,
          closing_cost_assistance: formData.closing_cost_assistance,
          projected_closing_date: formData.closing_date_preference,
          wdi_inspection_details: formData.wdi_inspection_details,
          fica_details: formData.fica_details,
          extras: formData.extras,
          lead_eifs_survey: formData.lead_eifs_survey,
          occupancy_notes: formData.occupancy_notes,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer request submitted successfully",
      });

      // Reset form or redirect
      setCurrentStep(0);
      setFormData({
        property_address: '',
        listing_price: '',
        mls_number: '',
        property_type: '',
        lot_size: '',
        square_footage: '',
        offer_price: '',
        earnest_money_amount: '',
        down_payment_percentage: '',
        financing_type: '',
        closing_date_preference: '',
        inspection_period_days: '',
        appraisal_contingency: false,
        financing_contingency: false,
        sale_contingency: false,
        other_contingencies: '',
        personal_property_included: '',
        seller_concessions_requested: '',
        special_terms: '',
        timeline_preferences: '',
        buyer_names: '',
        buyer_contacts: { phones: [], emails: [] },
        loan_type: '',
        lending_company: '',
        settlement_company: '',
        closing_cost_assistance: '',
        wdi_inspection_details: { period: null, provider: null, notes: '' },
        fica_details: { required: false, inspection_period: null },
        extras: '',
        lead_eifs_survey: '',
        occupancy_notes: ''
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="card-brand">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl font-brand-heading text-brand-charcoal">
              Digital Offer Request
            </CardTitle>
            <div className="text-sm text-brand-charcoal/60">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-brand-charcoal/70">
              <span>{STEPS[currentStep].title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <CurrentStepComponent 
            formData={formData}
            updateFormData={updateFormData}
          />

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-brand"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Offer Request'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="btn-brand"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

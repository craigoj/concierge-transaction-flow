import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PropertyDetailsStep } from './offer-steps/PropertyDetailsStep';
import { OfferTermsStep } from './offer-steps/OfferTermsStep';
import { FinancingDetailsStep } from './offer-steps/FinancingDetailsStep';
import { ContingenciesStep } from './offer-steps/ContingenciesStep';
import { AdditionalTermsStep } from './offer-steps/AdditionalTermsStep';
import { ReviewAndSubmitStep } from './offer-steps/ReviewAndSubmitStep';

export interface OfferFormData {
  // Property Details
  property_address: string;
  buyer_names: string;
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
  
  // Financing Details (keep existing names for database compatibility)
  purchase_price: string;
  emd_amount: string;
  exchange_fee: string;
  projected_closing_date: string;
  loan_type: string;
  lending_company: string;
  settlement_company: string;
  closing_cost_assistance: string;
  
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
}

const initialFormData: OfferFormData = {
  property_address: '',
  buyer_names: '',
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
  purchase_price: '',
  emd_amount: '',
  exchange_fee: '',
  projected_closing_date: '',
  loan_type: '',
  lending_company: '',
  settlement_company: '',
  closing_cost_assistance: '',
  inspection_period_days: '7',
  appraisal_contingency: true,
  financing_contingency: true,
  sale_contingency: false,
  other_contingencies: '',
  personal_property_included: '',
  seller_concessions_requested: '',
  special_terms: '',
  timeline_preferences: '',
};

const steps = [
  { id: 1, title: 'Property Details', component: PropertyDetailsStep },
  { id: 2, title: 'Offer Terms', component: OfferTermsStep },
  { id: 3, title: 'Financing Details', component: FinancingDetailsStep },
  { id: 4, title: 'Contingencies', component: ContingenciesStep },
  { id: 5, title: 'Additional Terms', component: AdditionalTermsStep },
  { id: 6, title: 'Review & Submit', component: ReviewAndSubmitStep },
];

export const OfferDraftingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OfferFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateFormData = (updates: Partial<OfferFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Auto-save functionality
  useEffect(() => {
    if (!user?.id) return;

    const autoSave = async () => {
      setAutoSaving(true);
      try {
        localStorage.setItem('offerDraftFormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setAutoSaving(false);
      }
    };

    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [formData, user?.id]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('offerDraftFormData');
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const offerData = {
        agent_id: user.id,
        property_address: formData.property_address,
        buyer_names: formData.buyer_names,
        purchase_price: parseFloat(formData.offer_price || formData.purchase_price) || 0,
        emd_amount: parseFloat(formData.earnest_money_amount || formData.emd_amount) || 0,
        exchange_fee: parseFloat(formData.exchange_fee) || 0,
        projected_closing_date: formData.closing_date_preference || formData.projected_closing_date,
        loan_type: formData.financing_type || formData.loan_type,
        lending_company: formData.lending_company,
        settlement_company: formData.settlement_company,
        closing_cost_assistance: formData.closing_cost_assistance || null,
        buyer_contacts: { phones: [], emails: [] },
        extras: formData.personal_property_included || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('offer_requests')
        .insert(offerData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer request submitted successfully",
      });

      localStorage.removeItem('offerDraftFormData');
      setFormData(initialFormData);
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

  const CurrentStepComponent = steps[currentStep - 1].component;
  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Offer Drafting Request</span>
          {autoSaving && (
            <span className="text-sm text-muted-foreground">Auto-saving...</span>
          )}
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
        />
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Offer Request"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

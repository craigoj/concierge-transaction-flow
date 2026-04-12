import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { documentGenerator } from '@/lib/document-generation/document-generator';
import { initializeStorage } from '@/lib/storage/initialize-storage';
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

interface OfferDraftingFormProps {
  transactionId: string;
}

export const OfferDraftingForm: React.FC<OfferDraftingFormProps> = ({ transactionId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OfferFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateFormData = (updates: Partial<OfferFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Initialize storage if needed
      await initializeStorage();

      const offerData = {
        transaction_id: transactionId,
        agent_id: user.id,
        property_address: formData.property_address,
        property_city: 'Test City',
        property_state: 'TS',
        property_zip: '12345',
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
        financing_contingency_days: formData.financing_contingency ? 30 : 0,
        inspection_contingency_days: parseInt(formData.inspection_period_days) || 0,
        appraisal_contingency_days: formData.appraisal_contingency ? 30 : 0,
        settlement_date_contingency_days: 0,
        status: 'pending',
      };

      const { error } = await supabase.from('offer_requests').insert(offerData);

      if (error) throw error;

      // Generate PDF document from offer data
      try {
        // Find the Offer Letter template
        const { data: templates, error: templateError } = await supabase
          .from('document_templates')
          .select('*')
          .eq('type', 'offer_letter')
          .eq('is_active', true)
          .limit(1);

        if (templateError) {
          console.error('Error fetching template:', templateError);
        } else if (templates && templates.length > 0) {
          const template = templates[0];

          // Map form data to template variables
          const templateVariables = {
            offer_date: new Date().toLocaleDateString(),
            seller_name: 'Seller Name', // This would come from listing data
            buyer_name: formData.buyer_names,
            property_address: formData.property_address,
            offer_price: formData.offer_price || formData.purchase_price,
            earnest_money: formData.earnest_money_amount || formData.emd_amount,
            down_payment: formData.down_payment_percentage
              ? `${formData.down_payment_percentage}%`
              : '',
            financing_type: formData.financing_type || formData.loan_type,
            closing_date: formData.closing_date_preference || formData.projected_closing_date,
            inspection_period: formData.inspection_period_days,
            financing_contingency: formData.financing_contingency ? '30' : '0',
            additional_terms: formData.special_terms || 'None',
            offer_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
            buyer_contact: 'Contact information', // This would come from user profile
          };

          // Generate the document
          const generateResult = await documentGenerator.generateDocument({
            templateId: template.id,
            transactionId: transactionId,
            variables: templateVariables,
            fileName: `offer_letter_${formData.property_address.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
            metadata: {
              offerType: 'offer_letter',
              propertyAddress: formData.property_address,
              buyerName: formData.buyer_names,
            },
          });

          if (generateResult.success) {
            toast({
              title: 'Success',
              description: 'Offer request submitted and PDF generated successfully',
            });
          } else {
            console.error('Document generation failed:', generateResult.error);
            toast({
              title: 'Offer Submitted',
              description: 'Offer request submitted successfully, but PDF generation failed',
            });
          }
        } else {
          toast({
            title: 'Offer Submitted',
            description:
              'Offer request submitted successfully (no template found for PDF generation)',
          });
        }
      } catch (docError) {
        console.error('Document generation error:', docError);
        toast({
          title: 'Offer Submitted',
          description: 'Offer request submitted successfully, but PDF generation failed',
        });
      }

      localStorage.removeItem('offerDraftFormData');
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
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
          {autoSaving && <span className="text-sm text-muted-foreground">Auto-saving...</span>}
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <CurrentStepComponent formData={formData} updateFormData={updateFormData} />

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
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Offer Request'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

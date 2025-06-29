
import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VendorPreferencesStep } from './intake-steps/VendorPreferencesStep';
import { BrandingPreferencesStep } from './intake-steps/BrandingPreferencesStep';
import { ReviewAndSubmitStep } from './intake-steps/ReviewAndSubmitStep';
import { 
  StepTransition, 
  AnimatedProgress,
  FormLoadingOverlay,
  FormStateProvider,
  useFormStateContext,
  NetworkStatusIndicator,
  FormStatusBar
} from './components';

interface AgentIntakeFormProps {
  onComplete?: () => void;
}

const AgentIntakeFormContent = ({ onComplete }: AgentIntakeFormProps) => {
  const {
    state,
    isLoading,
    setCurrentStep,
    setValidationErrors,
    updateVendorData,
    updateBrandingData,
    hasUnsavedChanges,
    forceSave
  } = useFormStateContext();

  const { currentStep, validationErrors, isSubmitting, vendorData, brandingData } = state;
  const [previousStep, setPreviousStep] = React.useState(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const steps = [
    { number: 1, title: 'Vendor Preferences', description: 'Configure your preferred vendors' },
    { number: 2, title: 'Branding Preferences', description: 'Set up your branding preferences' },
    { number: 3, title: 'Review & Submit', description: 'Review and complete setup' }
  ];

  const handleStepComplete = (stepNumber: number, data: any) => {
    if (stepNumber === 1) {
      updateVendorData(data);
    } else if (stepNumber === 2) {
      updateBrandingData(data);
    }
    
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps(prev => [...prev, stepNumber]);
    }

    forceSave();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setPreviousStep(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setPreviousStep(currentStep);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setPreviousStep(currentStep);
    setCurrentStep(stepNumber);
  };

  const handleEditStep = (stepNumber: number) => {
    setPreviousStep(currentStep);
    setCurrentStep(stepNumber);
  };

  // Convert AgentVendor[] to the format expected by VendorPreferencesStep
  const convertVendorsToStepFormat = (vendors: any[]) => {
    const grouped: Record<string, any[]> = {};
    vendors.forEach(vendor => {
      if (!grouped[vendor.vendor_type]) {
        grouped[vendor.vendor_type] = [];
      }
      grouped[vendor.vendor_type].push(vendor);
    });
    return grouped;
  };

  // Convert AgentBranding to the format expected by BrandingPreferencesStep
  const convertBrandingToStepFormat = (branding: any) => {
    return {
      has_branded_sign: branding.has_branded_sign || 'no',
      sign_notes: branding.sign_notes || '',
      review_link: branding.review_link || '',
      has_canva_template: branding.has_canva_template || 'no',
      canva_template_url: branding.canva_template_url || '',
      favorite_color: branding.favorite_color || '#3C3C3C',
      drinks_coffee: branding.drinks_coffee || false,
      drinks_alcohol: branding.drinks_alcohol || false,
      birthday: branding.birthday || '',
      social_media_permission: branding.social_media_permission || false
    };
  };

  const progress = (currentStep / 3) * 100;
  const direction = currentStep > previousStep ? 1 : -1;

  if (isLoading) {
    return <FormLoadingOverlay isVisible={true} message="Loading your profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Network Status */}
      <NetworkStatusIndicator />

      {/* Progress Header */}
      <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase">
                Agent Setup
              </CardTitle>
              <p className="text-brand-charcoal/70 font-brand-body mt-1">
                Complete your profile to get started
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-brand-charcoal">
                {currentStep}/3
              </div>
              <div className="text-sm text-brand-charcoal/60 font-brand-heading tracking-wide uppercase">
                Steps Complete
              </div>
            </div>
          </div>
          
          <AnimatedProgress progress={progress} className="mb-6" />
          
          {/* Step Navigation */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 flex-1 mx-1 hover:scale-102 ${
                  currentStep === step.number
                    ? 'bg-brand-charcoal text-brand-background shadow-brand-elevation'
                    : completedSteps.includes(step.number)
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-brand-taupe/10 text-brand-charcoal/70 hover:bg-brand-taupe/20'
                }`}
              >
                <div className="flex-shrink-0">
                  {completedSteps.includes(step.number) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="font-brand-heading text-sm tracking-wide uppercase truncate">
                    {step.title}
                  </div>
                  <div className="text-xs opacity-80 truncate">
                    {step.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Validation Errors Alert */}
      {Object.keys(validationErrors).some(key => validationErrors[key]) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors before proceeding.
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content with Transitions */}
      <div className="min-h-[600px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          <StepTransition 
            key={currentStep}
            currentStep={currentStep} 
            direction={direction}
          >
            {currentStep === 1 && (
              <VendorPreferencesStep
                onComplete={(data) => handleStepComplete(1, data)}
                onNext={handleNext}
                initialData={convertVendorsToStepFormat(vendorData)}
              />
            )}
            {currentStep === 2 && (
              <BrandingPreferencesStep
                onComplete={(data) => handleStepComplete(2, data)}
                onNext={handleNext}
                onPrevious={handlePrevious}
                initialData={convertBrandingToStepFormat(brandingData)}
                onFieldChange={async (field: string, value: any) => {
                  setValidationErrors({ ...validationErrors, [field]: '' });
                }}
                errors={validationErrors}
              />
            )}
            {currentStep === 3 && (
              <ReviewAndSubmitStep
                vendorData={convertVendorsToStepFormat(vendorData)}
                brandingData={convertBrandingToStepFormat(brandingData)}
                onPrevious={handlePrevious}
                onComplete={onComplete}
                onEditStep={handleEditStep}
              />
            )}
          </StepTransition>
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <FormStatusBar />

      {/* Loading Overlay */}
      <FormLoadingOverlay 
        isVisible={isSubmitting}
        message="Setting up your profile..."
        progress={isSubmitting ? 75 : 0}
      />
    </div>
  );
};

export const AgentIntakeForm = ({ onComplete }: AgentIntakeFormProps) => {
  return (
    <FormStateProvider 
      autoSaveInterval={30000}
      enableOptimisticUpdates={true}
      enableConflictResolution={true}
    >
      <AgentIntakeFormContent onComplete={onComplete} />
    </FormStateProvider>
  );
};

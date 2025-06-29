
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VendorPreferencesStep } from './intake-steps/VendorPreferencesStep';
import { BrandingPreferencesStep } from './intake-steps/BrandingPreferencesStep';
import { ReviewAndSubmitStep } from './intake-steps/ReviewAndSubmitStep';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';
import { useLiveValidation, createEmailValidator } from '@/hooks/useLiveValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  StepTransition, 
  AutoSaveStatus, 
  AnimatedProgress,
  FormLoadingOverlay 
} from './components';

interface AgentIntakeFormProps {
  onComplete?: () => void;
}

export const AgentIntakeForm = ({ onComplete }: AgentIntakeFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vendors: {},
    branding: {
      has_branded_sign: '',
      sign_notes: '',
      review_link: '',
      has_canva_template: '',
      canva_template_url: '',
      favorite_color: '#3C3C3C',
      drinks_coffee: false,
      drinks_alcohol: false,
      birthday: '',
      social_media_permission: false
    },
    review: {}
  });

  const calculateProgress = () => {
    return Math.round((completedSteps.length / 3) * 100);
  };

  // Auto-save functionality
  const { saveStatus, hasChanges, forceSave } = useFormAutoSave({
    table: 'agent_intake_sessions',
    data: {
      vendor_data: formData.vendors,
      branding_data: formData.branding,
      status: 'in_progress',
      completion_percentage: calculateProgress()
    },
    interval: 30000,
    enabled: currentStep < 3
  });

  // Live validation for branding step
  const { errors, validateField } = useLiveValidation({
    rules: [
      {
        field: 'review_link',
        validator: createEmailValidator()
      }
    ]
  });

  const steps = [
    { number: 1, title: 'Vendor Preferences', description: 'Configure your preferred vendors' },
    { number: 2, title: 'Branding Preferences', description: 'Set up your branding preferences' },
    { number: 3, title: 'Review & Submit', description: 'Review and complete setup' }
  ];

  const handleStepComplete = (stepNumber: number, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepNumber === 1 ? 'vendors' : stepNumber === 2 ? 'branding' : 'review']: data
    }));
    
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

  const progress = (currentStep / 3) * 100;
  const direction = currentStep > previousStep ? 1 : -1;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
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
              {/* Auto-save status with animation */}
              <div className="mt-2">
                <AutoSaveStatus status={saveStatus} />
              </div>
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
      {Object.keys(errors).some(key => errors[key]) && (
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
                initialData={formData.vendors}
              />
            )}
            {currentStep === 2 && (
              <BrandingPreferencesStep
                onComplete={(data) => handleStepComplete(2, data)}
                onNext={handleNext}
                onPrevious={handlePrevious}
                initialData={formData.branding}
                onFieldChange={(field, value) => validateField(field, value)}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <ReviewAndSubmitStep
                vendorData={formData.vendors}
                brandingData={formData.branding}
                onPrevious={handlePrevious}
                onComplete={onComplete}
                onEditStep={handleEditStep}
              />
            )}
          </StepTransition>
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      <FormLoadingOverlay 
        isVisible={isSubmitting}
        message="Setting up your profile..."
        progress={isSubmitting ? 75 : 0}
      />
    </div>
  );
};

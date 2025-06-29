
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VendorPreferencesStep } from './intake-steps/VendorPreferencesStep';
import { BrandingPreferencesStep } from './intake-steps/BrandingPreferencesStep';
import { ReviewAndSubmitStep } from './intake-steps/ReviewAndSubmitStep';
import { CheckCircle, Circle } from 'lucide-react';

interface AgentIntakeFormProps {
  onComplete?: () => void;
}

export const AgentIntakeForm = ({ onComplete }: AgentIntakeFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
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
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const progress = (currentStep / 3) * 100;

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
          
          <Progress value={progress} className="h-2 mb-6" />
          
          {/* Step Navigation */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => handleStepClick(step.number)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 flex-1 mx-1 ${
                  currentStep === step.number
                    ? 'bg-brand-charcoal text-brand-background'
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

      {/* Step Content */}
      <div className="min-h-[600px]">
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
          />
        )}
        {currentStep === 3 && (
          <ReviewAndSubmitStep
            vendorData={formData.vendors}
            brandingData={formData.branding}
            onPrevious={handlePrevious}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
};

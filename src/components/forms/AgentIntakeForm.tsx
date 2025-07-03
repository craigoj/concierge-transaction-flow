
import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VendorPreferencesStep from './intake-steps/VendorPreferencesStep';
import BrandingPreferencesStep from './intake-steps/BrandingPreferencesStep';
import ReviewAndSubmitStep from './intake-steps/ReviewAndSubmitStep';

interface AgentIntakeFormProps {
  onComplete?: () => void;
}

const AgentIntakeForm = ({ onComplete }: AgentIntakeFormProps) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [formData, setFormData] = React.useState({
    vendors: {},
    branding: {}
  });

  const steps = [
    { number: 1, title: 'Vendor Preferences', description: 'Configure your preferred vendors' },
    { number: 2, title: 'Branding Preferences', description: 'Set up your branding preferences' },
    { number: 3, title: 'Review & Submit', description: 'Review and complete setup' }
  ];

  const handleStepComplete = (stepNumber: number, data: any) => {
    if (stepNumber === 1) {
      setFormData(prev => ({ ...prev, vendors: data }));
    } else if (stepNumber === 2) {
      setFormData(prev => ({ ...prev, branding: data }));
    }
    
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
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-brand-charcoal h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
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

      {/* Step Content */}
      <div className="min-h-[600px] relative overflow-hidden">
        {currentStep === 1 && (
          <VendorPreferencesStep
            data={formData.vendors}
            onNext={handleNext}
            onChange={(data) => handleStepComplete(1, data)}
          />
        )}
        {currentStep === 2 && (
          <BrandingPreferencesStep
            data={formData.branding}
            onNext={handleNext}
            onPrev={handlePrevious}
            onChange={(field, value) => {
              const newBranding = { ...formData.branding, [field]: value };
              setFormData(prev => ({ ...prev, branding: newBranding }));
            }}
          />
        )}
        {currentStep === 3 && (
          <ReviewAndSubmitStep
            data={formData}
            onEdit={(step) => setCurrentStep(step)}
            onSubmit={async (data) => {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate submission
              onComplete?.();
            }}
            isLoading={false}
            isSubmitDisabled={false}
          />
        )}
      </div>
    </div>
  );
};

export { AgentIntakeForm };

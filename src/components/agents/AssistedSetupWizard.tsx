
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Building, 
  Palette, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Clock
} from "lucide-react";

interface AssistedSetupWizardProps {
  agent: any;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const AssistedSetupWizard = ({ agent, open, onClose, onComplete }: AssistedSetupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Agent Details
    phoneNumber: agent?.phone_number || '',
    brokerage: agent?.brokerage || '',
    yearsExperience: agent?.years_experience || '',
    
    // Setup Progress
    completedSteps: {
      profileCreated: true,
      emailVerified: !!agent?.email,
      passwordSet: false,
      preferencesSet: false,
      brandingSet: false,
      vendorsSet: false,
      trainingCompleted: false,
    }
  });
  
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Agent Profile", icon: User, description: "Complete agent information" },
    { id: 2, title: "Account Setup", icon: CheckCircle, description: "Verify account details" },
    { id: 3, title: "Branding Setup", icon: Palette, description: "Configure branding preferences" },
    { id: 4, title: "Vendor Setup", icon: Building, description: "Set up preferred vendors" },
    { id: 5, title: "Final Review", icon: CheckCircle, description: "Complete onboarding" },
  ];

  const currentStepData = steps.find(s => s.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepCompletion = (stepKey: string, completed: boolean) => {
    setFormData(prev => ({
      ...prev,
      completedSteps: {
        ...prev.completedSteps,
        [stepKey]: completed
      }
    }));
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      // Update agent profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone_number: formData.phoneNumber,
          brokerage: formData.brokerage,
          years_experience: parseInt(formData.yearsExperience) || null,
          onboarding_completed_at: new Date().toISOString(),
          invitation_status: 'completed',
          onboarding_method: 'assisted_setup',
        })
        .eq('id', agent.id);

      if (profileError) throw profileError;

      // Log the assisted setup
      await supabase
        .from('activity_logs')
        .insert({
          user_id: agent.id,
          action: 'assisted_onboarding_completed',
          description: 'Agent onboarding completed with admin assistance',
          entity_type: 'profile',
          entity_id: agent.id,
          metadata: {
            setup_method: 'assisted_setup',
            completed_steps: formData.completedSteps,
          },
        });

      toast({
        title: "Onboarding Complete!",
        description: `${agent.first_name} ${agent.last_name} has been successfully onboarded.`,
      });

      onComplete();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Onboarding failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brokerage">Brokerage</Label>
              <Input
                id="brokerage"
                value={formData.brokerage}
                onChange={(e) => setFormData(prev => ({ ...prev, brokerage: e.target.value }))}
                placeholder="ABC Real Estate"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                value={formData.yearsExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                placeholder="5"
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Account Verification Checklist</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="profileCreated"
                  checked={formData.completedSteps.profileCreated}
                  onCheckedChange={(checked) => handleStepCompletion('profileCreated', checked as boolean)}
                />
                <Label htmlFor="profileCreated">Profile created and verified</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailVerified"
                  checked={formData.completedSteps.emailVerified}
                  onCheckedChange={(checked) => handleStepCompletion('emailVerified', checked as boolean)}
                />
                <Label htmlFor="emailVerified">Email address verified</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="passwordSet"
                  checked={formData.completedSteps.passwordSet}
                  onCheckedChange={(checked) => handleStepCompletion('passwordSet', checked as boolean)}
                />
                <Label htmlFor="passwordSet">Password set and tested</Label>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Branding & Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="brandingSet"
                  checked={formData.completedSteps.brandingSet}
                  onCheckedChange={(checked) => handleStepCompletion('brandingSet', checked as boolean)}
                />
                <Label htmlFor="brandingSet">Branding preferences configured</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preferencesSet"
                  checked={formData.completedSteps.preferencesSet}
                  onCheckedChange={(checked) => handleStepCompletion('preferencesSet', checked as boolean)}
                />
                <Label htmlFor="preferencesSet">Communication preferences set</Label>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Work with the agent to complete their branding intake form
                if they haven't already done so.
              </p>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Vendor Setup</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vendorsSet"
                  checked={formData.completedSteps.vendorsSet}
                  onCheckedChange={(checked) => handleStepCompletion('vendorsSet', checked as boolean)}
                />
                <Label htmlFor="vendorsSet">Preferred vendors configured</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trainingCompleted"
                  checked={formData.completedSteps.trainingCompleted}
                  onCheckedChange={(checked) => handleStepCompletion('trainingCompleted', checked as boolean)}
                />
                <Label htmlFor="trainingCompleted">Platform training completed</Label>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Tip:</strong> Help the agent add their most frequently used vendors
                for each category (lender, title company, inspector, etc.).
              </p>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Onboarding Summary</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Agent Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {agent.first_name} {agent.last_name}</p>
                  <p><strong>Email:</strong> {agent.email}</p>
                  <p><strong>Phone:</strong> {formData.phoneNumber || 'Not provided'}</p>
                  <p><strong>Brokerage:</strong> {formData.brokerage || 'Not provided'}</p>
                  <p><strong>Experience:</strong> {formData.yearsExperience || 'Not provided'} years</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Completion Status</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(formData.completedSteps).map(([key, completed]) => (
                    <div key={key} className="flex items-center space-x-2">
                      {completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className={completed ? 'text-green-700' : 'text-yellow-700'}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Assisted Setup: {agent?.first_name} {agent?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step.id === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : step.id < currentStep 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepData && <currentStepData.icon className="h-5 w-5" />}
                {currentStepData?.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{currentStepData?.description}</p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              
              {currentStep < steps.length ? (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Complete Onboarding
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

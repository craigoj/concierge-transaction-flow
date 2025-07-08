import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Import the step components
import { PropertyDetailsStep } from './wizard-steps/PropertyDetailsStep';
import { ClientInformationStep } from './wizard-steps/ClientInformationStep';
import { TransactionConfigurationStep } from './wizard-steps/TransactionConfigurationStep';
import { ReviewSubmitStep } from './wizard-steps/ReviewSubmitStep';

// Types
export interface PropertyDetails {
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'commercial' | 'land';
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  listing_price?: number;
  mls_number?: string;
  property_status: 'active' | 'pending' | 'under_contract' | 'sold' | 'off_market';
}

export interface ClientInformation {
  primary_client: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller' | 'agent';
    communication_preference: 'email' | 'phone' | 'text' | 'app';
  };
  secondary_clients: Array<{
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    role: 'buyer' | 'seller' | 'agent';
    communication_preference: 'email' | 'phone' | 'text' | 'app';
  }>;
  special_requirements?: string;
}

export interface TransactionConfiguration {
  transaction_type: 'listing' | 'buyer' | 'dual';
  service_tier:
    | 'buyer_core'
    | 'buyer_elite'
    | 'white_glove_buyer'
    | 'listing_core'
    | 'listing_elite'
    | 'white_glove_listing';
  agent_id: string;
  expected_closing_date?: string;
  financing_type: 'cash' | 'conventional' | 'fha' | 'va' | 'usda' | 'other';
  pre_approval_status: boolean;
  lender_info?: string;
  priority_level: 'standard' | 'urgent' | 'rush';
  notes?: string;
}

export interface WizardData {
  propertyDetails: PropertyDetails;
  clientInformation: ClientInformation;
  transactionConfiguration: TransactionConfiguration;
}

interface TransactionCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const steps = [
  { id: 1, title: 'Property Details', description: 'Transaction type & property information' },
  { id: 2, title: 'Client Information', description: 'Client details & contacts' },
  { id: 3, title: 'Configuration', description: 'Service tier & transaction settings' },
  { id: 4, title: 'Review & Submit', description: 'Confirm and create transaction' },
];

export const TransactionCreationWizard: React.FC<TransactionCreationWizardProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (step: number, data: any) => {
    setWizardData((prev) => ({
      ...prev,
      ...(step === 1 && { propertyDetails: data }),
      ...(step === 2 && { clientInformation: data }),
      ...(step === 3 && { transactionConfiguration: data }),
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        const propertyDetails = wizardData.propertyDetails;
        return !!(
          propertyDetails?.address_street &&
          propertyDetails?.address_city &&
          propertyDetails?.address_state &&
          propertyDetails?.address_zip &&
          propertyDetails?.property_type
        );
      }
      case 2: {
        const clientInfo = wizardData.clientInformation;
        return !!(
          clientInfo?.primary_client?.first_name &&
          clientInfo?.primary_client?.last_name &&
          clientInfo?.primary_client?.email &&
          clientInfo?.primary_client?.role
        );
      }
      case 3: {
        const transactionConfig = wizardData.transactionConfiguration;
        return !!(
          transactionConfig?.transaction_type &&
          transactionConfig?.service_tier &&
          transactionConfig?.financing_type
        );
      }
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (
      !user ||
      !wizardData.propertyDetails ||
      !wizardData.clientInformation ||
      !wizardData.transactionConfiguration
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please complete all required fields',
      });
      return;
    }

    setLoading(true);
    try {
      // Create property first
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert(wizardData.propertyDetails)
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Create transaction
      const transactionData = {
        property_id: property.id,
        agent_id: wizardData.transactionConfiguration.agent_id || user.id,
        transaction_type_enum: wizardData.transactionConfiguration.transaction_type,
        service_tier: wizardData.transactionConfiguration.service_tier,
        expected_closing_date: wizardData.transactionConfiguration.expected_closing_date || null,
        financing_type: wizardData.transactionConfiguration.financing_type,
        pre_approval_status: wizardData.transactionConfiguration.pre_approval_status,
        lender_info: wizardData.transactionConfiguration.lender_info,
        priority_level: wizardData.transactionConfiguration.priority_level,
        notes: wizardData.transactionConfiguration.notes,
        status: 'pending' as const,
      };

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create primary client
      const primaryClientData = {
        transaction_id: transaction.id,
        client_type: 'primary' as const,
        ...wizardData.clientInformation.primary_client,
      };

      const { error: primaryClientError } = await supabase
        .from('transaction_clients')
        .insert(primaryClientData);

      if (primaryClientError) throw primaryClientError;

      // Create secondary clients if any
      if (wizardData.clientInformation.secondary_clients?.length > 0) {
        const secondaryClientsData = wizardData.clientInformation.secondary_clients.map(
          (client) => ({
            transaction_id: transaction.id,
            client_type: 'secondary' as const,
            ...client,
          })
        );

        const { error: secondaryClientsError } = await supabase
          .from('transaction_clients')
          .insert(secondaryClientsData);

        if (secondaryClientsError) throw secondaryClientsError;
      }

      toast({
        title: 'Success',
        description: 'Transaction created successfully with all details',
      });

      // Reset wizard
      setCurrentStep(1);
      setWizardData({});
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create transaction',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setWizardData({});
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyDetailsStep
            data={wizardData.propertyDetails}
            onChange={(data) => handleStepData(1, data)}
          />
        );
      case 2:
        return (
          <ClientInformationStep
            data={wizardData.clientInformation}
            onChange={(data) => handleStepData(2, data)}
          />
        );
      case 3:
        return (
          <TransactionConfigurationStep
            data={wizardData.transactionConfiguration}
            onChange={(data) => handleStepData(3, data)}
            transactionType={
              wizardData.propertyDetails?.property_status === 'active' ? 'listing' : 'buyer'
            }
          />
        );
      case 4:
        return (
          <ReviewSubmitStep
            data={wizardData as WizardData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold">Create New Transaction</DialogTitle>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {steps.length}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center space-x-2 ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }
                  `}
                  >
                    {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          <Card className="border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge variant="outline">{steps[currentStep - 1]?.title}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={!validateStep(currentStep) || loading}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Creating...' : 'Create Transaction'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionCreationWizard;

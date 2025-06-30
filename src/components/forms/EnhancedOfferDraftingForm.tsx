
import React, { useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, DollarSign, Building, FileText, CreditCard } from 'lucide-react';
import { ValidationProvider } from '@/components/validation/ValidationProvider';
import { ValidatedInput } from '@/components/validation/ValidatedInput';
import { SecurityIndicator } from '@/components/validation/SecurityIndicator';
import { useSecurityStatus } from '@/hooks/useSecurityStatus';
import { useAuth } from '@/integrations/supabase/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  emailSchema, 
  phoneSchema, 
  currencySchema, 
  futureDateSchema,
  offerRequestCrossValidation,
  createUniqueValidation,
  createBusinessRuleValidation
} from '@/lib/validation/validators';

interface EnhancedOfferDraftingFormProps {
  transactionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EnhancedOfferDraftingForm = ({ 
  transactionId, 
  onSuccess, 
  onCancel 
}: EnhancedOfferDraftingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { status } = useSecurityStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    property_address: '',
    buyer_names: '',
    phones: [''],
    emails: [''],
    purchase_price: '',
    loan_type: '',
    lending_company: '',
    emd_amount: '',
    exchange_fee: '',
    settlement_company: '',
    projected_closing_date: ''
  });

  // Enhanced validation rules with server-side validation
  const validationRules = [
    {
      field: 'property_address',
      schema: z.string().min(10, 'Please enter a complete address'),
      serverValidator: createUniqueValidation('transactions', 'property_address'),
      crossFieldDependencies: []
    },
    {
      field: 'buyer_names',
      schema: z.string().min(2, 'Buyer names are required'),
      crossFieldDependencies: []
    },
    {
      field: 'emails.0',
      schema: emailSchema,
      crossFieldDependencies: []
    },
    {
      field: 'phones.0',
      schema: phoneSchema,
      crossFieldDependencies: []
    },
    {
      field: 'purchase_price',
      schema: currencySchema,
      serverValidator: createBusinessRuleValidation(
        (value) => value >= 50000 && value <= 10000000,
        'Purchase price should be between $50,000 and $10,000,000'
      ),
      crossFieldDependencies: ['emd_amount']
    },
    {
      field: 'emd_amount',
      schema: currencySchema,
      serverValidator: createBusinessRuleValidation(
        (value, context) => {
          const purchasePrice = parseFloat(context?.purchase_price || '0');
          return value <= purchasePrice * 0.1;
        },
        'EMD should not exceed 10% of purchase price'
      ),
      crossFieldDependencies: ['purchase_price']
    },
    {
      field: 'projected_closing_date',
      schema: futureDateSchema,
      serverValidator: createBusinessRuleValidation(
        (value) => {
          const date = new Date(value);
          const maxDate = new Date();
          maxDate.setMonth(maxDate.getMonth() + 6);
          return date <= maxDate;
        },
        'Closing date should be within 6 months'
      ),
      crossFieldDependencies: []
    }
  ];

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user?.id || !status.isSecure) {
      toast({
        title: 'Security Error',
        description: 'Please ensure you are logged in and have a secure connection',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Final validation before submission
      const validationResult = offerRequestCrossValidation.safeParse({
        purchase_price: parseFloat(formData.purchase_price),
        emd_amount: parseFloat(formData.emd_amount),
        exchange_fee: parseFloat(formData.exchange_fee),
        projected_closing_date: new Date(formData.projected_closing_date),
        loan_type: formData.loan_type,
        buyer_contacts: {
          emails: formData.emails.filter(e => e.trim()),
          phones: formData.phones.filter(p => p.trim())
        }
      });

      if (!validationResult.success) {
        toast({
          title: 'Validation Error',
          description: validationResult.error.errors[0]?.message || 'Please check your inputs',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('offer_requests')
        .insert({
          agent_id: user.id,
          transaction_id: transactionId || null,
          property_address: formData.property_address,
          buyer_names: formData.buyer_names,
          buyer_contacts: {
            phones: formData.phones.filter(phone => phone.trim()),
            emails: formData.emails.filter(email => email.trim())
          },
          purchase_price: parseFloat(formData.purchase_price),
          loan_type: formData.loan_type,
          lending_company: formData.lending_company,
          emd_amount: parseFloat(formData.emd_amount),
          exchange_fee: parseFloat(formData.exchange_fee),
          settlement_company: formData.settlement_company,
          projected_closing_date: formData.projected_closing_date,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Offer Request Submitted! 📋',
        description: 'Your offer request has been submitted for review and processing.',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting offer request:', error);
      toast({
        title: 'Submission Error',
        description: 'Failed to submit offer request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ValidationProvider 
      rules={validationRules}
      debounceMs={500}
      enableServerValidation={true}
      enableCaching={60000}
      rateLimitConfig={{ maxRequests: 20, windowMs: 300000 }}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
            Enhanced Offer Drafting Request
          </h1>
          <p className="text-lg font-brand-body text-brand-charcoal/70 mb-4">
            Complete this secure form to request a professional offer draft
          </p>
          <SecurityIndicator status={status} />
        </div>

        {/* Property Information */}
        <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
          <CardHeader>
            <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
              <Home className="h-6 w-6" />
              Property & Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ValidatedInput
              name="property_address"
              label="Property Address"
              value={formData.property_address}
              onChange={(value) => handleFieldChange('property_address', value)}
              placeholder="123 Main Street, City, State 12345"
              required
              description="Enter the complete property address"
            />

            <ValidatedInput
              name="buyer_names"
              label="Buyer Names"
              value={formData.buyer_names}
              onChange={(value) => handleFieldChange('buyer_names', value)}
              placeholder="John Doe, Jane Smith"
              required
              description="Enter all buyer names separated by commas"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ValidatedInput
                name="emails.0"
                label="Primary Email"
                type="email"
                value={formData.emails[0]}
                onChange={(value) => {
                  const newEmails = [...formData.emails];
                  newEmails[0] = value;
                  setFormData(prev => ({ ...prev, emails: newEmails }));
                }}
                placeholder="buyer@email.com"
                required
                description="Primary contact email for the buyer"
              />

              <ValidatedInput
                name="phones.0"
                label="Primary Phone"
                value={formData.phones[0]}
                onChange={(value) => {
                  const newPhones = [...formData.phones];
                  newPhones[0] = value;
                  setFormData(prev => ({ ...prev, phones: newPhones }));
                }}
                placeholder="(555) 123-4567"
                required
                description="Primary contact phone for the buyer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
          <CardHeader>
            <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
              <DollarSign className="h-6 w-6" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ValidatedInput
              name="purchase_price"
              label="Purchase Price"
              value={formData.purchase_price}
              onChange={(value) => handleFieldChange('purchase_price', value)}
              placeholder="500000"
              required
              description="Enter the offer amount"
              context={formData}
            />

            <ValidatedInput
              name="emd_amount"
              label="EMD Amount"
              value={formData.emd_amount}
              onChange={(value) => handleFieldChange('emd_amount', value)}
              placeholder="5000"
              required
              description="Earnest money deposit amount"
              context={formData}
            />

            <ValidatedInput
              name="loan_type"
              label="Loan Type"
              value={formData.loan_type}
              onChange={(value) => handleFieldChange('loan_type', value)}
              placeholder="Conventional"
              required
              description="Type of financing"
            />

            <ValidatedInput
              name="exchange_fee"
              label="Exchange Fee"
              value={formData.exchange_fee}
              onChange={(value) => handleFieldChange('exchange_fee', value)}
              placeholder="500"
              required
              description="Exchange or processing fee"
            />
          </CardContent>
        </Card>

        {/* Settlement Information */}
        <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
          <CardHeader>
            <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
              <Building className="h-6 w-6" />
              Settlement Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ValidatedInput
              name="settlement_company"
              label="Settlement Company"
              value={formData.settlement_company}
              onChange={(value) => handleFieldChange('settlement_company', value)}
              placeholder="ABC Title & Settlement"
              required
              description="Name of the settlement company"
            />

            <ValidatedInput
              name="projected_closing_date"
              label="Projected Closing Date"
              type="date"
              value={formData.projected_closing_date}
              onChange={(value) => handleFieldChange('projected_closing_date', value)}
              required
              description="Target closing date (must be in the future)"
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !status.isSecure}
            className="min-w-40"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              'Submit Secure Offer Request'
            )}
          </Button>
        </div>
      </div>
    </ValidationProvider>
  );
};

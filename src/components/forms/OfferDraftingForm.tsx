
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Save, Send, FileText, DollarSign, Calendar as CalendarIcon, Home, AlertCircle, Plus, Trash2, Building, CreditCard, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeOfferUpdates } from '@/hooks/useRealtimeOfferUpdates';

// Form validation schema
const offerRequestSchema = z.object({
  // Property & Buyer Info
  property_address: z.string().min(1, 'Property address is required'),
  buyer_names: z.string().min(1, 'Buyer names are required'),
  phones: z.array(z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format')).min(1, 'At least one phone number is required'),
  emails: z.array(z.string().email('Invalid email format')).min(1, 'At least one email is required'),
  
  // Financial Details
  purchase_price: z.number().min(1, 'Purchase price must be greater than 0'),
  loan_type: z.string().min(1, 'Loan type is required'),
  lending_company: z.string().min(1, 'Lending company is required'),
  emd_amount: z.number().min(0, 'EMD amount must be 0 or greater'),
  exchange_fee: z.number().min(0, 'Exchange fee must be 0 or greater'),
  
  // Settlement Information
  settlement_company: z.string().min(1, 'Settlement company is required'),
  closing_cost_assistance: z.string().optional(),
  projected_closing_date: z.date().refine(date => date > new Date(), 'Closing date must be in the future'),
  
  // Inspection Details
  wdi_period: z.number().optional(),
  wdi_period_unit: z.enum(['days', 'weeks']).default('days'),
  wdi_provider: z.enum(['buyer', 'seller']).optional(),
  wdi_notes: z.string().optional(),
  fica_required: z.boolean().default(false),
  fica_inspection_period: z.number().optional(),
  
  // Additional Terms
  extras: z.string().optional(),
  lead_eifs_survey: z.string().optional(),
  occupancy_notes: z.string().optional(),
});

type OfferRequestFormData = z.infer<typeof offerRequestSchema>;

interface OfferDraftingFormProps {
  transactionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const OfferDraftingForm = ({ transactionId, onSuccess, onCancel }: OfferDraftingFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enable real-time offer updates
  useRealtimeOfferUpdates();

  const form = useForm<OfferRequestFormData>({
    resolver: zodResolver(offerRequestSchema),
    defaultValues: {
      property_address: '',
      buyer_names: '',
      phones: [''],
      emails: [''],
      purchase_price: 0,
      loan_type: '',
      lending_company: '',
      emd_amount: 0,
      exchange_fee: 0,
      settlement_company: '',
      closing_cost_assistance: '',
      wdi_period_unit: 'days',
      wdi_provider: 'buyer',
      fica_required: false,
      extras: '',
      lead_eifs_survey: '',
      occupancy_notes: '',
    },
  });

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const number = parseInt(numericValue) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const addContact = (type: 'phones' | 'emails') => {
    const current = form.getValues(type);
    form.setValue(type, [...current, '']);
  };

  const removeContact = (type: 'phones' | 'emails', index: number) => {
    const current = form.getValues(type);
    if (current.length > 1) {
      form.setValue(type, current.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: OfferRequestFormData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit an offer request',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: offerRequest, error } = await supabase
        .from('offer_requests')
        .insert({
          agent_id: user.id,
          transaction_id: transactionId || null,
          property_address: data.property_address,
          buyer_names: data.buyer_names,
          buyer_contacts: {
            phones: data.phones.filter(phone => phone.trim()),
            emails: data.emails.filter(email => email.trim())
          },
          purchase_price: data.purchase_price,
          loan_type: data.loan_type,
          lending_company: data.lending_company,
          emd_amount: data.emd_amount,
          exchange_fee: data.exchange_fee,
          settlement_company: data.settlement_company,
          closing_cost_assistance: data.closing_cost_assistance || null,
          projected_closing_date: format(data.projected_closing_date, 'yyyy-MM-dd'),
          wdi_inspection_details: {
            period: data.wdi_period,
            period_unit: data.wdi_period_unit,
            provider: data.wdi_provider,
            notes: data.wdi_notes || ''
          },
          fica_details: {
            required: data.fica_required,
            inspection_period: data.fica_required ? data.fica_inspection_period : null
          },
          extras: data.extras || null,
          lead_eifs_survey: data.lead_eifs_survey || null,
          occupancy_notes: data.occupancy_notes || null,
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
          Offer Drafting Request
        </h1>
        <p className="text-lg font-brand-body text-brand-charcoal/70">
          Complete this form to request a professional offer draft for your transaction
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Property & Buyer Info */}
          <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
            <CardHeader>
              <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
                <Home className="h-6 w-6" />
                Property & Buyer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="property_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Property Address *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123 Main Street, City, State 12345"
                        className="font-brand-body"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyer_names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Buyer Names *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe, Jane Smith"
                        className="font-brand-body"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Numbers */}
              <div className="space-y-3">
                <Label className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                  Phone Numbers *
                </Label>
                {form.watch('phones').map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`phones.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="(555) 123-4567"
                              className="font-brand-body"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeContact('phones', index)}
                      disabled={form.watch('phones').length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addContact('phones')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Phone
                </Button>
              </div>

              {/* Email Addresses */}
              <div className="space-y-3">
                <Label className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                  Email Addresses *
                </Label>
                {form.watch('emails').map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`emails.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="buyer@email.com"
                              className="font-brand-body"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeContact('emails', index)}
                      disabled={form.watch('emails').length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addContact('emails')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Email
                </Button>
              </div>
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
              type="submit"
              disabled={isSubmitting}
              className="min-w-40"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Offer Request'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Save, Send, FileText, DollarSign, Calendar, Home, AlertCircle, Plus, Minus } from 'lucide-react';
import { CurrencyInput } from '@/components/forms/components/CurrencyInput';
import { ContactArrayInput } from '@/components/forms/components/ContactArrayInput';
import { FormTransitions } from '@/components/forms/components/FormTransitions';
import { LoadingStates } from '@/components/forms/components/LoadingStates';
import { ProgressIndicator } from '@/components/forms/components/ProgressIndicator';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';
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

  const formData = form.watch();

  // Auto-save functionality (disabled - this is for draft offers)
  const { saveStatus, hasChanges } = useFormAutoSave({
    table: 'offer_requests',
    data: {
      transaction_id: transactionId || null,
      property_address: formData.property_address || '',
      buyer_names: formData.buyer_names || '',
      status: 'draft'
    },
    interval: 30000,
    enabled: false // Disable auto-save for now to avoid partial submissions
  });

  // Live validation
  const { errors, validateField, isValidating } = useLiveValidation({
    rules: [
      {
        field: 'emails',
        validator: async (emails: string[]) => {
          if (!emails?.length) return 'At least one email is required';
          
          const emailValidator = createEmailValidator();
          for (const email of emails) {
            if (email.trim()) {
              const error = await emailValidator(email);
              if (error) return `Invalid email: ${email}`;
            }
          }
          return null;
        }
      },
      {
        field: 'phones',
        validator: async (phones: string[]) => {
          if (!phones?.length) return 'At least one phone is required';
          
          const phoneValidator = createPhoneValidator();
          for (const phone of phones) {
            if (phone.trim()) {
              const error = await phoneValidator(phone);
              if (error) return `Invalid phone: ${phone}`;
            }
          }
          return null;
        }
      },
      {
        field: 'property_address',
        validator: createTransactionConflictValidator(user?.id || '')
      }
    ]
  });

  // Validate fields on change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && value[name as keyof typeof value] !== undefined) {
        validateField(name, value[name as keyof typeof value], value);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, validateField]);

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

  // Auto-save status indicator
  const getAutoSaveIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Auto-saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Save failed</span>
          </div>
        );
      default:
        return null;
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
        <div className="flex items-center gap-4 mt-2">
          {getAutoSaveIndicator()}
          {Object.keys(isValidating).some(key => isValidating[key]) && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm">Validating...</span>
            </div>
          )}
        </div>
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
                    {errors.property_address && (
                      <p className="text-sm text-red-600">{errors.property_address}</p>
                    )}
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

              {/* Phone Numbers with live validation */}
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
                {errors.phones && (
                  <p className="text-sm text-red-600">{errors.phones}</p>
                )}
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

              {/* Email Addresses with live validation */}
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
                {errors.emails && (
                  <p className="text-sm text-red-600">{errors.emails}</p>
                )}
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

          {/* Section 2: Financial Details */}
          <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
            <CardHeader>
              <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
                <DollarSign className="h-6 w-6" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Purchase Price *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="$500,000"
                        className="font-brand-body"
                        value={field.value ? formatCurrency(field.value.toString()) : ''}
                        onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loan_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Loan Type *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-brand-body">
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="conventional">Conventional</SelectItem>
                        <SelectItem value="fha">FHA</SelectItem>
                        <SelectItem value="va">VA</SelectItem>
                        <SelectItem value="usda">USDA</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lending_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Lending Company *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ABC Mortgage Company"
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
                name="emd_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      EMD Amount *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="$5,000"
                        className="font-brand-body"
                        value={field.value ? formatCurrency(field.value.toString()) : ''}
                        onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exchange_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Exchange Fee *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="$500"
                        className="font-brand-body"
                        value={field.value ? formatCurrency(field.value.toString()) : ''}
                        onChange={(e) => field.onChange(parseCurrency(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 3: Settlement Information */}
          <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
            <CardHeader>
              <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
                <Building className="h-6 w-6" />
                Settlement Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="settlement_company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Settlement Company *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ABC Title & Settlement"
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
                name="closing_cost_assistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Closing Cost Assistance
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Details about closing cost assistance..."
                        className="font-brand-body"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projected_closing_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Projected Closing Date *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full font-brand-body justify-start text-left",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Select date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 4: Inspection Details */}
          <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
            <CardHeader>
              <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Inspection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* WDI Inspection */}
              <div className="space-y-4">
                <h3 className="font-brand-heading tracking-wide uppercase text-brand-charcoal text-lg">
                  WDI Inspection
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="wdi_period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                          Inspection Period
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="7"
                            className="font-brand-body"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wdi_period_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                          Unit
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-brand-body">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wdi_provider"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                          Provider
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="buyer" id="buyer" />
                              <Label htmlFor="buyer" className="font-brand-body">Buyer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="seller" id="seller" />
                              <Label htmlFor="seller" className="font-brand-body">Seller</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="wdi_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                        WDI Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional WDI inspection notes..."
                          className="font-brand-body"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* FICA Details */}
              <div className="space-y-4">
                <h3 className="font-brand-heading tracking-wide uppercase text-brand-charcoal text-lg">
                  FICA Inspection
                </h3>
                
                <FormField
                  control={form.control}
                  name="fica_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                          FICA Inspection Required
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('fica_required') && (
                  <FormField
                    control={form.control}
                    name="fica_inspection_period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                          FICA Inspection Period (days)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="7"
                            className="font-brand-body max-w-xs"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Additional Terms */}
          <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
            <CardHeader>
              <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                Additional Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="extras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Extras
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional terms, conditions, or special requests..."
                        className="font-brand-body"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lead_eifs_survey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Lead/EIFS Survey
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Lead paint or EIFS survey requirements..."
                        className="font-brand-body"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupancy_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
                      Occupancy Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Occupancy terms and conditions..."
                        className="font-brand-body"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

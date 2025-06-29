
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { ChevronDown, ChevronRight, Plus, Trash2, Building2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const vendorTypes = [
  { key: 'lender', label: 'Lender', required: true, icon: Building2 },
  { key: 'settlement', label: 'Settlement Company', required: true, icon: Building2 },
  { key: 'home_inspection', label: 'Home Inspection', required: true, icon: Building2 },
  { key: 'termite_inspection', label: 'Termite Inspection', required: false, icon: Building2 },
  { key: 'photography', label: 'Photography', required: false, icon: Building2 },
  { key: 'staging', label: 'Staging', required: false, icon: Building2 },
  { key: 'cleaning', label: 'Cleaning', required: false, icon: Building2 },
  { key: 'lawn_care', label: 'Lawn Care', required: false, icon: Building2 }
];

const vendorSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  is_primary: z.boolean().default(false)
});

const formSchema = z.object({
  vendors: z.record(z.array(vendorSchema))
}).refine((data) => {
  // Check required vendor types have at least one vendor
  const requiredTypes = vendorTypes.filter(t => t.required).map(t => t.key);
  return requiredTypes.every(type => 
    data.vendors[type] && data.vendors[type].length > 0
  );
}, {
  message: 'Lender, Settlement Company, and Home Inspection are required',
  path: ['vendors']
});

interface VendorPreferencesStepProps {
  onComplete: (data: any) => void;
  onNext: () => void;
  initialData?: any;
}

export const VendorPreferencesStep = ({ onComplete, onNext, initialData }: VendorPreferencesStepProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<string[]>(['lender']);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendors: vendorTypes.reduce((acc, type) => ({
        ...acc,
        [type.key]: initialData?.[type.key] || []
      }), {})
    }
  });

  const { watch, setValue, getValues } = form;
  const watchedVendors = watch('vendors');

  // Load existing vendor data
  useEffect(() => {
    const loadVendorData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('agent_vendors')
          .select('*')
          .eq('agent_id', user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const groupedVendors = data.reduce((acc, vendor) => {
            if (!acc[vendor.vendor_type]) {
              acc[vendor.vendor_type] = [];
            }
            acc[vendor.vendor_type].push({
              id: vendor.id,
              company_name: vendor.company_name,
              contact_name: vendor.contact_name || '',
              email: vendor.email || '',
              phone: vendor.phone || '',
              address: vendor.address || '',
              notes: vendor.notes || '',
              is_primary: vendor.is_primary
            });
            return acc;
          }, {});

          setValue('vendors', { ...getValues('vendors'), ...groupedVendors });
        }
      } catch (error) {
        console.error('Error loading vendor data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load existing vendor data',
          variant: 'destructive'
        });
      }
    };

    loadVendorData();
  }, [user?.id, setValue, getValues, toast]);

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => 
      prev.includes(sectionKey) 
        ? prev.filter(key => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const addVendor = (vendorType: string) => {
    const currentVendors = getValues(`vendors.${vendorType}`) || [];
    const newVendor = {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      is_primary: currentVendors.length === 0
    };
    setValue(`vendors.${vendorType}`, [...currentVendors, newVendor]);
    
    // Open the section if it's not already open
    if (!openSections.includes(vendorType)) {
      setOpenSections(prev => [...prev, vendorType]);
    }
  };

  const removeVendor = (vendorType: string, index: number) => {
    const currentVendors = getValues(`vendors.${vendorType}`) || [];
    const updatedVendors = currentVendors.filter((_, i) => i !== index);
    
    // If we're removing the primary vendor, make the first remaining vendor primary
    if (currentVendors[index]?.is_primary && updatedVendors.length > 0) {
      updatedVendors[0].is_primary = true;
    }
    
    setValue(`vendors.${vendorType}`, updatedVendors);
  };

  const setPrimaryVendor = (vendorType: string, index: number) => {
    const currentVendors = getValues(`vendors.${vendorType}`) || [];
    const updatedVendors = currentVendors.map((vendor, i) => ({
      ...vendor,
      is_primary: i === index
    }));
    setValue(`vendors.${vendorType}`, updatedVendors);
  };

  const handleSave = async (data: any) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save vendor preferences',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Delete existing vendors for this agent
      await supabase
        .from('agent_vendors')
        .delete()
        .eq('agent_id', user.id);

      // Insert new vendor data
      const vendorInserts = [];
      Object.entries(data.vendors).forEach(([vendorType, vendors]: [string, any[]]) => {
        vendors.forEach(vendor => {
          if (vendor.company_name.trim()) {
            vendorInserts.push({
              agent_id: user.id,
              vendor_type: vendorType,
              company_name: vendor.company_name,
              contact_name: vendor.contact_name || null,
              email: vendor.email || null,
              phone: vendor.phone || null,
              address: vendor.address || null,
              notes: vendor.notes || null,
              is_primary: vendor.is_primary
            });
          }
        });
      });

      if (vendorInserts.length > 0) {
        const { error } = await supabase
          .from('agent_vendors')
          .insert(vendorInserts);

        if (error) throw error;
      }

      onComplete(data.vendors);
      onNext();
      
      toast({
        title: 'Success',
        description: 'Vendor preferences saved successfully',
      });
    } catch (error) {
      console.error('Error saving vendor data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save vendor preferences',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
      <CardHeader>
        <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
          <Building2 className="h-6 w-6" />
          Vendor Preferences
        </CardTitle>
        <p className="text-brand-charcoal/70 font-brand-body">
          Set up your preferred vendors for different services. Required vendors are marked with an asterisk (*).
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="space-y-4">
              {vendorTypes.map((vendorType) => {
                const vendors = watchedVendors[vendorType.key] || [];
                const isOpen = openSections.includes(vendorType.key);
                const hasError = form.formState.errors.vendors && vendors.length === 0 && vendorType.required;

                return (
                  <Collapsible key={vendorType.key} open={isOpen} onOpenChange={() => toggleSection(vendorType.key)}>
                    <CollapsibleTrigger asChild>
                      <div className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        hasError 
                          ? 'border-red-300 bg-red-50' 
                          : isOpen 
                          ? 'border-brand-charcoal bg-brand-charcoal text-brand-background' 
                          : 'border-brand-taupe/30 bg-brand-background hover:border-brand-taupe hover:bg-brand-taupe/10'
                      }`}>
                        <div className="flex items-center gap-3">
                          <vendorType.icon className="h-5 w-5" />
                          <div>
                            <h4 className="font-brand-heading tracking-wide uppercase text-base">
                              {vendorType.label}
                              {vendorType.required && <span className="text-red-500 ml-1">*</span>}
                            </h4>
                            <p className="text-sm opacity-80">
                              {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} configured
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
                          {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="space-y-4 pl-4">
                        {vendors.map((vendor, index) => (
                          <div key={index} className="border border-brand-taupe/30 rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal">
                                Vendor #{index + 1}
                              </h5>
                              <div className="flex items-center gap-2">
                                {vendors.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVendor(vendorType.key, index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`vendors.${vendorType.key}.${index}.company_name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-brand-heading text-sm tracking-wide uppercase">
                                      Company Name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Enter company name" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`vendors.${vendorType.key}.${index}.contact_name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-brand-heading text-sm tracking-wide uppercase">
                                      Contact Name
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Enter contact name" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`vendors.${vendorType.key}.${index}.email`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-brand-heading text-sm tracking-wide uppercase">
                                      Email
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} type="email" placeholder="Enter email address" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`vendors.${vendorType.key}.${index}.phone`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="font-brand-heading text-sm tracking-wide uppercase">
                                      Phone
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} type="tel" placeholder="Enter phone number" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`vendors.${vendorType.key}.${index}.address`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-brand-heading text-sm tracking-wide uppercase">
                                    Address
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter full address" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`vendors.${vendorType.key}.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-brand-heading text-sm tracking-wide uppercase">
                                    Notes
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={2} placeholder="Any additional notes..." />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {vendors.length > 1 && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`primary-${vendorType.key}-${index}`}
                                  name={`primary-${vendorType.key}`}
                                  checked={vendor.is_primary}
                                  onChange={() => setPrimaryVendor(vendorType.key, index)}
                                  className="h-4 w-4 text-brand-charcoal"
                                />
                                <Label 
                                  htmlFor={`primary-${vendorType.key}-${index}`}
                                  className="font-brand-heading text-sm tracking-wide uppercase cursor-pointer"
                                >
                                  Primary Vendor
                                </Label>
                              </div>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addVendor(vendorType.key)}
                          className="w-full flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add {vendorType.label}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            {form.formState.errors.vendors && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600 font-brand-body">
                  {form.formState.errors.vendors.message}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

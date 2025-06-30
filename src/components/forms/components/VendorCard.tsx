import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Plus, Trash2, Star, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VendorData {
  id?: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  is_primary: boolean;
}

interface VendorCardProps {
  title: string;
  vendors: VendorData[];
  onVendorsChange: (vendors: VendorData[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  errors?: Record<string, string>;
  isRequired?: boolean;
  className?: string;
}

export const VendorCard = ({
  title,
  vendors,
  onVendorsChange,
  isOpen,
  onToggle,
  errors = {},
  isRequired = false,
  className
}: VendorCardProps) => {
  const [newVendor, setNewVendor] = useState<VendorData>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    is_primary: false
  });

  const addVendor = () => {
    if (!newVendor.company_name.trim()) return;
    
    const vendorToAdd = {
      ...newVendor,
      id: `temp-${Date.now()}`,
      is_primary: vendors.length === 0 // First vendor is automatically primary
    };
    
    onVendorsChange([...vendors, vendorToAdd]);
    setNewVendor({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      is_primary: false
    });
  };

  const removeVendor = (index: number) => {
    const updatedVendors = vendors.filter((_, i) => i !== index);
    // If we removed the primary vendor, make the first remaining vendor primary
    if (vendors[index].is_primary && updatedVendors.length > 0) {
      updatedVendors[0].is_primary = true;
    }
    onVendorsChange(updatedVendors);
  };

  const setPrimaryVendor = (index: number) => {
    const updatedVendors = vendors.map((vendor, i) => ({
      ...vendor,
      is_primary: i === index
    }));
    onVendorsChange(updatedVendors);
  };

  const updateVendor = (index: number, field: keyof VendorData, value: string | boolean) => {
    const updatedVendors = vendors.map((vendor, i) => 
      i === index ? { ...vendor, [field]: value } : vendor
    );
    onVendorsChange(updatedVendors);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card className={cn(
      "transition-all duration-300",
      hasErrors && "border-red-300 bg-red-50/30",
      className
    )}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-brand-taupe/10 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5" />
                {title}
                {isRequired && <span className="text-red-500 text-sm">*</span>}
                {vendors.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasErrors && (
                  <Badge variant="destructive" className="text-xs">
                    Errors
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Existing Vendors */}
            {vendors.map((vendor, index) => (
              <Card key={vendor.id || index} className="border-brand-taupe/20 bg-brand-cream/30">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal">
                        {vendor.company_name}
                      </h4>
                      {vendor.is_primary && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!vendor.is_primary && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPrimaryVendor(index)}
                          className="text-xs"
                        >
                          Make Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVendor(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-brand-heading text-xs tracking-wide uppercase">
                        Contact Name
                      </Label>
                      <Input
                        value={vendor.contact_name || ''}
                        onChange={(e) => updateVendor(index, 'contact_name', e.target.value)}
                        placeholder="Contact person name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-brand-heading text-xs tracking-wide uppercase">
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={vendor.email || ''}
                        onChange={(e) => updateVendor(index, 'email', e.target.value)}
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-brand-heading text-xs tracking-wide uppercase">
                        Phone
                      </Label>
                      <Input
                        type="tel"
                        value={vendor.phone || ''}
                        onChange={(e) => updateVendor(index, 'phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-brand-heading text-xs tracking-wide uppercase">
                        Address
                      </Label>
                      <Input
                        value={vendor.address || ''}
                        onChange={(e) => updateVendor(index, 'address', e.target.value)}
                        placeholder="Business address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-brand-heading text-xs tracking-wide uppercase">
                      Notes
                    </Label>
                    <Textarea
                      value={vendor.notes || ''}
                      onChange={(e) => updateVendor(index, 'notes', e.target.value)}
                      placeholder="Additional notes or preferences..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Vendor Form */}
            <Card className="border-dashed border-2 border-brand-taupe/30 bg-brand-taupe/5">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New {title.slice(0, -1)}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-brand-heading text-xs tracking-wide uppercase">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newVendor.company_name}
                      onChange={(e) => setNewVendor({ ...newVendor, company_name: e.target.value })}
                      placeholder="Company name"
                      className={errors.company_name ? 'border-red-300' : ''}
                    />
                    {errors.company_name && (
                      <p className="text-sm text-red-600">{errors.company_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-brand-heading text-xs tracking-wide uppercase">
                      Contact Name
                    </Label>
                    <Input
                      value={newVendor.contact_name}
                      onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                      placeholder="Contact person name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-brand-heading text-xs tracking-wide uppercase">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-brand-heading text-xs tracking-wide uppercase">
                      Phone
                    </Label>
                    <Input
                      type="tel"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addVendor}
                  disabled={!newVendor.company_name.trim()}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {title.slice(0, -1)}
                </Button>
              </CardContent>
            </Card>

            {/* Validation Errors */}
            {hasErrors && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">Please fix the following errors:</p>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

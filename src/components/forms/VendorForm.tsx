import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building, Phone, Mail, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import type { Vendor, VendorType } from '@/hooks/useVendorManagement';

interface VendorFormProps {
  vendor: Vendor;
  vendorType: VendorType;
  isComplete: boolean;
  onUpdate: (field: keyof Vendor, value: string) => void;
  errors?: string[];
}

export const VendorForm: React.FC<VendorFormProps> = ({
  vendor,
  vendorType,
  isComplete,
  onUpdate,
  errors = []
}) => {
  return (
    <Card className={`transition-all duration-200 ${isComplete ? 'ring-2 ring-green-200' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            {vendorType.label}
          </div>
          {isComplete && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">{vendorType.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor={`${vendorType.id}-name`} className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            Company Name *
          </Label>
          <Input
            id={`${vendorType.id}-name`}
            value={vendor.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Enter company name"
            className={errors.some(e => e.includes('Company name')) ? 'border-red-300' : ''}
          />
        </div>

        {/* Contact Name */}
        <div className="space-y-2">
          <Label htmlFor={`${vendorType.id}-contact`}>
            Contact Person
          </Label>
          <Input
            id={`${vendorType.id}-contact`}
            value={vendor.contactName}
            onChange={(e) => onUpdate('contactName', e.target.value)}
            placeholder="Contact person name"
          />
        </div>

        {/* Phone and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${vendorType.id}-phone`} className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              Phone *
            </Label>
            <Input
              id={`${vendorType.id}-phone`}
              type="tel"
              value={vendor.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className={errors.some(e => e.includes('contact method')) ? 'border-red-300' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${vendorType.id}-email`} className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id={`${vendorType.id}-email`}
              type="email"
              value={vendor.email}
              onChange={(e) => onUpdate('email', e.target.value)}
              placeholder="contact@company.com"
              className={errors.some(e => e.includes('email') || e.includes('contact method')) ? 'border-red-300' : ''}
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor={`${vendorType.id}-address`} className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Address
          </Label>
          <Input
            id={`${vendorType.id}-address`}
            value={vendor.address}
            onChange={(e) => onUpdate('address', e.target.value)}
            placeholder="Business address"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor={`${vendorType.id}-notes`} className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Notes
          </Label>
          <Textarea
            id={`${vendorType.id}-notes`}
            value={vendor.notes}
            onChange={(e) => onUpdate('notes', e.target.value)}
            placeholder="Additional notes, preferences, or instructions"
            rows={3}
          />
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-sm text-red-800">
              <strong>Please fix the following:</strong>
              <ul className="mt-1 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Completion Notice */}
        <div className="text-xs text-gray-500">
          * At least company name and one contact method (phone or email) required
        </div>
      </CardContent>
    </Card>
  );
};
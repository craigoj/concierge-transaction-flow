import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Home, MapPin, DollarSign } from 'lucide-react';
import { PropertyDetails } from '../TransactionCreationWizard';

interface PropertyDetailsStepProps {
  data?: PropertyDetails;
  onChange: (data: PropertyDetails) => void;
}

export const PropertyDetailsStep: React.FC<PropertyDetailsStepProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<PropertyDetails>({
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    property_type: 'single_family',
    property_status: 'active',
    ...data,
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (field: keyof PropertyDetails, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const propertyTypes = [
    { value: 'single_family', label: 'Single Family', icon: Home },
    { value: 'condo', label: 'Condominium', icon: Building2 },
    { value: 'townhouse', label: 'Townhouse', icon: Home },
    { value: 'multi_family', label: 'Multi-Family', icon: Building2 },
    { value: 'commercial', label: 'Commercial', icon: Building2 },
    { value: 'land', label: 'Land', icon: MapPin },
  ];

  const propertyStatuses = [
    { value: 'active', label: 'Active', color: 'bg-green-500' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'under_contract', label: 'Under Contract', color: 'bg-blue-500' },
    { value: 'sold', label: 'Sold', color: 'bg-gray-500' },
    { value: 'off_market', label: 'Off Market', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Transaction Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Property Address</span>
          </CardTitle>
          <CardDescription>
            Enter the complete property address for this transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_street">Street Address</Label>
            <Input
              id="address_street"
              placeholder="123 Main Street"
              value={formData.address_street}
              onChange={(e) => handleChange('address_street', e.target.value)}
              required
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_city">City</Label>
              <Input
                id="address_city"
                placeholder="City"
                value={formData.address_city}
                onChange={(e) => handleChange('address_city', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_state">State</Label>
              <Input
                id="address_state"
                placeholder="State"
                value={formData.address_state}
                onChange={(e) => handleChange('address_state', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_zip">ZIP Code</Label>
              <Input
                id="address_zip"
                placeholder="12345"
                value={formData.address_zip}
                onChange={(e) => handleChange('address_zip', e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Property Type</span>
          </CardTitle>
          <CardDescription>Select the type of property for this transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {propertyTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.property_type === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleChange('property_type', type.value)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <IconComponent
                      className={`w-6 h-6 ${
                        formData.property_type === type.value
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Property Details</span>
          </CardTitle>
          <CardDescription>Provide additional property information (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                placeholder="3"
                value={formData.bedrooms || ''}
                onChange={(e) =>
                  handleChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                placeholder="2.5"
                value={formData.bathrooms || ''}
                onChange={(e) =>
                  handleChange('bathrooms', e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="square_feet">Square Feet</Label>
              <Input
                id="square_feet"
                type="number"
                min="0"
                placeholder="2000"
                value={formData.square_feet || ''}
                onChange={(e) =>
                  handleChange('square_feet', e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listing_price">Listing/Purchase Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="listing_price"
                  type="number"
                  min="0"
                  placeholder="450000"
                  className="pl-10"
                  value={formData.listing_price || ''}
                  onChange={(e) =>
                    handleChange(
                      'listing_price',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mls_number">MLS Number (Optional)</Label>
              <Input
                id="mls_number"
                placeholder="MLS123456"
                value={formData.mls_number || ''}
                onChange={(e) => handleChange('mls_number', e.target.value || undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Status */}
      <Card>
        <CardHeader>
          <CardTitle>Property Status</CardTitle>
          <CardDescription>Current status of the property in the market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {propertyStatuses.map((status) => (
              <button
                key={status.value}
                type="button"
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.property_status === status.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => handleChange('property_status', status.value)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

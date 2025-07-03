
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfferFormData } from '../OfferDraftingForm';

interface PropertyDetailsStepProps {
  formData: OfferFormData;
  updateFormData: (updates: Partial<OfferFormData>) => void;
}

export const PropertyDetailsStep = ({ formData, updateFormData }: PropertyDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
          Property Information
        </h3>
        <p className="text-brand-charcoal/60">
          Enter the details of the property for this offer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property_address">Property Address *</Label>
          <Input
            id="property_address"
            value={formData.property_address}
            onChange={(e) => updateFormData({ property_address: e.target.value })}
            placeholder="Enter full property address"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="listing_price">Listing Price</Label>
            <Input
              id="listing_price"
              type="number"
              value={formData.listing_price}
              onChange={(e) => updateFormData({ listing_price: e.target.value })}
              placeholder="$0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mls_number">MLS Number</Label>
            <Input
              id="mls_number"
              value={formData.mls_number}
              onChange={(e) => updateFormData({ mls_number: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_type">Property Type</Label>
          <Select
            value={formData.property_type}
            onValueChange={(value) => updateFormData({ property_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_family">Single Family Home</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="condo">Condominium</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
              <SelectItem value="multi_family">Multi-Family</SelectItem>
              <SelectItem value="land">Land/Lot</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lot_size">Lot Size</Label>
            <Input
              id="lot_size"
              value={formData.lot_size}
              onChange={(e) => updateFormData({ lot_size: e.target.value })}
              placeholder="e.g., 0.25 acres or 10,000 sq ft"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="square_footage">Square Footage</Label>
            <Input
              id="square_footage"
              type="number"
              value={formData.square_footage}
              onChange={(e) => updateFormData({ square_footage: e.target.value })}
              placeholder="Living space sq ft"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

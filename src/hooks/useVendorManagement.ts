import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

export interface Vendor {
  type: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface VendorType {
  id: string;
  label: string;
  icon: React.ComponentType;
  description: string;
}

export const VENDOR_TYPES: VendorType[] = [
  { id: 'title_company', label: 'Title Company', icon: () => null, description: 'Handles property title and closing' },
  { id: 'home_inspector', label: 'Home Inspector', icon: () => null, description: 'Conducts property inspections' },
  { id: 'termite_inspector', label: 'Termite Inspector', icon: () => null, description: 'Pest and termite inspections' },
  { id: 'lender', label: 'Lender', icon: () => null, description: 'Mortgage and financing' },
  { id: 'photographer', label: 'Photographer', icon: () => null, description: 'Property photography services' },
  { id: 'staging', label: 'Staging Company', icon: () => null, description: 'Home staging services' },
  { id: 'cleaning', label: 'Cleaning Service', icon: () => null, description: 'Property cleaning services' },
  { id: 'lawn_care', label: 'Lawn Care', icon: () => null, description: 'Landscaping and maintenance' },
  { id: 'insurance', label: 'Insurance Agent', icon: () => null, description: 'Property insurance services' },
  { id: 'attorney', label: 'Real Estate Attorney', icon: () => null, description: 'Legal services for transactions' },
  { id: 'appraiser', label: 'Appraiser', icon: () => null, description: 'Property valuation services' },
  { id: 'surveyor', label: 'Surveyor', icon: () => null, description: 'Property boundary surveys' },
  { id: 'contractor', label: 'General Contractor', icon: () => null, description: 'Construction and repair services' },
  { id: 'settlement', label: 'Settlement Company', icon: () => null, description: 'Closing and settlement services' }
];

const createEmptyVendor = (type: string): Vendor => ({
  type,
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  notes: ''
});

export const useVendorManagement = (initialData?: Record<string, Vendor>) => {
  // Initialize vendors state with all vendor types
  const [vendors, setVendors] = useState<Record<string, Vendor>>(() => {
    const initialVendors: Record<string, Vendor> = {};
    
    VENDOR_TYPES.forEach(vendorType => {
      initialVendors[vendorType.id] = initialData?.[vendorType.id] || createEmptyVendor(vendorType.label);
    });
    
    return initialVendors;
  });

  const updateVendor = useCallback((vendorId: string, updates: Partial<Vendor>) => {
    setVendors(prev => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        ...updates
      }
    }));

    logger.debug('Vendor updated', {
      vendorId,
      updates,
      context: 'vendor_management'
    });
  }, []);

  const updateVendorField = useCallback((vendorId: string, field: keyof Vendor, value: string) => {
    updateVendor(vendorId, { [field]: value });
  }, [updateVendor]);

  const resetVendor = useCallback((vendorId: string) => {
    const vendorType = VENDOR_TYPES.find(vt => vt.id === vendorId);
    if (vendorType) {
      setVendors(prev => ({
        ...prev,
        [vendorId]: createEmptyVendor(vendorType.label)
      }));

      logger.debug('Vendor reset', {
        vendorId,
        context: 'vendor_management'
      });
    }
  }, []);

  const getVendor = useCallback((vendorId: string): Vendor | undefined => {
    return vendors[vendorId];
  }, [vendors]);

  const isVendorComplete = useCallback((vendorId: string): boolean => {
    const vendor = vendors[vendorId];
    if (!vendor) return false;

    // Consider a vendor complete if at least name and one contact method are provided
    return !!(vendor.name && (vendor.phone || vendor.email));
  }, [vendors]);

  const getCompletedVendors = useCallback((): Vendor[] => {
    return Object.entries(vendors)
      .filter(([vendorId]) => isVendorComplete(vendorId))
      .map(([, vendor]) => vendor);
  }, [vendors, isVendorComplete]);

  const getIncompleteVendors = useCallback((): string[] => {
    return Object.keys(vendors).filter(vendorId => !isVendorComplete(vendorId));
  }, [vendors, isVendorComplete]);

  const validateVendors = useCallback(() => {
    const errors: Record<string, string[]> = {};

    Object.entries(vendors).forEach(([vendorId, vendor]) => {
      const vendorErrors: string[] = [];

      // Only validate if the vendor has any data entered
      const hasAnyData = Object.values(vendor).some(value => value.trim() !== '');
      
      if (hasAnyData) {
        if (!vendor.name.trim()) {
          vendorErrors.push('Company name is required');
        }

        if (!vendor.phone.trim() && !vendor.email.trim()) {
          vendorErrors.push('At least one contact method (phone or email) is required');
        }

        if (vendor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendor.email)) {
          vendorErrors.push('Invalid email format');
        }
      }

      if (vendorErrors.length > 0) {
        errors[vendorId] = vendorErrors;
      }
    });

    return errors;
  }, [vendors]);

  const exportVendors = useCallback(() => {
    const completedVendors = getCompletedVendors();
    
    logger.info('Vendors exported', {
      totalVendors: completedVendors.length,
      vendorTypes: completedVendors.map(v => v.type),
      context: 'vendor_management'
    });

    return completedVendors;
  }, [getCompletedVendors]);

  const importVendors = useCallback((importedVendors: Record<string, Vendor>) => {
    setVendors(prev => ({
      ...prev,
      ...importedVendors
    }));

    logger.info('Vendors imported', {
      importedCount: Object.keys(importedVendors).length,
      context: 'vendor_management'
    });
  }, []);

  return {
    vendors,
    updateVendor,
    updateVendorField,
    resetVendor,
    getVendor,
    isVendorComplete,
    getCompletedVendors,
    getIncompleteVendors,
    validateVendors,
    exportVendors,
    importVendors,
    vendorTypes: VENDOR_TYPES
  };
};
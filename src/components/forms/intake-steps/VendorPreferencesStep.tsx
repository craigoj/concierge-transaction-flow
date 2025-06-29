import React from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { 
  Plus, 
  Trash2, 
  Building, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  AlertCircle
} from 'lucide-react'

import { VENDOR_TYPES, type VendorType, type AgentVendorInsert } from '@/integrations/supabase/agent-concierge-types'

// =============================================================================
// VENDOR TYPE CONFIGURATION
// =============================================================================

const VENDOR_CONFIG = {
  lender: {
    title: 'Preferred Lender',
    description: 'Your go-to mortgage lender for financing coordination',
    icon: Building,
    required: true,
    color: 'bg-blue-50 border-blue-200'
  },
  settlement: {
    title: 'Settlement Company',
    description: 'Title company for closing coordination',
    icon: Building,
    required: true,
    color: 'bg-green-50 border-green-200'
  },
  home_inspection: {
    title: 'Home Inspector',
    description: 'Qualified home inspection services',
    icon: Building,
    required: true,
    color: 'bg-orange-50 border-orange-200'
  },
  termite_inspection: {
    title: 'Termite/Moisture Inspector',
    description: 'Specialized pest and moisture inspection',
    icon: Building,
    required: false,
    color: 'bg-red-50 border-red-200'
  },
  photography: {
    title: 'Photographer',
    description: 'Professional property photography',
    icon: Building,
    required: false,
    color: 'bg-purple-50 border-purple-200'
  },
  staging: {
    title: 'Staging Company',
    description: 'Home staging and preparation services',
    icon: Building,
    required: false,
    color: 'bg-pink-50 border-pink-200'
  },
  cleaning: {
    title: 'Cleaning Service',
    description: 'Pre and post-transaction cleaning',
    icon: Building,
    required: false,
    color: 'bg-cyan-50 border-cyan-200'
  },
  lawn_care: {
    title: 'Lawn Care',
    description: 'Property maintenance and landscaping',
    icon: Building,
    required: false,
    color: 'bg-emerald-50 border-emerald-200'
  }
} as const

// =============================================================================
// VENDOR CARD COMPONENT
// =============================================================================

interface VendorCardProps {
  vendorType: VendorType
  vendorIndex: number
  isExpanded: boolean
  onToggle: () => void
  onRemove: () => void
}

const VendorCard: React.FC<VendorCardProps> = ({
  vendorType,
  vendorIndex,
  isExpanded,
  onToggle,
  onRemove
}) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const config = VENDOR_CONFIG[vendorType]
  const IconComponent = config.icon
  
  const vendorData = watch(`vendors.${vendorIndex}`)
  const isPrimary = vendorData?.is_primary || false

  const handlePrimaryChange = (checked: boolean) => {
    setValue(`vendors.${vendorIndex}.is_primary`, checked)
    
    // If setting as primary, unset other primary vendors of same type
    if (checked) {
      const vendors = watch('vendors')
      vendors.forEach((vendor: AgentVendorInsert, index: number) => {
        if (index !== vendorIndex && vendor.vendor_type === vendorType && vendor.is_primary) {
          setValue(`vendors.${index}.is_primary`, false)
        }
      })
    }
  }

  return (
    <Card className={`${config.color} transition-all duration-200 hover:shadow-md`}>
      <CardHeader 
        className="cursor-pointer pb-3"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IconComponent className="w-5 h-5 text-brand-charcoal" />
            <div>
              <CardTitle className="text-lg font-semibold text-brand-charcoal">
                {config.title}
                {config.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </CardTitle>
              <CardDescription className="text-sm text-brand-charcoal/60">
                {config.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isPrimary && (
              <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">
                <Star className="w-3 h-3 mr-1" />
                Primary
              </Badge>
            )}
            
            {vendorData?.company_name && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Configured
              </Badge>
            )}
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name - Required */}
            <div className="md:col-span-2">
              <Label htmlFor={`vendors.${vendorIndex}.company_name`} className="flex items-center">
                Company Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                {...register(`vendors.${vendorIndex}.company_name`, { 
                  required: 'Company name is required' 
                })}
                placeholder="Enter company name"
                className="mt-1"
              />
              {errors.vendors?.[vendorIndex]?.company_name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.vendors[vendorIndex].company_name.message}
                </p>
              )}
            </div>

            {/* Contact Name */}
            <div>
              <Label htmlFor={`vendors.${vendorIndex}.contact_name`}>
                Contact Name
              </Label>
              <Input
                {...register(`vendors.${vendorIndex}.contact_name`)}
                placeholder="Primary contact"
                className="mt-1"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor={`vendors.${vendorIndex}.phone`} className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                Phone
              </Label>
              <Input
                {...register(`vendors.${vendorIndex}.phone`)}
                placeholder="(555) 123-4567"
                type="tel"
                className="mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor={`vendors.${vendorIndex}.email`} className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Label>
              <Input
                {...register(`vendors.${vendorIndex}.email`)}
                placeholder="contact@company.com"
                type="email"
                className="mt-1"
              />
              {errors.vendors?.[vendorIndex]?.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor={`vendors.${vendorIndex}.address`} className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Address
              </Label>
              <Input
                {...register(`vendors.${vendorIndex}.address`)}
                placeholder="Business address"
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <Label htmlFor={`vendors.${vendorIndex}.notes`}>
                Notes
              </Label>
              <Textarea
                {...register(`vendors.${vendorIndex}.notes`)}
                placeholder="Any special notes or preferences..."
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Primary Vendor Checkbox */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`vendors.${vendorIndex}.is_primary`}
                  checked={isPrimary}
                  onCheckedChange={handlePrimaryChange}
                />
                <Label 
                  htmlFor={`vendors.${vendorIndex}.is_primary`}
                  className="flex items-center cursor-pointer"
                >
                  <Star className="w-4 h-4 mr-1 text-amber-500" />
                  Set as primary {config.title.toLowerCase()}
                </Label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Primary vendors will be automatically selected for new transactions
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const VendorPreferencesStep: React.FC = () => {
  const { control, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vendors'
  })

  const [expandedVendors, setExpandedVendors] = React.useState<Set<number>>(new Set([0]))

  const vendors = watch('vendors')

  const addVendor = (vendorType: VendorType) => {
    const newVendorIndex = fields.length
    append({
      vendor_type: vendorType,
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      is_primary: false,
      is_active: true
    })
    
    // Expand the newly added vendor
    setExpandedVendors(prev => new Set([...prev, newVendorIndex]))
  }

  const removeVendor = (index: number) => {
    remove(index)
    // Update expanded vendors set
    setExpandedVendors(prev => {
      const newSet = new Set()
      prev.forEach(expandedIndex => {
        if (expandedIndex < index) {
          newSet.add(expandedIndex)
        } else if (expandedIndex > index) {
          newSet.add(expandedIndex - 1)
        }
      })
      return newSet
    })
  }

  const toggleVendorExpansion = (index: number) => {
    setExpandedVendors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const getAvailableVendorTypes = (): VendorType[] => {
    const usedTypes = new Set(vendors?.map((v: AgentVendorInsert) => v.vendor_type) || [])
    return VENDOR_TYPES.filter(type => !usedTypes.has(type))
  }

  const getRequiredVendorTypes = (): VendorType[] => {
    return Object.entries(VENDOR_CONFIG)
      .filter(([_, config]) => config.required)
      .map(([type, _]) => type as VendorType)
  }

  const getMissingRequiredVendors = (): VendorType[] => {
    const configuredTypes = new Set(vendors?.map((v: AgentVendorInsert) => v.vendor_type) || [])
    return getRequiredVendorTypes().filter(type => !configuredTypes.has(type))
  }

  const availableVendorTypes = getAvailableVendorTypes()
  const missingRequired = getMissingRequiredVendors()

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Vendor Preferences Setup</h3>
        <p className="text-blue-800 text-sm mb-3">
          Configure your preferred vendors to enable automated coordination and streamlined communication. 
          Required vendors are marked with an asterisk (*).
        </p>
        
        {missingRequired.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
            <p className="text-amber-800 text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Missing Required Vendors:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {missingRequired.map(type => (
                <Badge key={type} variant="outline" className="border-amber-300 text-amber-700">
                  {VENDOR_CONFIG[type].title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Existing Vendors */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const vendor = vendors?.[index]
          return (
            <VendorCard
              key={field.id}
              vendorType={vendor?.vendor_type}
              vendorIndex={index}
              isExpanded={expandedVendors.has(index)}
              onToggle={() => toggleVendorExpansion(index)}
              onRemove={() => removeVendor(index)}
            />
          )
        })}
      </div>

      {/* Add New Vendor */}
      {availableVendorTypes.length > 0 && (
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-gray-700 mb-4">Add Additional Vendors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableVendorTypes.map(vendorType => {
                const config = VENDOR_CONFIG[vendorType]
                return (
                  <Button
                    key={vendorType}
                    type="button"
                    variant="outline"
                    onClick={() => addVendor(vendorType)}
                    className="flex items-center space-x-2 h-auto p-4 flex-col"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">{config.title}</span>
                    {config.required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {vendors && vendors.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-green-900 mb-2">Configuration Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Total Vendors:</span>
                <span className="font-medium ml-2">{vendors.length}</span>
              </div>
              <div>
                <span className="text-green-700">Primary Vendors:</span>
                <span className="font-medium ml-2">
                  {vendors.filter((v: AgentVendorInsert) => v.is_primary).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default VendorPreferencesStep
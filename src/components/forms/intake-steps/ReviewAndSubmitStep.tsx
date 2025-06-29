import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Edit, 
  Building, 
  Star, 
  Palette, 
  Coffee, 
  Wine,
  Calendar,
  Link,
  MessageSquare,
  Clock,
  Image,
  FileText,
  Shield,
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

import { VENDOR_TYPES, type VendorType, type AgentVendorInsert } from '@/integrations/supabase/agent-concierge-types'

// =============================================================================
// VENDOR TYPE CONFIGURATION
// =============================================================================

const VENDOR_CONFIG = {
  lender: { title: 'Preferred Lender', icon: Building },
  settlement: { title: 'Settlement Company', icon: Building },
  home_inspection: { title: 'Home Inspector', icon: Building },
  termite_inspection: { title: 'Termite/Moisture Inspector', icon: Building },
  photography: { title: 'Photographer', icon: Building },
  staging: { title: 'Staging Company', icon: Building },
  cleaning: { title: 'Cleaning Service', icon: Building },
  lawn_care: { title: 'Lawn Care', icon: Building },
  title_company: { title: 'Title Company', icon: Building },
  appraiser: { title: 'Appraiser', icon: Building },
  surveyor: { title: 'Surveyor', icon: Building },
  insurance: { title: 'Insurance', icon: Building },
  locksmith: { title: 'Locksmith', icon: Building },
  handyman: { title: 'Handyman', icon: Building }
} as const

// =============================================================================
// SUMMARY COMPONENTS
// =============================================================================

interface EditButtonProps {
  onEdit: () => void
  section: string
}

const EditButton: React.FC<EditButtonProps> = ({ onEdit, section }) => (
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onEdit}
    className="flex items-center space-x-1"
  >
    <Edit className="w-3 h-3" />
    <span>Edit {section}</span>
  </Button>
)

const VendorSummaryCard: React.FC<{ onEditVendors: () => void }> = ({ onEditVendors }) => {
  const { watch } = useFormContext()
  const vendors = watch('vendors') || []

  const primaryVendors = vendors.filter((v: AgentVendorInsert) => v.is_primary)
  const totalVendors = vendors.length

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-blue-900">
            <Building className="w-5 h-5 mr-2" />
            Vendor Preferences
          </CardTitle>
          <EditButton onEdit={onEditVendors} section="Vendors" />
        </div>
        <CardDescription className="text-blue-700">
          Your preferred vendors for transaction coordination
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalVendors === 0 ? (
          <div className="text-center py-4">
            <p className="text-blue-700">No vendors configured yet</p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onEditVendors}
              className="mt-2"
            >
              Add Vendors
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{totalVendors}</div>
                <div className="text-sm text-blue-700">Total Vendors</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{primaryVendors.length}</div>
                <div className="text-sm text-blue-700">Primary Vendors</div>
              </div>
            </div>

            {/* Vendor List */}
            <div className="space-y-2">
              {vendors.map((vendor: AgentVendorInsert, index: number) => {
                const config = VENDOR_CONFIG[vendor.vendor_type as VendorType]
                const IconComponent = config?.icon || Building
                
                return (
                  <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-900">
                            {vendor.company_name}
                          </div>
                          <div className="text-sm text-blue-700">
                            {config?.title || vendor.vendor_type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {vendor.is_primary && (
                          <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-200">
                            <Star className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                        <div className="text-sm text-blue-600 space-x-2">
                          {vendor.email && <Mail className="w-3 h-3 inline" />}
                          {vendor.phone && <Phone className="w-3 h-3 inline" />}
                          {vendor.address && <MapPin className="w-3 h-3 inline" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const BrandingSummaryCard: React.FC<{ onEditBranding: () => void }> = ({ onEditBranding }) => {
  const { watch } = useFormContext()
  const branding = watch('branding') || {}

  const completedFields = Object.entries(branding).filter(([key, value]) => {
    if (key === 'has_branded_sign' || key === 'has_canva_template' || key === 'social_media_permission') {
      return value !== undefined && value !== null
    }
    return value && value !== ''
  }).length

  const totalFields = 12 // Approximate number of branding fields

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-purple-900">
            <Palette className="w-5 h-5 mr-2" />
            Branding & Preferences
          </CardTitle>
          <EditButton onEdit={onEditBranding} section="Branding" />
        </div>
        <CardDescription className="text-purple-700">
          Your personalization and communication preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Completion Status */}
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Profile Completion</span>
              <span className="text-sm text-purple-700">
                {completedFields} of {totalFields} fields
              </span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedFields / totalFields) * 100}%` }}
              />
            </div>
          </div>

          {/* Key Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Review Link */}
            {branding.review_link && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <Link className="w-4 h-4" />
                  <span className="font-medium">Review Link</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Sign Preference */}
            {branding.has_branded_sign !== undefined && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">
                    {branding.has_branded_sign ? 'Has Branded Signs' : 'Will Get Own Signs'}
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Canva Template */}
            {branding.has_canva_template !== undefined && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <Image className="w-4 h-4" />
                  <span className="font-medium">
                    {branding.has_canva_template ? 'Will Share Template' : 'Need Template Prep'}
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Social Media */}
            {branding.social_media_permission && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Social Media Approved</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Favorite Color */}
            {branding.favorite_color && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: branding.favorite_color }}
                  />
                  <span className="font-medium">Favorite Color</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Beverage Preferences */}
            {(branding.drinks_coffee || branding.drinks_alcohol) && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  {branding.drinks_coffee && <Coffee className="w-4 h-4" />}
                  {branding.drinks_alcohol && <Wine className="w-4 h-4" />}
                  <span className="font-medium">Beverage Preferences</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Communication Time */}
            {branding.preferred_communication_time && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    Prefers {branding.preferred_communication_time} communication
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Communication Style */}
            {branding.communication_style && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">
                    {branding.communication_style.charAt(0).toUpperCase() + branding.communication_style.slice(1)} style
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Birthday */}
            {branding.birthday && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Birthday Added</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}

            {/* Email Signature */}
            {branding.email_signature && (
              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Custom Email Signature</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface ReviewAndSubmitStepProps {
  onEditVendors?: () => void
  onEditBranding?: () => void
}

const ReviewAndSubmitStep: React.FC<ReviewAndSubmitStepProps> = ({
  onEditVendors = () => {},
  onEditBranding = () => {}
}) => {
  const { watch, formState: { isValid } } = useFormContext()
  const vendors = watch('vendors') || []
  const branding = watch('branding') || {}

  const hasRequiredFields = branding.review_link && vendors.length > 0
  const canSubmit = isValid && hasRequiredFields

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Ready to Complete Setup</h3>
        <p className="text-green-800 text-sm mb-3">
          Please review your information below. You can edit any section by clicking the "Edit" button. 
          Once submitted, your preferences will be saved and your personalized dashboard will be ready.
        </p>
        
        {!canSubmit && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
            <p className="text-amber-800 text-sm font-medium">
              Missing Required Information:
            </p>
            <ul className="text-amber-700 text-sm mt-1 list-disc list-inside">
              {!branding.review_link && <li>Review link is required</li>}
              {vendors.length === 0 && <li>At least one vendor is required</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Vendor Summary */}
      <VendorSummaryCard onEditVendors={onEditVendors} />

      {/* Branding Summary */}
      <BrandingSummaryCard onEditBranding={onEditBranding} />

      {/* Next Steps Preview */}
      <Card className="bg-gradient-to-r from-brand-charcoal to-brand-taupe-dark text-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            What Happens Next
          </CardTitle>
          <CardDescription className="text-gray-200">
            After completing your setup, you'll have access to these features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-white mb-2">Immediate Access:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Personalized agent dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Vendor coordination system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Transaction management tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Automated communication workflows</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white mb-2">Enhanced Features:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Service tier customization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Offer drafting request system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Branded marketing materials</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Performance analytics</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Status */}
      <Card className={canSubmit ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {canSubmit ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Ready to Submit</p>
                  <p className="text-sm text-green-700">
                    All required information has been provided. Click "Complete Setup" to finish.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full border-2 border-amber-400" />
                <div>
                  <p className="font-medium text-amber-900">Review Required</p>
                  <p className="text-sm text-amber-700">
                    Please complete the missing required fields before submitting.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReviewAndSubmitStep
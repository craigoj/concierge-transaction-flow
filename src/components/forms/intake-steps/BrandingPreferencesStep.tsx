import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Palette,
  Star,
  Coffee,
  Wine,
  Calendar,
  Link,
  Image,
  MessageSquare,
  Clock,
  FileText,
  AlertCircle,
  Info
} from 'lucide-react'

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

const COMMUNICATION_TIMES = [
  { value: 'morning', label: 'Morning (8AM - 12PM)', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: '☀️' },
  { value: 'evening', label: 'Evening (5PM - 8PM)', icon: '🌆' },
  { value: 'anytime', label: 'Anytime', icon: '⏰' }
]

const COMMUNICATION_STYLES = [
  { value: 'formal', label: 'Formal', description: 'Professional and structured communication' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and friendly tone' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive information and updates' },
  { value: 'brief', label: 'Brief', description: 'Concise and to-the-point messaging' }
]

const PREDEFINED_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#EAB308'
]

// =============================================================================
// PREFERENCE SECTION COMPONENTS
// =============================================================================

const SignPreferencesSection: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const hasBrandedSign = watch('branding.has_branded_sign')

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Star className="w-5 h-5 mr-2" />
          For Sale Sign Preferences
        </CardTitle>
        <CardDescription className="text-blue-700">
          Let us know about your branded signage preferences for listings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-base font-medium text-blue-900">
            Do you have branded for sale signs?
          </Label>
          <RadioGroup
            value={hasBrandedSign?.toString() || ''}
            onValueChange={(value) => setValue('branding.has_branded_sign', value === 'true')}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="sign-yes" />
              <Label htmlFor="sign-yes">Yes, I have branded signs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="sign-no" />
              <Label htmlFor="sign-no">No, but I can get my own</Label>
            </div>
          </RadioGroup>
        </div>

        {(hasBrandedSign === true || hasBrandedSign === false) && (
          <div>
            <Label htmlFor="branding.sign_notes">
              Sign Details & Notes
            </Label>
            <Textarea
              {...register('branding.sign_notes')}
              placeholder="Any specific requirements, installation instructions, or notes about your signage..."
              className="mt-1"
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const ReviewLinkSection: React.FC = () => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center text-green-900">
          <Link className="w-5 h-5 mr-2" />
          Review Link
          <span className="text-red-500 ml-1">*</span>
        </CardTitle>
        <CardDescription className="text-green-700">
          Your review link for client feedback and testimonials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="branding.review_link">
            Review Link URL
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            {...register('branding.review_link', { 
              required: 'Review link is required',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Please enter a valid URL starting with http:// or https://'
              }
            })}
            placeholder="https://www.google.com/maps/place/your-business"
            className="mt-1"
          />
          {errors.branding?.review_link && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.branding.review_link.message}
            </p>
          )}
          <p className="text-sm text-green-600 mt-1">
            This will be used for automated review requests after successful transactions
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const CanvaTemplateSection: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  const hasCanvaTemplate = watch('branding.has_canva_template')

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-900">
          <Image className="w-5 h-5 mr-2" />
          Canva Template Preferences
        </CardTitle>
        <CardDescription className="text-purple-700">
          Social media and marketing template configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-base font-medium text-purple-900">
            Canva Template Setup
          </Label>
          <RadioGroup
            value={hasCanvaTemplate?.toString() || ''}
            onValueChange={(value) => setValue('branding.has_canva_template', value === 'true')}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="canva-yes" />
              <Label htmlFor="canva-yes">Yes, I'll share my Canva template</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="canva-no" />
              <Label htmlFor="canva-no">No, please prepare one for me</Label>
            </div>
          </RadioGroup>
        </div>

        {hasCanvaTemplate === true && (
          <div>
            <Label htmlFor="branding.canva_template_url">
              Canva Template URL
            </Label>
            <Input
              {...register('branding.canva_template_url', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL'
                }
              })}
              placeholder="https://www.canva.com/design/your-template"
              className="mt-1"
            />
            {errors.branding?.canva_template_url && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.branding.canva_template_url.message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const PersonalizationSection: React.FC = () => {
  const { register, watch, setValue } = useFormContext()
  const favoriteColor = watch('branding.favorite_color')
  const drinksCoffee = watch('branding.drinks_coffee')
  const drinksAlcohol = watch('branding.drinks_alcohol')

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-900">
          <Palette className="w-5 h-5 mr-2" />
          Personal Preferences
        </CardTitle>
        <CardDescription className="text-amber-700">
          Help us personalize your service experience and client gifts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Favorite Color */}
        <div>
          <Label className="text-base font-medium text-amber-900 mb-3 block">
            Favorite Color
          </Label>
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    favoriteColor === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('branding.favorite_color', color)}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="custom-color" className="text-sm">Or enter custom color:</Label>
              <Input
                {...register('branding.favorite_color')}
                type="color"
                className="w-20 h-8 border-none p-0"
              />
              <Input
                {...register('branding.favorite_color')}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Beverage Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-medium text-amber-900 mb-3 block">
              Coffee Preference
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="drinks-coffee"
                  checked={drinksCoffee === true}
                  onCheckedChange={(checked) => 
                    setValue('branding.drinks_coffee', checked ? true : null)
                  }
                />
                <Label htmlFor="drinks-coffee" className="flex items-center">
                  <Coffee className="w-4 h-4 mr-1" />
                  I enjoy coffee
                </Label>
              </div>
              <p className="text-sm text-amber-600">
                Helps us choose appropriate client gifts and meeting preferences
              </p>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium text-amber-900 mb-3 block">
              Alcohol Preference
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="drinks-alcohol"
                  checked={drinksAlcohol === true}
                  onCheckedChange={(checked) => 
                    setValue('branding.drinks_alcohol', checked ? true : null)
                  }
                />
                <Label htmlFor="drinks-alcohol" className="flex items-center">
                  <Wine className="w-4 h-4 mr-1" />
                  I enjoy wine/alcohol
                </Label>
              </div>
              <p className="text-sm text-amber-600">
                Helps us select appropriate celebration gifts
              </p>
            </div>
          </div>
        </div>

        {/* Birthday */}
        <div>
          <Label htmlFor="branding.birthday" className="text-base font-medium text-amber-900">
            Birthday (Optional)
          </Label>
          <div className="flex items-center space-x-2 mt-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <Input
              {...register('branding.birthday')}
              type="date"
              className="w-auto"
            />
            <span className="text-sm text-amber-600">
              For personalized greetings and recognition
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CommunicationSection: React.FC = () => {
  const { watch, setValue } = useFormContext()
  const preferredTime = watch('branding.preferred_communication_time')
  const communicationStyle = watch('branding.communication_style')

  return (
    <Card className="bg-cyan-50 border-cyan-200">
      <CardHeader>
        <CardTitle className="flex items-center text-cyan-900">
          <MessageSquare className="w-5 h-5 mr-2" />
          Communication Preferences
        </CardTitle>
        <CardDescription className="text-cyan-700">
          Help us communicate with you in your preferred style and timing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preferred Communication Time */}
        <div>
          <Label className="text-base font-medium text-cyan-900 mb-3 block">
            Preferred Communication Time
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMUNICATION_TIMES.map((time) => (
              <button
                key={time.value}
                type="button"
                onClick={() => setValue('branding.preferred_communication_time', time.value)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  preferredTime === time.value
                    ? 'border-cyan-500 bg-cyan-100'
                    : 'border-gray-200 hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{time.icon}</span>
                  <div>
                    <div className="font-medium text-cyan-900">{time.label}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Communication Style */}
        <div>
          <Label className="text-base font-medium text-cyan-900 mb-3 block">
            Communication Style
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMUNICATION_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setValue('branding.communication_style', style.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  communicationStyle === style.value
                    ? 'border-cyan-500 bg-cyan-100'
                    : 'border-gray-200 hover:border-cyan-300'
                }`}
              >
                <div className="font-medium text-cyan-900 mb-1">{style.label}</div>
                <div className="text-sm text-cyan-700">{style.description}</div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SocialMediaSection: React.FC = () => {
  const { watch, setValue } = useFormContext()
  const socialMediaPermission = watch('branding.social_media_permission')

  return (
    <Card className="bg-indigo-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center text-indigo-900">
          <Image className="w-5 h-5 mr-2" />
          Social Media Permissions
        </CardTitle>
        <CardDescription className="text-indigo-700">
          Marketing and social media usage permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-900 mb-2">Social Media Usage</h4>
                <p className="text-sm text-indigo-800 mb-3">
                  By granting permission, you allow us to:
                </p>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• Create branded social media posts for your listings</li>
                  <li>• Share transaction success stories (with client permission)</li>
                  <li>• Feature your properties in our marketing materials</li>
                  <li>• Tag your social media accounts in relevant posts</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="social-media-permission"
              checked={socialMediaPermission || false}
              onCheckedChange={(checked) => 
                setValue('branding.social_media_permission', checked || false)
              }
            />
            <Label htmlFor="social-media-permission" className="text-base font-medium">
              I grant permission for social media marketing usage
            </Label>
          </div>
          
          {socialMediaPermission && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 flex items-center">
                <span className="mr-2">✓</span>
                Thank you! This will help us create enhanced marketing materials for your listings.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const BrandingPreferencesStep: React.FC = () => {
  const { register } = useFormContext()

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Branding & Personalization Setup</h3>
        <p className="text-blue-800 text-sm">
          These preferences help us deliver a personalized service experience that aligns with your brand 
          and communication style. All fields are optional except where marked with an asterisk (*).
        </p>
      </div>

      {/* Sign Preferences */}
      <SignPreferencesSection />

      {/* Review Link */}
      <ReviewLinkSection />

      {/* Canva Template */}
      <CanvaTemplateSection />

      {/* Personalization */}
      <PersonalizationSection />

      {/* Communication Preferences */}
      <CommunicationSection />

      {/* Social Media Permissions */}
      <SocialMediaSection />

      {/* Email Signature */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <FileText className="w-5 h-5 mr-2" />
            Email Signature (Optional)
          </CardTitle>
          <CardDescription className="text-gray-700">
            Custom email signature for automated communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="branding.email_signature">
              Email Signature
            </Label>
            <Textarea
              {...register('branding.email_signature')}
              placeholder="Best regards,&#10;Your Name&#10;Your Title&#10;Your Brokerage&#10;Phone: (555) 123-4567&#10;Email: your.email@example.com"
              className="mt-1"
              rows={5}
            />
            <p className="text-sm text-gray-500 mt-1">
              This signature will be automatically added to system-generated emails
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BrandingPreferencesStep
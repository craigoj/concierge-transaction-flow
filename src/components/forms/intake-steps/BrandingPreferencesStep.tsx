import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Palette, Link, Image, Coffee, Wine, Calendar, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandingFormData {
  has_branded_sign: string;
  sign_notes: string;
  review_link: string;
  has_canva_template: string;
  canva_template_url: string;
  favorite_color: string;
  drinks_coffee: boolean;
  drinks_alcohol: boolean;
  birthday: string;
  social_media_permission: boolean;
}

interface BrandingPreferencesStepProps {
  onComplete: (data: BrandingFormData) => void;
  onNext: () => void;
  onPrevious: () => void;
  initialData?: BrandingFormData;
  onFieldChange?: (field: string, value: any) => Promise<void>;
  errors?: Record<string, string>;
}

export const BrandingPreferencesStep = ({ 
  onComplete, 
  onNext, 
  onPrevious, 
  initialData,
  onFieldChange,
  errors = {}
}: BrandingPreferencesStepProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  
  // Use external errors if provided, otherwise use local errors
  const displayErrors = Object.keys(errors).length > 0 ? errors : localErrors;
  
  const [formData, setFormData] = useState<BrandingFormData>({
    has_branded_sign: initialData?.has_branded_sign || '',
    sign_notes: initialData?.sign_notes || '',
    review_link: initialData?.review_link || '',
    has_canva_template: initialData?.has_canva_template || '',
    canva_template_url: initialData?.canva_template_url || '',
    favorite_color: initialData?.favorite_color || '#3C3C3C',
    drinks_coffee: initialData?.drinks_coffee || false,
    drinks_alcohol: initialData?.drinks_alcohol || false,
    birthday: initialData?.birthday || '',
    social_media_permission: initialData?.social_media_permission || false
  });

  // Load existing branding data
  useEffect(() => {
    const loadBrandingData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('agent_branding')
          .select('*')
          .eq('agent_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData({
            has_branded_sign: data.has_branded_sign || '',
            sign_notes: data.sign_notes || '',
            review_link: data.review_link || '',
            has_canva_template: data.has_canva_template || '',
            canva_template_url: data.canva_template_url || '',
            favorite_color: data.favorite_color || '#3C3C3C',
            drinks_coffee: data.drinks_coffee || false,
            drinks_alcohol: data.drinks_alcohol || false,
            birthday: data.birthday || '',
            social_media_permission: data.social_media_permission || false
          });
        }
      } catch (error) {
        console.error('Error loading branding data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load existing branding data',
          variant: 'destructive'
        });
      }
    };

    loadBrandingData();
  }, [user?.id, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Review link is required and must be valid URL
    if (!formData.review_link.trim()) {
      newErrors.review_link = 'Review link is required';
    } else {
      try {
        new URL(formData.review_link);
      } catch {
        newErrors.review_link = 'Please enter a valid URL';
      }
    }

    // Canva template URL required if 'yes_will_share' selected
    if (formData.has_canva_template === 'yes_will_share' && !formData.canva_template_url.trim()) {
      newErrors.canva_template_url = 'Canva template URL is required when sharing template';
    } else if (formData.canva_template_url.trim()) {
      try {
        new URL(formData.canva_template_url);
      } catch {
        newErrors.canva_template_url = 'Please enter a valid URL';
      }
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save branding preferences',
        variant: 'destructive'
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before continuing',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_branding')
        .upsert({
          agent_id: user.id,
          has_branded_sign: formData.has_branded_sign || null,
          sign_notes: formData.sign_notes || null,
          review_link: formData.review_link,
          has_canva_template: formData.has_canva_template || null,
          canva_template_url: formData.canva_template_url || null,
          favorite_color: formData.favorite_color,
          drinks_coffee: formData.drinks_coffee,
          drinks_alcohol: formData.drinks_alcohol,
          birthday: formData.birthday || null,
          social_media_permission: formData.social_media_permission
        });

      if (error) throw error;

      onComplete(formData);
      onNext();
      
      toast({
        title: 'Success',
        description: 'Branding preferences saved successfully',
      });
    } catch (error) {
      console.error('Error saving branding data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save branding preferences',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = async (field: keyof BrandingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (displayErrors[field]) {
      setLocalErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Call external field change handler if provided
    if (onFieldChange) {
      await onFieldChange(field, value);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
      <CardHeader>
        <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
          <Palette className="h-6 w-6" />
          Branding Preferences
        </CardTitle>
        <p className="text-brand-charcoal/70 font-brand-body">
          Configure your branding and personalization settings to enhance your service delivery.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Branded Sign Section */}
        <Card className="border-brand-taupe/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
              <Image className="h-5 w-5" />
              Branded Signage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="font-brand-heading text-sm tracking-wide uppercase">
                Do you have a branded sign for listings?
              </Label>
              <RadioGroup
                value={formData.has_branded_sign}
                onValueChange={(value) => updateField('has_branded_sign', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="sign-yes" />
                  <Label htmlFor="sign-yes" className="font-brand-body cursor-pointer">
                    Yes, I have a branded sign
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="sign-no" />
                  <Label htmlFor="sign-no" className="font-brand-body cursor-pointer">
                    No, I don't have one
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="will_get_own" id="sign-will-get" />
                  <Label htmlFor="sign-will-get" className="font-brand-body cursor-pointer">
                    No, but I will get my own
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.has_branded_sign && (
              <div className="space-y-2">
                <Label className="font-brand-heading text-sm tracking-wide uppercase">
                  Sign Details/Notes
                </Label>
                <Textarea
                  value={formData.sign_notes}
                  onChange={(e) => updateField('sign_notes', e.target.value)}
                  placeholder="Please provide details about your branded sign..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Link Section */}
        <Card className="border-brand-taupe/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
              <Link className="h-5 w-5" />
              Client Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-brand-heading text-sm tracking-wide uppercase">
                Review Link <span className="text-red-500">*</span>
              </Label>
              <Input
                type="url"
                value={formData.review_link}
                onChange={(e) => updateField('review_link', e.target.value)}
                placeholder="https://example.com/reviews"
                className={displayErrors.review_link ? 'border-red-300' : ''}
              />
              {displayErrors.review_link && (
                <p className="text-sm text-red-600">{displayErrors.review_link}</p>
              )}
              <p className="text-sm text-brand-charcoal/60">
                Link to your Google Reviews, Zillow profile, or other review platform
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Canva Template Section */}
        <Card className="border-brand-taupe/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
              <Image className="h-5 w-5" />
              Marketing Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="font-brand-heading text-sm tracking-wide uppercase">
                Do you have Canva templates to share?
              </Label>
              <RadioGroup
                value={formData.has_canva_template}
                onValueChange={(value) => updateField('has_canva_template', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes_will_share" id="canva-yes" />
                  <Label htmlFor="canva-yes" className="font-brand-body cursor-pointer">
                    Yes, I will share my templates
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_prepare_one" id="canva-prepare" />
                  <Label htmlFor="canva-prepare" className="font-brand-body cursor-pointer">
                    No, but please prepare one for me
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_dont_use" id="canva-no" />
                  <Label htmlFor="canva-no" className="font-brand-body cursor-pointer">
                    No, I don't use Canva
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.has_canva_template === 'yes_will_share' && (
              <div className="space-y-2">
                <Label className="font-brand-heading text-sm tracking-wide uppercase">
                  Canva Template URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="url"
                  value={formData.canva_template_url}
                  onChange={(e) => updateField('canva_template_url', e.target.value)}
                  placeholder="https://canva.com/design/..."
                  className={displayErrors.canva_template_url ? 'border-red-300' : ''}
                />
                {displayErrors.canva_template_url && (
                  <p className="text-sm text-red-600">{displayErrors.canva_template_url}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Preferences Section */}
        <Card className="border-brand-taupe/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Personal Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-brand-heading text-sm tracking-wide uppercase">
                Favorite Color
              </Label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.favorite_color}
                  onChange={(e) => updateField('favorite_color', e.target.value)}
                  className="w-12 h-12 rounded border border-brand-taupe/30 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.favorite_color}
                  onChange={(e) => updateField('favorite_color', e.target.value)}
                  placeholder="#3C3C3C"
                  className="max-w-32"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="drinks-coffee"
                  checked={formData.drinks_coffee}
                  onCheckedChange={(checked) => updateField('drinks_coffee', !!checked)}
                />
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  <Label htmlFor="drinks-coffee" className="font-brand-body cursor-pointer">
                    I drink coffee
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="drinks-alcohol"
                  checked={formData.drinks_alcohol}
                  onCheckedChange={(checked) => updateField('drinks_alcohol', !!checked)}
                />
                <div className="flex items-center gap-2">
                  <Wine className="h-4 w-4" />
                  <Label htmlFor="drinks-alcohol" className="font-brand-body cursor-pointer">
                    I drink alcohol
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-brand-heading text-sm tracking-wide uppercase flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Birthday (Optional)
              </Label>
              <Input
                type="date"
                value={formData.birthday}
                onChange={(e) => updateField('birthday', e.target.value)}
                className="max-w-48"
              />
              <p className="text-sm text-brand-charcoal/60">
                This helps us send personalized birthday wishes to enhance client relationships
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Permission Section */}
        <Card className="border-brand-taupe/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="social-media-permission"
                checked={formData.social_media_permission}
                onCheckedChange={(checked) => updateField('social_media_permission', !!checked)}
                className="mt-1"
              />
              <div className="space-y-2">
                <Label htmlFor="social-media-permission" className="font-brand-body cursor-pointer">
                  I give permission to use my transactions and client success stories for social media marketing
                </Label>
                <p className="text-sm text-brand-charcoal/60 leading-relaxed">
                  This permission allows us to create professional social media posts showcasing your successful 
                  transactions (with client consent). We will always maintain client privacy and professionalism. 
                  You can revoke this permission at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

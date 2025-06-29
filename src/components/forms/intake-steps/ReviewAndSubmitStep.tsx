
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Edit, MapPin, Palette, Users, Mail, Phone, Clock, Calendar, Share2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/utils/emailUtils';

interface VendorData {
  [key: string]: Array<{
    company_name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    is_primary: boolean;
  }>;
}

interface BrandingData {
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

interface ReviewAndSubmitStepProps {
  vendorData: VendorData;
  brandingData: BrandingData;
  onPrevious: () => void;
  onComplete?: () => void;
  onEditStep?: (step: number) => void;
}

export const ReviewAndSubmitStep = ({ 
  vendorData, 
  brandingData, 
  onPrevious, 
  onComplete,
  onEditStep 
}: ReviewAndSubmitStepProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate data before submission
  useEffect(() => {
    const errors: string[] = [];
    
    // Check if branding data has required fields
    if (!brandingData.review_link?.trim()) {
      errors.push('Review link is required');
    }
    
    // Check if at least one vendor is configured
    const hasVendors = Object.keys(vendorData).some(type => 
      vendorData[type] && vendorData[type].length > 0
    );
    
    if (!hasVendors) {
      errors.push('At least one vendor must be configured');
    }
    
    setValidationErrors(errors);
  }, [vendorData, brandingData]);

  const formatVendorType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getVendorSummary = () => {
    const vendorTypes = Object.keys(vendorData).filter(type => 
      vendorData[type] && vendorData[type].length > 0
    );
    
    return vendorTypes.map(type => ({
      type: formatVendorType(type),
      count: vendorData[type].length,
      primary: vendorData[type].find(v => v.is_primary)?.company_name || vendorData[type][0]?.company_name
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to complete setup',
        variant: 'destructive'
      });
      return;
    }

    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Start database transaction
      const { error: sessionError } = await supabase
        .rpc('begin_transaction');

      if (sessionError) throw sessionError;

      // Create/update intake session
      const { data: sessionData, error: intakeError } = await supabase
        .from('agent_intake_sessions')
        .upsert({
          agent_id: user.id,
          status: 'completed',
          vendor_data: vendorData,
          branding_data: brandingData,
          completion_percentage: 100,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (intakeError) throw intakeError;

      // Batch insert vendor data
      const vendorInserts = [];
      for (const [vendorType, vendors] of Object.entries(vendorData)) {
        if (vendors && vendors.length > 0) {
          for (const vendor of vendors) {
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
        }
      }

      if (vendorInserts.length > 0) {
        const { error: vendorError } = await supabase
          .from('agent_vendors')
          .upsert(vendorInserts);

        if (vendorError) throw vendorError;
      }

      // Insert/update branding data
      const { error: brandingError } = await supabase
        .from('agent_branding')
        .upsert({
          agent_id: user.id,
          has_branded_sign: brandingData.has_branded_sign || null,
          sign_notes: brandingData.sign_notes || null,
          review_link: brandingData.review_link,
          has_canva_template: brandingData.has_canva_template || null,
          canva_template_url: brandingData.canva_template_url || null,
          favorite_color: brandingData.favorite_color,
          drinks_coffee: brandingData.drinks_coffee,
          drinks_alcohol: brandingData.drinks_alcohol,
          birthday: brandingData.birthday || null,
          social_media_permission: brandingData.social_media_permission
        });

      if (brandingError) throw brandingError;

      // Get user profile for welcome email
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      // Send welcome email
      if (profile?.email && profile?.first_name) {
        try {
          await sendWelcomeEmail(profile.email, `${profile.first_name} ${profile.last_name || ''}`.trim());
        } catch (emailError) {
          console.error('Welcome email failed:', emailError);
          // Don't fail the whole process for email issues
        }
      }

      // Commit transaction
      await supabase.rpc('commit_transaction');
      
      toast({
        title: 'Setup Complete! 🎉',
        description: `Welcome to your Agent Concierge, ${profile?.first_name || 'Agent'}! Your personalized dashboard is ready.`,
      });

      // Complete the flow
      onComplete?.();

    } catch (error) {
      console.error('Error completing intake:', error);
      
      // Rollback transaction
      await supabase.rpc('rollback_transaction');
      
      toast({
        title: 'Setup Error',
        description: 'Failed to complete setup. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const vendorSummary = getVendorSummary();

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
      <CardHeader>
        <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
          <CheckCircle className="h-6 w-6" />
          Review & Submit
        </CardTitle>
        <p className="text-brand-charcoal/70 font-brand-body">
          Review your settings and complete the setup process to access your personalized dashboard.
        </p>
        
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              Please fix the following issues:
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Vendor Preferences Summary */}
        <Card className="border-brand-taupe/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
                <Users className="h-5 w-5" />
                Vendor Preferences
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditStep?.(1)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {vendorSummary.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendorSummary.map((vendor, index) => (
                  <div key={index} className="bg-brand-taupe/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal">
                        {vendor.type}
                      </span>
                      <Badge variant="secondary">{vendor.count} vendor{vendor.count > 1 ? 's' : ''}</Badge>
                    </div>
                    <p className="text-sm text-brand-charcoal/70">
                      Primary: <span className="font-medium">{vendor.primary}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-charcoal/60 font-brand-body italic">
                No vendor preferences configured
              </p>
            )}
          </CardContent>
        </Card>

        {/* Branding Preferences Summary */}
        <Card className="border-brand-taupe/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding Preferences
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditStep?.(2)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal block mb-1">
                    Branded Sign
                  </span>
                  <p className="text-sm text-brand-charcoal/70">
                    {brandingData.has_branded_sign ? 
                      formatVendorType(brandingData.has_branded_sign) : 
                      'Not specified'
                    }
                  </p>
                </div>
                
                <div>
                  <span className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal block mb-1">
                    Review Link
                  </span>
                  <p className="text-sm text-brand-charcoal/70 break-all">
                    {brandingData.review_link || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal block mb-1">
                    Canva Templates
                  </span>
                  <p className="text-sm text-brand-charcoal/70">
                    {brandingData.has_canva_template ? 
                      formatVendorType(brandingData.has_canva_template) : 
                      'Not specified'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal block mb-1">
                    Favorite Color
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border border-brand-taupe/30"
                      style={{ backgroundColor: brandingData.favorite_color }}
                    />
                    <span className="text-sm text-brand-charcoal/70">{brandingData.favorite_color}</span>
                  </div>
                </div>

                <div>
                  <span className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal block mb-1">
                    Preferences
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {brandingData.drinks_coffee && (
                      <Badge variant="outline">☕ Coffee</Badge>
                    )}
                    {brandingData.drinks_alcohol && (
                      <Badge variant="outline">🍷 Alcohol</Badge>
                    )}
                    {brandingData.social_media_permission && (
                      <Badge variant="outline">📱 Social Media OK</Badge>
                    )}
                    {brandingData.birthday && (
                      <Badge variant="outline">🎂 Birthday Set</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-brand-heading tracking-wide uppercase text-green-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What Happens Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-green-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <p>Your personalized agent dashboard will be activated with your vendor preferences</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <p>Welcome email with next steps will be sent to your registered email</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <p>Your branding preferences will be applied to all future transactions</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">4</span>
                </div>
                <p>You'll be redirected to your agent dashboard to start managing transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || validationErrors.length > 0}
            className="min-w-40"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Completing Setup...
              </div>
            ) : (
              'Complete Setup 🎉'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

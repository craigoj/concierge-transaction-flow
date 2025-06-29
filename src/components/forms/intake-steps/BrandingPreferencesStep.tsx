
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface BrandingPreferencesStepProps {
  onComplete: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  initialData?: any;
}

export const BrandingPreferencesStep = ({ onComplete, onNext, onPrevious, initialData }: BrandingPreferencesStepProps) => {
  const handleSave = () => {
    // Placeholder for branding preferences
    onComplete({});
    onNext();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
      <CardHeader>
        <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
          <Palette className="h-6 w-6" />
          Branding Preferences
        </CardTitle>
        <p className="text-brand-charcoal/70 font-brand-body">
          Configure your branding and personalization settings.
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-brand-charcoal/60 font-brand-body mb-8">
            Branding preferences step coming soon...
          </p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button onClick={handleSave}>
              Save & Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

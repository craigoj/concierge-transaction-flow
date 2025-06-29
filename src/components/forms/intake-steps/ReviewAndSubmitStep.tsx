
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ReviewAndSubmitStepProps {
  vendorData: any;
  brandingData: any;
  onPrevious: () => void;
  onComplete?: () => void;
}

export const ReviewAndSubmitStep = ({ vendorData, brandingData, onPrevious, onComplete }: ReviewAndSubmitStepProps) => {
  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
      <CardHeader>
        <CardTitle className="text-xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase flex items-center gap-3">
          <CheckCircle className="h-6 w-6" />
          Review & Submit
        </CardTitle>
        <p className="text-brand-charcoal/70 font-brand-body">
          Review your settings and complete the setup process.
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-brand-charcoal/60 font-brand-body mb-8">
            Review and submit step coming soon...
          </p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button onClick={handleComplete}>
              Complete Setup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

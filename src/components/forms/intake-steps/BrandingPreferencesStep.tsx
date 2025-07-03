import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Palette, Coffee, Wine, Star, Share2 } from 'lucide-react';

interface BrandingPreferencesStepProps {
  data: any;
  onNext: () => void;
  onPrev: () => void;
  onChange: (field: string, value: any) => void;
}

const BrandingPreferencesStep: React.FC<BrandingPreferencesStepProps> = ({
  data,
  onNext,
  onPrev,
  onChange,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Branding Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <Input
            id="primaryColor"
            type="color"
            value={data.primaryColor || '#007BFF'}
            onChange={(e) => onChange('primaryColor', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Secondary Color</Label>
          <Input
            id="secondaryColor"
            type="color"
            value={data.secondaryColor || '#6C757D'}
            onChange={(e) => onChange('secondaryColor', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontFamily">Font Family</Label>
          <Input
            id="fontFamily"
            type="text"
            placeholder="e.g., Arial, Helvetica, sans-serif"
            value={data.fontFamily || 'Arial, Helvetica, sans-serif'}
            onChange={(e) => onChange('fontFamily', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Preferred Communication Style</Label>
          <RadioGroup
            defaultValue={data.communicationStyle || 'formal'}
            onValueChange={(value) => onChange('communicationStyle', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="formal" id="formal" />
              <Label htmlFor="formal">Formal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="informal" id="informal" />
              <Label htmlFor="informal">Informal</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friendly" id="friendly" />
              <Label htmlFor="friendly">Friendly</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any specific branding requests or guidelines?"
            value={data.additionalNotes || ''}
            onChange={(e) => onChange('additionalNotes', e.target.value)}
          />
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={onPrev}>
            Previous
          </Button>
          <Button onClick={onNext}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandingPreferencesStep;

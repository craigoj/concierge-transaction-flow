
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Edit3, Send, Loader2 } from 'lucide-react';

interface FormData {
  vendors?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ReviewAndSubmitStepProps {
  data: FormData;
  onEdit: (step: number) => void;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  isSubmitDisabled: boolean;
}

const ReviewAndSubmitStep: React.FC<ReviewAndSubmitStepProps> = ({ 
  data, 
  onEdit, 
  onSubmit, 
  isLoading,
  isSubmitDisabled
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to submit.",
      });
      return;
    }

    if (isSubmitDisabled) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Please ensure all required fields are completed before submitting.",
      });
      return;
    }

    await onSubmit(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Review and Submit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Data */}
        {Object.entries(data).map(([key, value]: [string, unknown], index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold capitalize">{key.replace(/_/g, ' ')}</h4>
              <Button variant="link" size="sm" onClick={() => onEdit(index)}>
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
            {typeof value === 'boolean' ? (
              <Badge variant={value ? "default" : "secondary"}>
                {value ? "Yes" : "No"}
              </Badge>
            ) : Array.isArray(value) ? (
              <ul className="list-disc pl-5">
                {value.map((item, i) => (
                  <li key={i} className="text-sm">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">{String(value)}</p>
            )}
            <Separator />
          </div>
        ))}

        {/* Submit Button */}
        <Button 
          className="w-full" 
          onClick={handleSubmit} 
          disabled={isLoading || isSubmitDisabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReviewAndSubmitStep;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { generateMockData } from "@/utils/seedMockData";
import { toast } from "sonner";

export const MockDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleGenerateData = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus('idle');
    setMessage('');

    try {
      // Simulate progress updates
      const progressSteps = [
        'Creating realistic transactions...',
        'Adding client profiles...',
        'Generating task workflows...',
        'Creating communication logs...',
        'Adding document records...',
        'Setting up notifications...',
        'Configuring automation rules...',
        'Finalizing demo data...'
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setMessage(progressSteps[i]);
        setProgress((i + 1) * 12.5);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const result = await generateMockData();
      
      if (result.success) {
        setStatus('success');
        setProgress(100);
        setMessage('Mock data generated successfully!');
        toast.success('Demo data has been created successfully!');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
      toast.error('Failed to generate mock data');
      console.error('Mock data generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Generate Demo Data
        </CardTitle>
        <CardDescription>
          Populate your platform with comprehensive, realistic mock data for demonstration purposes.
          This will create transactions, clients, tasks, communications, and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Will Create:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• 15-20 realistic transactions</li>
              <li>• Client profiles & contact info</li>
              <li>• Task workflows by service tier</li>
              <li>• Communication histories</li>
              <li>• Document records</li>
              <li>• Notification examples</li>
              <li>• Automation rule samples</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Service Tiers:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• White Glove ($2.5M+ luxury)</li>
              <li>• Elite ($800K-$2M properties)</li>
              <li>• Core ($300K-$700K standard)</li>
              <li>• Dual transactions</li>
              <li>• Mixed buyer/seller types</li>
              <li>• Various market locations</li>
            </ul>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Demo data generated successfully!</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{message}</span>
          </div>
        )}

        <Button 
          onClick={handleGenerateData} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Demo Data...
            </>
          ) : (
            'Generate Comprehensive Demo Data'
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          Note: This will create realistic demo data for your platform. 
          Existing data will not be affected, but new demo records will be added.
        </p>
      </CardContent>
    </Card>
  );
};

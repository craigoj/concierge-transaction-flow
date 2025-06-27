
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, RefreshCw, Anchor, Building, Users, FileText, MapPin } from "lucide-react";
import { generateHamptonRoadsMockData } from "@/utils/seedHamptonRoadsData";
import { toast } from "sonner";

export const HamptonRoadsMockDataGenerator = () => {
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
      // Simulate progress updates with Hampton Roads specific steps
      const progressSteps = [
        'Creating Hampton Roads real estate professionals...',
        'Generating waterfront and luxury property transactions...',
        'Adding military family and local client profiles...',
        'Creating Hampton Roads specific email templates...',
        'Setting up military PCS and waterfront workflows...',
        'Generating flood zone and hurricane preparedness tasks...',
        'Creating local communication threads...',
        'Adding Hampton Roads document templates...',
        'Setting up military-friendly notifications...',
        'Finalizing Hampton Roads demo environment...'
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        setMessage(progressSteps[i]);
        setProgress((i + 1) * 10);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const result = await generateHamptonRoadsMockData();
      
      if (result.success) {
        setStatus('success');
        setProgress(100);
        setMessage('Hampton Roads demo data generated successfully!');
        toast.success('Hampton Roads real estate demo data has been created successfully!');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
      toast.error('Failed to generate Hampton Roads mock data');
      console.error('Hampton Roads mock data generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Anchor className="h-6 w-6 text-blue-600" />
          Generate Hampton Roads Demo Data
        </CardTitle>
        <CardDescription className="text-lg">
          Create comprehensive, realistic mock data specifically tailored for Hampton Roads luxury real estate coordination, 
          including military relocations, waterfront properties, and local market expertise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-500" />
              Property Types & Locations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• White Glove: Riverside Dr, Bayshore Ln, Colonial Ave</li>
              <li>• Elite: Cavalier Dr, Larchmont, Great Neck, Shore Dr</li>
              <li>• Core: Military-friendly near bases & shipyard</li>
              <li>• Authentic Hampton Roads addresses & neighborhoods</li>
              <li>• Flood zone designations (AE, VE, X zones)</li>
              <li>• Hurricane-rated features & marina access</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Hampton Roads Professionals
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 2 Coordinators: Patricia Williamson, Michael Chen</li>
              <li>• 8 Agents: Military specialists, waterfront experts</li>
              <li>• Local brokerages: Berkshire Hathaway, Rose & Womble</li>
              <li>• VA license numbers (0225-XXXXXX format)</li>
              <li>• Military relocation & luxury market expertise</li>
              <li>• Historic Ghent & waterfront specializations</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              Military & Local Clients
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Navy, Army, Air Force families with PCS orders</li>
              <li>• EVMS/Sentara medical professionals</li>
              <li>• Newport News Shipyard workers</li>
              <li>• Military retirees staying in Hampton Roads</li>
              <li>• VA loan processes & base proximity needs</li>
              <li>• Hurricane season & deployment planning</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              Hampton Roads Specialties
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Flood zone certificates & hurricane prep</li>
              <li>• Military PCS timelines & VA loan docs</li>
              <li>• Marina access & waterfront agreements</li>
              <li>• Historic district preservation guidelines</li>
              <li>• Base commute analysis & school districts</li>
              <li>• Chesapeake Bay preservation compliance</li>
            </ul>
          </div>
        </div>

        {isGenerating && (
          <div className="space-y-3">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Hampton Roads demo data generated successfully!</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        <Button 
          onClick={handleGenerateData} 
          disabled={isGenerating}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Generating Hampton Roads Demo Data...
            </>
          ) : (
            <>
              <Anchor className="h-5 w-5 mr-2" />
              Generate Hampton Roads Real Estate Demo Data
            </>
          )}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            🌊 Authentic Hampton Roads Market Data
          </h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            This generates realistic data reflecting the unique Hampton Roads real estate market including 
            military relocations, waterfront lifestyle, hurricane preparedness, flood zones, and local 
            expertise in Norfolk, Virginia Beach, Portsmouth, Newport News, Hampton, and Chesapeake areas.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          This will replace existing demo data with Hampton Roads-specific content including 
          authentic addresses, military-focused services, and waterfront property expertise.
        </p>
      </CardContent>
    </Card>
  );
};

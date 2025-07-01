
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Settings,
  UserCheck
} from "lucide-react";

interface ProgressCheckpoint {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  required: boolean;
  completedAt?: string;
}

interface ProgressCheckpointOverrideProps {
  agentId: string;
  agentName: string;
  onProgressUpdate: () => void;
}

export const ProgressCheckpointOverride = ({ 
  agentId, 
  agentName, 
  onProgressUpdate 
}: ProgressCheckpointOverrideProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock checkpoints - in real implementation, these would come from the database
  const [checkpoints, setCheckpoints] = useState<ProgressCheckpoint[]>([
    {
      id: '1',
      name: 'Profile Information',
      description: 'Basic agent information completed',
      completed: true,
      required: true,
      completedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Vendor Preferences',
      description: 'Agent vendor preferences configured',
      completed: false,
      required: true
    },
    {
      id: '3',
      name: 'Branding Setup',
      description: 'Agent branding preferences set',
      completed: false,
      required: true
    },
    {
      id: '4',
      name: 'Communication Settings',
      description: 'Communication preferences configured',
      completed: false,
      required: false
    },
    {
      id: '5',
      name: 'Document Templates',
      description: 'Document templates reviewed and approved',
      completed: false,
      required: false
    }
  ]);

  const handleOverrideCheckpoint = async (checkpointId: string, complete: boolean) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would update the database
      setCheckpoints(prev => prev.map(checkpoint => 
        checkpoint.id === checkpointId 
          ? { 
              ...checkpoint, 
              completed: complete,
              completedAt: complete ? new Date().toISOString() : undefined
            }
          : checkpoint
      ));

      toast({
        title: complete ? "Checkpoint Completed" : "Checkpoint Reset",
        description: `${agentName}'s progress has been updated.`,
      });

      onProgressUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Update Progress",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceComplete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed_at: new Date().toISOString(),
          invitation_status: 'completed'
        })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Onboarding Completed",
        description: `${agentName}'s onboarding has been marked as complete.`,
      });

      setCheckpoints(prev => prev.map(checkpoint => ({
        ...checkpoint,
        completed: true,
        completedAt: new Date().toISOString()
      })));

      onProgressUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Complete Onboarding",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = checkpoints.filter(c => c.completed).length;
  const totalCount = checkpoints.length;
  const requiredCount = checkpoints.filter(c => c.required).length;
  const completedRequiredCount = checkpoints.filter(c => c.required && c.completed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Progress Override - {agentName}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {completedCount}/{totalCount} Complete
            </Badge>
            <Badge variant={completedRequiredCount === requiredCount ? "default" : "secondary"}>
              {completedRequiredCount}/{requiredCount} Required
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {checkpoint.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : checkpoint.required ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium flex items-center">
                    {checkpoint.name}
                    {checkpoint.required && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Required
                      </Badge>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">{checkpoint.description}</p>
                  {checkpoint.completedAt && (
                    <p className="text-xs text-gray-500">
                      Completed: {new Date(checkpoint.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {!checkpoint.completed ? (
                  <Button
                    size="sm"
                    onClick={() => handleOverrideCheckpoint(checkpoint.id, true)}
                    disabled={isLoading}
                  >
                    Mark Complete
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOverrideCheckpoint(checkpoint.id, false)}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button
              onClick={handleForceComplete}
              disabled={isLoading}
              className="w-full"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Force Complete Onboarding
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

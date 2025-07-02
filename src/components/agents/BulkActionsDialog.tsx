
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, Users, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsDialogProps {
  selectedAgents: any[];
  open: boolean;
  onClose: () => void;
  onActionCompleted: () => void;
}

export const BulkActionsDialog = ({ selectedAgents, open, onClose, onActionCompleted }: BulkActionsDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const actions = [
    { value: "activate", label: "Activate Agents", icon: CheckCircle, color: "text-green-600" },
    { value: "deactivate", label: "Deactivate Agents", icon: XCircle, color: "text-yellow-600" },
    { value: "delete", label: "Delete Agents", icon: Trash2, color: "text-red-600", dangerous: true },
  ];

  const selectedActionConfig = actions.find(a => a.value === selectedAction);

  const handleBulkAction = async () => {
    if (!selectedAction) return;
    
    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      const agentIds = selectedAgents.map(agent => agent.id);
      let successCount = 0;
      let failureCount = 0;
      const operationResults: any[] = [];

      if (selectedAction === "activate" || selectedAction === "deactivate") {
        const newStatus = selectedAction === "activate" ? "completed" : "pending";
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            invitation_status: newStatus,
            admin_activated: selectedAction === "activate",
            updated_at: new Date().toISOString()
          })
          .in('id', agentIds)
          .select('id, first_name, last_name');

        if (error) throw error;

        successCount = data?.length || 0;
        operationResults.push(...(data || []).map(agent => ({
          id: agent.id,
          name: `${agent.first_name} ${agent.last_name}`,
          status: 'success',
          message: `Successfully ${selectedAction}d`
        })));

      } else if (selectedAction === "delete") {
        // Delete agents one by one to handle any individual failures
        for (const agent of selectedAgents) {
          try {
            const { error } = await supabase
              .from('profiles')
              .delete()
              .eq('id', agent.id);

            if (error) throw error;

            successCount++;
            operationResults.push({
              id: agent.id,
              name: `${agent.first_name} ${agent.last_name}`,
              status: 'success',
              message: 'Successfully deleted'
            });
          } catch (err: any) {
            failureCount++;
            operationResults.push({
              id: agent.id,
              name: `${agent.first_name} ${agent.last_name}`,
              status: 'error',
              message: err.message || 'Delete failed'
            });
          }
        }
      }

      setResults(operationResults);

      const actionPastTense = selectedAction === "delete" ? "deleted" : `${selectedAction}d`;
      
      toast({
        title: "Bulk Action Completed",
        description: `${successCount} agents ${actionPastTense} successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}.`,
        variant: failureCount > 0 ? "destructive" : "default",
      });

      // Close dialog after successful operation
      setTimeout(() => {
        onClose();
        onActionCompleted();
        setResults([]);
        setSelectedAction("");
      }, 3000);
      
    } catch (error: any) {
      console.error("Error performing bulk action:", error);
      
      const errorMessage = error.message || "An unexpected error occurred during the bulk operation.";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Bulk Action Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction("");
    setError(null);
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Agent Actions
          </DialogTitle>
          <DialogDescription>
            Perform actions on {selectedAgents.length} selected agent{selectedAgents.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Agents Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Selected Agents ({selectedAgents.length}):</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {selectedAgents.map((agent) => (
                <Badge key={agent.id} variant="outline" className="text-xs">
                  {agent.first_name} {agent.last_name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Action:</label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${action.color}`} />
                        <span>{action.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Warning for dangerous actions */}
          {selectedActionConfig?.dangerous && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. All selected agents and their associated data will be permanently deleted.
              </AlertDescription>
            </Alert>
          )}

          {/* Results Display */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Operation Results:</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {results.map((result) => (
                  <div key={result.id} className={`flex items-center justify-between p-2 rounded text-sm ${
                    result.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <span>{result.name}</span>
                    <span className="text-xs">{result.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkAction}
            disabled={!selectedAction || isLoading}
            variant={selectedActionConfig?.dangerous ? "destructive" : "default"}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : selectedActionConfig ? (
              <>
                <selectedActionConfig.icon className="h-4 w-4" />
                {selectedActionConfig.label}
              </>
            ) : (
              "Select Action"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

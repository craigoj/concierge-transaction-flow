
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
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteAgentDialogProps {
  agent: any;
  open: boolean;
  onClose: () => void;
  onAgentDeleted: () => void;
}

export const DeleteAgentDialog = ({ agent, open, onClose, onAgentDeleted }: DeleteAgentDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const expectedConfirmation = `DELETE ${agent?.first_name} ${agent?.last_name}`;
  const isConfirmationValid = confirmationText === expectedConfirmation;

  const handleDelete = async () => {
    if (!isConfirmationValid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting agent deletion process for agent:", agent.id);

      // First, delete from auth.users using admin privileges
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(agent.id);
      
      if (authDeleteError) {
        console.error("Auth user deletion error:", authDeleteError);
        // Continue with profile deletion even if auth deletion fails
      }

      // Delete from profiles table (this should cascade to related tables)
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', agent.id);

      if (profileDeleteError) {
        console.error("Profile deletion error:", profileDeleteError);
        throw profileDeleteError;
      }

      // Also delete from agent_invitations to clean up
      const { error: invitationDeleteError } = await supabase
        .from('agent_invitations')
        .delete()
        .eq('agent_id', agent.id);

      if (invitationDeleteError) {
        console.warn("Invitation deletion error (non-critical):", invitationDeleteError);
        // This is non-critical, continue
      }

      console.log("Agent deletion completed successfully");

      toast({
        title: "Agent Deleted",
        description: `${agent.first_name} ${agent.last_name} has been permanently deleted.`,
      });

      onClose();
      onAgentDeleted();
      
    } catch (error: any) {
      console.error("Error deleting agent:", error);
      
      const errorMessage = error.message || "An unexpected error occurred while deleting the agent.";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error Deleting Agent",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Agent Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the agent account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">You are about to delete:</h4>
            <div className="text-red-700">
              <p><strong>Name:</strong> {agent?.first_name} {agent?.last_name}</p>
              <p><strong>Email:</strong> {agent?.email}</p>
              <p><strong>Status:</strong> {agent?.invitation_status}</p>
              {agent?.brokerage && <p><strong>Brokerage:</strong> {agent.brokerage}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Type <code className="bg-gray-100 px-1 rounded text-sm">{expectedConfirmation}</code> to confirm deletion:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type the confirmation text..."
              disabled={isLoading}
              className="font-mono"
            />
          </div>

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
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Agent
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

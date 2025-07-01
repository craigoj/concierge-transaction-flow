
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Key, 
  Mail, 
  Eye,
  Lock,
  Unlock
} from "lucide-react";

interface QuickActionsMenuProps {
  agentId: string;
  agentName: string;
  currentStatus: string;
  isLocked?: boolean;
  onRefresh: () => void;
}

export const QuickActionsMenu = ({ 
  agentId, 
  agentName, 
  currentStatus, 
  isLocked = false,
  onRefresh 
}: QuickActionsMenuProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSetupLink = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_agent_setup_link', {
        p_agent_id: agentId,
        p_expires_hours: 24
      });
      
      if (error) throw error;
      
      const setupUrl = `${window.location.origin}/agent/setup/${data}`;
      await navigator.clipboard.writeText(setupUrl);
      
      toast({
        title: "Setup Link Generated",
        description: "Link copied to clipboard. Valid for 24 hours.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Generate Link",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePassword = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-temp-password', {
        body: {
          agentId,
          expiresHours: 24,
          sendEmail: true
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Temporary Password Generated",
        description: `Password sent to ${agentName}. Expires in 24 hours.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Generate Password",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockAccount = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('lock_user_account', {
        p_user_id: agentId,
        p_reason: 'Manual lock by coordinator'
      });
      
      if (error) throw error;
      
      toast({
        title: "Account Locked",
        description: `${agentName}'s account has been locked.`,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Lock Account",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockAccount = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('unlock_user_account', {
        p_user_id: agentId
      });
      
      if (error) throw error;
      
      toast({
        title: "Account Unlocked",
        description: `${agentName}'s account has been unlocked.`,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Unlock Account",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvitation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-agent-invitation', {
        body: {
          agentId,
          isResend: true
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Invitation Resent",
        description: `Invitation email sent to ${agentName}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Resend Invitation",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleGenerateSetupLink}>
          <Key className="h-4 w-4 mr-2" />
          Generate Setup Link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleGeneratePassword}>
          <Key className="h-4 w-4 mr-2" />
          Generate Temp Password
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleResendInvitation}>
          <Mail className="h-4 w-4 mr-2" />
          Resend Invitation
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isLocked ? (
          <DropdownMenuItem onClick={handleUnlockAccount} className="text-green-600">
            <Unlock className="h-4 w-4 mr-2" />
            Unlock Account
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleLockAccount} className="text-red-600">
            <Lock className="h-4 w-4 mr-2" />
            Lock Account
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


import { Button } from "@/components/ui/button";
import { Settings, User, LogOut, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MainNavigation from "@/components/navigation/MainNavigation";
import NotificationCenter from "@/components/notifications/NotificationCenter";

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign Out Error",
          description: error.message,
        });
      } else {
        navigate('/auth');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 px-8 py-6 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/')}
            >
              <span className="text-primary-foreground font-bold text-xl">AC</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">The Agent Concierge</h1>
              <p className="text-sm text-muted-foreground font-medium">Transaction Coordination Platform</p>
            </div>
          </div>
          
          {/* Enhanced Main Navigation */}
          <MainNavigation />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-muted/50 rounded-xl"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Enhanced Notification Center */}
          <NotificationCenter />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50 rounded-xl">
                <User className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-border/50 shadow-lg">
              <DropdownMenuItem className="hover:bg-muted/50">
                <User className="mr-3 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-muted/50">
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="hover:bg-muted/50 text-destructive cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;


import { Button } from "@/components/ui/button";
import { Settings, User, LogOut, Search, Plus } from "lucide-react";
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
import MobileNavigation from "@/components/navigation/MobileNavigation";
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
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Mobile Navigation */}
          <MobileNavigation />
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-transform border border-border/20"
              onClick={() => navigate('/')}
            >
              <img 
                src="/lovable-uploads/c4831673-bd4c-4354-9ab1-25fe70b2edb2.png"
                alt="The Agent Concierge Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">The Agent Concierge</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Transaction Coordination Platform</p>
            </div>
          </div>
          
          {/* Enhanced Main Navigation - Hidden on mobile */}
          <MainNavigation />
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Global Create Button - AFrame Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 sm:px-4 py-2 font-medium text-sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-border/50 shadow-lg">
              <DropdownMenuItem 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/transactions/new')}
              >
                🏠 Transaction
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/clients/new')}
              >
                👤 Contact
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/tasks/new')}
              >
                ✓ Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/communications/new')}
              >
                📝 Contact Note
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/templates/new')}
              >
                📄 Letter (Blank)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-muted/50 rounded-xl"
            onClick={() => navigate('/search')}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </Button>

          {/* Enhanced Notification Center */}
          <NotificationCenter />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50 rounded-xl">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-border/50 shadow-lg">
              <DropdownMenuItem 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-3 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate('/settings')}
              >
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

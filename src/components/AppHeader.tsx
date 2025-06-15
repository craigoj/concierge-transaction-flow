
import { Button } from "@/components/ui/button";
import { Bell, Settings, User, LogOut, Home, FileText } from "lucide-react";
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 px-8 py-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm cursor-pointer"
              onClick={() => navigate('/')}
            >
              <span className="text-primary-foreground font-bold text-xl">AC</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">The Agent Concierge</h1>
              <p className="text-sm text-muted-foreground font-medium">Transaction Coordination Platform</p>
            </div>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant={isActive('/') ? "default" : "ghost"} 
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button 
              variant={isActive('/transactions') ? "default" : "ghost"} 
              size="sm"
              onClick={() => navigate('/transactions')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Transactions
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-xl">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
          </Button>
          
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
    </div>
  );
};

export default AppHeader;

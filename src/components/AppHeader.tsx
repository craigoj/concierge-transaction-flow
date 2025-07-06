
import { Button } from "@/components/ui/button";
import { Add, Search, Person, Settings, LogOut } from "@vibe/icons";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationCenter from "@/components/notifications/NotificationCenter";

const AppHeader = () => {
  const navigate = useNavigate();
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

  const handleCreateTransaction = () => {
    navigate('/transactions');
    // Trigger the create dialog after navigation
    setTimeout(() => {
      const createButton = document.querySelector('[data-create-transaction]');
      if (createButton) {
        (createButton as HTMLElement).click();
      }
    }, 100);
  };

  const handleCreateContact = () => {
    navigate('/clients/new');
  };

  const handleCreateTask = () => {
    toast({
      title: "Create Task",
      description: "Task creation will be available from within a transaction. Please create or select a transaction first.",
    });
    navigate('/transactions');
  };

  const handleCreateContactNote = () => {
    navigate('/communications');
  };

  const handleCreateLetter = () => {
    navigate('/templates');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-brand-taupe/20 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="hover:bg-brand-taupe/20 text-brand-charcoal" />
          
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-brand-charcoal rounded-xl flex items-center justify-center shadow-brand-subtle cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/')}
            >
              <img 
                src="/lovable-uploads/5daf1e7a-db5b-46d0-bd10-afb6f64213b2.png"
                alt="The Agent Concierge Logo"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
                THE AGENT CONCIERGE
              </h1>
              <p className="text-sm text-brand-charcoal/60 font-brand-body">
                Transaction Coordination Platform
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Global Create Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="rounded-xl shadow-brand-subtle"
              >
                <Add className="h-4 w-4" />
                CREATE
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-brand-taupe/20 shadow-brand-elevation">
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 cursor-pointer font-brand-body"
                onClick={handleCreateTransaction}
              >
                🏠 Transaction
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 cursor-pointer font-brand-body"
                onClick={handleCreateContact}
              >
                👤 Contact
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 cursor-pointer font-brand-body"
                onClick={handleCreateTask}
              >
                ✓ Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 cursor-pointer font-brand-body"
                onClick={handleCreateContactNote}
              >
                📝 Contact Note
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 cursor-pointer font-brand-body"
                onClick={handleCreateLetter}
              >
                📄 Letter (Blank)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-brand-taupe/20 rounded-xl text-brand-charcoal"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notification Center */}
          <NotificationCenter />
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-brand-taupe/20 rounded-xl text-brand-charcoal">
                <Person className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-brand-taupe/20 shadow-brand-elevation">
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 cursor-pointer font-brand-body"
                onClick={() => navigate('/profile')}
              >
                <Person className="mr-3 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 cursor-pointer font-brand-body"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-brand-taupe/20" />
              <DropdownMenuItem 
                className="hover:bg-brand-taupe/10 text-destructive cursor-pointer font-brand-body"
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

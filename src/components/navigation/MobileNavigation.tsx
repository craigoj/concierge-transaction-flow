
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu,
  Home, 
  FileText, 
  Users, 
  MessageSquare, 
  FolderOpen, 
  BarChart3,
  UserCheck,
  Mail,
  Workflow,
  X
} from 'lucide-react';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/transactions', label: 'Transactions', icon: FileText },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/agents', label: 'Agents', icon: UserCheck },
    { path: '/communications', label: 'Communications', icon: MessageSquare },
    { path: '/templates', label: 'Templates', icon: Mail },
    { path: '/workflows', label: 'Workflows', icon: Workflow },
    { path: '/documents', label: 'Documents', icon: FolderOpen },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-border/20">
                  <img 
                    src="/lovable-uploads/c4831673-bd4c-4354-9ab1-25fe70b2edb2.png"
                    alt="The Agent Concierge Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Agent Concierge</h2>
                  <p className="text-sm text-muted-foreground">TC Platform</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full justify-start gap-3 h-12"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground text-center">
              Transaction Coordination Platform
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;

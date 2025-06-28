
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  MessageSquare, 
  FolderOpen, 
  BarChart3,
  UserCheck,
  Mail,
  Workflow
} from 'lucide-react';

const MainNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
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
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          variant={isActive(item.path) ? "default" : "ghost"}
          size="sm"
          onClick={() => navigate(item.path)}
          className="gap-2"
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
};

export default MainNavigation;

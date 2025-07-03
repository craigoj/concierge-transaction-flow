
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Shield,
  Cog,
  User
} from 'lucide-react';

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole();

  const isAgent = role === 'agent';
  const isCoordinator = role === 'coordinator';

  const agentMenuItems = [
    { href: '/agent/dashboard', label: 'Dashboard', icon: Home },
    { href: '/transactions', label: 'Transactions', icon: FileText },
    { href: '/offer-drafting', label: 'Offer Requests', icon: FileText },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/agent/setup', label: 'Setup', icon: Settings },
  ];

  const coordinatorMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/transactions', label: 'Transactions', icon: FileText },
    { href: '/agents', label: 'Agents', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/automation', label: 'Automation', icon: Cog },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = isAgent ? agentMenuItems : coordinatorMenuItems;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Concierge</h2>
        <p className="text-sm text-gray-600 capitalize">{role} Portal</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <User className="h-8 w-8 text-gray-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;

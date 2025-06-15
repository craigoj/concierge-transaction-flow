
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  FolderOpen,
  BarChart3,
  UserCheck,
  Mail,
  Workflow,
} from "lucide-react";

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

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-brand-taupe/20">
      <SidebarHeader className="p-6 border-b border-brand-taupe/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-charcoal rounded-xl flex items-center justify-center">
            <img 
              src="/lovable-uploads/5daf1e7a-db5b-46d0-bd10-afb6f64213b2.png"
              alt="The Agent Concierge Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-brand-wide">
              AGENT CONCIERGE
            </h2>
            <p className="text-xs text-brand-charcoal/60 font-brand-body">
              Coordination Platform
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-brand-heading tracking-brand-wide text-brand-charcoal/60 uppercase mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    className={`w-full justify-start gap-3 h-12 rounded-lg font-brand-body transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-brand-charcoal text-brand-background shadow-brand-subtle'
                        : 'text-brand-charcoal/70 hover:bg-brand-taupe/20 hover:text-brand-charcoal'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

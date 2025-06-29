
import { Home, FileText, Users, MessageCircle, Settings, BarChart3, Calendar, Workflow, Database, UserPlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const coordinatorMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: FileText,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Communications", 
    url: "/communications",
    icon: MessageCircle,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
];

const agentMenuItems = [
  {
    title: "Dashboard",
    url: "/agent/dashboard",
    icon: Home,
  },
  {
    title: "My Transactions",
    url: "/agent/transactions", 
    icon: FileText,
  },
  {
    title: "My Tasks",
    url: "/agent/tasks",
    icon: Workflow,
  },
  {
    title: "My Clients",
    url: "/agent/clients",
    icon: Users,
  },
  {
    title: "Calendar",
    url: "/agent/calendar",
    icon: Calendar,
  },
];

const managementItems = [
  {
    title: "Agents",
    url: "/agents",
    icon: Users,
  },
  {
    title: "Agent Intake",
    url: "/agent-intake",
    icon: UserPlus,
  },
  {
    title: "Workflows",
    url: "/workflows",
    icon: Workflow,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
  {
    title: "Automation",
    url: "/automation",
    icon: Workflow,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const demoItems = [
  {
    title: "Demo Setup",
    url: "/demo-setup",
    icon: Database,
  },
];

export function AppSidebar() {
  const location = useLocation();

  // Get user role to determine which menu items to show
  const { data: userRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Error fetching user role:', error);
        return 'agent'; // Default fallback
      }

      return profile?.role || 'agent';
    }
  });

  const isActive = (url: string) => {
    if (url === '/dashboard' || url === '/agent/dashboard') {
      return location.pathname === '/' || location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  const isAgent = userRole === 'agent';
  const isCoordinator = userRole === 'coordinator';
  const mainMenuItems = isAgent ? agentMenuItems : coordinatorMenuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAgent ? 'Agent Portal' : 'Main'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Only show management section for coordinators */}
        {isCoordinator && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* Only show demo section for coordinators */}
        {isCoordinator && (
          <SidebarGroup>
            <SidebarGroupLabel>Demo</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {demoItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

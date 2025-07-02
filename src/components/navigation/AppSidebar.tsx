
import { Building2, Users, FileText, Settings, Calendar, Bell, MessageSquare, User, BarChart3, Workflow } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";

// Agent navigation items
const agentItems = [
  { title: "Dashboard", url: "/agent/dashboard", icon: Building2 },
  { title: "My Transactions", url: "/agent/transactions", icon: Building2 },
  { title: "My Tasks", url: "/agent/tasks", icon: FileText },
  { title: "My Clients", url: "/agent/clients", icon: Users },
  { title: "Calendar", url: "/agent/calendar", icon: Calendar },
];

// Coordinator navigation items
const coordinatorItems = [
  { title: "Dashboard", url: "/", icon: Building2 },
  { title: "Transactions", url: "/transactions", icon: Building2 },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Agents", url: "/agents", icon: User },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Workflows", url: "/workflows", icon: Workflow },
  { title: "Analytics", url: "/automation", icon: BarChart3 },
];

// Settings and utility items (same for both roles)
const utilityItems = [
  { title: "Communications", url: "/communications", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { role, loading } = useUserRole();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    if (path === "/agent/dashboard") {
      return currentPath === "/agent/dashboard";
    }
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  // Show loading state while determining role
  if (loading) {
    return (
      <Sidebar variant="inset">
        <SidebarContent>
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Choose navigation items based on role
  const mainItems = role === 'agent' ? agentItems : coordinatorItems;
  const navigationLabel = role === 'agent' ? 'Agent Portal' : 'Coordinator Portal';

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{navigationLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
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

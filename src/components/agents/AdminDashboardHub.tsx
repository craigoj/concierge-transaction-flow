
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp,
  Mail,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { Database, Tables } from "@/integrations/supabase/types";
import { AdminDashboardStats } from "@/types/agent";

type Profile = Tables<'profiles'>;
type CommunicationHistory = Tables<'communication_history'>;
type AccountLockout = Tables<'account_lockouts'>;

export const AdminDashboardHub = () => {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<AdminDashboardStats> => {
      const { data: agents } = await supabase
        .from('profiles')
        .select('id, invitation_status, created_at, onboarding_completed_at')
        .eq('role', 'agent');

      const { data: communications } = await supabase
        .from('communication_history')
        .select('id, status, sent_at')
        .gte('sent_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: lockouts } = await supabase
        .from('account_lockouts')
        .select('id, user_id')
        .eq('is_active', true);

      const totalAgents = agents?.length || 0;
      const activeAgents = agents?.filter(a => a.invitation_status === 'completed').length || 0;
      const pendingAgents = agents?.filter(a => a.invitation_status === 'sent').length || 0;
      const lockedAgents = lockouts?.length || 0;
      
      const thisWeekAgents = agents?.filter(a => {
        const createdDate = new Date(a.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate >= weekAgo;
      }).length || 0;

      const communicationsThisWeek = communications?.length || 0;
      const failedCommunications = communications?.filter(c => c.status === 'failed').length || 0;

      return {
        totalAgents,
        activeAgents,
        pendingAgents,
        lockedAgents,
        thisWeekAgents,
        communicationsThisWeek,
        failedCommunications,
        onboardingRate: totalAgents > 0 ? Math.round((activeAgents / totalAgents) * 100) : 0
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats: AdminDashboardStats = dashboardStats || {
    totalAgents: 0,
    activeAgents: 0,
    pendingAgents: 0,
    lockedAgents: 0,
    thisWeekAgents: 0,
    communicationsThisWeek: 0,
    failedCommunications: 0,
    onboardingRate: 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-charcoal">Admin Dashboard</h2>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisWeekAgents} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onboardingRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Setup</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAgents}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Accounts</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lockedAgents}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communications</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.communicationsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Sent this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Communications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedCommunications}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.thisWeekAgents > 0 ? '+' : ''}{stats.thisWeekAgents}
            </div>
            <p className="text-xs text-muted-foreground">
              New agents this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.onboardingRate}%</div>
            <p className="text-xs text-muted-foreground">
              Onboarding completion
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

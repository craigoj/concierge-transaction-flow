
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Building,
  Award,
  Activity,
  Clock
} from "lucide-react";

interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  pendingAgents: number;
  completionRate: number;
  avgOnboardingTime: number;
  topBrokerages: Array<{ name: string; count: number; percentage: number }>;
  registrationTrend: Array<{ month: string; count: number }>;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
}

export const AgentAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: agents = [] } = useQuery({
    queryKey: ['all-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (agents.length > 0) {
      calculateMetrics();
    }
  }, [agents]);

  const calculateMetrics = () => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.invitation_status === 'completed').length;
    const pendingAgents = agents.filter(a => a.invitation_status === 'pending').length;
    const completionRate = totalAgents > 0 ? (activeAgents / totalAgents) * 100 : 0;

    // Calculate average onboarding time
    const completedAgents = agents.filter(a => a.onboarding_completed_at && a.created_at);
    const avgOnboardingTime = completedAgents.length > 0 
      ? completedAgents.reduce((sum, agent) => {
          const start = new Date(agent.created_at);
          const end = new Date(agent.onboarding_completed_at);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedAgents.length
      : 0;

    // Top brokerages
    const brokerageCount = agents.reduce((acc, agent) => {
      if (agent.brokerage) {
        acc[agent.brokerage] = (acc[agent.brokerage] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topBrokerages = Object.entries(brokerageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalAgents) * 100
      }));

    // Registration trend (last 12 months)
    const registrationTrend = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const count = agents.filter(agent => {
        const agentDate = new Date(agent.created_at);
        return agentDate.getMonth() === date.getMonth() && 
               agentDate.getFullYear() === date.getFullYear();
      }).length;
      registrationTrend.push({ month: monthName, count });
    }

    // Status breakdown
    const statusCounts = agents.reduce((acc, agent) => {
      const status = agent.invitation_status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusColors = {
      completed: '#22c55e',
      sent: '#3b82f6',
      pending: '#f59e0b',
      expired: '#ef4444'
    };

    const statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: statusColors[name as keyof typeof statusColors] || '#6b7280'
    }));

    setMetrics({
      totalAgents,
      activeAgents,
      pendingAgents,
      completionRate,
      avgOnboardingTime,
      topBrokerages,
      registrationTrend,
      statusBreakdown
    });
    setLoading(false);
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAgents}</div>
            <p className="text-xs text-muted-foreground">All registered agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Onboarding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgOnboardingTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">Time to complete setup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Setup</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingAgents}</div>
            <p className="text-xs text-muted-foreground">Awaiting activation</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registration Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Agent Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${(percentage || 0).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Brokerages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Top Brokerages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topBrokerages.map((brokerage, index) => (
              <div key={brokerage.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{brokerage.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {brokerage.count} agents ({brokerage.percentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <Progress value={brokerage.percentage} className="w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

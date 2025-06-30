
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AdvancedAnalyticsProps {
  agentId?: string;
}

const AdvancedAnalytics = ({ agentId }: AdvancedAnalyticsProps) => {
  const { data: analyticsData } = useQuery({
    queryKey: ['advanced-analytics', agentId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetAgentId = agentId || user?.id;
      
      if (!targetAgentId) throw new Error('No agent ID available');

      // Get transactions data
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, tasks(*)')
        .eq('agent_id', targetAgentId);

      // Get completion metrics
      const totalTransactions = transactions?.length || 0;
      const activeTransactions = transactions?.filter(t => t.status === 'active').length || 0;
      const closedTransactions = transactions?.filter(t => t.status === 'closed').length || 0;
      
      // Calculate completion rates
      const completionRate = totalTransactions > 0 ? (closedTransactions / totalTransactions) * 100 : 0;
      
      // Calculate average closing time
      const closedWithDates = transactions?.filter(t => t.status === 'closed' && t.closing_date) || [];
      const avgClosingTime = closedWithDates.length > 0 
        ? closedWithDates.reduce((acc, t) => {
            const created = new Date(t.created_at);
            const closed = new Date(t.closing_date!);
            return acc + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / closedWithDates.length
        : 0;

      // Task completion metrics
      const allTasks = transactions?.flatMap(t => t.tasks || []) || [];
      const completedTasks = allTasks.filter(t => t.is_completed).length;
      const taskCompletionRate = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;

      // Monthly performance data (mock data for demo)
      const monthlyData = [
        { month: 'Jan', transactions: 3, revenue: 15000, completionRate: 85 },
        { month: 'Feb', transactions: 5, revenue: 25000, completionRate: 90 },
        { month: 'Mar', transactions: 4, revenue: 20000, completionRate: 95 },
        { month: 'Apr', transactions: 6, revenue: 30000, completionRate: 88 },
        { month: 'May', transactions: 7, revenue: 35000, completionRate: 92 },
        { month: 'Jun', transactions: 5, revenue: 25000, completionRate: 94 }
      ];

      // Service tier distribution
      const tierData = [
        { name: 'Core', value: 40, color: '#10B981' },
        { name: 'Elite', value: 35, color: '#3B82F6' },
        { name: 'White Glove', value: 25, color: '#8B5CF6' }
      ];

      return {
        totalTransactions,
        activeTransactions,
        closedTransactions,
        completionRate: Math.round(completionRate),
        avgClosingTime: Math.round(avgClosingTime),
        taskCompletionRate: Math.round(taskCompletionRate),
        monthlyData,
        tierData,
        totalRevenue: monthlyData.reduce((acc, m) => acc + m.revenue, 0)
      };
    },
  });

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-brand-taupe/20 rounded w-3/4"></div>
            <div className="h-32 bg-brand-taupe/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const kpiCards = [
    {
      title: 'Total Transactions',
      value: analyticsData.totalTransactions,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completion Rate',
      value: `${analyticsData.completionRate}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg Closing Time',
      value: `${analyticsData.avgClosingTime} days`,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Total Revenue',
      value: `$${analyticsData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className={`${kpi.bgColor} border-0`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Transactions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Completion Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Service Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {analyticsData.tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-brand-charcoal">Strengths</h4>
              <div className="space-y-2">
                {analyticsData.completionRate > 85 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-green-100 text-green-800">High Performance</Badge>
                    <span>Excellent completion rate</span>
                  </div>
                )}
                {analyticsData.avgClosingTime < 30 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-blue-100 text-blue-800">Efficient</Badge>
                    <span>Fast closing times</span>
                  </div>
                )}
                {analyticsData.taskCompletionRate > 90 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-purple-100 text-purple-800">Organized</Badge>
                    <span>Strong task management</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-brand-charcoal">Opportunities</h4>
              <div className="space-y-2">
                {analyticsData.completionRate < 80 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-amber-100 text-amber-800">Focus Area</Badge>
                    <span>Improve completion rates</span>
                  </div>
                )}
                {analyticsData.avgClosingTime > 45 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-orange-100 text-orange-800">Efficiency</Badge>
                    <span>Reduce closing times</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-gray-100 text-gray-800">Growth</Badge>
                  <span>Explore premium service tiers</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;

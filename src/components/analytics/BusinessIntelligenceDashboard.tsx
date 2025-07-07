import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceTierType } from '@/types/serviceTiers';
import {
  BusinessIntelligenceData,
  ServiceTierPerformance,
  GeographicData,
  KPICard,
  TransactionWithDetails,
} from '@/types/dashboard';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Target,
  Zap,
  Download,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface BusinessIntelligenceDashboardProps {
  agentId?: string;
  dateRange?: string;
}

const BusinessIntelligenceDashboard = ({
  agentId,
  dateRange = '6months',
}: BusinessIntelligenceDashboardProps) => {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedServiceTier, setSelectedServiceTier] = useState<'all' | ServiceTierType>('all');

  const { data: businessData } = useQuery({
    queryKey: ['business-intelligence', agentId, dateRange, selectedServiceTier],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const targetAgentId = agentId || user?.id;

      if (!targetAgentId) throw new Error('No agent ID available');

      // Get comprehensive transaction data
      let query = supabase
        .from('transactions')
        .select(
          `
          *,
          clients(*),
          tasks(*),
          transaction_service_details(*)
        `
        )
        .eq('agent_id', targetAgentId);

      if (selectedServiceTier !== 'all') {
        query = query.eq('service_tier', selectedServiceTier as ServiceTierType);
      }

      const { data: transactions } = await query;

      // Calculate business metrics
      const totalRevenue =
        transactions?.reduce((sum, t) => {
          const serviceDetails = t.transaction_service_details?.[0];
          return sum + (serviceDetails?.total_service_cost || 0);
        }, 0) || 0;

      const avgTransactionValue = transactions?.length > 0 ? totalRevenue / transactions.length : 0;

      // Service tier performance
      const tierPerformance =
        transactions?.reduce(
          (acc, t) => {
            const tier = t.service_tier || 'unknown';
            if (!acc[tier]) {
              acc[tier] = { count: 0, revenue: 0, avgClosingTime: 0 };
            }
            acc[tier].count += 1;
            acc[tier].revenue += t.transaction_service_details?.[0]?.total_service_cost || 0;
            return acc;
          },
          {} as Record<string, { count: number; revenue: number; avgClosingTime: number }>
        ) || {};

      // Geographic distribution
      const geoData =
        transactions?.reduce(
          (acc, t) => {
            const city = t.city || 'Unknown';
            if (!acc[city]) {
              acc[city] = { count: 0, revenue: 0 };
            }
            acc[city].count += 1;
            acc[city].revenue += t.transaction_service_details?.[0]?.total_service_cost || 0;
            return acc;
          },
          {} as Record<string, { count: number; revenue: number }>
        ) || {};

      // Monthly trends (mock data for demo)
      const monthlyTrends = [
        { month: 'Jan', transactions: 3, revenue: 15000, leads: 25, conversions: 12 },
        { month: 'Feb', transactions: 5, revenue: 25000, leads: 32, conversions: 16 },
        { month: 'Mar', transactions: 4, revenue: 20000, leads: 28, conversions: 14 },
        { month: 'Apr', transactions: 6, revenue: 30000, leads: 35, conversions: 18 },
        { month: 'May', transactions: 7, revenue: 35000, leads: 42, conversions: 21 },
        { month: 'Jun', transactions: 5, revenue: 25000, leads: 38, conversions: 19 },
      ];

      return {
        totalTransactions: transactions?.length || 0,
        totalRevenue,
        avgTransactionValue: Math.round(avgTransactionValue),
        conversionRate: 45, // Mock data
        monthlyTrends,
        tierPerformance: Object.entries(tierPerformance).map(
          ([tier, data]): ServiceTierPerformance => ({
            tier,
            count: data.count,
            revenue: data.revenue,
            avgClosingTime: data.avgClosingTime,
          })
        ),
        geoData: Object.entries(geoData).map(
          ([city, data]): GeographicData => ({
            city,
            count: data.count,
            revenue: data.revenue,
          })
        ),
        projectedRevenue: totalRevenue * 1.25, // 25% growth projection
        marketShare: 12.5, // Mock data
        clientSatisfaction: 4.8,
      };
    },
  });

  const exportReport = () => {
    // Mock export functionality
    console.log('Exporting business intelligence report...');
  };

  if (!businessData) {
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

  const kpiCards: KPICard[] = [
    {
      title: 'Total Revenue',
      value: `$${businessData.totalRevenue.toLocaleString()}`,
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Avg Transaction Value',
      value: `$${businessData.avgTransactionValue.toLocaleString()}`,
      change: '+8.2%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Conversion Rate',
      value: `${businessData.conversionRate}%`,
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Market Share',
      value: `${businessData.marketShare}%`,
      change: '+0.8%',
      trend: 'up',
      icon: Zap,
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-charcoal">Business Intelligence</h2>
          <p className="text-brand-charcoal/60">Advanced analytics and market insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedServiceTier}
            onValueChange={(value: 'all' | ServiceTierType) => setSelectedServiceTier(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="buyer_core">Core Buyer</SelectItem>
              <SelectItem value="buyer_elite">Elite Buyer</SelectItem>
              <SelectItem value="white_glove_buyer">White Glove Buyer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">{kpi.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-50`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle>Revenue & Transaction Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={businessData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                      name="Revenue ($)"
                    />
                    <Area
                      type="monotone"
                      dataKey="transactions"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.2}
                      name="Transactions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Service Tier Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={businessData.tierPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tier" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Lead Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Leads</span>
                    <Badge className="bg-blue-100 text-blue-800">200</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Qualified Leads</span>
                    <Badge className="bg-green-100 text-green-800">120</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Active Clients</span>
                    <Badge className="bg-purple-100 text-purple-800">90</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium">Closed Deals</span>
                    <Badge className="bg-amber-100 text-amber-800">30</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Top Markets</h4>
                  <div className="space-y-3">
                    {businessData.geoData.slice(0, 5).map((market, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{market.city}</div>
                          <div className="text-sm text-gray-600">{market.count} transactions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${market.revenue?.toLocaleString() || 0}
                          </div>
                          <div className="text-sm text-gray-600">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={businessData.geoData.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ city, count }) => `${city}: ${count}`}
                      >
                        {businessData.geoData.slice(0, 6).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'][
                                index
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Revenue Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      ${businessData.projectedRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Projected Annual Revenue</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Run Rate</span>
                      <span className="font-semibold">
                        ${(businessData.totalRevenue * 12).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate</span>
                      <span className="text-green-600 font-semibold">+25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Expansion</span>
                      <span className="font-semibold">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">Strong Performance</div>
                    <div className="text-sm text-green-700">
                      White Glove services show 40% higher profit margins
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800">Growth Opportunity</div>
                    <div className="text-sm text-blue-700">
                      Norfolk market shows 25% year-over-year growth potential
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="font-medium text-amber-800">Action Required</div>
                    <div className="text-sm text-amber-700">
                      Consider expanding Elite services to capture mid-market
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligenceDashboard;

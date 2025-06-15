
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Calendar, Users, DollarSign } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('6months');
  const [selectedAgent, setSelectedAgent] = useState('all');

  // Fetch transactions data
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['analytics-transactions', dateRange, selectedAgent],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_agent_id_fkey(first_name, last_name, id)
        `)
        .eq('status', 'closed')
        .order('closing_date', { ascending: true });

      // Apply date range filter
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case '30days':
          startDate = subMonths(now, 1);
          break;
        case '90days':
          startDate = subMonths(now, 3);
          break;
        case '6months':
          startDate = subMonths(now, 6);
          break;
        case '1year':
          startDate = subMonths(now, 12);
          break;
        default:
          startDate = subMonths(now, 6);
      }

      query = query.gte('closing_date', startDate.toISOString().split('T')[0]);

      // Apply agent filter
      if (selectedAgent !== 'all') {
        query = query.eq('agent_id', selectedAgent);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch agents for filter
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'agent');
      if (error) throw error;
      return data;
    }
  });

  // Process data for charts
  const { salesVolumeData, commissionsData, keyMetrics } = useMemo(() => {
    if (!transactions) return { salesVolumeData: [], commissionsData: [], keyMetrics: {} };

    // Group by month
    const monthlyData = new Map();
    
    transactions.forEach(transaction => {
      if (!transaction.closing_date || !transaction.purchase_price) return;
      
      const month = format(parseISO(transaction.closing_date), 'MMM yyyy');
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          month,
          volume: 0,
          commissions: 0,
          count: 0
        });
      }
      
      const data = monthlyData.get(month);
      data.volume += Number(transaction.purchase_price);
      data.commissions += Number(transaction.purchase_price) * (Number(transaction.commission_rate) || 0.03) / 100;
      data.count += 1;
    });

    const salesVolumeData = Array.from(monthlyData.values());
    const commissionsData = Array.from(monthlyData.values());

    // Calculate key metrics
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, t) => sum + (Number(t.purchase_price) || 0), 0);
    const totalCommissions = transactions.reduce((sum, t) => 
      sum + (Number(t.purchase_price) || 0) * (Number(t.commission_rate) || 3) / 100, 0
    );
    const avgSalePrice = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

    return {
      salesVolumeData,
      commissionsData,
      keyMetrics: {
        totalTransactions,
        totalVolume,
        totalCommissions,
        avgSalePrice
      }
    };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader />
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.first_name} {agent.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.totalTransactions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(keyMetrics.totalVolume || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(keyMetrics.totalCommissions || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Sale Price</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(keyMetrics.avgSalePrice || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Volume By Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-muted-foreground">Loading chart data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales Volume']}
                    />
                    <Bar dataKey="volume" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Commissions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gross Commissions By Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-muted-foreground">Loading chart data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={commissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commissions']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="commissions" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

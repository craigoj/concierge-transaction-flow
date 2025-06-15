
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Calendar, Users, DollarSign } from 'lucide-react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
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
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Premium Header Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
              Analytics
            </h1>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
              Insights that drive excellence and inform strategic decisions
            </p>
          </div>
        </div>
        <div className="w-24 h-px bg-brand-taupe"></div>
      </div>

      {/* Enhanced Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-brand-taupe" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-brand-taupe" />
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-64 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
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
        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-brand-heading tracking-wide text-brand-charcoal/70 uppercase">Total Transactions</CardTitle>
            <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-brand-taupe" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">{keyMetrics.totalTransactions || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-brand-heading tracking-wide text-brand-charcoal/70 uppercase">Total Volume</CardTitle>
            <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-brand-taupe" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
              ${(keyMetrics.totalVolume || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-brand-heading tracking-wide text-brand-charcoal/70 uppercase">Total Commissions</CardTitle>
            <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-brand-taupe" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
              ${(keyMetrics.totalCommissions || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-brand-heading tracking-wide text-brand-charcoal/70 uppercase">Avg Sale Price</CardTitle>
            <div className="w-12 h-12 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
              <PieChart className="h-6 w-6 text-brand-taupe" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
              ${(keyMetrics.avgSalePrice || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Volume Chart */}
        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-brand-heading tracking-wide text-brand-charcoal uppercase">
              <TrendingUp className="h-6 w-6 text-brand-taupe" />
              Sales Volume By Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-brand-charcoal/60 font-brand-body">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={salesVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" className="text-xs font-brand-body" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    className="text-xs font-brand-body"
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Sales Volume']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-brand-body)'
                    }}
                  />
                  <Bar dataKey="volume" fill="#2D3748" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Commissions Chart */}
        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-brand-heading tracking-wide text-brand-charcoal uppercase">
              <DollarSign className="h-6 w-6 text-brand-taupe" />
              Gross Commissions By Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-brand-charcoal/60 font-brand-body">Loading chart data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={commissionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" className="text-xs font-brand-body" />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    className="text-xs font-brand-body"
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Commissions']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-brand-body)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commissions" 
                    stroke="#A0785A" 
                    strokeWidth={3}
                    dot={{ fill: '#A0785A', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#2D3748' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

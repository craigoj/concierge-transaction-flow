
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EnhancedDashboardStats = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Get transaction stats
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('status, purchase_price, created_at');

      if (transactionError) throw transactionError;

      // Get client count
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id');

      if (clientError) throw clientError;

      // Calculate stats
      const activeTransactions = transactions?.filter(t => t.status === 'active').length || 0;
      const totalClients = clients?.length || 0;
      
      // Calculate monthly revenue (sum of purchase prices * commission rate estimate)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTransactions = transactions?.filter(t => {
        const transactionDate = new Date(t.created_at);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      }) || [];

      const monthlyRevenue = monthlyTransactions.reduce((sum, t) => {
        const price = Number(t.purchase_price) || 0;
        const estimatedCommission = price * 0.03; // 3% commission estimate
        return sum + estimatedCommission;
      }, 0);

      // Calculate completion rate
      const completedTransactions = transactions?.filter(t => t.status === 'closed').length || 0;
      const totalTransactions = transactions?.length || 0;
      const completionRate = totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0;

      return {
        activeTransactions,
        totalClients,
        monthlyRevenue,
        completionRate: Math.round(completionRate)
      };
    },
  });

  const stats = [
    {
      title: "Active Transactions",
      value: statsData?.activeTransactions?.toString() || "0",
      change: "+12%",
      changeType: "positive" as const,
      icon: Calendar,
      color: "text-blue-600",
      href: "/transactions?filter=active"
    },
    {
      title: "Total Clients",
      value: statsData?.totalClients?.toString() || "0",
      change: "+8%",
      changeType: "positive" as const,
      icon: Users,
      color: "text-green-600",
      href: "/clients"
    },
    {
      title: "Monthly Revenue",
      value: `$${statsData?.monthlyRevenue?.toLocaleString() || "0"}`,
      change: "+23%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "text-primary",
      href: "/analytics/revenue"
    },
    {
      title: "Completion Rate",
      value: `${statsData?.completionRate || 0}%`,
      change: "+2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-emerald-600",
      href: "/analytics/performance"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <div className="flex items-center space-x-1">
                  <span className={`text-sm flex items-center ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full bg-gray-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedDashboardStats;
